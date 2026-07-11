/* ============================================================
   Element dataset generator  (build tool — run with Node)
   ------------------------------------------------------------
   Produces assets/data/elements.js, the single authoritative
   reference dataset shared by every visualization.

   Why a generator?  Electron configurations are computed from the
   aufbau (Madelung) order plus the documented anomalies, so they
   are correct by construction rather than hand-typed.  Periodic
   positions (period / group / block / grid x,y) are also derived.
   The curated physical data (mass, electronegativity, ionization
   energy, covalent radius, phase, category) lives in CORE below.

   Run:  node assets/data/_generate.js
   ============================================================ */

"use strict";
const fs = require("fs");
const path = require("path");

/* CORE rows: [Z, symbol, name, mass, category, EN, IE1(kJ/mol), covRadius(pm), phase]
   - mass: standard atomic weight; for elements with no stable isotope
     it is the mass number of the most stable/common isotope.
   - EN: Pauling electronegativity (null where not defined/unknown).
   - IE1: first ionization energy in kJ/mol (null where unknown).
   - covRadius: single-bond covalent radius in pm (Cordero 2008; null if unknown).
   - phase: state at 25 °C, 1 atm ("solid" | "liquid" | "gas" | "unknown").
   categories: alkali-metal, alkaline-earth-metal, transition-metal,
     post-transition-metal, metalloid, nonmetal, halogen, noble-gas,
     lanthanide, actinide, unknown.                                       */
