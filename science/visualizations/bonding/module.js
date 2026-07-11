/* ============================================================
   M5 · Chemical Bonding — module data
   Build tasks grade against moduleState() -> { a, b, bondType, bondOrder }.
   bondType ∈ {ionic, polar, nonpolar, metallic}.
   ============================================================ */
"use strict";

const MODULE = {
  id: "m5-bonding",
  title: "M5 · Chemical Bonding",
  intro: "Atoms bond to reach a full outer shell. Depending on the two atoms, they transfer, " +
         "share, or pool their electrons. Predict the bond, then watch it happen.",

  lessons: [
    {
      id: "why-bond",
      title: "1 · From ions to compounds",
      goal: "Connect charge to why atoms stick together.",
      body: `Atoms are most stable with a <b>full outer shell</b> (like the noble gases). <b>Metals
        lose</b> electrons → positive ions; <b>nonmetals gain</b> them → negative ions. Opposite
        charges attract, so the ions stick together into a <b>compound</b> (Na⁺ + Cl⁻ → NaCl).`,
      keywords: ["valence electrons", "compound", "chemical bond"],
      tryIt: { prompt: "Pair a metal and a nonmetal and watch electrons transfer.", preset: { a: "Na", b: "Cl" } },
      check: [
        { q: "Do metals gain or lose electrons?", a: "lose (become positive)" },
        { q: "Why do a + ion and a − ion stick together?", a: "opposite charges attract" },
      ],
    },
    {
      id: "ionic",
      title: "2 · Ionic bonds",
      goal: "Full transfer of electrons.",
      body: `In an <b>ionic bond</b>, a metal <b>gives</b> electron(s) to a nonmetal. The resulting
        + and − ions attract strongly and pack into a repeating <b>lattice</b>. Ionic compounds are
        hard, high-melting, and conduct when dissolved or melted.`,
      keywords: ["ionic bond", "ion", "lattice"],
      tryIt: { prompt: "Make magnesium + oxygen (MgO): a 2+ / 2− pair.", preset: { a: "Mg", b: "O" } },
      check: [
        { q: "In an ionic bond, electrons are…?", a: "transferred (given away)" },
        { q: "What holds an ionic compound together?", a: "attraction between + and − ions" },
      ],
    },
    {
      id: "covalent",
      title: "3 · Covalent bonds",
      goal: "Sharing electrons.",
      body: `Two <b>nonmetals share</b> electrons in a <b>covalent bond</b>. Each shared pair counts
        toward <b>both</b> atoms' outer shells. Atoms can share 1, 2, or 3 pairs → <b>single,
        double, triple</b> bonds (O₂ is a double bond; N₂ is a triple bond).`,
      keywords: ["covalent bond", "shared pair", "single/double/triple bond", "octet"],
      tryIt: { prompt: "Make O₂ and set it to a double bond so both atoms reach 8.", preset: { a: "O", b: "O", order: 2 } },
      check: [
        { q: "In a covalent bond, electrons are…?", a: "shared" },
        { q: "How many shared pairs is a triple bond?", a: "3" },
      ],
    },
    {
      id: "polarity",
      title: "4 · Polar vs. nonpolar covalent",
      goal: "Unequal sharing makes partial charges.",
      body: `If the two atoms pull equally, the shared electrons sit in the middle — <b>nonpolar</b>.
        If one atom pulls harder (higher electronegativity), the pair shifts toward it, giving
        partial charges (δ+ / δ−) — a <b>polar</b> covalent bond.`,
      keywords: ["polar", "nonpolar", "electronegativity", "partial charge"],
      tryIt: { prompt: "Compare Cl–Cl (nonpolar) with H–Cl (polar).", preset: { a: "H", b: "Cl" } },
      check: [
        { q: "Two identical atoms sharing electrons form a…?", a: "nonpolar covalent bond" },
        { q: "What makes a covalent bond polar?", a: "one atom pulls the shared pair harder" },
      ],
    },
    {
      id: "metallic",
      title: "5 · Metallic bonds",
      goal: "A shared sea of electrons.",
      body: `In a metal, atoms pool their valence electrons into a shared <b>“sea”</b> that flows
        between fixed positive cores. That sea is why metals <b>conduct electricity</b>, bend
        without breaking, and are shiny. (This is the gateway to solid-state physics.)`,
      keywords: ["metallic bond", "electron sea", "conductivity"],
      tryIt: { prompt: "Pair two metals (e.g. Na + Mg) to see the electron sea.", preset: { a: "Na", b: "Mg" } },
      check: [
        { q: "What holds a metal together?", a: "a shared sea of delocalized electrons" },
        { q: "Why do metals conduct electricity?", a: "the sea of electrons can move freely" },
      ],
    },
    {
      id: "predict",
      title: "6 · Predicting the bond type",
      goal: "Use the electronegativity gap.",
      body: `Rule of thumb: <b>metal + nonmetal → ionic</b>; <b>two nonmetals → covalent</b> (polar if
        their electronegativities differ, nonpolar if not); <b>two metals → metallic</b>. The bigger
        the electronegativity gap between two nonmetals, the more polar the bond.`,
      keywords: ["electronegativity gap", "bond type"],
      tryIt: { prompt: "Try different pairs and read the predicted bond type.", preset: { a: "C", b: "O" } },
      check: [
        { q: "Metal + nonmetal usually gives which bond?", a: "ionic" },
        { q: "A big electronegativity gap between two nonmetals makes the bond more…?", a: "polar" },
      ],
    },
  ],

  quiz: [
    { type: "mc", q: "In an ionic bond, electrons are…", choices: ["transferred", "shared", "destroyed"], answer: 0, explain: "One atom gives electrons to the other." },
    { type: "mc", q: "In a covalent bond, electrons are…", choices: ["transferred", "shared", "removed"], answer: 1, explain: "Both atoms share the electron pair(s)." },
    { type: "mc", q: "What holds a metal together?", choices: ["A sea of shared electrons", "Transferred electrons", "Neutrons"], answer: 0, explain: "Delocalized valence electrons — the electron sea." },
    { type: "mc", q: "Between two nonmetals, a bigger electronegativity gap makes the bond…", choices: ["more polar", "more metallic", "nonpolar"], answer: 0, explain: "The shared pair shifts toward the stronger puller." },
    { type: "tf", q: "Noble gases bond eagerly with other atoms.", answer: false, explain: "Full outer shell → they barely react." },
    { type: "build", q: "Make an ionic bond (pick a metal and a nonmetal).", check: { bondType: "ionic" }, explain: "e.g. Na + Cl, or Mg + O." },
    { type: "build", q: "Make a nonpolar covalent bond.", check: { bondType: "nonpolar" }, explain: "Two identical nonmetals, e.g. O + O or Cl + Cl." },
    { type: "build", q: "Make a metallic bond (two metals).", check: { bondType: "metallic" }, explain: "e.g. Na + Mg." },
  ],
};
