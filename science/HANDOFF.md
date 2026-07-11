# HANDOFF — STEM Visualizations platform

**Purpose of this file:** a cold-start briefing so a new Claude Code session (in a fresh
repository) can understand the project's full status, conventions, and next steps, and keep
building without re-deriving context. Read this first, then `MODULES.md` and `ROADMAP.md`.

Last updated at commit `d916b0b` on branch `claude/stem-visualization-platform-d44uo2`.

---

## 1. What this is

An interactive, **feature-rich STEM visualization platform** for teaching chemistry/physics by
*changing things* (not memorizing). Pedagogy: every visualization exposes controls; students
build/tweak and watch derived quantities respond. Content is aimed at middle school for the
foundational chemistry, rising to high-school/advanced for later modules.

Each visualization is the **Explore** centerpiece of a **Module** = **Learn + Explore + Quiz**
(see §4). The audience-facing goal is a middle-school quiz on atomic structure, expanding outward.

## 2. Tech stack & how to run

- **Static site, NO build step.** Plain HTML + CSS + vanilla JS, Canvas/SVG. No framework, no
  bundler, no npm dependencies shipped. Keep it that way (it's a hard design constraint — easy to
  deploy, view-source friendly for learners).
- **Run locally:** `python3 -m http.server 8000` then open `http://localhost:8000`.
- **Node is used only for dev tooling** (data generation + headless tests), never shipped.

### Testing (do this after any change)
- **Headless smoke test** (loads every page in jsdom, drives interactions, catches runtime errors):
  ```
  npm install --no-save jsdom        # once per environment; node_modules is gitignored
  node assets/data/_smoke.js         # must print PASS for all 7 pages
  ```
- **Syntax check** a JS file: `node --check path/to/file.js`.
- For a `?beta=1` module test, load the page in jsdom with a `file://…?beta=1` URL and a stubbed
  canvas context (see `_smoke.js` for the stub, incl. `createRadialGradient`). jsdom warnings
  "Could not parse CSS stylesheet" and "scrollTo not implemented" are harmless artifacts.

## 3. The shared dataset (single source of truth)

`assets/data/elements.js` — **all 118 elements**, GENERATED. Do not hand-edit.
- Regenerate: `node assets/data/_generate.js` (electron configs computed from aufbau + the
  documented anomalies; positions/shells/valence derived; curated mass, electronegativity,
  ionization energy, covalent radius, phase, category). Self-checks confirm every config sums to Z.
- Globals it exposes to pages: `ELEMENTS`, `ELEMENT_BY_Z`, `ELEMENT_BY_SYMBOL`, `ELEMENT_CATEGORIES`.
- `assets/data/element-facts.js` — curated `ELEMENT_INFO` (crust ppm + a fact for all 118),
  `SYNTHESIS` (synthetic elements), `ISO_ABUND` (natural isotope abundances for 38 elements).

## 4. The module system (Learn / Explore / Quiz)

Architecture doc: **`MODULES.md`**. One module per visualization.

- **Shared shell:** `assets/js/module-shell.js` + `assets/css/module.css`. Injects a top tab bar
  (🔬 Explore / 📖 Learn / ✅ Quiz) around a page. **Gated on `?beta=1`** — with no query string the
  page is the plain visualization (so public pages are unchanged).
- To add the shell to a viz page: (1) put `id="explorePanel"` on the page's main `<main class="wrap">`;
  (2) include `module.css` in `<head>`; (3) load `module.js` then `../../assets/js/module-shell.js`
  after the viz script.
- Each viz supplies `visualizations/<viz>/module.js` defining a global `MODULE = { id, title,
  intro, lessons[], quiz[] }`. Human-readable mirror lives in `visualizations/<viz>/MODULE.md`.