const CORE = [
  [1,"H","Hydrogen",1.008,"nonmetal",2.20,1312,31,"gas"],
  [2,"He","Helium",4.0026,"noble-gas",null,2372,28,"gas"],
  [3,"Li","Lithium",6.94,"alkali-metal",0.98,520,128,"solid"],
  [4,"Be","Beryllium",9.0122,"alkaline-earth-metal",1.57,899,96,"solid"],
  [5,"B","Boron",10.81,"metalloid",2.04,801,84,"solid"],
  [6,"C","Carbon",12.011,"nonmetal",2.55,1086,76,"solid"],
  [7,"N","Nitrogen",14.007,"nonmetal",3.04,1402,71,"gas"],
  [8,"O","Oxygen",15.999,"nonmetal",3.44,1314,66,"gas"],
  [9,"F","Fluorine",18.998,"halogen",3.98,1681,57,"gas"],
  [10,"Ne","Neon",20.180,"noble-gas",null,2081,58,"gas"],
  [11,"Na","Sodium",22.990,"alkali-metal",0.93,496,166,"solid"],
  [12,"Mg","Magnesium",24.305,"alkaline-earth-metal",1.31,738,141,"solid"],
  [13,"Al","Aluminium",26.982,"post-transition-metal",1.61,578,121,"solid"],
  [14,"Si","Silicon",28.085,"metalloid",1.90,786,111,"solid"],
  [15,"P","Phosphorus",30.974,"nonmetal",2.19,1012,107,"solid"],
  [16,"S","Sulfur",32.06,"nonmetal",2.58,1000,105,"solid"],
  [17,"Cl","Chlorine",35.45,"halogen",3.16,1251,102,"gas"],
  [18,"Ar","Argon",39.95,"noble-gas",null,1521,106,"gas"],
  [19,"K","Potassium",39.098,"alkali-metal",0.82,419,203,"solid"],
  [20,"Ca","Calcium",40.078,"alkaline-earth-metal",1.00,590,176,"solid"],
  [21,"Sc","Scandium",44.956,"transition-metal",1.36,633,170,"solid"],
  [22,"Ti","Titanium",47.867,"transition-metal",1.54,659,160,"solid"],
  [23,"V","Vanadium",50.942,"transition-metal",1.63,651,153,"solid"],
  [24,"Cr","Chromium",51.996,"transition-metal",1.66,653,139,"solid"],
  [25,"Mn","Manganese",54.938,"transition-metal",1.55,717,139,"solid"],
  [26,"Fe","Iron",55.845,"transition-metal",1.83,762,132,"solid"],
  [27,"Co","Cobalt",58.933,"transition-metal",1.88,760,126,"solid"],
  [28,"Ni","Nickel",58.693,"transition-metal",1.91,737,124,"solid"],
  [29,"Cu","Copper",63.546,"transition-metal",1.90,745,132,"solid"],
  [30,"Zn","Zinc",65.38,"transition-metal",1.65,906,122,"solid"],
  [31,"Ga","Gallium",69.723,"post-transition-metal",1.81,579,122,"solid"],
  [32,"Ge","Germanium",72.630,"metalloid",2.01,762,120,"solid"],
  [33,"As","Arsenic",74.922,"metalloid",2.18,947,119,"solid"],
  [34,"Se","Selenium",78.971,"nonmetal",2.55,941,120,"solid"],
  [35,"Br","Bromine",79.904,"halogen",2.96,1140,120,"liquid"],
  [36,"Kr","Krypton",83.798,"noble-gas",3.00,1351,116,"gas"],
  [37,"Rb","Rubidium",85.468,"alkali-metal",0.82,403,220,"solid"],
  [38,"Sr","Strontium",87.62,"alkaline-earth-metal",0.95,549,195,"solid"],
  [39,"Y","Yttrium",88.906,"transition-metal",1.22,600,190,"solid"],
  [40,"Zr","Zirconium",91.224,"transition-metal",1.33,640,175,"solid"],
  [41,"Nb","Niobium",92.906,"transition-metal",1.60,652,164,"solid"],
  [42,"Mo","Molybdenum",95.95,"transition-metal",2.16,684,154,"solid"],
  [43,"Tc","Technetium",98,"transition-metal",1.90,702,147,"solid"],
  [44,"Ru","Ruthenium",101.07,"transition-metal",2.20,710,146,"solid"],
  [45,"Rh","Rhodium",102.91,"transition-metal",2.28,720,142,"solid"],
  [46,"Pd","Palladium",106.42,"transition-metal",2.20,804,139,"solid"],
  [47,"Ag","Silver",107.87,"transition-metal",1.93,731,145,"solid"],
  [48,"Cd","Cadmium",112.41,"transition-metal",1.69,868,144,"solid"],
  [49,"In","Indium",114.82,"post-transition-metal",1.78,558,142,"solid"],
  [50,"Sn","Tin",118.71,"post-transition-metal",1.96,709,139,"solid"],
  [51,"Sb","Antimony",121.76,"metalloid",2.05,834,139,"solid"],
  [52,"Te","Tellurium",127.60,"metalloid",2.10,869,138,"solid"],
  [53,"I","Iodine",126.90,"halogen",2.66,1008,139,"solid"],
  [54,"Xe","Xenon",131.29,"noble-gas",2.60,1170,140,"gas"],
  [55,"Cs","Caesium",132.91,"alkali-metal",0.79,376,244,"solid"],
  [56,"Ba","Barium",137.33,"alkaline-earth-metal",0.89,503,215,"solid"],
  [57,"La","Lanthanum",138.91,"lanthanide",1.10,538,207,"solid"],
  [58,"Ce","Cerium",140.12,"lanthanide",1.12,534,204,"solid"],
  [59,"Pr","Praseodymium",140.91,"lanthanide",1.13,527,203,"solid"],
  [60,"Nd","Neodymium",144.24,"lanthanide",1.14,533,201,"solid"],
  [61,"Pm","Promethium",145,"lanthanide",1.13,540,199,"solid"],
  [62,"Sm","Samarium",150.36,"lanthanide",1.17,545,198,"solid"],
  [63,"Eu","Europium",151.96,"lanthanide",1.20,547,198,"solid"],
  [64,"Gd","Gadolinium",157.25,"lanthanide",1.20,593,196,"solid"],
  [65,"Tb","Terbium",158.93,"lanthanide",1.10,566,194,"solid"],
  [66,"Dy","Dysprosium",162.50,"lanthanide",1.22,573,192,"solid"],
  [67,"Ho","Holmium",164.93,"lanthanide",1.23,581,192,"solid"],
  [68,"Er","Erbium",167.26,"lanthanide",1.24,589,189,"solid"],
  [69,"Tm","Thulium",168.93,"lanthanide",1.25,597,190,"solid"],
  [70,"Yb","Ytterbium",173.05,"lanthanide",1.10,603,187,"solid"],
  [71,"Lu","Lutetium",174.97,"lanthanide",1.27,524,187,"solid"],
  [72,"Hf","Hafnium",178.49,"transition-metal",1.30,659,175,"solid"],
  [73,"Ta","Tantalum",180.95,"transition-metal",1.50,761,170,"solid"],
  [74,"W","Tungsten",183.84,"transition-metal",2.36,770,162,"solid"],
  [75,"Re","Rhenium",186.21,"transition-metal",1.90,760,151,"solid"],
  [76,"Os","Osmium",190.23,"transition-metal",2.20,840,144,"solid"],
  [77,"Ir","Iridium",192.22,"transition-metal",2.20,880,141,"solid"],
  [78,"Pt","Platinum",195.08,"transition-metal",2.28,870,136,"solid"],
  [79,"Au","Gold",196.97,"transition-metal",2.54,890,136,"solid"],
  [80,"Hg","Mercury",200.59,"transition-metal",2.00,1007,132,"liquid"],
  [81,"Tl","Thallium",204.38,"post-transition-metal",1.62,589,145,"solid"],
  [82,"Pb","Lead",207.2,"post-transition-metal",1.87,716,146,"solid"],
  [83,"Bi","Bismuth",208.98,"post-transition-metal",2.02,703,148,"solid"],
  [84,"Po","Polonium",209,"post-transition-metal",2.00,812,140,"solid"],
  [85,"At","Astatine",210,"halogen",2.20,899,150,"solid"],
  [86,"Rn","Radon",222,"noble-gas",2.20,1037,150,"gas"],
  [87,"Fr","Francium",223,"alkali-metal",0.79,393,260,"solid"],
  [88,"Ra","Radium",226,"alkaline-earth-metal",0.90,509,221,"solid"],
  [89,"Ac","Actinium",227,"actinide",1.10,499,215,"solid"],
  [90,"Th","Thorium",232.04,"actinide",1.30,587,206,"solid"],
  [91,"Pa","Protactinium",231.04,"actinide",1.50,568,200,"solid"],
  [92,"U","Uranium",238.03,"actinide",1.38,598,196,"solid"],
  [93,"Np","Neptunium",237,"actinide",1.36,605,190,"solid"],
  [94,"Pu","Plutonium",244,"actinide",1.28,585,187,"solid"],
  [95,"Am","Americium",243,"actinide",1.13,578,180,"solid"],
  [96,"Cm","Curium",247,"actinide",1.28,581,169,"solid"],
  [97,"Bk","Berkelium",247,"actinide",1.30,601,null,"solid"],
  [98,"Cf","Californium",251,"actinide",1.30,608,null,"solid"],
  [99,"Es","Einsteinium",252,"actinide",1.30,619,null,"solid"],
  [100,"Fm","Fermium",257,"actinide",1.30,627,null,"unknown"],
  [101,"Md","Mendelevium",258,"actinide",1.30,635,null,"unknown"],
  [102,"No","Nobelium",259,"actinide",1.30,642,null,"unknown"],
  [103,"Lr","Lawrencium",266,"actinide",1.30,479,null,"unknown"],
  [104,"Rf","Rutherfordium",267,"transition-metal",null,580,null,"unknown"],
  [105,"Db","Dubnium",268,"transition-metal",null,null,null,"unknown"],
  [106,"Sg","Seaborgium",269,"transition-metal",null,null,null,"unknown"],
  [107,"Bh","Bohrium",270,"transition-metal",null,null,null,"unknown"],
  [108,"Hs","Hassium",269,"transition-metal",null,null,null,"unknown"],
  [109,"Mt","Meitnerium",278,"unknown",null,null,null,"unknown"],
  [110,"Ds","Darmstadtium",281,"unknown",null,null,null,"unknown"],
  [111,"Rg","Roentgenium",282,"unknown",null,null,null,"unknown"],
  [112,"Cn","Copernicium",285,"transition-metal",null,null,null,"unknown"],
  [113,"Nh","Nihonium",286,"post-transition-metal",null,null,null,"unknown"],
  [114,"Fl","Flerovium",289,"post-transition-metal",null,null,null,"unknown"],
  [115,"Mc","Moscovium",290,"post-transition-metal",null,null,null,"unknown"],
  [116,"Lv","Livermorium",293,"post-transition-metal",null,null,null,"unknown"],
  [117,"Ts","Tennessine",294,"halogen",null,null,null,"unknown"],
  [118,"Og","Oganesson",294,"noble-gas",null,null,null,"unknown"],
];

