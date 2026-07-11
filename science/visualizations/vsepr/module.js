/* ============================================================
   M6 · Molecular Shape (VSEPR) — module data
   Build tasks grade against moduleState() -> { bonds, lone, shape, polar }.
   ============================================================ */
"use strict";

const MODULE = {
  id: "m6-vsepr",
  title: "M6 · Molecular Shape",
  intro: "A molecule's 3D shape comes from electron groups pushing apart — and that shape " +
         "decides whether the whole molecule is polar. Build shapes and test the idea.",

  lessons: [
    {
      id: "repel",
      title: "1 · Electron pairs repel",
      goal: "Repulsion sets the shape.",
      body: `Every group of electrons around a central atom — <b>bonds and lone pairs</b> — pushes
        as <b>far apart</b> as possible (like charges repel). That spacing is what fixes the
        molecule's <b>shape</b>. Two groups → 180°, three → 120°, four → 109.5°.`,
      keywords: ["electron domain", "repulsion", "bond angle"],
      tryIt: { prompt: "Set 4 bonding groups, 0 lone pairs — a tetrahedron.", preset: { bonds: 4, lone: 0 } },
      check: [
        { q: "What pushes electron groups apart?", a: "they repel each other (like charges)" },
        { q: "Four electron groups spread to what angle?", a: "about 109.5°" },
      ],
    },
    {
      id: "naming",
      title: "2 · Naming the shape (AXE)",
      goal: "Count atoms and lone pairs.",
      body: `Count <b>bonding groups (X)</b> and <b>lone pairs (E)</b> on the central atom. The
        <b>shape name counts only the atoms you can see</b>: AX₂ linear, AX₃ trigonal planar,
        AX₄ tetrahedral… Lone pairs still take up space and bend the visible atoms.`,
      keywords: ["AXE model", "linear", "trigonal planar", "tetrahedral"],
      tryIt: { prompt: "Try 3 bonds and 0 lone pairs — trigonal planar (like BF₃).", preset: { bonds: 3, lone: 0 } },
      check: [
        { q: "AX₄ (4 bonds, 0 lone pairs) is which shape?", a: "tetrahedral" },
        { q: "Does the shape name include lone pairs?", a: "No — only the visible atoms" },
      ],
    },
    {
      id: "lone-pairs",
      title: "3 · Lone pairs bend things",
      goal: "Why water is bent.",
      body: `Water's oxygen has <b>2 bonds and 2 lone pairs</b> (AX₂E₂). The four groups spread like
        a tetrahedron, but the two lone pairs are invisible, so the <b>visible</b> shape is
        <b>bent</b>, not straight.`,
      keywords: ["lone pair", "bent"],
      tryIt: { prompt: "Build water: 2 bonds, 2 lone pairs.", preset: { bonds: 2, lone: 2 } },
      check: [
        { q: "Why is water bent instead of straight?", a: "its two lone pairs push the bonds down" },
        { q: "How many lone pairs does water's oxygen have?", a: "2" },
      ],
    },
    {
      id: "polarity",
      title: "4 · Shape decides polarity",
      goal: "Symmetry can cancel polar bonds.",
      body: `Even with polar bonds, a <b>symmetric</b> shape can make the bond dipoles <b>cancel</b>,
        so the whole molecule is <b>nonpolar</b> (CO₂ linear, CH₄ tetrahedral). An <b>unsymmetric</b>
        shape doesn't cancel → <b>polar</b> (H₂O bent, NH₃ pyramidal).`,
      keywords: ["polarity", "symmetry", "dipole"],
      tryIt: { prompt: "Compare CO₂ (2 bonds, 0 lone → nonpolar) with H₂O (2 bonds, 2 lone → polar).", preset: { bonds: 2, lone: 0 } },
      check: [
        { q: "CO₂ has polar bonds but is nonpolar — why?", a: "its linear shape cancels the dipoles" },
        { q: "Is water polar or nonpolar?", a: "polar (bent shape doesn't cancel)" },
      ],
    },
  ],

  quiz: [
    { type: "mc", q: "What makes electron groups spread apart?", choices: ["Gravity", "They repel each other", "The nucleus pushes them"], answer: 1, explain: "Like charges repel — that sets the geometry." },
    { type: "mc", q: "CO₂ is linear and…", choices: ["polar", "nonpolar"], answer: 1, explain: "Its two bond dipoles point opposite and cancel." },
    { type: "mc", q: "Water is bent because of its…", choices: ["extra protons", "lone pairs", "neutrons"], answer: 1, explain: "Two lone pairs push the O–H bonds into a bent shape." },
    { type: "mc", q: "A symmetric molecule with polar bonds is usually…", choices: ["polar", "nonpolar"], answer: 1, explain: "Symmetry cancels the bond dipoles." },
    { type: "build", q: "Build a water molecule: 2 bonding groups and 2 lone pairs.", check: { bonds: 2, lone: 2 }, explain: "AX₂E₂ → bent, polar." },
    { type: "build", q: "Build a tetrahedral molecule: 4 bonds, 0 lone pairs.", check: { bonds: 4, lone: 0 }, explain: "AX₄ → tetrahedral (like CH₄)." },
    { type: "build", q: "Build any nonpolar molecule (2 or more bonds, no net dipole).", check: { polar: false, bonds: { min: 2 } }, explain: "e.g. CO₂ (linear), BF₃ (trigonal planar), CH₄ (tetrahedral)." },
  ],
};
