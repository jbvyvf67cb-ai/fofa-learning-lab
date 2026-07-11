/* ============================================================
   M4 · Periodic Table — module data
   Build tasks grade against moduleState() ->
     { symbol, colorMode, highlightMode, highlightValue }.
   ============================================================ */
"use strict";

const MODULE = {
  id: "m4-periodic-table",
  title: "M4 · Periodic Table",
  intro: "The periodic table isn't a random grid — its rows and columns encode how atoms behave. " +
         "Learn to read it, then colour by trends and highlight families.",

  lessons: [
    {
      id: "reading",
      title: "1 · Reading the periodic table",
      goal: "Read a cell and understand rows vs. columns.",
      body: `Each box shows the <b>symbol</b>, the <b>atomic number</b>, and the <b>average atomic
        mass</b>. A <b>row (period)</b> ≈ how many electron shells the atom has. A <b>column
        (group)</b> groups elements that <b>act alike</b>, because they have the <b>same number of
        valence electrons</b>.`,
      keywords: ["period (row)", "group (column)", "valence electron"],
      tryIt: { prompt: "Highlight a group and read the shared property.", preset: { highlightMode: "group", highlightValue: "1" } },
      check: [
        { q: "What do elements in the same column share?", a: "the same valence electrons; similar behaviour" },
        { q: "What three things does a cell show?", a: "symbol, atomic number, average atomic mass" },
      ],
    },
    {
      id: "metals",
      title: "2 · Metals, nonmetals, metalloids",
      goal: "Know the three big regions.",
      body: `<b>Metals</b> (most of the table, on the left) are shiny and conduct; they tend to
        <b>lose</b> electrons. <b>Nonmetals</b> (upper right) tend to <b>gain or share</b> electrons.
        <b>Metalloids</b> sit on the staircase between them with in-between properties.`,
      keywords: ["metal", "nonmetal", "metalloid"],
      tryIt: { prompt: "Colour by category and find the metalloid staircase.", preset: { colorMode: "category" } },
      check: [
        { q: "Where are most metals?", a: "on the left and middle" },
        { q: "Do metals tend to gain or lose electrons?", a: "lose" },
      ],
    },
    {
      id: "trend-period",
      title: "3 · Trends across a period",
      goal: "What changes left → right.",
      body: `Moving <b>left → right</b> across a row, protons pile in and pull the electrons tighter,
        so atoms get <b>smaller</b> and hold their electrons more strongly — <b>electronegativity
        rises</b> toward the top-right (fluorine is the most electronegative).`,
      keywords: ["atomic radius", "electronegativity", "trend"],
      tryIt: { prompt: "Colour by electronegativity and spot the top-right corner.", preset: { colorMode: "electronegativity" } },
      check: [
        { q: "Across a period, atoms get…?", a: "smaller" },
        { q: "Which corner is most electronegative?", a: "the top-right (toward fluorine)" },
      ],
    },
    {
      id: "trend-group",
      title: "4 · Trends down a group",
      goal: "What changes top → bottom.",
      body: `Going <b>down a column</b>, each element adds a shell, so atoms get <b>bigger</b> and
        the outer electrons are farther from the nucleus and easier to lose. That's why the metals
        at the bottom-left are the most reactive.`,
      keywords: ["shell", "atomic radius", "reactivity"],
      tryIt: { prompt: "Colour by covalent radius; watch it grow down each column.", preset: { colorMode: "covalentRadius" } },
      check: [
        { q: "Down a group, atoms get…?", a: "bigger" },
        { q: "Why do atoms get bigger down a group?", a: "each row adds another electron shell" },
      ],
    },
    {
      id: "families",
      title: "5 · Families at a glance",
      goal: "Meet a few important columns.",
      body: `<b>Alkali metals</b> (group 1): 1 valence electron, super reactive. <b>Halogens</b>
        (group 17): 7 valence electrons, grab one more to react. <b>Noble gases</b> (group 18):
        full outer shell, almost unreactive.`,
      keywords: ["alkali metals", "halogens", "noble gases"],
      tryIt: { prompt: "Highlight group 18 — the noble gases.", preset: { highlightMode: "group", highlightValue: "18" } },
      check: [
        { q: "How many valence electrons do group-1 metals have?", a: "1" },
        { q: "Why are noble gases unreactive?", a: "their outer shell is already full" },
      ],
    },
  ],

  quiz: [
    { type: "mc", q: "An element's row (period) number tells you roughly its number of…", choices: ["protons", "electron shells", "neutrons"], answer: 1, explain: "Period ≈ number of occupied electron shells." },
    { type: "mc", q: "Elements in the same group (column) have the same number of…", choices: ["valence electrons", "neutrons", "shells"], answer: 0, explain: "Same valence electrons → similar chemistry." },
    { type: "mc", q: "Why are the noble gases so unreactive?", choices: ["They're too heavy", "Their outer shell is already full", "They have no electrons"], answer: 1, explain: "A full outer shell is very stable." },
    { type: "mc", q: "Across a period (left → right), atoms generally get…", choices: ["bigger", "smaller", "stay the same"], answer: 1, explain: "More protons pull electrons in tighter." },
    { type: "mc", q: "The most electronegative elements are in the…", choices: ["bottom-left", "top-right (near fluorine)", "middle"], answer: 1, explain: "Electronegativity peaks toward fluorine." },
    { type: "build", q: "Colour the table by electronegativity.", check: { colorMode: "electronegativity" }, explain: "Use the “Colour by” menu." },
    { type: "build", q: "Highlight group 1 (the alkali metals).", check: { highlightMode: "group", highlightValue: "1" }, explain: "Use the Highlight menu → A group → Group 1." },
    { type: "build", q: "Find iron (Fe) — search for it or click it.", check: { symbol: "Fe" }, explain: "Type Fe, Iron, or 26 in the Find box." },
  ],
};
