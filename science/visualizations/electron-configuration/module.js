/* ============================================================
   M3 · Electron Configuration & Shells — module data
   Build tasks grade against moduleState() -> { z, shown, levels, valence, filled }.
   ============================================================ */
"use strict";

const MODULE = {
  id: "m3-electron-config",
  title: "M3 · Electron Configuration",
  intro: "Electrons fill shells and orbitals in a set order. Here you'll see how that order " +
         "builds up an atom and where the all-important valence electrons come from.",

  lessons: [
    {
      id: "levels",
      title: "1 · Energy levels (shells)",
      goal: "Electrons live in shells that fill from the inside out.",
      body: `Electrons occupy <b>shells</b> (energy levels) around the nucleus. Inner shells fill
        first. The shells hold <b>2, then 8, then 8/18…</b> electrons. The <b>number of shells</b>
        an atom uses is (roughly) its <b>period</b> on the periodic table.`,
      keywords: ["shell", "energy level", "period"],
      tryIt: { prompt: "Watch sodium build up its shells (2, 8, 1).", preset: { z: 11 } },
      check: [
        { q: "How many electrons fit in the first shell?", a: "2" },
        { q: "Which shell fills first — inner or outer?", a: "the inner shell" },
      ],
    },
    {
      id: "orbitals",
      title: "2 · Orbitals & spin",
      goal: "Shells split into orbitals; each holds 2 electrons.",
      body: `Shells split into subshells (<b>s, p, d, f</b>). Each <b>orbital</b> holds <b>2
        electrons</b> with opposite <b>spin</b> (Pauli). Within a subshell, electrons go in
        <b>singly first</b>, then pair up (Hund's rule).`,
      keywords: ["orbital", "subshell (s, p, d, f)", "spin", "Pauli", "Hund's rule"],
      tryIt: { prompt: "Look at oxygen's 2p orbitals — see the single electrons before pairing.", preset: { z: 8 } },
      check: [
        { q: "How many electrons fit in one orbital?", a: "2 (opposite spin)" },
        { q: "Do electrons pair up right away in a subshell?", a: "No — singly first (Hund's rule)" },
      ],
    },
    {
      id: "aufbau",
      title: "3 · The aufbau (filling) order",
      goal: "Electrons fill lowest energy first — with a twist.",
      body: `Electrons fill the <b>lowest-energy</b> subshell first: 1s, 2s, 2p, 3s, 3p… A famous
        surprise: <b>4s fills before 3d</b>. The energy ladder in the tool shows the order.`,
      keywords: ["aufbau", "filling order"],
      tryIt: { prompt: "Build scandium (Z=21) and watch 4s fill before 3d.", preset: { z: 21 } },
      check: [
        { q: "Which fills first, 4s or 3d?", a: "4s" },
        { q: "What does “lowest energy first” mean?", a: "the cheapest-to-fill subshell fills before higher ones" },
      ],
    },
    {
      id: "valence",
      title: "4 · Valence electrons",
      goal: "The outer-shell electrons that drive chemistry.",
      body: `<b>Valence electrons</b> are the electrons in the <b>outermost shell</b>. They're the
        ones that form bonds — losing, gaining, or sharing to fill the outer shell. Main-group
        atoms in the same column have the <b>same valence count</b> (that's Module 4).`,
      keywords: ["valence electron", "outer shell"],
      tryIt: { prompt: "Chlorine has 7 valence electrons — one short of a full shell.", preset: { z: 17 } },
      check: [
        { q: "Valence electrons are in which shell?", a: "the outermost shell" },
        { q: "How many valence electrons does oxygen have?", a: "6" },
      ],
    },
    {
      id: "exceptions",
      title: "5 · Exceptions to the rule",
      goal: "Why a few elements break aufbau.",
      body: `A handful of elements (like <b>chromium</b> and <b>copper</b>) don't follow the simple
        order, because a <b>half-filled</b> or <b>completely filled</b> d subshell is extra stable,
        so one electron shifts to reach it. The tool flags these.`,
      keywords: ["exception", "half-filled subshell"],
      tryIt: { prompt: "Build chromium (Z=24) and read the exception note.", preset: { z: 24 } },
      check: [
        { q: "Why does chromium break the rule?", a: "a half-filled d subshell is extra stable" },
        { q: "Does copper follow the simple order?", a: "No — it's an exception too" },
      ],
    },
  ],

  quiz: [
    { type: "mc", q: "How many electrons fit in the first shell?", choices: ["2", "8", "18"], answer: 0, explain: "The first shell (n=1) holds 2." },
    { type: "mc", q: "Valence electrons are the electrons in the…", choices: ["innermost shell", "outermost shell", "nucleus"], answer: 1, explain: "Valence = outer-shell electrons." },
    { type: "numeric", q: "How many valence electrons does oxygen have?", answer: 6, explain: "Oxygen: 2s² 2p⁴ → 6 in the outer shell." },
    { type: "mc", q: "Which subshell fills first?", choices: ["3d before 4s", "4s before 3d", "they fill together"], answer: 1, explain: "4s is lower energy, so it fills before 3d." },
    { type: "numeric", q: "How many electrons fit in a full p subshell?", answer: 6, explain: "p has 3 orbitals × 2 = 6." },
    { type: "tf", q: "Chromium follows the simple aufbau order exactly.", answer: false, explain: "Cr is an exception — a half-filled 3d is extra stable." },
    { type: "build", q: "Show fluorine (Z = 9).", check: { z: 9 }, explain: "Fluorine has 9 electrons: 1s² 2s² 2p⁵." },
    { type: "build", q: "Show a noble gas — an element with a full outer shell of 8 electrons.", check: { valence: 8 }, explain: "Neon, argon, krypton… all have 8 valence electrons." },
  ],
};
