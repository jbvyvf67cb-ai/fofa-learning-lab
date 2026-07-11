# Learning Modules — architecture & map

The platform is organized as **modules**. A module is one coherent learning unit built
around a single visualization, bundling three parts:

```
┌─ MODULE ──────────────────────────────────────────────┐
│  📖 Learn    a few short lesson cards (concept-sized)   │
│  🔬 Explore  the interactive visualization              │
│  ✅ Quiz     question bank + "build/do it" tasks        │
│              graded from the visualization's live state │
└────────────────────────────────────────────────────────┘
```

**One module per visualization.** Each visualization we've built (or will build) is the
Explore centerpiece of exactly one module and owns its own Learn cards and Quiz.

## Module map

| # | Module | Explore (visualization) | Owns these topics | Content status |
|---|--------|-------------------------|-------------------|----------------|
| **M1** | Atomic Structure | `element-explorer` | subatomic particles; charge & ions; mass & mass number; atomic number / identity; **intro** isotopes; nuclear stability; radioactive decay; (bonus) history of the atom | ✅ written |
| **M2** | Isotopes & Atomic Mass | `isotopes` | isotopes deep-dive; abundance; **average atomic mass** (weighted) | ✅ written |
| **M3** | Electron Configuration | `electron-configuration` | shells / energy levels; orbitals & spin; valence electrons; aufbau order + exceptions | ✅ written |
| **M4** | Periodic Table | `periodic-table` | reading a cell; periods vs. groups; metals/nonmetals; periodic trends | ✅ written |
| **M5** | Chemical Bonding | `bonding` | why atoms bond (octet); ionic; covalent (single/double/triple, polarity); metallic | ✅ written |
| **M6** | Molecular Shape | `vsepr` | electron domains → shape; shape → polarity | ✅ written |
| **Adv** | Laser on Diamond | `laser-diamond` | bandgap/transparency; thermal conduction; boundary & finite-size heat loss; graphitization runaway; the two thresholds | ✅ written |
| *Fork A* | Mole, Molar Mass, Stoichiometry, Gas Laws | *(new)* | quantitative path | planned |
| *Fork B* | Crystal Lattices, Band Theory | *(new)* | solid-state path | planned |

Content for each module lives in that visualization's folder as `MODULE.md`
(e.g. `visualizations/element-explorer/MODULE.md`). This file is the index.

### Advanced modules
- **Laser on Diamond** ✅ built — a thermal-physics + finite-size simulation (does "infinite
  time" help you cut a diamond? depends on the boundary). Own visualization, reuses the module
  shell. Full spec: [`ideas/laser-on-diamond.md`](ideas/laser-on-diamond.md).

### Ownership of shared topics (no duplication)
- **Isotopes**: a light *intro* card in **M1** (build different-neutron atoms); the full
  treatment + **average atomic mass** in **M2**.
- **Reading the periodic table / valence**: a preview mention in M1's stability card; the
  real content in **M4** (and valence configuration in **M3**).
- **Ions → compounds**: charge/ions taught in **M1**; how ions *form compounds* in **M5**.
- **Valence electrons**: introduced in **M3**, applied in **M4** (groups) and **M5** (bonding).

## The shared "module shell" (to build once, reuse everywhere)

Each visualization page gets a lightweight three-tab shell wrapped around the existing viz:

- **Explore** (default tab) — the visualization exactly as it is today.
- **Learn** — renders the module's lesson cards (read → *try it* prompt → check questions).
- **Quiz** — runs the module's question bank; shows score + explanations.

Design goals: no framework, no build step (matches the rest of the site); the shell is a
single shared script + stylesheet; each viz supplies only its **content data**.

### Planned file layout
```
assets/js/module-shell.js        shared: tab bar, lesson renderer, quiz engine, progress
assets/css/module.css            shared styles for cards / quiz
visualizations/<viz>/MODULE.md   human-readable content (this is the source of truth)
visualizations/<viz>/module.js   the same content as data (lessons[] + quiz[]) the shell reads
```
The landing page (`index.html`) becomes a **module map / learning path**: cards for M1…M6
that open each module (still public = M1 only until we choose otherwise; `?beta=1` reveals the rest).

### Progress & scoring
- Stored in `localStorage` per module: which lessons were read, quiz best score, build-tasks passed.
- No accounts. A small progress bar per module on the map.

## Data schemas (so MODULE.md maps 1:1 to module.js)

**Lesson card**
```js
{ id, title, goal,
  body: "html string",            // the explanation
  keywords: ["atom","nucleus"],
  misconception: "…",
  tryIt: { prompt: "…", preset?: {…} }   // preset can auto-configure the viz
}
```

**Quiz question** (types)
```js
{ type:"mc",      q, choices:[…], answer: idx, explain }
{ type:"tf",      q, answer: true|false, explain }
{ type:"numeric", q, answer: n, tolerance: 0, explain }
{ type:"build",   q, check: {…}, explain }   // graded from the viz's live state
```

**Build-task grading contract.** Each visualization exposes a read-only hook the quiz can
poll, e.g. the Element Explorer would expose `window.moduleState()` → `{ z, n, e, charge }`.
A `build` question's `check` (e.g. `{ z:8, n:10, charge:0 }`) is compared against it. Each
value may be a primitive (strict `===`) or a spec `{ min, max, gt, lt, eq }` for numeric
ranges (e.g. `{ avg: { min: 35.7, max: 36.2 } }`). Tasks may also optionally *set* the viz to
a starting state via `tryIt.preset`. Per-viz `moduleState()` shapes:
`element-explorer {z,n,e,charge}` · `isotopes {symbol,avg}` · `electron-configuration
{z,shown,levels,valence,filled}` · `periodic-table {symbol,colorMode,highlightMode,highlightValue}`
· `bonding {a,b,bondType,bondOrder}` · `vsepr {bonds,lone,shape,polar}`.

## Build order
1. **Docs (this step):** MODULES.md + per-visualization MODULE.md content (M1 full, M2–M6 drafts).
2. **Pilot the shell on M1** (Atomic Structure) — it's the module whose content is finished.
   Build `module-shell.js` + `module.css`, add the `moduleState()` hook to the Element
   Explorer, wire M1's `module.js`. This becomes the template.
3. **Replicate to M2–M6:** flesh out each MODULE.md, add its `module.js`, drop in the shell.
4. **Landing page → module map.**

## History note
The original `LEARNING.md` (atomic-structure content) has been split into this module model:
its core became `visualizations/element-explorer/MODULE.md` (M1), with the average-atomic-mass
card moving to M2, reading-the-table to M4, and ions→compounds to M5.
