# Fofa Learning Lab

An interactive, hands-on learning site for kids — **learn by changing things**. A landing page
serves subjects; each subject is an arc of learning with visualizations, quizzes, and
**measurables** that report back to **Home Assistant**.

**Live (once Pages is enabled):** `https://jbvyvf67cb-ai.github.io/fofa-learning-lab/`

## Subjects

| Subject | Status | Folder |
|---|---|---|
| **Science** | Ready · 7 explorations (Learn/Explore/Quiz) | [`science/`](./science) — merged from `stem-viz` |
| **Writing** | Ready · Unit 1 live (17 modules total) | [`writing/`](./writing) — merged from `Writing` |
| **Math** | Ready · 3 guided lessons live (Probability → Statistics arc) | [`math/`](./math) |
| **Reading** | Coming soon (arc drafted) | [`reading/`](./reading) |

Science and Writing gate their in-progress content behind `?beta=1` (append it to any subject or
module URL to preview everything).

## How it's built

- **Vanilla HTML/CSS/JS, no build step, no dependencies shipped.** Clone and open. Deployed as-is
  to GitHub Pages. (Node is used only for the science smoke test and the quiz-manifest generator.)
- **One design system.** [`assets/css/fofa.css`](./assets/css/fofa.css) owns the canonical palette
  and type tokens. Each subject's shared stylesheet (`science/assets/css/main.css`,
  `writing/assets/css/base.css`) `@import`s it and only aliases its legacy variable names, so every
  module inherits one look without being rewritten.
- **Each subject is self-contained** under its own folder with its own `assets/`, so all in-module
  relative paths keep working.

## Accounts, progress & grading → Home Assistant

The lab is static, so it never holds an API key. A student logs in, and progress, sequential lesson
gating, and quiz grading all run **server-side in Home Assistant** (which holds the Claude key). The
browser only stores a short-lived session token.

- Login + client: [`login.html`](./login.html) + [`assets/js/fofa-account.js`](./assets/js/fofa-account.js)
  (global `FofaAccount`), with a built-in **mock backend** so it runs before the integration exists
  (demo login `fofa` / `learn`).
- Gating: [`assets/js/fofa-gate.js`](./assets/js/fofa-gate.js) +
  [`assets/js/fofa-lesson-guard.js`](./assets/js/fofa-lesson-guard.js), driven by
  [`curriculum/index.json`](./curriculum/index.json).
- Parent setup: open [`settings.html`](./settings.html) and set the Home Assistant base URL.
- **The full contract for the Home-Assistant side is in
  [`docs/BACKEND-CONTRACT.md`](./docs/BACKEND-CONTRACT.md)** — `login`/`state`/`progress`/`quiz`
  endpoints, gating, and the quiz manifest.
- Canonical quiz data: [`quizzes/`](./quizzes) (`index.json` + per-module JSON, generated from the
  science `module.js` files via `node quizzes/_generate.js`).

## Run & test locally

```bash
python3 -m http.server 8000        # then open http://localhost:8000
node quizzes/_generate.js          # regenerate the quiz manifest after a science quiz changes
cd science && npm install --no-save jsdom && node assets/data/_smoke.js   # science smoke test (7/7)
```

## Deploy

`.github/workflows/pages.yml` publishes the whole repo to Pages on push. **One-time:** in the repo,
Settings → Pages → Source = "GitHub Actions".

## For the next session

Several Claude Code sessions build this repo in parallel — start with
[`docs/MULTI-SESSION.md`](./docs/MULTI-SESSION.md) (who owns what + shared-branch rules), then
[`HANDOFF.md`](./HANDOFF.md) (architecture, how to add a subject/module/quiz). The Home-Assistant
backend is built in a separate private session against
[`docs/BACKEND-CONTRACT.md`](./docs/BACKEND-CONTRACT.md). Each merged subject also keeps its own
original `HANDOFF/MODULES/ROADMAP` under its folder.
