/* ============================================================
   M2 · Isotopes & Atomic Mass — module data (Learn + Quiz)
   Consumed by the shared module-shell.js. Source of truth: MODULE.md.
   Build tasks grade against window.moduleState() -> { symbol, avg }.
   ============================================================ */
"use strict";

const MODULE = {
  id: "m2-isotopes",
  title: "M2 · Isotopes & Atomic Mass",
  intro: "Elements come as a mix of isotopes. Here you'll see how that mix sets the " +
         "average atomic mass on the periodic table. Read a card, try it, then take the quiz.",

  lessons: [
    {
      id: "abundance",
      title: "1 · A closer look at isotopes",
      goal: "Connect isotopes to abundance.",
      body: `Most elements are a <b>mix</b> of isotopes in nature. Chlorine is about
        <b>75% Cl-35</b> and <b>25% Cl-37</b>. Each isotope has the same protons (same element)
        but different neutrons, so a different mass. <b>Abundance</b> = the % of atoms that are
        a given isotope.`,
      keywords: ["isotope", "abundance", "natural mixture"],
      tryIt: { prompt: "Pick an element and read how common each isotope is.", preset: { symbol: "Cl" } },
      check: [
        { q: "What does “75% abundance” mean for Cl-35?", a: "75 of every 100 chlorine atoms are Cl-35" },
        { q: "Do chlorine's two isotopes have the same number of protons?", a: "Yes (both 17)" },
      ],
    },
    {
      id: "average-mass",
      title: "2 · Average atomic mass",
      goal: "Explain the weighted-average mass on the periodic table.",
      body: `The mass on the periodic table (chlorine's <b>35.45</b>) is a <b>weighted average</b>
        of an element's natural isotopes, weighted by how common each is. Chlorine ≈ 75% Cl-35 +
        25% Cl-37 → an average near 35.5, closer to the more common isotope. <b>No single atom
        weighs 35.45</b> — it's an average. Formula: average = Σ (fraction × isotope mass).`,
      keywords: ["average atomic mass", "weighted average"],
      misconception: "the table mass is NOT one atom's mass — it's an average of the whole mixture.",
      tryIt: { prompt: "Slide the abundances; the average slides toward whichever isotope is more common.", preset: { symbol: "Cl" } },
      check: [
        { q: "Why is chlorine 35.45, not a whole number?", a: "it's a weighted average of Cl-35 and Cl-37" },
        { q: "90% light isotope, 10% heavy — the average is closer to which?", a: "the light one (more common)" },
        { q: "0.75×35 + 0.25×37 = ?", a: "35.5" },
      ],
    },
    {
      id: "weighted-vs-plain",
      title: "3 · Weighted vs. plain average",
      goal: "See why we weight by abundance.",
      body: `A <b>plain</b> average of masses 35 and 37 is 36. But chlorine is mostly Cl-35, so the
        real average is pulled down to about <b>35.45</b>. Weighting by abundance is what makes the
        average land near the common isotope instead of halfway between.`,
      keywords: ["weighted average", "abundance"],
      tryIt: { prompt: "Set chlorine to an even 50/50 split (use “Make all equal”) — now the average sits near 36, the plain midpoint.", preset: { symbol: "Cl" } },
      check: [
        { q: "At a 50/50 mix of Cl-35 and Cl-37, roughly what is the average?", a: "about 36 (the midpoint)" },
        { q: "Why is the real average 35.45, not 36?", a: "Cl-35 is far more abundant, pulling it down" },
      ],
    },
  ],

  quiz: [
    { type: "mc", q: "The mass listed on the periodic table is…", choices: ["The mass of one atom", "A weighted average of the isotopes", "The mass of the heaviest isotope"], answer: 1, explain: "It's a weighted average over the natural isotope mixture." },
    { type: "numeric", q: "An element is 50% mass-10 and 50% mass-11. What is the average atomic mass?", answer: 10.5, tolerance: 0.05, explain: "0.5×10 + 0.5×11 = 10.5." },
    { type: "numeric", q: "Chlorine is 75% mass-35 and 25% mass-37. Average? (0.75×35 + 0.25×37)", answer: 35.5, tolerance: 0.05, explain: "26.25 + 9.25 = 35.5." },
    { type: "numeric", q: "An element is 20% mass-10 and 80% mass-11. Average?", answer: 10.8, tolerance: 0.05, explain: "0.2×10 + 0.8×11 = 2 + 8.8 = 10.8." },
    { type: "mc", q: "If an element is 90% a light isotope and 10% a heavy one, the average is…", choices: ["Closer to the light isotope", "Exactly halfway", "Closer to the heavy isotope"], answer: 0, explain: "The average is pulled toward the more abundant (light) isotope." },
    { type: "tf", q: "Every single chlorine atom weighs 35.45 u.", answer: false, explain: "35.45 is an average; individual atoms are ~35 or ~37." },
    { type: "build", q: "Load chlorine (Cl) into the tool.", check: { symbol: "Cl" }, explain: "Use the element picker to choose chlorine." },
    { type: "build", q: "Load chlorine and set an even 50/50 mix (use “Make all equal”). The average should land near 36.", check: { symbol: "Cl", avg: { min: 35.7, max: 36.2 } }, explain: "A 50/50 split of ~35 and ~37 averages to ~36 — the plain midpoint." },
  ],
};
