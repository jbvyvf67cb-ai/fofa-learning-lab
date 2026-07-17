# Math — learning lessons (Probability → Statistics)

Math uses a **guided-lesson** format, deliberately different from the science subject's
Learn/Explore/Quiz tabs. A math lesson is **one scrolling page** where the teaching text and the
interactive it refers to sit **together**, in reading order — no jumping between a "learn" tab and an
"explore" tab. Concepts are introduced one small step at a time, and the sample space is always
**drawn**, never just named.

```
┌─ A MATH LESSON (one page, top to bottom) ─────────────┐
│  say → interactive → say → interactive → … → checks    │
│  Each step teaches ONE idea with the thing you play     │
│  with right next to the words. A few inline checks at   │
│  the end unlock the next lesson.                        │
└─────────────────────────────────────────────────────────┘
```

## Shared kit (self-contained under `math/`)
- `math/assets/css/lesson.css` — the guided-lesson layout: steps, die tiles, the 36-square grid,
  fairness tally, probability slice bar, distribution bars, inline checks, completion banner.
- `math/assets/js/lesson-kit.js` — `window.Lesson`:
  - `Lesson.die(value,{size,sides})` / `Lesson.miniDie(value)` — draw a die face (pips for a
    6-sided 1–6, otherwise a number). Pip diameter is set in `em` off the tile's font-size.
  - `Lesson.grid(mount,{showPair,headerSize})` — the 6×6 dice-pair grid (rows = die A, cols = die B);
    returns `{ cells:{"a,b":el}, forEach(fn) }`.
  - `Lesson.check(mount,{q,choices,answer,explain})` — an inline check question.
  - `Lesson.setup({module,next})` — tracks the checks, reports the score to `Fofa` when they're all
    answered (advancing gating), and shows the "lesson complete → next" banner.
- Gating/measurables reuse the lab-wide scripts: `fofa-account.js`, `fofa-measure.js`, and
  `fofa-lesson-guard.js` (the guard still recognises a lesson by its `/<subject>/visualizations/<slug>/`
  path, so lessons live under `math/visualizations/<slug>/`).

## Course map

The whole course requires **only arithmetic and a little algebra**. The through-line is *counting*:
probability is counting outcomes in a sample space you can see; statistics is counting real data.

| # | Lesson | Folder | Teaches | Status |
|---|--------|--------|---------|--------|
| **1** | The Single Die | `single-die` | probability = favourable ÷ total, drawn on one die's six faces; equally likely (fairness tally); fraction/decimal/percent; many-sided dice (1/N) | ✅ built |
| **2** | Two Dice & the Sample Space | `two-dice` | the 6×6 = 36 grid drawn and counted; every square equally likely; P(one pair) = 1/36; multiplication (6×6) seen as grid area | ✅ built |
| **3** | Sums & Permutations | `sums-and-permutations` | mark the squares that make a total → count/36; permutations = ordered pairs mirrored across the diagonal; the distribution is just how many squares sit on each sum-stripe | ✅ built |
| **4** | Coins & "At Least One" | `coins` | the complement rule P(not A)=1−P(A) as a green/red bar; the sample space doubling into a tree of 2^N sequences; the "at least one" shortcut (1 − P(none)) | ✅ built |
| **5** | Combinations | `combinations` | group coin sequences by # Heads → the bin sizes are C(n,k); Pascal's triangle (each = sum of two above); "choose which k of n flips are Heads" | ✅ built |
| **6** | Conditional Probability & Trees | `conditional-trees` | draw marbles without replacement → the 2nd draw's odds change; a probability tree (multiply along a path); add across the leaves of an event | ✅ built |
| **7** | Monty Hall — should you switch? | `monty-hall` | enumerate the 3-door sample space (switch wins 2/3); playable game; simulate switch vs. stay → converges to 2/3 vs 1/3 | ✅ built |
| **S1–S4** | Statistics | *(new)* | mean/median/mode; spread; histograms; expected value | planned |

## Why this format (design intent)
- **No tab back-and-forth.** Earlier drafts split teaching and interactive into separate tabs; that
  made the student hop around. Now they read down one column, playing as they go.
- **One idea per lesson.** Lesson 1 is *only* single-die basics — no chaining, no sums. The second
  die arrives in Lesson 2; permutations in Lesson 3. Nothing is assumed; "sample space" is *drawn*.
- **Everything is counting.** The 36-grid is the spine of Lessons 2–3: a roll is landing on a square,
  a total's probability is that total's share of the flat grid. The "bell" shape is revealed as
  nothing more than how many equally-likely squares add up to each number.

## End-of-unit graded quizzes

Each unit ends with a **graded quiz** that is scored server-side by Home Assistant (objective
questions by rule, written questions by Claude) — the browser never grades. Unit A ships one:

- **Quiz bank (authored, source of truth):** `quizzes/math/unit-a-probability.json` — questions with
  answer keys in the manifest shape from [`docs/BACKEND-CONTRACT.md`](../docs/BACKEND-CONTRACT.md) §4
  (`mc`/`tf`/`numeric`/`free`; `free` carries a `rubric` + `max`). Math is guided-lesson content with
  no `module.js`, so these are hand-authored JSON (unlike science, which is generated from `module.js`).
  `node quizzes/_generate.js` **catalogs** `quizzes/math/*.json` into `quizzes/index.json` without
  overwriting them.
- **Quiz page:** `math/visualizations/unit-a-probability/` — sets `window.QUIZ = { subject, module,
  quizId, passMin }` and includes the shared client (`fofa-account.js`), the math **quiz shell**
  (`math/assets/js/quiz-shell.js`), and `fofa-lesson-guard.js`.
- **Quiz shell:** `math/assets/js/quiz-shell.js` renders the questions, collects answers, and submits
  via `FofaAccount.quiz()` (the Lab-owned client → `POST /api/fofa/quiz`, or the mock grader). It
  renders the returned per-question results + score and never grades locally. Reusable for future unit
  quizzes — just add a bank JSON + a page that sets `window.QUIZ`.
- **Gating & stars:** the quiz is a `curriculum/index.json` lesson (`unit-a-probability`, gate
  `quiz` min 0.7) placed after the last content lesson, so it unlocks only when the unit is finished;
  passing marks it complete and earns quiz stars per the curriculum `stars` policy — automatically.

**To add a Unit B quiz:** author `quizzes/math/unit-b-*.json`, run the generator, add a
`math/visualizations/unit-b-*/` page setting `window.QUIZ`, and a `curriculum` entry after Unit B's
last lesson.

## How to add Lesson 4+
1. `math/visualizations/<slug>/` with `index.html` (the steps + prose) and `<slug>.js` (the
   interactives + `Lesson.check(...)` calls), linking `../../assets/css/lesson.css` and the shared
   scripts (see any existing lesson's `<head>`/`<script>` block).
2. End the script with `Lesson.setup({ module:"<id>", next:{title,url} })`.
3. Add the lesson to `curriculum/index.json` under `math` (in order) for sequential gating, and a
   card to `math/index.html`.
