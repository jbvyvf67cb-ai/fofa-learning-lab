/* ============================================================
   Advanced · Laser on Diamond — module data
   Build tasks grade against moduleState() ->
     { regime, cuts, timeHelps, boundary, atmos }.
   ============================================================ */
"use strict";

const MODULE = {
  id: "adv-laser-diamond",
  title: "Laser on Diamond",
  intro: "Diamond is transparent, the best heat conductor of any solid, and yet a laser can " +
         "still cut it. Whether that takes forever or works with a weak beam depends entirely on " +
         "how the diamond sheds heat. (Advanced — physics + materials.)",

  lessons: [
    {
      id: "transparent",
      title: "1 · Why a laser passes straight through",
      goal: "Bandgap and why single photons aren't absorbed.",
      body: `Diamond's <b>bandgap</b> is ~5.5 eV, so ordinary visible/IR photons carry too little
        energy to be absorbed one at a time — they pass through. Absorption only happens through
        <b>nonlinear</b> (multi-photon) effects at the focus, at <b>defects</b>, or once a spot turns
        to <b>graphite</b>. Here we bundle all that into an adjustable “absorbed fraction”.`,
      keywords: ["bandgap", "multiphoton absorption", "absorbed fraction"],
      tryIt: { prompt: "Set the absorbed fraction very low — the diamond stays cold and clear.", preset: { absPct: 0.1 } },
      check: [
        { q: "Why is diamond transparent to most lasers?", a: "single sub-gap photons can't be absorbed" },
        { q: "Name one way light does get absorbed.", a: "multi-photon absorption, defects, or graphite" },
      ],
    },
    {
      id: "conduction",
      title: "2 · The lattice fights back (local rise)",
      goal: "Why diamond's conductivity resists a hot spot.",
      body: `Diamond is the <b>best bulk heat conductor known</b> (~5× copper). Heat dumped at the
        focus is conducted away almost as fast as it arrives, so the local temperature rise
        ΔT<sub>loc</sub> = P<sub>abs</sub>/(4πk)(1/a − 1/b) stays small unless the absorbed power is
        huge (~40 W at a 1 µm spot).`,
      keywords: ["thermal conductivity", "local temperature rise", "steady-state conduction"],
      tryIt: { prompt: "Use the Heat-sunk boundary and crank the power — see how much it takes.", preset: { boundary: "sink", PL: 50, absPct: 100 } },
      check: [
        { q: "Why doesn't a weak beam heat the spot much?", a: "diamond conducts the heat away fast" },
        { q: "Roughly how much absorbed power cuts a heat-sunk diamond at 1 µm?", a: "about 40 W" },
      ],
    },
    {
      id: "boundary",
      title: "3 · The boundary decides everything",
      goal: "Finite size turns an unwinnable race into a winnable one.",
      body: `A real diamond is finite: its only exit for heat is its <b>outer surface</b>
        (convection + radiation), which sheds only ~0.5–1 W even glowing hot. If it's
        <b>isolated</b>, any absorbed power above that slowly drives the <b>whole stone's baseline
        up</b> until graphitization is inevitable. If it's <b>heat-sunk</b>, the baseline stays at
        ambient and only the (tiny) local rise matters.`,
      keywords: ["boundary condition", "surface heat loss", "heat capacity"],
      tryIt: { prompt: "Same power, flip Boundary from Heat-sunk to Isolated and watch the answer change.", preset: { boundary: "isolated", PL: 5, absPct: 20 } },
      check: [
        { q: "How does an isolated diamond finally reach graphitization?", a: "its whole baseline temperature creeps up over time" },
        { q: "In which case does infinite time help?", a: "the isolated (bulk-limited) case" },
      ],
    },
    {
      id: "runaway",
      title: "4 · Graphitization runaway",
      goal: "The positive-feedback cut.",
      body: `Once any spot hits ~1900 K, sp³ diamond flips to <b>sp² graphite</b>, which is <b>black</b>
        and absorbs strongly — so it gets hotter, makes more graphite, and runs away into a cut. This
        is why "the two thresholds" matter: a heat-sunk stone needs ~40 W to trip it; an isolated one
        can be tripped by ~1 W given time.`,
      keywords: ["graphitization", "sp³ → sp²", "positive feedback", "the two thresholds"],
      tryIt: { prompt: "Push the power until the spot crosses the threshold and the diamond cuts.", preset: { boundary: "isolated", PL: 30, absPct: 30 } },
      check: [
        { q: "Why is graphitization a runaway?", a: "graphite is black, absorbs more, gets hotter, makes more graphite" },
        { q: "What are the two thresholds?", a: "~40 W local (heat-sunk) vs ~1 W bulk (isolated)" },
      ],
    },
  ],

  quiz: [
    { type: "mc", q: "Why is diamond transparent to most laser light?", choices: ["It reflects everything", "Single sub-bandgap photons can't be absorbed", "It has no electrons"], answer: 1, explain: "The 5.5 eV gap is bigger than a visible/IR photon's energy." },
    { type: "mc", q: "Diamond's extreme thermal conductivity means a hot spot…", choices: ["stays hot easily", "is cooled almost as fast as it's heated", "cannot form at all"], answer: 1, explain: "The lattice conducts heat away very fast." },
    { type: "mc", q: "In which case does 'infinite time' actually help cut the diamond?", choices: ["Heat-sunk (isothermal)", "Isolated (surface loss only)", "It never helps"], answer: 1, explain: "An isolated stone slowly preheats until it cuts." },
    { type: "mc", q: "Graphitization runs away because graphite is…", choices: ["transparent", "black and strongly absorbing", "a better conductor"], answer: 1, explain: "Black graphite absorbs more → hotter → more graphite." },
    { type: "tf", q: "A heat-sunk diamond can be cut by a very weak beam if you just wait long enough.", answer: false, explain: "Heat-sunk → steady state instantly; time doesn't help. You need ~40 W locally." },
    { type: "build", q: "Set it up so that infinite time DOES help (a weak beam that eventually cuts).", check: { timeHelps: true }, explain: "Use the Isolated boundary with a modest absorbed power (above the ~1 W surface-loss limit)." },
    { type: "build", q: "Put the diamond in the regime where it stays safe and NEVER cuts.", check: { cuts: false }, explain: "Heat-sink it, or drop the power/absorption so the steady spot stays below T_g." },
  ],
};
