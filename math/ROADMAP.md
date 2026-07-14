# Math ROADMAP — a Probability → Statistics course

**Design promise:** every module uses **only arithmetic and a little algebra**. No calculus, no
memorized formulas without a visible reason. The through-line is *counting*: probability is careful
counting of outcomes, and statistics is careful counting of data. Same skill, two directions.

Lessons use the **guided-lesson format** (see `MODULES.md`): one scrolling page, teaching and
interactive interleaved, sample space always drawn. One idea per lesson — we go slowly, because this
foundation carries the whole course.

## The arc

### Unit A — Probability (learn chance by rolling, flipping, counting)
The first three lessons are the fundamentals, taught deliberately slowly on the humble die.

1. **Lesson 1 · The Single Die** ✅ *built* — basic probability, one die only.
   - The six faces **drawn** as the sample space; a roll = one of them.
   - Fair = **equally likely** (fairness tally that evens out as you roll).
   - Probability = **(faces that count) ÷ 6**; written as fraction, decimal, percent.
   - Many-sided dice: one number out of N = 1/N; more sides → rarer.
2. **Lesson 2 · Two Dice & the Sample Space** ✅ *built* — chaining, drawn.
   - Add a second die → the **6×6 = 36 grid**, drawn and counted.
   - Every square equally likely; a roll = landing on one square; P(one pair) = 1/36.
   - The multiplication rule (6×6) seen as the grid's area, not a formula.
3. **Lesson 3 · Sums & Permutations** ✅ *built* — where the shape comes from.
   - **Mark** the squares that add to a total → count ÷ 36 (a find-the-squares game).
   - **Permutations**: (1,5) and (5,1) are different squares — mirror pairs across the diagonal.
   - The distribution is just **how many squares sit on each sum-stripe**; the "bell" is counting.
4. **Lesson 4 · Coins & "At Least One"** ✅ *built* — three new moves on the simplest random thing.
   - **Complement** rule P(not A) = 1 − P(A), shown as a green/red bar that always fills to 1.
   - The sample space **doubles** with each coin → a drawn **tree** of 2^N sequences (the grid could
     only reach two dimensions; the tree keeps going).
   - **"At least one"** = 1 − P(none): count the single all-Tails way to fail and subtract.
5. **Lesson 5 · Combinations** ✅ *built* — when order doesn't matter.
   - Group coin sequences by # Heads → the bin sizes are the combinations C(n,k).
   - Pascal's triangle by counting (each entry = sum of the two above); "choose which k of n are Heads".
6. **Lesson 6 · Conditional Probability & Trees** ✅ *built* — when one event changes the next.
   - Draw marbles without replacement → the 2nd draw's odds change (conditional probability).
   - A probability tree: multiply along a path; add across the leaves that make up an event.
7. **Lesson 7 · Monty Hall** ✅ *built* — counting beats intuition.
   - Enumerate the tiny 3-door sample space (switch wins 2 of 3); a playable game; and a simulation
     of switch-vs-stay that converges to 2/3 vs 1/3.
   - *(Optional bonus, a separate counting/information strand: the 21-card "guess your card" trick —
     deterministic base-3 narrowing, 27 → 9 → 3 → 1, not probability but a lovely contrast to it.)*

### Unit B — Statistics (describe real data with the same counting)
5. **S1 · Describing Data** — mean, median, mode, range (drag points, watch them move).
6. **S2 · Spread** — range, quartiles, box plots, mean absolute deviation.
7. **S3 · Histograms & the Shape of Data** — bin data into bars; the bell returns.
8. **S4 · Expected Value & Fair Games** — Σ(payoff × probability); is a bet fair?

## Bridges between the two halves
- Lesson 3's dice-sum shape **is** the histogram of S3 — introduce the shape early, name it late.
- Lesson 3's "count the ways" (order matters) sets up Lesson 5's "count the picks" (order doesn't).
- The "multiply probabilities" idea sets up S4's expected value (weighted sum).

## Conventions (so Lesson 4+ match 1–3)
- One guided lesson per folder, in `math/visualizations/<slug>/` with `index.html` (the steps + prose)
  and `<slug>.js` (the interactives + inline `Lesson.check(...)` calls). No separate content/quiz file
  and no tabs — the page *is* the lesson.
- Reuse the shared kit: link `../../assets/css/main.css` + `../../assets/css/lesson.css`, then the
  root `fofa-account.js` + `fofa-measure.js`, `../../assets/js/lesson-kit.js`, the lesson's own
  `<slug>.js`, and `../../../assets/js/fofa-lesson-guard.js` (see any built lesson's `<head>`).
- Build interactives with `Lesson.die` / `Lesson.grid`; end `<slug>.js` with
  `Lesson.setup({ module, next })` so completing the checks reports the score and unlocks the next
  lesson.
- Add each new lesson to `curriculum/index.json` under `math` (in order) for sequential gating, and a
  card on `math/index.html`.
