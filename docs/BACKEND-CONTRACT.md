# BACKEND-CONTRACT.md — the authenticated Fofa ⇄ Home Assistant API

**This is the single source of truth for the Home-Assistant `fofa` integration.** It gives
**login, cross-device persistent progress, and sequential lesson gating**, with every secret (the
Claude key) staying server-side. (An earlier anonymous-webhook design has been retired.)

**Audience:** the Claude Code session that owns Home Assistant. It builds a small custom integration
(`fofa`) that implements the endpoints below. This repo (the web app, on GitHub Pages) is the
client and speaks exactly this contract.

---

## 1. Shape of the system (chosen: hosting = GitHub Pages)

```
  Browser (GitHub Pages, public URL)                Home Assistant (custom `fofa` integration)
  ┌───────────────────────────────┐  HTTPS+CORS   ┌──────────────────────────────────────────┐
  │ login screen                  │ ─────────────►│ POST /api/fofa/login   → session token     │
  │ assets/js/fofa-account.js     │               │ GET  /api/fofa/state   → progress + gating │
  │ (Bearer <token> on requests)  │ ◄─────────────│ POST /api/fofa/progress→ record a result   │
  │ progress + gating client      │               │ POST /api/fofa/grade   → Claude grades      │
  └───────────────────────────────┘               │ stores per-student data; holds Claude key  │
                                                   └──────────────────────────────────────────┘
```

- **Own accounts (confirmed).** Credentials are checked **by the `fofa` integration** — its own
  accounts table (`username → hashed password → student id`), *not* Home Assistant users. So a
  student never gets a Home Assistant login / house access, no matter how many accounts exist.
- **Multi-user by construction (see §7).** Start with one student, but model it as one row in that
  table and **namespace all stored data by student id** so more accounts can be added later with no
  schema change.
- Because the page is served cross-origin from HA, HA must allow it. In `configuration.yaml`:
  ```yaml
  http:
    cors_allowed_origins:
      - https://jbvyvf67cb-ai.github.io
  ```
- **Remote access = Nabu Casa Cloud (confirmed).** HA is reached over its Nabu Casa HTTPS URL, so
  the lab works across devices out of the house. Passwords only ever travel over HTTPS.
- The web app stores only a **short-lived session token** (never the password, never the Claude key)
  in `localStorage["fofa:session"]`, plus a read-only cache of the last `state` for offline display.
  The server is always the source of truth.

---

## 2. Auth

### `POST /api/fofa/login`
Request: `{ "username": "fofa", "password": "…" }`
Response 200: `{ "ok": true, "token": "<opaque session token>", "expires": "2026-07-18T…Z", "student": "Fofa" }`
Response 401: `{ "ok": false, "error": "bad-credentials" }`

- Store passwords hashed (bcrypt/argon2), never plaintext. Rate-limit attempts.
- The token is a bearer credential; scope it to this one account. Expiry ~7–30 days is fine; the
  client re-logs in when it 401s.

### Authenticated requests
All other endpoints require header `Authorization: Bearer <token>`. On an expired/invalid token
return `401 { "ok": false, "error": "unauthorized" }` — the client will show the login screen.

*(If you later prefer HA-native auth instead of own-accounts, keep these same endpoints but validate
an HA long-lived token / OAuth session instead of your own table. The client contract is unchanged.)*

---

## 3. Progress + gating

### `GET /api/fofa/state`
Returns everything the app needs to render locks and scores. **The server computes gating** from
[`../curriculum/index.json`](../curriculum/index.json) (the ordered arcs + gate rules) applied to the
student's recorded results — do not trust the client to decide what's unlocked.

```json
{
  "ok": true,
  "student": "Fofa",
  "curriculumVersion": "2026-07-11",
  "lessons": {
    "science/m1-atomic-structure": { "status": "complete", "best": 10, "max": 11, "attempts": 3, "last": "2026-07-11T…Z" },
    "science/m2-isotopes":         { "status": "unlocked", "best": 5,  "max": 8,  "attempts": 1, "last": "…" },
    "science/m3-electron-config":  { "status": "locked",   "best": 0,  "max": 8,  "attempts": 0, "last": null },
    "writing/sentence-anatomy":    { "status": "complete", "best": 1,  "max": 1,  "attempts": 1, "last": "…" }
  }
}
```