/* ---- aufbau (Madelung) subshell fill order ---- */
const FILL_ORDER = [
  "1s","2s","2p","3s","3p","4s","3d","4p","5s","4d","5p","6s",
  "4f","5d","6p","7s","5f","6d","7p",
];
const SUBSHELL_CAP = { s: 2, p: 6, d: 10, f: 14 };

/* Documented anomalous configurations, stored as full subshell maps
   (only the subshells that differ from a clean aufbau fill need be
   exact — we store the complete valence picture for safety). */
const ANOMALIES = {
  24: { "3d": 5, "4s": 1 },                 // Cr
  29: { "3d": 10, "4s": 1 },                // Cu
  41: { "4d": 4, "5s": 1 },                 // Nb
  42: { "4d": 5, "5s": 1 },                 // Mo
  44: { "4d": 7, "5s": 1 },                 // Ru
  45: { "4d": 8, "5s": 1 },                 // Rh
  46: { "4d": 10, "5s": 0 },                // Pd
  47: { "4d": 10, "5s": 1 },                // Ag
  57: { "5d": 1, "4f": 0, "6s": 2 },        // La
  58: { "4f": 1, "5d": 1, "6s": 2 },        // Ce
  64: { "4f": 7, "5d": 1, "6s": 2 },        // Gd
  78: { "4f": 14, "5d": 9, "6s": 1 },       // Pt
  79: { "4f": 14, "5d": 10, "6s": 1 },      // Au
  89: { "6d": 1, "5f": 0, "7s": 2 },        // Ac
  90: { "6d": 2, "5f": 0, "7s": 2 },        // Th
  91: { "5f": 2, "6d": 1, "7s": 2 },        // Pa
  92: { "5f": 3, "6d": 1, "7s": 2 },        // U
  93: { "5f": 4, "6d": 1, "7s": 2 },        // Np
  96: { "5f": 7, "6d": 1, "7s": 2 },        // Cm
  103: { "5f": 14, "6d": 0, "7s": 2, "7p": 1 }, // Lr (p instead of d)
};

