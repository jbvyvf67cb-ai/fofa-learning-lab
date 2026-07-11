# HANDOFF — Fofa Learning Lab

**Purpose:** cold-start briefing for a fresh Claude Code session. Read this first, then
[`MEASURABLES.md`](./MEASURABLES.md) for the Home Assistant contract. Each merged subject also has
its own original handoff under `science/HANDOFF.md` and `writing/HANDOFF.md`.

## 1. What this is

Fofa Learning Lab is a learning site for a kid. A landing page serves subjects (Science, Writing
live; Math, Reading coming soon). Each subject is an arc of learning = visualizations + quizzes +
**measurables** that report to **Home Assistant**. A separate Claude session owns the HA side (it
holds a Claude API key for grading open-ended work); this repo is the web app + the contract it
speaks.

It was assembled by merging two finished, philosophically-identical static sites:
`stem-viz` → `science/`, `Writing` → `writing/`.

## 2. Hard constraints (do not break)

- **Vanilla HTML/CSS/JS, no build step, no shipped dependencies, relative paths only.** The repo IS
  the site. (Node is used only for `science/assets/data/_smoke.js` and `quizzes/_generate.js`.)
- **No API keys in the browser, ever.** Measurables go out via a Home Assistant **webhook** whose
  URL is the only secret and lives in `localStorage` (set on `settings.html`) — never in the repo.
- **`?beta=1` gating is preserved** in both subjects: the public view is intentionally minimal
  (science = Element Explorer only; writing = Unit 1 only). In-progress content shows only with
  `?beta=1`. Keep it that way unless the owner says otherwise.

## 3. Repository map

```
index.html            Fofa landing (4 subjects)          settings.html   parent → HA config
assets/css/fofa.css   canonical design tokens + Fofa components
assets/js/fofa-measure.js   measurables engine (global Fofa)
math/ reading/        coming-soon subject pages (arcs)
science/              merged stem-viz (own assets/, 7 modules, Learn/Explore/Quiz shell)
writing/              merged Writing (own assets/, 17 modules, game-style)
quizzes/              generated quiz manifest (index.json + science/*.json) + writing/rubrics.json
MEASURABLES.md        THE Home Assistant contract (webhooks + grading + manifest)
.github/workflows/pages.yml   single Pages deploy for the whole repo
```

## 4. The unified design system (how it works)

The two sites were already sibling dark-blue palettes. Unification did **not** rewrite the 24
modules — instead:

- [`assets/css/fofa.css`](./assets/css/fofa.css) is the **single source of truth** for the palette
  and a two-face type system: `--font-display` (serif, for big headings) + `--font-ui` (sans). It
  also holds the `.fofa-*` components used by Fofa's own pages (landing/settings/placeholders) and a
  global `h1,h2 { font-family: var(--font-display) }` rule so headings match everywhere.
- `science/assets/css/main.css` and `writing/assets/css/base.css` each `@import` fofa.css (path
  `../../../assets/css/fofa.css`) and keep only an **alias `:root`** mapping legacy names to the
  canonical tokens (e.g. science `--ink-dim: var(--ink-mute)`, `--font: var(--font-ui)`; writing
  `--font: var(--font-display)`) plus subject-only colors (science particles, writing `--pos-*`).
- Every module themes through CSS variables loaded via those two stylesheets, so editing them
  propagates one look to all modules. Science and writing pages never load each other's CSS, so
  their overlapping class names (`.card`, `.hero`) never collide.

## 5. The measurables engine

`assets/js/fofa-measure.js` exposes `window.Fofa`:

- `Fofa.config` / `Fofa.setConfig({child,webhookUrl,gradeUrl})` — read/persist parent config
  (`localStorage["fofa:config"]`, shared across all subject subpaths since localStorage is
  per-origin).
- `Fofa.report({subject,module,activity,kind,score,max,detail})` → mirrors to
  `localStorage["fofa:progress"]` and fire-and-forget POSTs to the HA measurable webhook. Returns
  `{sent}`.
- `Fofa.grade({subject,module,prompt,rubric,response})` → POSTs to the HA grading webhook and awaits
  `{ok,score,max,feedback}` for open-ended work.
- `Fofa.progress()` / `Fofa.clearProgress()`.

**Wired in:** science `assets/js/module-shell.js` `markScore()` calls `Fofa.report` when a quiz is
fully answered; writing `word-sort` (streak win) and `parts-of-speech-detective` (word solved) call
it too. Module pages load the engine via `../../../assets/js/fofa-measure.js` (root shared asset),
distinct from each subject's own `../../assets/...`.

The webhook/grading/manifest schemas are documented in [`MEASURABLES.md`](./MEASURABLES.md) — the
interface for the HA-side session.

## 6. How to add things

- **A quiz measurable to a writing module:** load `../../../assets/js/fofa-measure.js`, then at the
  win/solve point call `Fofa.report({subject:"writing", module:"<slug>", activity:"…", kind:"game",
  score, max})`. That's the whole integration.
- **Open-ended grading (reading/writing):** collect the response, call
  `Fofa.grade({subject,module,prompt,rubric,response})`, render `feedback`. Add the rubric to
  `quizzes/writing/rubrics.json`.
- **A new subject:** add `<subject>/` (self-contained, its own `assets/` importing fofa.css), a
  coming-soon or live `index.html`, a card on the Fofa `index.html`, and (if live) a `../` back-bar.
- **A new science quiz question:** edit the module's `module.js`, then `node quizzes/_generate.js`.

## 7. Verify before committing

```bash
python3 -m http.server 8000                       # zero console errors on every page
cd science && node assets/data/_smoke.js          # 7/7 PASS
node quizzes/_generate.js                         # manifest regenerates cleanly
```
A headless-browser check (Playwright + `/opt/pw-browsers/chromium-1194`) that asserts no console
errors and drives the Settings "Send test result" flow is the fastest end-to-end confidence check —
see the session history for the script.

## 8. Conventions

- Work on the designated feature branch; push `-u origin <branch>` with backoff on network errors.
  Don't open PRs unless asked.
- Watch for the stray `</content>` write-artifact at the end of newly-written files (it contaminated
  some source files on import); strip lone `</content>` lines and re-check.
- Owner reviews visually — take screenshots of interactions when confirming work.