- `status` ∈ `locked | unlocked | complete`.
- Gating rule (server-side): the first lesson of a subject is always `unlocked`; lesson *i* is
  `unlocked` iff lesson *i-1* is `complete`; a lesson is `complete` iff its `gate`
  (from `curriculum/index.json`) is satisfied by the recorded results:
  - `quiz`  → `best / max >= gate.min`
  - `complete` → a result with `score == max` was recorded
  - `grade` → an AI-graded result with `score / max >= gate.min`
  - `visit` → any result recorded for the lesson (the app reports a `visit` on open)
- Keep `best` monotonic (never lower it). Return locked lessons too (with zeros) so the app can show
  the whole path.

### `POST /api/fofa/progress`
The app calls this whenever the student finishes an activity.
Request:
```json
{
  "subject": "science", "module": "m1-atomic-structure",
  "activity": "quiz", "kind": "quiz",
  "score": 10, "max": 11,
  "detail": { }
}
```
Response 200: return the **updated** `state` (same shape as `GET /api/fofa/state`) so the client can
re-render locks immediately without a second round-trip. Recompute gating on write.

---

## 4. Quiz grading — one endpoint for every question type

A quiz is graded **once, on the server**, in a single submission — whether its questions are
objective, free-response, or a mix. The browser is a dumb reporter: it collects the student's
*answers* (never a score, never keeps a separate grader) and posts them; the server grades each
question by its type, sums, records the result (so it counts toward gating), and returns the
per-question breakdown plus the updated `state`.

This supersedes the old `/grade` endpoint — a free-response prompt is just a one-question quiz.

### `POST /api/fofa/quiz`
Request — the student's answers, keyed by question id:
```json
{
  "subject": "science", "module": "m1-atomic-structure", "quizId": "m1-atomic-structure",
  "answers": [
    { "id": "q1", "type": "mc",      "choice": 1 },
    { "id": "q2", "type": "tf",      "choice": true },
    { "id": "q3", "type": "numeric", "value": 35 },
    { "id": "q7", "type": "build",   "state": { "z": 6, "n": 6, "e": 6, "charge": 0 } },
    { "id": "q9", "type": "free",    "response": { "kind": "text", "text": "Because the nucleus…" } }
  ]
}
```

