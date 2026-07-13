# Math ROADMAP — a Probability → Statistics course

**Design promise:** every module uses **only arithmetic and a little algebra**. No calculus, no
memorized formulas without a visible reason. The through-line is *counting*: probability is careful
counting of outcomes, and statistics is careful counting of data. Same skill, two directions.

## The arc

### Unit A — Probability (learn chance by rolling, flipping, counting)
1. **P1 · Dice & Probability** ✅ *built*
   - One die: P(a single number) = 1/N; fair = equally likely; fraction/decimal/percent.
   - Many-sided dice: bigger N → each number rarer.
   - Chaining dice: independent events multiply (AND ×); N^k ordered outcomes; (1/N)^k each.
     Mutually exclusive OR adds.
   - Sums: P(sum) = ways ÷ N^k; count the **ordered** ways (permutations, order matters); why 7 beats 2.
   - Distribution shape: triangle for 2 dice → bell for more. Monte-Carlo roller → law of large numbers.
2. **P2 · Coins, Spinners & "At Least One"**
   - Complement rule P(not A) = 1 − P(A); the "at least one" trick (1 − P(none)).
   - OR for mutually exclusive events; when you can/can't just add.
3. **P3 · Combinations — when order doesn't matter**
   - Choosing vs. arranging; (1,4) and (4,1) as the *same* pick.
   - Build Pascal's triangle by counting; "n choose k".
4. **P4 · Conditional Probability & Trees**
   - Dependent events; drawing without replacement; tree diagrams; multiply along the branches.

### Unit B — Statistics (describe real data with the same counting)
5. **S1 · Describing Data** — mean, median, mode, range (drag points, watch them move).
6. **S2 · Spread** — range, quartiles, box plots, mean absolute deviation.
7. **S3 · Histograms & the Shape of Data** — bin data into bars; the bell returns.
8. **S4 · Expected Value & Fair Games** — Σ(payoff × probability); is a bet fair?

## Bridges between the two halves
- P1's dice-sum triangle **is** the histogram of S3 — introduce the shape early, name it late.
- P1's "count the ways" (order matters) sets up P3's "count the picks" (order doesn't).
- P1/P4's "multiply probabilities" sets up S4's expected value (weighted sum).

## Conventions (so P2+ match P1)
- One interactive lab per module, in `math/visualizations/<slug>/` with `index.html`,
  `<slug>.js` (the lab), `module.js` (Learn cards + Quiz), and `MODULE.md` (source of truth).
- Reuse the shared shell: link `../../assets/css/main.css`, `../../assets/css/module.css`, then the
  lab script, `module.js`, the root `fofa-account.js` + `fofa-measure.js`,
  `../../assets/js/module-shell.js`, and `../../../assets/js/fofa-lesson-guard.js`.
- Expose `window.moduleState()` (for build-task grading) and `window.moduleSetState()` (for lesson
  presets).
- Add each new module to `curriculum/index.json` under `math` for sequential gating, and a card on
  `math/index.html`.