/* Build the subshell occupation map for a given Z by clean aufbau,
   then overlay any documented anomaly for that Z. */
function configFor(z) {
  const occ = {};
  let left = z;
  for (const sub of FILL_ORDER) {
    if (left <= 0) break;
    const cap = SUBSHELL_CAP[sub[1]];
    const put = Math.min(cap, left);
    occ[sub] = put;
    left -= put;
  }
  const anom = ANOMALIES[z];
  if (anom) {
    // Re-balance: anomalies move 1 electron between an (n)s/d/f and
    // neighbours. We trust the documented map for the listed subshells
    // and recompute the total to keep electron count == Z.
    for (const k of Object.keys(anom)) occ[k] = anom[k];
    // remove any zero entries
    for (const k of Object.keys(occ)) if (occ[k] === 0) delete occ[k];
    const total = Object.values(occ).reduce((a, b) => a + b, 0);
    if (total !== z) {
      throw new Error(`Anomaly for Z=${z} sums to ${total}, expected ${z}`);
    }
  }
  return occ;
}

/* Order subshells for display: by principal n, then s<p<d<f. */
const ORBITAL_RANK = { s: 0, p: 1, d: 2, f: 3 };
function orderedSubshells(occ) {
  return Object.keys(occ).sort((a, b) => {
    const na = +a[0], nb = +b[0];
    if (na !== nb) return na - nb;
    return ORBITAL_RANK[a[1]] - ORBITAL_RANK[b[1]];
  });
}

/* Noble-gas core symbols by Z. */
const NOBLE = [2, 10, 18, 36, 54, 86];
function nobleCoreFor(z) {
  let core = 0;
  for (const ng of NOBLE) { if (ng < z) core = ng; else break; }
  return core; // Z of the noble gas core, or 0 if none
}