- **Quiz question types:** `mc` (choices+answer idx), `tf` (answer bool), `numeric`
  (answer+tolerance), `build` (graded from the viz's live state).
- **Build-task grading contract:** each viz exposes `window.moduleState()` (read) and
  `window.moduleSetState(preset)` (used by lesson "Set it up in Explore →" presets). A `build`
  question's `check` object is compared to `moduleState()`; each value is a primitive (strict `===`)
  OR a range spec `{ min, max, gt, lt, eq }`.
- Progress (lessons read, quiz best score) is stored in `localStorage` per `MODULE.id`.

### `moduleState()` shapes (per viz)
| viz | moduleState() returns |
|---|---|
| `element-explorer` | `{ z, n, e, charge }` |
| `isotopes` | `{ symbol, avg }` |
| `electron-configuration` | `{ z, shown, levels, valence, filled }` |
| `periodic-table` | `{ symbol, colorMode, highlightMode, highlightValue }` |
| `bonding` | `{ a, b, bondType, bondOrder }` (bondType ∈ ionic/polar/nonpolar/metallic) |
| `vsepr` | `{ bonds, lone, shape, polar }` |
| `laser-diamond` | `{ regime, cuts, timeHelps, boundary, atmos }` |

## 5. Current status — what's built

**7 visualizations, each with a full Learn/Explore/Quiz module (all behind `?beta=1`):**

| # | Module | Folder | Lessons/Quiz | Notes |
|---|--------|--------|--------------|-------|
| M1 | Atomic Structure | `element-explorer` | 8 / 11 | **PUBLIC** on landing page. Existence badge (nature/lab/theoretical/impossible), band-of-stability chart, ion cycler, Z up to 1000 (systematic IUPAC names). |
| M2 | Isotopes & Atomic Mass | `isotopes` | 3 / 8 | weighted-average mass; 17 elements w/ exact isotope masses. |
| M3 | Electron Configuration | `electron-configuration` | 5 / 8 | orbital filling, aufbau ladder, exceptions. |
| M4 | Periodic Table | `periodic-table` | 5 / 8 | all 118; colour-by-trend, highlight group/period/block. |
| M5 | Chemical Bonding | `bonding` | 6 / 8 | ionic/covalent/metallic, polarity, molecule gallery. |
| M6 | Molecular Shape (VSEPR) | `vsepr` | 4 / 7 | electron domains → 3D shape → polarity (vector sum). |
| Adv | Laser on Diamond | `laser-diamond` | 4 / 7 | thermal-physics sim; the two-threshold / boundary insight. |

**Landing page (`index.html`):** shows ONLY the Element Explorer publicly; everything else
(M2–M6 + Advanced) is inside `.beta-only` divs revealed when `?beta=1` (a small script toggles a
`body.beta` class). Keep the public page minimal unless told otherwise.

**Key design decisions the user made along the way:**
- Public landing page = M1 only; rest gated behind `?beta=1`.
- Module = per-visualization (not per-concept). Shared topics owned once (isotopes intro in M1, full
  in M2; reading the table in M4; ions→compounds in M5; valence in M3). See `MODULES.md`.
- Nature filter in Element Explorer defaults to the common natural ion (with a cycler); H special-cased to neutral.
- Element Explorer goes to Z=1000 (theoretical, systematic names).

## 6. Deployment

- GitHub Pages workflow exists at `.github/workflows/pages.yml` (deploys the repo root on push).
- **Not yet live:** the repo owner must set **Settings → Pages → Source = "GitHub Actions"** once;
  the first run failed only because that toggle wasn't set. After that it auto-deploys.
- Expected URLs (project-site pattern `https://<owner>.github.io/<repo>/`):
  landing `/`; a module e.g. `/visualizations/laser-diamond/?beta=1`.
- **NEW REPO NOTE:** update the `branches:` filter in `pages.yml` to the new repo's default branch,
  and the URLs change to the new owner/repo.

## 7. Conventions & gotchas (important)

- **No build step / no framework / no runtime deps.** Don't introduce them.
- **Stray `</content>` tag bug:** when files are written in this environment, a literal `</content>`
  line is sometimes appended to the end. ALWAYS check the tail of a newly written file and strip it:
  `sed -i '/^<\/content>$/d' <file>`, then `node --check`. This bit us repeatedly.
- **`elements.js` is generated** — edit `_generate.js` and regenerate, never edit the output.
- **Gating:** anything not ready for the public goes behind `?beta=1` and inside `.beta-only` on the
  landing page. Confirm the public view is unchanged after edits.
- **Commit style:** end commit messages with the Co-Authored-By/Claude-Session trailer used
  throughout the history. Work on the designated feature branch; push with `-u origin <branch>` and
  retry with backoff on network errors. Don't open PRs unless asked.
- **Testing gate:** run `node assets/data/_smoke.js` (all 7 PASS) before committing UI/JS changes.

## 8. Repository map

```
index.html                       landing page (public = M1 only; ?beta=1 reveals the rest)
README.md                        quick overview
ROADMAP.md                       curriculum tree: trunk → Fork A (stoichiometry) / Fork B (solid-state)
MODULES.md                       module architecture, map, data schemas, moduleState() shapes
HANDOFF.md                       this file
ideas/laser-on-diamond.md        full physics brief for the laser sim (captured from the user)
.github/workflows/pages.yml      GitHub Pages deploy
assets/
  css/main.css                   shared site styles (theme variables)
  css/module.css                 shared Learn/Quiz shell styles
  js/module-shell.js             shared tab bar + lesson renderer + quiz engine + progress
  data/elements.js               GENERATED 118-element dataset
  data/_generate.js              the generator (run: node assets/data/_generate.js)
  data/element-facts.js          crust %, facts, synthesis history, isotope abundances
  data/_smoke.js                 headless jsdom smoke test for all pages
visualizations/<name>/
  index.html                     the page (+ id="explorePanel", module includes)
  <name>.js                      the visualization logic (+ window.moduleState/moduleSetState hooks)
  module.js                      MODULE data (lessons[] + quiz[])
  MODULE.md                      human-readable module content (mirrors module.js)
```

## 9. What's next (suggested, not started)

Per `ROADMAP.md`, the trunk (atomic structure → bonding) is complete and both forks are unlocked:

- **Fork A — Stoichiometry (quantitative):** Mole & Avogadro → Molar Mass (reuse `elements.js`) →
  Balancing & limiting reagent → Gas Laws PV=nRT simulator. Each is a new visualization + module.
- **Fork B — Solid-state (qualitative):** Crystal Lattices → Band Theory (conductor/insulator/
  semiconductor). The bonding module's metallic "electron sea" and the laser sim's band-gap card
  are the on-ramps.
- **Deepen existing modules:** expand quiz banks, add intermolecular forces / states of matter,
  lattice energy; the laser sim could expose its remaining knobs (pulsed/cold-ablation, wavelength,
  oxidation feedback) — see `ideas/laser-on-diamond.md` §4/§8.
- **Landing page → module map:** turn it into a proper learning path with per-module progress bars
  (the shell already tracks progress in localStorage).
- **Pending user review:** the user said they'd give feedback after the full module set was built —
  expect change requests on content/level/UX.

## 10. Migrating to a new repo (checklist)

1. Copy all tracked files (everything except `node_modules/`, which is gitignored).
2. In the new session, `npm install --no-save jsdom` and run `node assets/data/_smoke.js` to confirm
   all 7 pages pass.
3. Update `.github/workflows/pages.yml` `branches:` to the new default branch; enable Pages
   (Settings → Pages → Source = GitHub Actions).
4. Read `MODULES.md` (architecture) + `ROADMAP.md` (curriculum) before adding modules.
5. When adding a module: build the viz → add `moduleState()`/`moduleSetState()` hooks → author
   `module.js` + `MODULE.md` → wire the 3 includes + `id="explorePanel"` → smoke-test → commit.
