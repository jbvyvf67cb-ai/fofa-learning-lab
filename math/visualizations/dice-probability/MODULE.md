# P1 · Dice & Probability — module content

**Explore:** the Dice & Probability lab (this folder).
**Status:** ✅ written (mirrors `module.js`).
**Owns:** probability of a single outcome (1/N); independent events (AND → ×, OR → +);
the sample space N^k; counting ordered ways to make a sum; the shape of a distribution; a first
look at the law of large numbers.
**Prereqs:** only arithmetic (multiply, divide) and reading a simple formula. First module of the
**Probability → Statistics** course. Build tasks grade against `moduleState()` →
`{ sides, dice, sum, ways, total, pSum, pFace }`.

---

## Lesson 1 — One die: every face is equally likely
**Goal:** find the probability of a single number and write it three ways.

A **probability** runs from **0** (never) to **1** (always). On a **fair** die every face is
**equally likely**, so the chance of any chosen number is **1 ÷ (number of sides)**:
**P(a chosen face) = 1/N**. A 6-sided die → 1/6 ≈ 0.167 = 16.7%; a 20-sided die → 1/20 = 5%.
The set of everything that can happen, {1, 2, …, N}, is the **sample space**. The same value can be
written as a **fraction**, a **decimal**, or a **percent** (× 100 for the percent).

**Key words:** probability, fair, equally likely, sample space, 1/N, fraction/decimal/percent.
**Common mistake:** a bigger number isn't harder to roll; more sides makes a single number *less*
likely, not more.
**Try it:** 20 sides, 1 die — the "One die" card reads 1/20 = 5%. *(preset: sides 20, dice 1)*

**Check yourself:**
1. P of a 4 on a fair 8-sided die? _A: 1/8 = 0.125 = 12.5%._
2. Write 1/5 as a percent. _A: 20%._
3. Does a d20 make a single number more or less likely than a d6? _A: less likely (1/20 < 1/6)._

---

## Lesson 2 — Chaining dice: independent chances multiply
**Goal:** combine dice with AND (×) and outcomes with OR (+).

Dice don't affect each other — they're **independent**. For **both** events (this **AND** that) you
**multiply**: **P(A and B) = P(A) × P(B)**. Two sixes on two dice → 1/6 × 1/6 = **1/36**. In general
**k** dice of **N** sides give **N^k** equally likely **ordered** rolls, and each exact roll is
**(1/N)^k**. For **this OR that** (mutually exclusive) you **add**: a 1 or a 2 on one die = 1/6 + 1/6.

**Key words:** independent, AND → multiply, OR → add, N^k outcomes, (1/N)^k, ordered rolls.
**Common mistake:** for "both dice" you multiply, not add (adding would give 1/3 for two sixes — far
too big).
**Try it:** 2 six-sided dice — the "Sample space" card shows 6 × 6 = 36, each roll 1/36.
*(preset: sides 6, dice 2, sum 7)*

**Check yourself:**
1. P of two coins both heads? _A: 1/2 × 1/2 = 1/4._
2. Ordered outcomes of three d6? _A: 6 × 6 × 6 = 216._
3. AND means multiply or add? _A: multiply._

---

## Lesson 3 — Sums: count the ways (sets & permutations)
**Goal:** compute P(sum) by counting the ordered ways to make it.

Sums are **not** equally likely: with two dice, **7** is easiest and **2/12** hardest. Probability is
**favourable ÷ total**, so **P(sum = s) = (ways to make s) / N^k**. Because all N^k ordered rolls are
equally likely, you just **count the ones that work**. Sum 5 → (1,4),(2,3),(3,2),(4,1) = **4 ways** →
4/36 = 1/9. **Order matters** — (1,4) and (4,1) are different rolls (the **permutation** idea), and
counting them separately is what keeps every roll equally likely. Sum 7 → **6 ways** → 6/36 = 1/6,
the tallest bar. The bars form a **triangle** for two dice and a **bell** for more — the door into
statistics.

**Key words:** favourable ÷ total, ways to make a sum, order matters, permutation, distribution,
triangle → bell.
**Common mistake:** treating (1,4) and (4,1) as one outcome — count ordered outcomes and every sum's
probability comes out right.
**Try it:** 2 six-sided dice, target 7 → 6 ways → 6/36 = 1/6; then slide the target to 2 and to 12.
*(preset: sides 6, dice 2, sum 7)*

**Check yourself:**
1. Ordered ways to make a sum of 4 with two d6? _A: 3 → (1,3),(2,2),(3,1)._
2. So P(sum = 4)? _A: 3/36 = 1/12._
3. Most likely sum with two dice, and why? _A: 7 — it has the most ways (6)._

---

## Lesson 4 (bonus) — Rolling for real vs. the exact number
**Goal:** see why real rolls drift toward the calculated probability.

The lab computes every probability **exactly** by counting — it never needs to roll. But rolling
**hundreds or thousands** of times makes the observed share of each sum settle onto the exact bars.
That drift is the **law of large numbers**, the bridge from **probability** (what should happen) to
**statistics** (what did happen, from data).

**Key words:** law of large numbers, observed vs. expected, probability → statistics.
**Try it:** 2 dice, target 7, press "Roll ×1000" a few times; the violet dots snap onto the bars.

**Check yourself:**
1. More rolls → observed frequencies get closer or further from exact? _A: closer._
2. Which field measures what actually happened from data? _A: statistics._

---

## Quiz bank (P1)
- (numeric) P of a 13 on a d20, as a whole percent → **5**.
- (tf) On one fair die, a 6 is less likely than a 3 → **False**.
- (mc) P(A and B) for independent events → P(A)+P(B) / **P(A)×P(B)** / P(A)−P(B).
- (numeric) Total ordered outcomes of two d6 → **36**.
- (numeric) Ordered ways to make a sum of 4 with two d6 → **3**.
- (mc) Most likely sum of two d6 → 2 / 6 / **7** / 12.
- (tf) (2,5) and (5,2) count as the same outcome → **False**.
- (numeric) Total ordered outcomes of three d6 → **216**.
- (build) One d20. → `{ sides: 20, dice: 1 }`
- (build) Two d6 targeting the most-likely sum. → `{ sides: 6, dice: 2, sum: 7 }`
- (build) Two d6 targeting a sum with only one way. → `{ sides: 6, dice: 2, ways: 1 }`