/* Electrons per principal shell (n) -> array index n-1. */
function shellsFromOcc(occ) {
  const shells = [];
  for (const sub of Object.keys(occ)) {
    const n = +sub[0];
    shells[n - 1] = (shells[n - 1] || 0) + occ[sub];
  }
  for (let i = 0; i < shells.length; i++) shells[i] = shells[i] || 0;
  return shells;
}

/* Periodic-table position: returns {period, group, x, y, block}.
   x = column 1..18 for the main body; f-block elements get their own
   rows (y = 9 for lanthanides, 10 for actinides) at columns 3..17. */
function position(z) {
  // f-block: La–Lu (57–71), Ac–Lr (89–103)
  if (z >= 57 && z <= 71) {
    return { period: 6, group: 0, x: 3 + (z - 57), y: 9, block: "f" };
  }
  if (z >= 89 && z <= 103) {
    return { period: 7, group: 0, x: 3 + (z - 89), y: 10, block: "f" };
  }
  // main-body layout, period by period
  const rows = [
    [1],                                    // dummy
  ];
  // Build a lookup of Z -> {period, group} for the main body.
  const MAIN = {};
  // period 1
  MAIN[1] = [1, 1]; MAIN[2] = [1, 18];
  // periods 2 & 3 (groups 1,2 then 13–18)
  let p2 = [3,4,5,6,7,8,9,10], g2 = [1,2,13,14,15,16,17,18];
  p2.forEach((zz, i) => MAIN[zz] = [2, g2[i]]);
  let p3 = [11,12,13,14,15,16,17,18];
  p3.forEach((zz, i) => MAIN[zz] = [3, g2[i]]);
  // periods 4 & 5 (full 18 groups)
  for (let i = 0; i < 18; i++) MAIN[19 + i] = [4, i + 1];
  for (let i = 0; i < 18; i++) MAIN[37 + i] = [5, i + 1];
  // period 6: Cs Ba | (La-Lu f-block handled above) | Hf..Rn -> groups 4..18
  MAIN[55] = [6, 1]; MAIN[56] = [6, 2];
  for (let i = 72; i <= 86; i++) MAIN[i] = [6, i - 72 + 4];
  // period 7: Fr Ra | (Ac-Lr handled above) | Rf..Og -> groups 4..18
  MAIN[87] = [7, 1]; MAIN[88] = [7, 2];
  for (let i = 104; i <= 118; i++) MAIN[i] = [7, i - 104 + 4];

  const [period, group] = MAIN[z];
  const block =
    group === 1 || group === 2 ? (z === 2 ? "s" : "s") :
    group >= 3 && group <= 12 ? "d" : "p";
  return { period, group, x: group, y: period, block: z === 2 ? "s" : block };
}

/* Valence electron count (main-group: from group; He = 2).
   For d-block we report outer s + d electrons; f-block left as null. */
function valenceFor(z, group, occ, block) {
  if (block === "f") return null;
  if (z === 2) return 2;                     // helium: a duet, not an octet
  if (group >= 13) return group - 10;       // 13->3 ... 18->8
  if (group === 1) return 1;
  if (group === 2) return 2;
  // d-block: outer ns + (n-1)d
  let v = 0;
  const subs = orderedSubshells(occ);
  const maxN = Math.max(...subs.map((s) => +s[0]));
  for (const s of subs) {
    if (s[1] === "s" && +s[0] === maxN) v += occ[s];
    if (s[1] === "d" && +s[0] === maxN - 1) v += occ[s];
  }
  return v;
}