**How the server grades each `type`** (answer key comes from `quizzes/<subject>/<quizId>.json`, which
the server holds; the client never sends keys):
- `mc` → `choice` (index) equals the question's `answer`.
- `tf` → `choice` (bool) equals `answer`.
- `numeric` → `|value − answer| ≤ tolerance`.
- `build` → the client-captured `state` (from the viz's `window.moduleState()`) satisfies the
  question's `check` spec — the server evaluates the check, so grading logic still lives server-side.
- `free` → the server sends `response` + the question's `rubric` to Claude (its key) and gets a score.

### Free-response answers are a *typed content object* (forward-compatible)
`answer.response` is `{ "kind": …, … }`, not a bare string — so non-text answers slot in later with
**no schema change**:
- `{ "kind": "text",  "text": "…" }`  — implemented now.
- `{ "kind": "image", "mime": "image/png", "data": "<base64>" }`  — **reserved** for handwritten /
  photographed answers. Grading them is the same call with Claude *vision*; the only additions are a
  capture UI on the client and reading the image on the server. Nothing here changes to enable it.
- `{ "kind": "ink", "strokes": [...] }` — reserved for stylus capture, if ever wanted.

### Response
```json
{
  "ok": true,
  "score": 4, "max": 5,
  "results": [
    { "id": "q1", "correct": true,  "earned": 1, "of": 1 },
    { "id": "q3", "correct": false, "earned": 0, "of": 1, "expected": 35 },
    { "id": "q9", "earned": 2, "of": 3, "feedback": "Good — name one detail that shows it." }
  ],
  "state": { …updated gating state… }
}
```
On failure: `{ "ok": false, "error": "…" }`. Record the result and recompute gating before returning,
so the client re-renders locks from `state` without a second call. (Because a `free` question waits on
Claude, quiz results are shown all at once on submit — the client posts once and renders `results`.)

`POST /api/fofa/progress` (§3) stays for **activities/games** (Word Sort streaks, `visit`, etc.) that
report an outcome rather than answers. Quizzes always go through `/api/fofa/quiz`.

### The quiz manifest (where the server reads questions + answer keys)
The canonical quiz banks live in-repo under [`quizzes/`](../quizzes) and are fetched from the
deployed Pages URL (e.g. `https://jbvyvf67cb-ai.github.io/fofa-learning-lab/quizzes/index.json`):
- **`quizzes/index.json`** — catalog: `subjects.<subject>.modules[]`, each with `id`, `slug`,
  `title`, `quiz` (path to the per-module JSON), `count`, `gradeable`, `types`.
- **`quizzes/science/<module-id>.json`** — one file per module: `{ id, slug, title, source, page,
  gradeable, questions[] }`. Question shape:
  `{ "id":"q3", "type":"numeric", "prompt":"…", "answer":35, "tolerance":0, "explain":"…" }`
  (`mc` has `choices[]`+`answer` index; `tf` has `answer` bool; `build` has `check` +
  `interactiveOnly:true`; `free` carries a `rubric` and optional `max`).
- **`quizzes/writing/rubrics.json`** — rubrics for open-ended prompts (used to grade `free` answers).

These files are **GENERATED** from the science `module.js` quiz banks by `node quizzes/_generate.js`
— edit the `module.js`, not the JSON. The server holds these (with answers); the client only ever
sends answers.

---

## 5. What each side builds

- **HA session (`fofa` integration):** the endpoints in §2–§4 (`login`, `state`, `progress`, and the
  unified `quiz`), an accounts store (hashed passwords), per-student progress storage, server-side
  gating computed from `curriculum/index.json`, and the Claude grading call for `free` questions
  (text now; vision-ready for `image` later). Add `cors_allowed_origins`. Expose HA over HTTPS.
- **This repo (web app):** a login screen; `assets/js/fofa-account.js` (login, token handling,
  `state`/`progress`/`quiz` calls, offline cache + a **mock backend** that grades from the quiz
  manifest so it runs pre-integration); the quiz shell posts answers to `quiz` and renders `results`
  (no client-side grading); gating UI that locks module cards; `visit` reporting on exploration
  lessons; and a Settings field for the HA base URL.

---

## 7. Multiple users (supported)

The model is multi-user from day one; a single student is just N=1. To keep it that way:

- **Accounts table:** each row is `{ username, password_hash, student_id, display_name, created }`.
  Adding a child = inserting a row. Hash with bcrypt/argon2; never store plaintext.
- **Per-student data:** key all progress/results storage by `student_id`. `GET /api/fofa/state`,
  `POST /api/fofa/progress`, and `POST /api/fofa/quiz` operate **only** on the student behind the
  request's bearer token — a user can never see or affect another's data.
- **Creating/resetting accounts:** expose a parent/admin path — simplest is an HA service call or a
  small admin endpoint (e.g. `POST /api/fofa/admin/accounts`) guarded by your *Home Assistant* login
  (admin only), so the parent adds a kid and sets a password from HA. Kids' Fofa accounts stay
  separate from HA users.
- **Optional per-student curriculum:** gating is computed per student from `curriculum/index.json`,
  so you can later give different children different arcs or grade thresholds by allowing a
  per-student override of the gate `min`/order. Not required now — noted so nothing precludes it.
- **Frontend:** already per-user (login → token → scoped state; the user chip + log-out switch
  users). No app change is needed to go from one child to several; a profile picker on the login
  screen is a nice-to-have, not a requirement.

## 8. Versioning

`curriculum/index.json` carries the arc + gate rules; both sides read it so lesson order and grade
thresholds stay in lockstep. When it changes, bump a date/version and have `GET /api/fofa/state`
echo `curriculumVersion` so the client can detect drift.
