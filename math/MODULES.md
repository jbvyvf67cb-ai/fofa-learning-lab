# Math — learning modules (Probability → Statistics)

Math follows the same **module** model as science: one coherent unit built around a single
interactive visualization, bundling three tabs.

```
┌─ MODULE ──────────────────────────────────────────────┐
│  📖 Learn    a few short lesson cards (concept-sized)   │
│  🔬 Explore  the interactive lab                        │
│  ✅ Quiz     question bank + "set it up" build tasks    │
│              graded from the lab's live state           │
└────────────────────────────────────────────────────────┘
```

The shell is the **same shared code** as science, copied into this subject so it's self-contained:
`math/assets/js/module-shell.js` (reports `subject:"math"`) + `math/assets/css/module.css`, both
themed through `math/assets/css/main.css` → `assets/css/fofa.css`. The Learn/Quiz tabs are gated on
`?beta=1`; without it the page is just the Explore lab.

## Course map

The whole course requires **only arithmetic and a little algebra**. It's one arc that starts by
*counting* outcomes and ends by *describing* data — probability and statistics as two views of the
same picture.

| # | Module | Explore (visualization) | Owns these ideas | Status |
|---|--------|-------------------------|------------------|--------|
| **P1** | Dice & Probability | `dice-probability` | probability of a single outcome (1/N); independent events (AND ×, OR +); sample space N^k; counting ordered ways to make a sum; distribution shape; intro to the law of large numbers | ✅ written |
| **P2** | Coins, Spinners & "At Least One" | *(new)* | complement rule P(not A)=1−P(A); mutually exclusive OR; the "at least one" complement trick | planned |
| **P3** | Combinations — order doesn't matter | *(new)* | choosing vs. arranging; Pascal's triangle by counting; "n choose k" | planned |
| **P4** | Conditional Probability & Trees | *(new)* | dependent events; drawing without replacement; tree diagrams; multiply along branches | planned |
| **S1** | Describing Data | *(new)* | mean, median, mode, range | planned |
| **S2** | Spread | *(new)* | range, quartiles, box plots, mean absolute deviation | planned |
| **S3** | Histograms & Shape | *(new)* | binning data; the bell shape returns | planned |
| **S4** | Expected Value & Fair Games | *(new)* | expected value = Σ(payoff × probability); is a game fair? | planned |

Content for each module lives in that visualization's folder as `MODULE.md`
(e.g. `visualizations/dice-probability/MODULE.md`). This file is the index.

### Ownership of shared ideas (no duplication)
- **Counting ordered outcomes** (permutations, order matters): introduced in **P1** (sums);
  the *order-doesn't-matter* counterpart (combinations) is **P3**.
- **Multiplying probabilities**: independent AND in **P1**; dependent/branch multiplication in **P4**.
- **The bell shape / distribution**: first seen as the dice-sum triangle in **P1**; revisited as a
  data histogram in **S3**.
- **Averages**: the *weighted* average idea appears as expected value in **S4** and mean in **S1**.

## Data schemas (MODULE.md ↔ module.js), shared with science
See `science/MODULES.md` for the full lesson-card and quiz-question schemas — they're identical.
A quiz `build` question is graded against the lab's `window.moduleState()`:

- `dice-probability` → `{ sides, dice, sum, ways, total, pSum, pFace }`

Each `check` value may be a primitive (strict `===`) or a spec `{ min, max, gt, lt, eq }` for numeric
ranges. A lesson's `tryIt.preset` may set the lab via `window.moduleSetState({ sides, dice, sum })`.

## Build order
1. **P1 (this step):** the Dice & Probability lab + `module.js` + `MODULE.md` — the template for the
   whole course.
2. **P2–P4:** flesh out each `MODULE.md`, add its lab + `module.js`, drop in the shared shell.
3. **S1–S4:** the statistics half, reusing the same shell around data-oriented visualizations.
4. Keep `curriculum/index.json` (the `math` arc) in step with new modules for sequential gating.