/* ---- assemble ---- */
function configString(occ, ordered) {
  return ordered.map((s) => `${s}${superscript(occ[s])}`).join(" ");
}
function configPlain(occ, ordered) {
  return ordered.map((s) => `${s}^${occ[s]}`).join(" ");
}
const SUP = {0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
function superscript(n){return String(n).split("").map(d=>SUP[d]).join("");}

const SYM_BY_Z = {};
CORE.forEach((r) => (SYM_BY_Z[r[0]] = r[1]));

const elements = CORE.map((row) => {
  const [number, symbol, name, mass, category, en, ie1, covRadius, phase] = row;
  const occ = configFor(number);
  const ordered = orderedSubshells(occ);
  const pos = position(number);
  const coreZ = nobleCoreFor(number);
  const shorthandOrdered = coreZ
    ? ordered.filter((s) => {
        // keep subshells filled after the noble core; a simple rule:
        // drop subshells fully accounted for by the core electron count
        return true;
      })
    : ordered;

  // shorthand: subtract the core's subshells
  let shorthand = configPlain(occ, ordered);
  let shorthandPretty = configString(occ, ordered);
  if (coreZ) {
    const coreOcc = configFor(coreZ);
    const diff = {};
    for (const s of ordered) {
      const c = coreOcc[s] || 0;
      if (occ[s] - c > 0) diff[s] = occ[s] - c;
    }
    const diffOrdered = orderedSubshells(diff);
    shorthand = `[${SYM_BY_Z[coreZ]}] ` + configPlain(diff, diffOrdered);
    shorthandPretty = `[${SYM_BY_Z[coreZ]}] ` + configString(diff, diffOrdered);
  }

  const shells = shellsFromOcc(occ);
  const valence = valenceFor(number, pos.group, occ, pos.block);

  return {
    number, symbol, name, mass, category, phase,
    electronegativity: en, ionizationEnergy: ie1, covalentRadius: covRadius,
    period: pos.period, group: pos.group, block: pos.block,
    x: pos.x, y: pos.y,
    shells,
    valence,
    config: configPlain(occ, ordered),
    configPretty: configString(occ, ordered),
    configShorthand: shorthand,
    configShorthandPretty: shorthandPretty,
    occ, // subshell -> count, for the electron-config visualization
    anomalous: !!ANOMALIES[number],
    noStableIsotope: number === 43 || number === 61 || number >= 84,
  };
});

/* category display metadata (label + colour) */
const CATEGORIES = {
  "alkali-metal":          { label: "Alkali metal",          color: "#ff7a59" },
  "alkaline-earth-metal":  { label: "Alkaline earth metal",  color: "#ffb24d" },
  "transition-metal":      { label: "Transition metal",      color: "#ffd35c" },
  "post-transition-metal": { label: "Post-transition metal", color: "#7fd1a8" },
  "metalloid":             { label: "Metalloid",             color: "#4fd0c0" },
  "nonmetal":              { label: "Reactive nonmetal",     color: "#5bd0ff" },
  "halogen":               { label: "Halogen",               color: "#5b8cff" },
  "noble-gas":             { label: "Noble gas",             color: "#b08cff" },
  "lanthanide":            { label: "Lanthanide",            color: "#ff8fc4" },
  "actinide":              { label: "Actinide",              color: "#ff6fa3" },
  "unknown":               { label: "Unknown properties",    color: "#6f78a3" },
};

const out =
`/* ============================================================
   elements.js  —  GENERATED FILE, do not edit by hand.
   Source of truth + generator: assets/data/_generate.js
   Run \`node assets/data/_generate.js\` to regenerate.

   The single authoritative element dataset shared by every
   visualization (periodic table, electron configuration,
   bonding, and later the stoichiometry molar-mass tools).
   ============================================================ */
"use strict";
const ELEMENT_CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};
const ELEMENTS = ${JSON.stringify(elements, null, 0)};
const ELEMENT_BY_SYMBOL = Object.fromEntries(ELEMENTS.map(e => [e.symbol, e]));
const ELEMENT_BY_Z = Object.fromEntries(ELEMENTS.map(e => [e.number, e]));
if (typeof module !== "undefined") module.exports = { ELEMENTS, ELEMENT_CATEGORIES, ELEMENT_BY_SYMBOL, ELEMENT_BY_Z };
`;

fs.writeFileSync(path.join(__dirname, "elements.js"), out);
console.log(`Wrote elements.js with ${elements.length} elements.`);

/* quick self-checks */
const errs = [];
for (const e of elements) {
  const sum = Object.values(e.occ).reduce((a, b) => a + b, 0);
  if (sum !== e.number) errs.push(`${e.symbol}: config sums to ${sum} not ${e.number}`);
  const shellSum = e.shells.reduce((a, b) => a + b, 0);
  if (shellSum !== e.number) errs.push(`${e.symbol}: shells sum to ${shellSum}`);
}
console.log(errs.length ? "ERRORS:\n" + errs.join("\n") : "Self-check passed: all configs sum to Z.");
