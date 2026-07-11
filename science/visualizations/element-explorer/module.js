/* ============================================================
   M1 · Atomic Structure — module data (Learn + Quiz)
   Consumed by the shared module-shell.js. Source of truth: MODULE.md.
   Grading of build tasks uses window.moduleState() from the Explorer.
   ============================================================ */
"use strict";

const MODULE = {
  id: "m1-atomic-structure",
  title: "M1 · Atomic Structure",
  intro: "Read a card, try it in the Explorer, then test yourself in the Quiz. " +
         "This module covers what atoms are made of, charge, mass, isotopes, and radioactivity.",

  lessons: [
    {
      id: "particles",
      title: "1 · What's inside an atom?",
      goal: "Name the three particles and where they live.",
      body: `An <b>atom</b> is the smallest piece of an element. It has three parts:
        <b>protons</b> and <b>neutrons</b> in a tiny dense center (the <b>nucleus</b>), and
        <b>electrons</b> zipping around outside in layers called <b>shells</b>.
        The nucleus holds almost all the mass; the rest is mostly empty space.`,
      keywords: ["atom", "nucleus", "proton", "neutron", "electron", "shell"],
      misconception: "electrons are <i>not</i> inside the nucleus — they're outside, in shells.",
      tryIt: { prompt: "Add and remove each particle and watch where it goes.", preset: { z: 6, n: 6, e: 6 } },
      check: [
        { q: "Which two particles are in the nucleus?", a: "protons and neutrons" },
        { q: "Which particle moves around the outside?", a: "the electron" },
        { q: "True/False: most of an atom is empty space.", a: "True" },
      ],
    },
    {
      id: "charge",
      title: "2 · Charge: neutral atoms vs. ions",
      goal: "Explain charge and how atoms become ions.",
      body: `Charges: proton <b>+1</b>, electron <b>−1</b>, neutron <b>0</b>. In a neutral atom,
        protons = electrons, so charges cancel. <b>Charge = protons − electrons.</b>
        Lose electrons → <b>positive (cation)</b>; gain electrons → <b>negative (anion)</b>.
        A charged atom is an <b>ion</b>. Only electrons move — protons never leave.`,
      keywords: ["charge", "neutral", "ion", "cation (+)", "anion (−)"],
      misconception: "you don't remove protons to make a positive ion — you remove electrons.",
      tryIt: { prompt: "Keep protons fixed and change the electrons; watch the charge and the Na⁺/Cl⁻ label.", preset: { z: 11, n: 12, e: 11 } },
      check: [
        { q: "11 protons, 10 electrons → charge?", a: "+1" },
        { q: "An atom gains 2 electrons — cation or anion?", a: "anion (negative)" },
        { q: "What is an ion?", a: "an atom with a charge (unequal protons and electrons)" },
      ],
    },
    {
      id: "mass",
      title: "3 · Mass and mass number",
      goal: "Know what gives an atom its mass.",
      body: `Protons and neutrons each weigh about <b>1 amu</b>; electrons weigh almost nothing.
        So mass comes from the nucleus: <b>mass number A = protons + neutrons</b>.
        Electrons don't count for mass.`,
      keywords: ["atomic mass unit (amu)", "mass number (A)"],
      misconception: "don't count electrons for mass, and don't confuse mass number with atomic number.",
      tryIt: { prompt: "Watch the “Mass number (A = Z + N)” readout — it changes with protons/neutrons, not electrons.", preset: { z: 6, n: 8, e: 6 } },
      check: [
        { q: "6 protons, 8 neutrons → mass number?", a: "14" },
        { q: "Why ignore electrons for mass?", a: "they weigh almost nothing" },
        { q: "Which particles give almost all the mass?", a: "protons and neutrons" },
      ],
    },
    {
      id: "atomic-number",
      title: "4 · Atomic number: the element's ID badge",
      goal: "Connect proton count to element identity.",
      body: `The <b>number of protons = atomic number (Z)</b>, and it decides <b>which element</b>
        it is. Change protons → change element. Hydrogen = 1, Carbon = 6, Oxygen = 8.
        In a neutral atom, electrons also equal Z.`,
      keywords: ["atomic number (Z)", "element", "chemical symbol"],
      misconception: "neutrons and electrons do NOT decide the element — only protons do.",
      tryIt: { prompt: "Drag the proton slider and watch the element name and symbol change.", preset: { z: 8, n: 8, e: 8 } },
      check: [
        { q: "What determines the element?", a: "the number of protons (atomic number)" },
        { q: "8 protons → which element?", a: "oxygen" },
        { q: "Add a proton to carbon (6) → what forms?", a: "nitrogen (7)" },
      ],
    },
    {
      id: "isotopes",
      title: "5 · Isotopes (intro)",
      goal: "Define isotopes. (Average mass is Module 2.)",
      body: `Same element = <b>same protons, always</b>. But the neutron count can differ →
        <b>isotopes</b> (Carbon-12 vs Carbon-14). Same chemistry, different mass.
        Named element-massnumber.`,
      keywords: ["isotope"],
      misconception: "different neutrons does NOT make a different element — it makes a different isotope.",
      tryIt: { prompt: "Lock protons and change neutrons; the isotope name and mass number change.", preset: { z: 6, n: 6, e: 6 } },
      check: [
        { q: "Carbon-12 and Carbon-14 share the same number of what?", a: "protons (and electrons)" },
        { q: "What differs between two isotopes?", a: "the number of neutrons" },
        { q: "Oxygen-18 has 8 protons — how many neutrons?", a: "10" },
      ],
    },
    {
      id: "stability",
      title: "6 · A balanced nucleus (stability)",
      goal: "Why atoms need a balance of neutrons and protons.",
      body: `Protons all repel each other. <b>Neutrons act like glue</b> — they add a strong
        short-range pull (the <b>strong nuclear force</b>) with no extra push. Too few or too
        many neutrons → <b>unstable</b>. Stable atoms form a <b>band of stability</b>: small
        atoms ≈ equal p and n; big atoms need <b>more neutrons than protons</b>.`,
      keywords: ["stable", "unstable", "band of stability", "strong nuclear force"],
      misconception: "more neutrons is NOT always more stable — there's a “just right” range.",
      tryIt: { prompt: "Change neutrons and watch the badge (nature/lab/theoretical/impossible) and the N-vs-Z chart.", preset: { z: 20, n: 20, e: 20 } },
      check: [
        { q: "What holds the nucleus together against proton repulsion?", a: "the strong nuclear force" },
        { q: "Why do neutrons help?", a: "they add pull without adding positive push" },
        { q: "Do heavy atoms need more or fewer neutrons than protons?", a: "more" },
      ],
    },
    {
      id: "decay",
      title: "7 · Radioactive decay (high level)",
      goal: "Describe what an unstable nucleus does.",
      body: `An <b>unstable (radioactive)</b> nucleus <b>decays</b> over time, giving off
        particles/energy (<b>radiation</b>) to become more stable.
        <b>Alpha</b>: ejects 2 protons + 2 neutrons. <b>Beta</b>: a neutron becomes a proton and
        emits an electron. <b>Gamma</b>: energy only. <b>Half-life</b> = the time for half the
        atoms in a sample to decay (gradual and random). Example: Carbon-14 dating.`,
      keywords: ["radioactive", "radiation", "decay", "half-life", "alpha/beta/gamma"],
      misconception: "a radioactive sample doesn't decay all at once — it's gradual, measured by half-life.",
      tryIt: { prompt: "Build Carbon-14 (6p, 8n) and compare it with stable Carbon-12.", preset: { z: 6, n: 8, e: 6 } },
      check: [
        { q: "What is a half-life?", a: "the time for half the atoms in a sample to decay" },
        { q: "In beta decay a neutron becomes a…?", a: "a proton (plus an emitted electron)" },
        { q: "Alpha decay releases a particle made of…?", a: "2 protons + 2 neutrons" },
      ],
    },
    {
      id: "history",
      title: "Bonus · How our picture of the atom changed",
      goal: "A short “how we know” story.",
      body: `<b>Dalton</b> (~1803): atoms are tiny solid balls. <b>Thomson</b> (~1897): discovered
        <b>electrons</b> (“plum pudding”). <b>Rutherford</b> (~1911): gold-foil experiment →
        a tiny dense <b>nucleus</b>. <b>Bohr</b> (~1913): electrons in fixed <b>shells</b>.
        <b>Modern</b>: electrons live in fuzzy <b>clouds</b> (probabilities, not exact paths).`,
      keywords: ["Dalton", "Thomson", "Rutherford", "Bohr", "electron cloud"],
      check: [
        { q: "Who discovered the tiny dense nucleus?", a: "Rutherford (gold foil)" },
        { q: "Who discovered the electron?", a: "Thomson" },
      ],
    },
  ],

  quiz: [
    { type: "mc", q: "Which particle has no charge?", choices: ["Proton", "Neutron", "Electron"], answer: 1, explain: "Neutrons are neutral (0 charge)." },
    { type: "mc", q: "Where is almost all of an atom's mass?", choices: ["In the electrons", "In the nucleus", "Spread out evenly"], answer: 1, explain: "Protons and neutrons in the nucleus carry the mass." },
    { type: "numeric", q: "An atom has 17 protons and 18 neutrons. What is its mass number?", answer: 35, explain: "A = Z + N = 17 + 18." },
    { type: "numeric", q: "A neutral atom has 20 protons. How many electrons does it have?", answer: 20, explain: "Neutral means electrons = protons." },
    { type: "tf", q: "Two isotopes of the same element have different atomic numbers.", answer: false, explain: "Same element = same protons = same atomic number; only neutrons differ." },
    { type: "mc", q: "Over time, an unstable nucleus will…", choices: ["Stay exactly the same", "Decay and release radiation", "Gain protons on its own"], answer: 1, explain: "Unstable nuclei decay toward stability." },
    { type: "mc", q: "A sodium atom (11 protons) with 10 electrons is a…", choices: ["Cation (+1)", "Anion (−1)", "Neutral atom"], answer: 0, explain: "Fewer electrons than protons → positive → cation." },
    { type: "build", q: "Build a neutral Carbon-12 atom.", check: { z: 6, n: 6, charge: 0 }, explain: "Carbon = 6 protons; mass 12 → 6 neutrons; neutral → 6 electrons." },
    { type: "build", q: "Build an atom of Oxygen-18.", check: { z: 8, n: 10 }, explain: "Oxygen = 8 protons; 18 − 8 = 10 neutrons." },
    { type: "build", q: "Build a chloride ion, Cl⁻, from Cl-37.", check: { z: 17, n: 20, charge: -1 }, explain: "Chlorine = 17 protons; 37 − 17 = 20 neutrons; −1 charge → 18 electrons." },
    { type: "build", q: "Make a radioactive version of carbon.", check: { z: 6, n: 8 }, explain: "Carbon-14 (6p, 8n) is the famous radioactive isotope." },
  ],
};
