# BACKEND-CONTRACT.md — the authenticated Fofa ⇄ Home Assistant API

**Supersedes the anonymous webhook in [`../MEASURABLES.md`](../MEASURABLES.md) for progress.**
That model was fire-and-forget and device-local. This one gives **login, cross-device persistent
progress, and sequential lesson gating**, with every secret (the Claude key) staying server-side.

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

- **Single student** for now, so a single account is enough — but model it as one row in an accounts
  table so more can be added later. Credentials are checked **by the `fofa` integration** (own
  accounts), so the student never gets a Home Assistant login / house access.
- Because the page is served cross-origin from HA, HA must allow it. In `configuration.yaml`:
  ```yaml
  http:
    cors_allowed_origins:
      - https://jbvyvf67cb-ai.github.io
  ```
- **HA must be reachable over HTTPS from the student's devices** (Nabu Casa Cloud or a reverse
  proxy). Passwords only ever travel over HTTPS. This is a hard prerequisite for cross-device use.
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

## 4. Free-form grading (unchanged concept, now authenticated)

### `POST /api/fofa/grade`
Request:
```json
{
  "subject": "reading", "module": "response-1", "activity": "freeform",
  "prompt": "…", "rubric": "…(from quizzes/writing/rubrics.json)…", "response": "…student writing…"
}
```
Behavior: the integration calls Claude (its key) to score the response against the rubric, **records
the result** (so it counts toward gating), and responds:
```json
{ "ok": true, "score": 3, "max": 4, "feedback": "…", "state": { …updated state… } }
```
On failure: `{ "ok": false, "error": "…" }`.

---

## 5. What each side builds

- **HA session (`fofa` integration):** the endpoints in §2–§4, an accounts store (hashed
  passwords), per-student progress storage, server-side gating computed from
  `curriculum/index.json`, and the Claude grading call. Add `cors_allowed_origins`. Expose HA over
  HTTPS.
- **This repo (web app):** a login screen; `assets/js/fofa-account.js` (login, token handling,
  `state`/`progress`/`grade` calls, offline cache); gating UI that locks module cards and the
  landing/subject pages based on `state`; `visit` reporting on exploration lessons; and a settings
  field for the HA base URL. The existing `fofa-measure.js` localStorage path becomes the offline
  cache behind this client.

---

## 6. Versioning

`curriculum/index.json` carries the arc + gate rules; both sides read it so lesson order and grade
thresholds stay in lockstep. When it changes, bump a date/version and have `GET /api/fofa/state`
echo `curriculumVersion` so the client can detect drift.
