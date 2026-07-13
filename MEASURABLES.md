# MEASURABLES.md — the Fofa ⇄ Home Assistant contract

> **Superseded for accounts/progress/grading.** This file documents the original
> anonymous-webhook approach (fire-and-forget, device-local). The current design is the
> authenticated, server-side model in **[`docs/BACKEND-CONTRACT.md`](./docs/BACKEND-CONTRACT.md)** —
> login, cross-device progress, sequential gating, and one unified `/api/fofa/quiz` endpoint that
> grades objective **and** free-response questions server-side. Build the endpoints from that file;
> keep this one only for the webhook/quiz-manifest details it still describes.


**Audience:** the Claude Code session that owns the **Home Assistant** side (it holds the
Claude API key). This file is the complete interface between the Fofa Learning Lab web app and
Home Assistant. If you implement the two webhooks described here, measurables and AI grading light
up with zero changes to the web app.

---

## 1. Why webhooks (the architecture)

Fofa Learning Lab is a **static site** (plain HTML/CSS/JS on GitHub Pages, no server, no build).
A static site **cannot safely hold an API key** — anything in the page is public. So:

```
  ┌─────────────────────┐   POST result (JSON)    ┌──────────────────────┐
  │  Fofa (browser)     │ ──────────────────────► │  Home Assistant       │
  │  fofa-measure.js    │                         │  (holds the Claude key)│
  │                     │ ◄────────────────────── │  webhook automations   │
  └─────────────────────┘   grade response (JSON) └──────────────────────┘
```

- The **only secret is the webhook URL**, which contains an unguessable id. It lives in the
  parent's browser (localStorage, set on `settings.html`) — never in the repo.
- Home Assistant is the backend: it **stores** measurables and, for open-ended work, **grades**
  with Claude and returns feedback.
- Two webhooks (you create both in HA, ids are yours):
  1. **Measurable webhook** — receives every result (fire-and-forget). Configure the parent's
     browser with its URL as *Home Assistant webhook URL*.
  2. **Grading webhook** — receives an open-ended response, calls Claude, and **responds** with a
     score. Configure it as *Grading webhook URL*. Optional; skip it and only auto-graded quizzes
     report.

The web app sends these automatically via the global `Fofa` API in
[`assets/js/fofa-measure.js`](./assets/js/fofa-measure.js). You do not modify the web app.

---

## 2. Measurable webhook — payload it receives

Every completed quiz/activity POSTs one JSON body (`Content-Type: application/json`):

```json
{
  "source": "fofa",
  "type": "measurable",
  "student": "Fofa",                    // parent-entered child name, or null
  "ts": "2026-07-11T15:04:05.000Z",     // ISO 8601, browser clock
  "subject": "science",                 // science | writing | math | reading | settings
  "module": "m1-atomic-structure",      // module id/slug (see the quiz manifest)
  "activity": "quiz",                   // quiz | streak-of-10 | word-solved | test | ...
  "kind": "quiz",                       // quiz | game | build | freeform
  "score": 9,                           // number achieved (may be omitted for pure events)
  "max": 11,                            // out of (may be omitted)
  "detail": { }                         // optional, activity-specific extras
}
```

**Your HA automation** should trigger on this webhook and record it however you like — e.g. update
a per-subject/-module sensor, append to the logbook, tick a to-do, or store in a
`input_text`/helper. Nothing needs to be returned (the browser ignores the response for
measurables).

Minimal HA automation sketch:

```yaml
automation:
  - alias: Fofa – record measurable
    trigger:
      - platform: webhook
        webhook_id: fofa_measurable_REPLACE_WITH_RANDOM   # this id is the secret
        allowed_methods: [POST]
        local_only: false            # set true if the browser is on your LAN only
    action:
      - variables:
          m: "{{ trigger.json }}"
      - service: logbook.log
        data:
          name: "Fofa · {{ m.subject }}"
          message: "{{ m.student }} scored {{ m.score }}/{{ m.max }} on {{ m.module }} ({{ m.activity }})"
      # e.g. also push to a sensor / statistics / notify, as you prefer.
```

---

## 3. Grading webhook — request it receives, response it must return

For open-ended work (free-form writing, reading responses), the web app calls `Fofa.grade(...)`,
which POSTs:

```json
{
  "source": "fofa",
  "type": "grade-request",
  "student": "Fofa",
  "ts": "2026-07-11T15:04:05.000Z",
  "subject": "writing",
  "module": "show-dont-tell",
  "activity": "freeform",
  "kind": "freeform",
  "detail": {
    "prompt": "Rewrite \"She was scared\" without using the word scared…",
    "rubric": "…rubric text or criteria (from quizzes/writing/rubrics.json)…",
    "response": "…the student's writing…"
  }
}
```

**Your grading webhook must RESPOND** (HA webhooks can return a response) with JSON:

```json
{ "ok": true, "score": 3, "max": 4, "feedback": "Great use of the trembling hands! Try adding what she hears next." }
```

- `score`/`max` are numbers; `feedback` is a short kid-facing string.
- On failure return `{ "ok": false, "error": "…" }` — the page shows a graceful fallback.
- **CORS:** because the browser reads this response cross-origin, the HA HTTP integration must
  allow the Pages origin. In `configuration.yaml`:
  ```yaml
  http:
    cors_allowed_origins:
      - https://jbvyvf67cb-ai.github.io      # the GitHub Pages origin serving the lab
  ```
  (The measurable webhook in §2 is fire-and-forget and does not need CORS.)

HA grading automation sketch (Claude does the scoring):

```yaml
automation:
  - alias: Fofa – grade open-ended writing
    trigger:
      - platform: webhook
        webhook_id: fofa_grade_REPLACE_WITH_RANDOM
        allowed_methods: [POST]
    action:
      - variables:
          d: "{{ trigger.json.detail }}"
      # Call Claude however your HA is set up (Anthropic Conversation integration, rest_command,
      # or a script). Prompt Claude to return STRICT JSON {score,max,feedback} judged against d.rubric.
      - service: anthropic.generate   # <- whatever your integration exposes
        response_variable: ai
        data:
          model: claude-sonnet-5
          prompt: >
            You are grading a young student's writing. Rubric: {{ d.rubric }}.
            Prompt was: {{ d.prompt }}. Student wrote: {{ d.response }}.
            Reply with ONLY compact JSON: {"score":<int>,"max":<int>,"feedback":"<one or two warm, specific sentences>"}.
      - stop: ""
        response_variable: ai            # return Claude's JSON as the webhook response
```

Adapt the Claude call to your actual HA setup (the Anthropic integration, a `rest_command`, or a
shell/script). The only hard requirement is that the webhook's **HTTP response body is the JSON
above**.

---

## 4. The quiz manifest — reference/serve quizzes from HA

So HA can *reference* the same questions the site uses (to re-serve them, build dashboards, or
grade auto-gradeable items itself), the canonical quiz banks are exported to JSON under
[`quizzes/`](./quizzes):

- **`quizzes/index.json`** — catalog: `subjects.<subject>.modules[]`, each with `id`, `slug`,
  `title`, `quiz` (path to the per-module JSON), `count`, `gradeable`, and `types`.
- **`quizzes/science/<module-id>.json`** — one file per science module: `{ id, slug, title, source,
  page, gradeable, questions[] }`.
- **`quizzes/writing/rubrics.json`** — rubrics for open-ended writing prompts (used as
  `detail.rubric` in §3).

Question shape (normalized):

```json
{ "id": "q3", "type": "numeric", "prompt": "…", "answer": 35, "tolerance": 0, "explain": "…" }
```

`type` ∈ `mc` (has `choices[]` + `answer` index), `tf` (`answer` bool), `numeric` (`answer` +
`tolerance`), `build` (has `check`, marked `interactiveOnly: true` — graded from live viz state in
the browser, not auto-gradeable server-side).

Fetch them from the deployed site, e.g.
`https://jbvyvf67cb-ai.github.io/fofa-learning-lab/quizzes/index.json`.

**Regeneration:** the JSON is GENERATED from the science `module.js` files by
`node quizzes/_generate.js` (run from the repo root). The `module.js` is the source of truth — do
not hand-edit the JSON.

---

## 5. Quick checklist for the HA session

1. Create the **measurable webhook** automation (§2). Give the parent its URL for
   *Settings → Home Assistant webhook URL*.
2. (Optional) Create the **grading webhook** (§3), wire it to Claude, add `cors_allowed_origins`.
   Give the parent its URL for *Settings → Grading webhook URL*.
3. Test end-to-end: on the lab's **Settings** page, click **Send test result** — you should see a
   `type:"measurable"` POST with `subject:"settings", module:"connection-test"`.
4. (Optional) Pull `quizzes/index.json` to build dashboards or re-serve questions.

That's the whole contract. The web app already speaks it.
