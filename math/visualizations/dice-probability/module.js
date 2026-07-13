/* ============================================================
   P1 · Dice & Probability — module data (Learn + Quiz)
   Consumed by the shared module-shell.js. Source of truth: MODULE.md.
   Build tasks are graded from window.moduleState() in dice-probability.js:
     { sides, dice, sum, ways, total, pSum, pFace }
   ============================================================ */
"use strict";

const MODULE = {
  id: "p1-dice-probability",
  title: "P1 · Dice & Probability",
  intro: "Probability is just careful counting. Read a card, set it up in the Explore lab, " +
         "then test yourself. We go from the chance of a single number, to chaining dice together, " +
         "to counting every way a sum can happen — using only arithmetic and a little algebra.",

  lessons: [
    {
      id: "one-die",
      title: "1 · One die: every face is equally likely",
      goal: "Find the probability of a single number and write it three ways.",
      body: `A <b>probability</b> is a number from <b>0</b> (never) to <b>1</b> (always) that says how likely
        something is. On a <b>fair</b> die every face is <b>equally likely</b>, so the chance of any one
        number is <b>1 divided by the number of sides</b>:
        <br><span class="mono" style="color:var(--prob)">P(a chosen face) = 1 / N</span>.
        On a normal 6-sided die that's <b>1/6 ≈ 0.167 = 16.7%</b>. On a 20-sided die it's <b>1/20 = 5%</b>.
        The list of everything that can happen — {1, 2, 3, … N} — is called the <b>sample space</b>.
        The same fraction can wear three outfits: a <b>fraction</b> (1/6), a <b>decimal</b> (0.167),
        and a <b>percent</b> (16.7%) — multiply by 100 to get the percent.`,
      keywords: ["probability", "fair", "equally likely", "sample space", "1/N", "fraction · decimal · percent"],
      misconception: "a bigger number isn't harder to roll — on a fair die a 6 is exactly as likely as a 1. And more sides makes each single number <i>less</i> likely, not more.",
      tryIt: { prompt: "Set the die to 20 sides with 1 die, and read the “One die” card: 1/20 = 5%.", preset: { sides: 20, dice: 1, sum: 13 } },
      check: [
        { q: "P of rolling a 4 on a fair 8-sided die?", a: "1/8 = 0.125 = 12.5%" },
        { q: "Write 1/5 as a percent.", a: "20%" },
        { q: "Does a 20-sided die make a single number more or less likely than a 6-sided die?", a: "less likely (1/20 < 1/6)" },
      ],
    },
    {
      id: "chaining",
      title: "2 · Chaining dice: independent chances multiply",
      goal: "Combine dice with AND (×) and combine outcomes with OR (+).",
      body: `Rolling one die doesn't change another — they're <b>independent</b>. To get the chance that
        <b>both</b> things happen (this <b>AND</b> that), you <b>multiply</b>:
        <br><span class="mono" style="color:var(--prob)">P(A and B) = P(A) × P(B)</span>.
        Two 6-sided dice both landing on 6? <b>1/6 × 1/6 = 1/36</b>. In general, <b>k</b> dice of
        <b>N</b> sides give <b>N × N × … = N<sup>k</sup></b> equally likely <b>ordered</b> rolls, and each
        exact roll has probability <b>(1/N)<sup>k</sup></b>. That grid of N<sup>k</sup> rolls is the new
        sample space. (For <b>this OR that</b>, when they can't both happen, you <b>add</b> instead:
        rolling a 1 or a 2 on one die is 1/6 + 1/6 = 2/6.)`,
      keywords: ["independent", "AND → multiply", "OR → add", "Nᵏ outcomes", "(1/N)ᵏ", "ordered rolls"],
      misconception: "for “both dice” you multiply, you don't add — adding 1/6 + 1/6 for two sixes would give 1/3, which is far too big.",
      tryIt: { prompt: "Set 2 six-sided dice and read the “Sample space” card: 6 × 6 = 36 rolls, each 1/36.", preset: { sides: 6, dice: 2, sum: 7 } },
      check: [
        { q: "P of two coins (2 sides) both landing heads?", a: "1/2 × 1/2 = 1/4" },
        { q: "How many ordered outcomes do three 6-sided dice have?", a: "6 × 6 × 6 = 216" },
        { q: "AND means multiply or add?", a: "multiply" },
      ],
    },
    {
      id: "sums",
      title: "3 · Sums: count the ways (sets & permutations)",
      goal: "Compute P(sum) by counting the ordered ways to make it.",
      body: `Sums are <b>not</b> all equally likely — with two dice, <b>7</b> is the easiest and <b>2</b> or
        <b>12</b> the hardest. Why? Because probability is <b>favourable outcomes ÷ total outcomes</b>, and
        some sums have more ways to happen:
        <br><span class="mono" style="color:var(--prob-hi)">P(sum = s) = (ways to make s) / N<sup>k</sup></span>.
        Since all N<sup>k</sup> ordered rolls are equally likely, you just <b>count the ones that work</b>.
        Sum of 5 on two dice: (1,4), (2,3), (3,2), (4,1) — <b>4 ways</b> → 4/36 = 1/9. <b>Order matters</b>:
        (1,4) and (4,1) are two different rolls (this is the <b>permutation</b> idea), and counting them
        separately is exactly what keeps every roll equally likely. Sum of 7 has <b>6</b> ways → 6/36 = 1/6,
        the tallest bar. Stacking the bars up makes a <b>triangle</b> for two dice and a <b>bell shape</b> for
        more — the doorway into statistics.`,
      keywords: ["favourable ÷ total", "ways to make a sum", "order matters", "permutation", "distribution", "triangle → bell"],
      misconception: "(1,4) and (4,1) are NOT the same roll — treat them as one and the counting breaks. Count ordered outcomes and every sum's probability comes out right.",
      tryIt: { prompt: "Set 2 six-sided dice, target sum 7, and read the ways: 6 ordered outcomes → 6/36 = 1/6. Then slide the target to 2 and to 12.", preset: { sides: 6, dice: 2, sum: 7 } },
      check: [
        { q: "How many ordered ways make a sum of 4 with two 6-sided dice?", a: "3 → (1,3),(2,2),(3,1)" },
        { q: "So P(sum = 4)?", a: "3/36 = 1/12" },
        { q: "Which sum is most likely with two dice, and why?", a: "7 — it has the most ways (6 of them)" },
      ],
    },
    {
      id: "law-large-numbers",
      title: "Bonus · Rolling for real vs. the exact number",
      goal: "See why real rolls drift toward the calculated probability.",
      body: `The lab computes every probability <b>exactly</b> by counting — it never needs to roll. But you
        <b>can</b> roll, and here's the payoff: a few rolls look random and lumpy, but as you roll <b>hundreds
        or thousands</b> of times, the observed share of each sum settles onto the exact bars. That drift is the
        <b>law of large numbers</b>, and it's the bridge from <em>probability</em> (what should happen) to
        <em>statistics</em> (what did happen, measured from data). Same triangle, two directions.`,
      keywords: ["law of large numbers", "observed vs. expected", "probability → statistics"],
      tryIt: { prompt: "With 2 dice and target 7, press “Roll ×1000” a few times and watch the violet dots snap onto the bars.", preset: { sides: 6, dice: 2, sum: 7 } },
      check: [
        { q: "Do more rolls make the observed frequencies closer to or further from the exact probability?", a: "closer" },
        { q: "Which field measures what actually happened from data?", a: "statistics" },
      ],
    },
  ],

  quiz: [
    { type: "numeric", q: "A fair die has 20 sides. What is the probability of rolling a 13, as a percent? (whole number)", answer: 5, tolerance: 0, explain: "Every face is 1/20 = 0.05 = 5%." },
    { type: "tf", q: "On one fair die, rolling a 6 is less likely than rolling a 3.", answer: false, explain: "A fair die has no favourites — both are 1/N." },
    { type: "mc", q: "For two independent dice, P(this AND that) equals…", choices: ["P(A) + P(B)", "P(A) × P(B)", "P(A) − P(B)"], answer: 1, explain: "AND with independent events multiplies: e.g. two sixes = 1/6 × 1/6 = 1/36." },
    { type: "numeric", q: "Roll two 6-sided dice. How many equally-likely ordered outcomes are there in total?", answer: 36, tolerance: 0, explain: "6 × 6 = 6² = 36." },
    { type: "numeric", q: "With two 6-sided dice, how many ordered ways make a sum of 4?", answer: 3, tolerance: 0, explain: "(1,3), (2,2), (3,1) — three ways." },
    { type: "mc", q: "Rolling two 6-sided dice, which sum is the MOST likely?", choices: ["2", "6", "7", "12"], answer: 2, explain: "7 has the most ways (6 of them) → 6/36 = 1/6." },
    { type: "tf", q: "When counting the ways to make a sum, (2,5) and (5,2) count as the SAME outcome.", answer: false, explain: "Order matters — they are two different rolls. Counting them separately keeps every roll equally likely." },
    { type: "numeric", q: "How many ordered outcomes do three 6-sided dice have in total?", answer: 216, tolerance: 0, explain: "6 × 6 × 6 = 6³ = 216." },
    { type: "build", q: "Set the lab to one 20-sided die (so a single face shows as 1/20).", check: { sides: 20, dice: 1 }, explain: "1 die, 20 sides → P(any face) = 1/20 = 5%." },
    { type: "build", q: "Set up two 6-sided dice and target the most-likely sum.", check: { sides: 6, dice: 2, sum: 7 }, explain: "Sum 7 has 6 ways → 6/36 = 1/6, the tallest bar." },
    { type: "build", q: "Set up two 6-sided dice and target a sum with only ONE way to make it.", check: { sides: 6, dice: 2, ways: 1 }, explain: "Sum 2 (1+1) or sum 12 (6+6) each have exactly one ordered way → 1/36." },
  ],
};
