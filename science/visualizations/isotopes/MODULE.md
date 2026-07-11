# M2 · Isotopes & Atomic Mass — module content

**Explore:** the Isotopes & Average Atomic Mass viz (this folder).
**Status:** ✅ written (mirrors `module.js`).
**Owns:** isotopes deep-dive; natural abundance; **average (weighted) atomic mass**.
Builds on M1's isotope intro. Build tasks grade against `moduleState()` → `{ symbol, avg }`.

---

## Lesson 1 — A closer look at isotopes
**Goal:** connect isotopes to abundance.

Most elements are a **mix** of isotopes in nature. Chlorine is about **75% Cl-35** and
**25% Cl-37**. Each isotope has the same protons (same element) but different neutrons, so a
different mass. **Abundance** = the % of atoms that are a given isotope.

**Key words:** isotope, abundance, natural mixture.
**Try it:** Pick an element; the bars show how common each isotope is. *(preset: Cl)*

**Check yourself:**
1. What does "75% abundance" mean for Cl-35? _A: 75 of every 100 chlorine atoms are Cl-35._
2. Do chlorine's two isotopes have the same number of protons? _A: Yes (both 17)._

---

## Lesson 2 — Average atomic mass
**Goal:** explain the weighted-average mass on the periodic table.

The mass on the periodic table (chlorine's **35.45**) is a **weighted average** of an element's
natural isotopes, weighted by how common each is. Chlorine ≈ 75% Cl-35 + 25% Cl-37 → average
near 35.5, closer to the more common isotope. **No single atom weighs 35.45.**
Formula: average = Σ (fraction × isotope mass).

**Key words:** average atomic mass, weighted average.
**Common mistake:** the table mass is not one atom's mass — it's an average of the mixture.
**Try it:** Slide the abundances; the average slides toward whichever isotope is more common.

**Check yourself:**
1. Why is chlorine 35.45, not a whole number? _A: weighted average of Cl-35 and Cl-37._
2. 90% light isotope, 10% heavy — average closer to which? _A: the light one (more common)._
3. 0.75×35 + 0.25×37 = ? _A: 35.5._

---

## Lesson 3 — Weighted vs. plain average
**Goal:** see why we weight by abundance.

A **plain** average of 35 and 37 is 36. But chlorine is mostly Cl-35, so the real average is
pulled down to about **35.45**. Weighting by abundance is what makes the average land near the
common isotope instead of halfway between.

**Key words:** weighted average, abundance.
**Try it:** Set chlorine to a 50/50 split (use "Make all equal") — now the average sits near 36,
the plain midpoint.

**Check yourself:**
1. At a 50/50 mix of Cl-35 and Cl-37, roughly what is the average? _A: about 36 (the midpoint)._
2. Why is the real average 35.45, not 36? _A: Cl-35 is far more abundant, pulling it down._

---

## Quiz bank (M2)
- (mc) The periodic-table mass is → one atom's mass / **a weighted average of the isotopes** / the heaviest isotope.
- (numeric) 50% mass-10, 50% mass-11 → **10.5**.
- (numeric) 0.75×35 + 0.25×37 → **35.5**.
- (numeric) 20% mass-10, 80% mass-11 → **10.8**.
- (mc) 90% light + 10% heavy → average is **closer to the light isotope**.
- (tf) Every chlorine atom weighs 35.45 u → **False**.
- (build) Load chlorine (Cl). → `{ symbol: "Cl" }`
- (build) Load chlorine, set a 50/50 mix; average near 36. → `{ symbol: "Cl", avg: { min: 35.7, max: 36.2 } }`
