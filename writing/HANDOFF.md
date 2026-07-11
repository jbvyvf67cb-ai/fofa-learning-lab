# Writing Lab — Session Handoff

**Read this first.** It is written for a fresh Claude Code session picking up
this project (likely after the code is copied into a new repository). It tells
you what this is, how it's built, exactly where things stand, and what to do
next. When you make meaningful progress, **update this file** so the next
handoff stays accurate.

_Last updated at commit `51312b6` (branch `claude/effort-estimation-9bd9b4`)._

---

## 1. What this project is

**Writing Lab** is an interactive language-arts learning site — the
"learn by changing things" companion to a sibling STEM project
([stem-viz](https://github.com/jbvyvf67cb-ai/stem-viz)). Students learn to
write by taking sentences apart: clicking words to see their jobs, dragging
parts of speech, splitting subjects from predicates, and so on.

**Curriculum shape:** a **trunk** (grammar mechanics, Units 1–4 + a Style
branch point) that everyone walks, then **branches** (writing modes:
descriptive, persuasive, narrative, expository) that reuse the same primitives.
The full arc lives in [`ROADMAP.md`](./ROADMAP.md).

**Audience:** school-age students. Keep interactions concrete, forgiving, and
manipulable. Grammar accuracy is non-negotiable — this is a teaching tool.

---

## 2. Tech stack & hard rules

- **Vanilla HTML/CSS/JS only. No frameworks, no build step, no npm, no bundler,
  no external resources/CDNs.** Clone and open. This constraint is deliberate
  (mirrors stem-viz) — do not introduce dependencies.
- One self-contained folder per experience under `visualizations/<slug>/index.html`,
  with page-specific CSS/JS inline in that file.
- Two shared files, and only two, are pulled in by every module:
  - `assets/css/base.css` — the design system (CSS variables + components).
  - `assets/data/grammar.js` — the authoritative dataset (global `WL_GRAMMAR`).
- **Relative asset paths only.** From a module: `../../assets/...`, home link
  `../../`, Experiences link `../../#modules`. From root `index.html`:
  `assets/...`. Root-absolute `/assets/...` **breaks on GitHub Pages** (the site
  is served from a `/Writing/` subpath), so never use it.
- Accessibility: real `<button>`s, keyboard-operable, color always paired with a
  text/shape cue (never color alone). `base.css` handles `:focus-visible`.
- Every page must load with **zero console errors**.

Full authoring conventions are in [`MODULES.md`](./MODULES.md).

---

## 3. Repository layout

```
index.html                 Landing page (unit-grouped card grid)
README.md · ROADMAP.md · MODULES.md · HANDOFF.md (this file)
.nojekyll                  Serve files as-is on Pages (no Jekyll processing)
.github/workflows/pages.yml  Auto-deploy to GitHub Pages on push
assets/
  css/base.css             Design system + canonical part-of-speech colors
  data/grammar.js          Authoritative dataset -> global WL_GRAMMAR
visualizations/<slug>/index.html   17 modules (see status below)
```

---

## 4. The shared data contract (`assets/data/grammar.js`)

Everything is exposed on the global `WL_GRAMMAR`. Modules read from it; they
must **not** hardcode part-of-speech colors — pull them from here so the color
code ("nouns are blue, verbs red, …") stays identical across every module.

Keys currently exported:

- `PARTS` — `{ noun, pronoun, verb, adjective, adverb, preposition,
  conjunction, article, interjection }`, each `{ label, color, short, blurb,
  examples[] }`. **This is the color source of truth.**
- `POS_ORDER` — the 9 pos keys in canonical display order.
- `SENTENCES` — example sentences; tokens tagged `{ w, pos, role, head }`
  (role = subject/predicate/modifier). Used by Sentence Anatomy + hero demo.
- `WORD_BANK` — **285 words** `{ w, pos }`, built by category then flattened.
  228 are noun/verb/adjective/adverb (kept deliberately unambiguous so sorting
  games are fair). Used by Word Sort.
- `DISGUISES` — **14 words** `{ word, uses:[{ pos, text, idx }] }` where `idx`
  is the target word's 0-based position in `text.split(" ")`. Used by
  Part-of-Speech Detective.
- `WORD_FORMS`, `CORE_SENTENCES`, `BUILDER`, `FRAGMENTS`, `OBJECTS`,
  `OBJECT_ROLES`, `PHRASE_TYPES`, `PHRASES`, `CLAUSES`, `SENTENCE_TYPES`,
  `SENTENCE_TYPE_INFO`, `PUNCTUATION_PAIRS`, `RUNONS`, `ACTIVE_PASSIVE`,
  `RHYTHM`, `COMBINE`, `REDUCE`, `PARALLELISM` — one dataset per later-unit
  module (see the file's section comments for exact shapes).

**Data integrity is critical.** After editing grammar.js, run a quick node
check (it's plain JS; `global.window = global; require('./assets/data/grammar.js')`)
to confirm it parses and, for `DISGUISES`, that each `idx` points at the target
word. There's an example check pattern in the git history of this session.

---

## 5. Current status — what's built

**All 17 trunk modules exist, work, and are verified (zero console errors).**
The public site is intentionally scoped to Unit 1 (see §6).

**Unit 1 · Parts of speech** (the current focus)
- `sentence-anatomy` — click a word → part of speech + role; toggle
  subject/predicate split. Exploration, no quiz (intentionally).
- `word-sort` — **untimed**; goal is a **streak of 10 correct in a row**
  (10 pips; a wrong answer resets the streak and shows the right answer).
  Drag / tap / keys 1–4.
- `parts-of-speech-detective` — **redesigned**: a word's sentences shown side
  by side; a palette of **all 9 parts of speech**; student drags/taps the
  correct pos under each sentence; solving all of a word reveals the
  "same spelling, different job" lesson. 14 words.
- `word-shape-lab` — morph one root across parts of speech
  (beauty → beautify → beautiful → beautifully).

**Units 2–4 + Style branch point** — built and functional, but **preview-only**
(gated, see §6). Slugs: `subject-predicate`, `sentence-builder`,
`complete-or-fragment`, `object-tracker`, `phrase-painter`, `clause-combiner`,
`sentence-type-sorter`, `punctuation-playground`, `run-on-repair`,
`rhythm-and-length`, `active-passive`, `combining-reducing`, `parallelism-tuner`.

**Not built yet:** the writing-mode branches (descriptive, persuasive,
narrative, expository). These are the next major body of work.

---

## 6. Important: the `?beta=1` gate

Per the project owner, the public landing page (`index.html`) shows **only
Unit 1**. Everything past Unit 1 is wrapped in `<div id="beta" hidden>` and
revealed only when the page is opened with **`?beta=1`** (a small script checks
the query string). The later modules still work by direct URL — there is simply
no click-path to them from the main page.

If you add Unit 1 content, surface it normally. If you touch Units 2+ or the
branches, keep them inside the `#beta` gate until the owner says otherwise.

---

## 7. Design system quick reference (`assets/css/base.css`)

- Colors: `--bg, --bg-soft, --panel, --panel-2, --line, --ink, --ink-soft,
  --ink-mute, --accent, --accent-warm, --good, --bad`, plus `--pos-*` mirrors
  of the parts-of-speech colors (JS reads them from `WL_GRAMMAR.PARTS` instead).
- Fonts: `--font` (serif, for headings/sentences), `--ui-font` (sans, for UI).
- Components: `.site-head/.brand/.glyph`, `.wrap`, `.panel/.pad`,
  `.btn(.primary/.ghost)`, `.chip/.dot`, `.eyebrow`, `.card/.grid`,
  `.site-foot`, `.row/.spacer`, `.muted/.center`.
- Every module page starts `<main class="wrap">` with an `.eyebrow` unit label,
  an `<h1 style="font-family:var(--font)">`, a `<p class="muted">` intro, then
  content inside `<section class="panel pad">`. Each has an inline SVG favicon
  (a ¶ mark) — copy it from any existing module's `<head>`.

The fastest way to build a new module correctly is to **copy an existing one**
(e.g. `word-sort` for game-style, `sentence-anatomy` for sentence rendering,
`parts-of-speech-detective` for drag-and-drop) and adapt.

---

## 8. Deploy (GitHub Pages)

- `.github/workflows/pages.yml` deploys the repo (no build) to Pages on push to
  `main` or the current dev branch, plus `workflow_dispatch`.
- **One-time setup already done on the original repo:** Settings → Pages →
  Source = "GitHub Actions". **A NEW repo will need this toggled once** — the
  Actions token cannot enable Pages itself (it lacks admin scope; attempting
  `enablement: true` fails with "Resource not accessible by integration").
  After that one toggle, every push auto-deploys.
- If deploying from a non-default branch, the `github-pages` environment may
  restrict deploys to the default branch; merging to `main` resolves it.
- `.nojekyll` is present so files (including `.md`) serve as-is.
- Original live site: https://jbvyvf67cb-ai.github.io/Writing/ (beta preview:
  append `?beta=1`). A new repo will have its own `<owner>.github.io/<repo>/` URL.

**Verifying locally:** `python3 -m http.server 8000` then open
`http://localhost:8000`. This session verified modules with headless Chromium at
`/opt/pw-browsers/chromium` via the globally-installed Playwright at
`/opt/node22/lib/node_modules/playwright` — the standard "load page, assert no
console errors, click through buttons + keys" smoke test. Reuse that approach.

---

## 9. Suggested next steps (in priority order)

1. **Deepen Unit 1** if the owner wants more there first. Candidate additions:
   a "Part-of-Speech Detective" difficulty ramp, or more `SENTENCES` variety in
   Sentence Anatomy. (Owner has signaled Unit 1 is the current focus.)
2. **Build the first writing-mode branch: Descriptive writing.** Suggested
   modules: a show-don't-tell rewriter, and simile/metaphor/personification
   sandboxes. Add the needed datasets to `grammar.js`, build under
   `visualizations/`, and keep them inside the `#beta` gate (or a new gate)
   until promoted. Update `ROADMAP.md` (`🔜` → `✅`) and `README.md`.
3. When promoting anything out of preview, remove it from the `#beta` block in
   `index.html` and give it a normal card.

### An open question the owner left pending
In Word Sort, a wrong answer currently **keeps the same word** on screen so the
student can place it correctly before moving on. The owner was asked whether it
should instead **advance to a new word** on a miss (pure "start over" pressure).
If they answer, apply it in `visualizations/word-sort/index.html` (`attempt()`
function — the wrong-answer branch).

---

## 10. Working agreements observed so far

- Owner wants a **live, auto-deploying** site and minimal manual git/ops work.
- Owner reviews visually — take screenshots of interactions when confirming work.
- Commit in logical chunks with descriptive messages; push to the working
  branch; do **not** open PRs unless asked.
- Keep grammar correct and interactions forgiving/manipulable ("learn by
  changing things").
