/* ============================================================
   Element Explorer
   ------------------------------------------------------------
   Build any atom from protons / neutrons / electrons and see:
     • which element, isotope, ion, mass number, charge
     • whether the nuclide occurs in NATURE, only in the LAB,
       is THEORETICAL, or is IMPOSSIBLE
     • the electron shells, number of energy levels, valence
       electrons — and the derivation, to prep for the periodic
       table, electron configuration, and bonding.

   The existence FILTER (nature / lab / anything) auto-sets the
   neutron and electron counts to a valid configuration and
   constrains the neutron slider accordingly.

   Existence model: natural isotopes are curated (NAT below).
   The lab / theoretical / impossible boundaries use an
   approximate band around the line of stability — enough to
   teach the idea, not a full chart of nuclides.
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);

/* ---------- curated natural (stable + primordial / decay-chain) isotope
   mass numbers. Empty array => element has no natural isotopes (synthetic,
   or Tc / Pm). Elements beyond Z=92 are treated as lab-only. ---------- */
const NAT = {
  1:[1,2], 2:[3,4], 3:[6,7], 4:[9], 5:[10,11], 6:[12,13,14], 7:[14,15], 8:[16,17,18],
  9:[19], 10:[20,21,22], 11:[23], 12:[24,25,26], 13:[27], 14:[28,29,30], 15:[31],
  16:[32,33,34,36], 17:[35,37], 18:[36,38,40], 19:[39,40,41], 20:[40,42,43,44,46,48],
  21:[45], 22:[46,47,48,49,50], 23:[50,51], 24:[50,52,53,54], 25:[55], 26:[54,56,57,58],
  27:[59], 28:[58,60,61,62,64], 29:[63,65], 30:[64,66,67,68,70], 31:[69,71],
  32:[70,72,73,74,76], 33:[75], 34:[74,76,77,78,80,82], 35:[79,81], 36:[78,80,82,83,84,86],
  37:[85,87], 38:[84,86,87,88], 39:[89], 40:[90,91,92,94,96], 41:[93], 42:[92,94,95,96,97,98,100],
  43:[], 44:[96,98,99,100,101,102,104], 45:[103], 46:[102,104,105,106,108,110], 47:[107,109],
  48:[106,108,110,111,112,113,114,116], 49:[113,115], 50:[112,114,115,116,117,118,119,120,122,124],
  51:[121,123], 52:[120,122,123,124,125,126,128,130], 53:[127], 54:[124,126,128,129,130,131,132,134,136],
  55:[133], 56:[130,132,134,135,136,137,138], 57:[138,139], 58:[136,138,140,142], 59:[141],
  60:[142,143,144,145,146,148,150], 61:[], 62:[144,147,148,149,150,152,154], 63:[151,153],
  64:[152,154,155,156,157,158,160], 65:[159], 66:[156,158,160,161,162,163,164], 67:[165],
  68:[162,164,166,167,168,170], 69:[169], 70:[168,170,171,172,173,174,176], 71:[175,176],
  72:[174,176,177,178,179,180], 73:[180,181], 74:[180,182,183,184,186], 75:[185,187],
  76:[184,186,187,188,189,190,192], 77:[191,193], 78:[190,192,194,195,196,198], 79:[197],
  80:[196,198,199,200,201,202,204], 81:[203,205], 82:[204,206,207,208], 83:[209],
  84:[210], 85:[210], 86:[222], 87:[223], 88:[226], 89:[227], 90:[232], 91:[231], 92:[234,235,238],
};
/* Z 93..118 -> synthetic (no NAT entry => treated as []) */

/* ---------- common natural monatomic ion charges per element, most common
   first. Elements absent from this table have no common monatomic ion and
   default to the neutral atom. Neutral (0) is always offered as a cycle option. */
const ION = {
  1:[1,-1], 3:[1], 4:[2], 7:[-3], 8:[-2], 9:[-1], 11:[1], 12:[2], 13:[3],
  15:[-3], 16:[-2], 17:[-1], 19:[1], 20:[2], 21:[3], 22:[4,3], 23:[5,4,3,2],
  24:[3,6,2], 25:[2,4,7], 26:[2,3], 27:[2,3], 28:[2], 29:[2,1], 30:[2], 31:[3],
  32:[4,2], 33:[3,5], 34:[-2], 35:[-1], 37:[1], 38:[2], 39:[3], 40:[4], 41:[5],
  42:[6,4], 44:[3,4], 45:[3], 46:[2,4], 47:[1], 48:[2], 49:[3], 50:[2,4],
  51:[3,5], 52:[-2,4], 53:[-1], 55:[1], 56:[2], 57:[3], 58:[3,4], 59:[3], 60:[3],
  62:[3,2], 63:[3,2], 64:[3], 65:[3], 66:[3], 67:[3], 68:[3], 69:[3], 70:[3,2],
  71:[3], 72:[4], 73:[5], 74:[6,4], 75:[7,4], 76:[4,3], 77:[3,4], 78:[2,4],
  79:[3,1], 80:[2,1], 81:[1,3], 82:[2,4], 83:[3,5], 84:[4,2], 85:[-1], 87:[1],
  88:[2], 89:[3], 90:[4], 91:[5], 92:[6,4],
};
/* options for the ion cycler: common ions first, then neutral (if not already there) */
function ionOptions(z){
  const list = (ION[z] || []).slice();
  if (!list.includes(0)) list.push(0);
  return list;
}
function ionLabel(z, charge){
  const sym = elementFor(z).symbol;
  if (charge === 0) return sym + " (neutral)";
  const mag = Math.abs(charge) === 1 ? "" : sup(Math.abs(charge));
  return sym + mag + (charge > 0 ? "⁺" : "⁻");
}

const SUP = {0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
const SUB = {0:"₀",1:"₁",2:"₂",3:"₃",4:"₄",5:"₅",6:"₆",7:"₇",8:"₈",9:"₉"};
const sup = (n) => String(n).split("").map(d=>SUP[d]).join("");
const sub = (n) => String(n).split("").map(d=>SUB[d]).join("");

const MAX_Z = 1000;   // explorer goes up to Z=1000 (theoretical, systematically named)

/* Extended aufbau (Madelung) order, generated so it covers any electron count
   up to ~1000 — including the g, h, … orbitals predicted for super-heavy atoms.
   For Z ≤ 118 this reproduces the standard 1s 2s 2p 3s … order exactly. */
const ORB_LETTER = ["s","p","d","f","g","h","i","k","l","m","n","o"];
function orbLetter(l){ return ORB_LETTER[l] || ("(l"+l+")"); }
function buildFillOrder(maxN){
  const subs = [];
  for (let n=1; n<=maxN; n++) for (let l=0; l<n; l++) subs.push({ n, l });
  subs.sort((a,b)=> (a.n+a.l) - (b.n+b.l) || a.n - b.n);   // Madelung: n+l, then n
  return subs.map(s => ({ n:s.n, label:s.n+orbLetter(s.l), cap:2*(2*s.l+1) }));
}
const FILL = buildFillOrder(22);   // far more than enough for 1000 electrons

/* ---------- IUPAC systematic names for elements beyond the dataset (Z > 118) ---------- */
const SYS_ROOTS = ["nil","un","bi","tri","quad","pent","hex","sept","oct","enn"];
const SYS_SYM   = ["n","u","b","t","q","p","h","s","o","e"];
function systematicElement(z){
  const digits = String(z).split("").map(Number);
  let name = digits.map(d => SYS_ROOTS[d]).join("");
  name = name.replace(/nnn/g, "nn");      // "enn"+"nil" -> single double-n (e.g. 190)
  name = name.replace(/i$/, "") + "ium";  // drop trailing i of bi/tri before -ium
  name = name.charAt(0).toUpperCase() + name.slice(1);
  let sym = digits.map(d => SYS_SYM[d]).join("");
  sym = sym.charAt(0).toUpperCase() + sym.slice(1);
  return { number:z, symbol:sym, name, category:"unknown",
           period:null, group:null, block:null, mass:null, valence:null,
           systematic:true };
}
/* element record for any Z: dataset for 1..118, systematic for 119..1000 */
function elementFor(z){ return ELEMENT_BY_Z[z] || systematicElement(z); }

function natOf(z){ return NAT[z] || []; }
/* central mass number: real most-stable A for Z ≤ 118; an N/Z≈1.5 estimate above */
function massNumberCenter(z){
  return ELEMENT_BY_Z[z] ? Math.round(ELEMENT_BY_Z[z].mass) : Math.round(z * 2.5);
}
/* main natural isotope = natural A closest to the standard atomic mass */
function mainA(z){
  const list = natOf(z);
  if (!list.length) return massNumberCenter(z);
  const m = ELEMENT_BY_Z[z] ? ELEMENT_BY_Z[z].mass : massNumberCenter(z);
  return list.reduce((best,a)=> Math.abs(a-m) < Math.abs(best-m) ? a : best, list[0]);
}

/* ---------- existence classification of a nuclide (Z, N) ---------- */
function bands(z){
  const list = natOf(z);
  const stLo = list.length ? Math.min(...list) : massNumberCenter(z);
  const stHi = list.length ? Math.max(...list) : massNumberCenter(z);
  const labReach  = Math.round(stHi * 0.15) + 6;
  const theoReach = Math.round(stHi * 0.15) + 8;
  return {
    labLo: stLo - labReach, labHi: stHi + labReach,
    theoLo: stLo - labReach - theoReach, theoHi: stHi + labReach + theoReach,
  };
}
function classifyNuclide(z, n){
  const A = z + n;
  if (n < 0) return { key:"impossible", reason:"You can't have a negative number of neutrons." };
  if (z > 118){
    const el = systematicElement(z);
    return { key:"theoretical", reason:`Element ${z} (${el.symbol}) has only a systematic IUPAC placeholder name — ` +
      `it has never been synthesised, so it exists only on paper.` };
  }
  const list = natOf(z);
  if (list.includes(A)) return { key:"nature", reason:`${ELEMENT_BY_Z[z].name}-${A} is one of this element's naturally occurring isotopes.` };
  const synthElem = list.length === 0;
  const b = bands(z);
  if (A >= b.labLo && A <= b.labHi)
    return { key:"lab", reason: synthElem
      ? `This whole element is synthetic — it's only ever been created in a laboratory or reactor.`
      : `This isotope isn't found in nature, but it has been produced in the lab.` };
  if (A >= b.theoLo && A <= b.theoHi)
    return { key:"theoretical", reason:`This isotope sits near the limits of nuclear stability — predicted to be possible but not (yet) observed.` };
  return { key:"impossible", reason:`Mass number ${A} is far outside the band of stability for ${ELEMENT_BY_Z[z].symbol} — the nucleus couldn't hold together.` };
}

/* ---------- charge / electron status (separate from the nuclide) ---------- */
function chargeStatus(z, e){
  const q = z - e;
  if (e === 0)            return { q, text:`<b>Bare nucleus</b> (all ${z} electrons stripped) — only in plasmas, stars, or accelerators.`, bad:false };
  if (q === 0)            return { q, text:`<b>Neutral atom</b> — electrons balance protons.`, bad:false };
  if (q > 0)              return { q, text:`<b>Cation ${q>1?q+"+":"+"}</b> — lost ${q} electron${q>1?"s":""}; common in nature and the lab.`, bad:false };
  const extra = -q;
  if (extra <= 2)         return { q, text:`<b>Anion ${extra>1?extra+"−":"−"}</b> — gained ${extra} electron${extra>1?"s":""}.`, bad:false };
  return { q, text:`<b>Over-filled (${extra}−)</b> — an isolated atom can't bind this many extra electrons; this ion is essentially impossible.`, bad:true };
}

/* ---------- shells & valence from an electron count (handles ions & super-heavy) ---------- */
function shellsFor(eCount){
  const sh=[]; let left=eCount;
  for (const s of FILL){ if (left<=0) break; const put=Math.min(s.cap,left); sh[s.n-1]=(sh[s.n-1]||0)+put; left-=put; }
  for (let i=0;i<sh.length;i++) sh[i]=sh[i]||0;
  return sh;
}

/* ---------- state ---------- */
const state = { z:6, n:6, e:6, filter:"nature" };
let canvas, ctx, nucleusOrder=[];

/* ---------- filter behaviour ---------- */
function neutronRange(){
  if (state.filter === "nature"){
    const ns = natOf(state.z).map(a=>a-state.z);
    return ns.length ? { min:Math.min(...ns), max:Math.max(...ns), snap:ns } : null;
  }
  if (state.filter === "lab"){
    const b = bands(state.z);
    return { min:Math.max(0,b.labLo-state.z), max:b.labHi-state.z, snap:null };
  }
  return { min:0, max:200, snap:null };
}
/* snap a neutron value to the nearest allowed for the current filter */
function snapNeutron(nWanted){
  const r = neutronRange();
  if (!r) return nWanted;
  let n = Math.max(r.min, Math.min(r.max, nWanted));
  if (r.snap) n = r.snap.reduce((b,v)=> Math.abs(v-nWanted)<Math.abs(b-nWanted)?v:b, r.snap[0]);
  return n;
}
/* when element or filter changes, reset N and electrons to a valid config */
function applyFilterDefaults(){
  if (state.filter === "nature"){
    const list = natOf(state.z);
    state.n = list.length ? (mainA(state.z) - state.z) : (massNumberCenter(state.z) - state.z);
    // default to the element's most common natural ion (neutral if it has none).
    // Hydrogen is special-cased to neutral: its "ion" H+ is a bare proton, which
    // would otherwise read as the confusing "bare nucleus" state on first view.
    const primary = (list.length && state.z !== 1) ? ionOptions(state.z)[0] : 0;
    state.e = state.z - primary;
  } else if (state.filter === "lab"){
    const list = natOf(state.z);
    state.n = list.length ? (Math.max(...list) + 2 - state.z) : (massNumberCenter(state.z) - state.z);
    state.e = state.z;
  } else {
    state.n = mainA(state.z) - state.z;        // sensible default; user is free to roam
    state.e = state.z;
  }
  if (state.n < 0) state.n = 0;
}

/* ---------- mutations ---------- */
function setFilter(f){
  state.filter = f;
  for (const b of $("filterSeg").children) b.classList.toggle("on", b.dataset.f === f);
  applyFilterDefaults();
  rebuildNucleus(); render();
}
function setProtons(z){
  state.z = Math.max(1, Math.min(MAX_Z, z|0));
  applyFilterDefaults();           // changing element re-derives a valid isotope for the filter
  rebuildNucleus(); render();
}
function setNeutrons(n){
  n = n|0;
  if (state.filter !== "anything") n = snapNeutron(n);
  state.n = Math.max(0, Math.min(3000, n));
  rebuildNucleus(); render();
}
function setElectrons(e){
  state.e = Math.max(0, Math.min(MAX_Z + 10, e|0));
  render();
}
/* set electrons so the atom carries `charge` (a common-ion shortcut) */
function setIonCharge(charge){ setElectrons(state.z - charge); }
/* advance to the next common ion (then neutral, then wrap) */
function cycleIon(){
  const opts = ionOptions(state.z);
  const cur = state.z - state.e;
  let idx = opts.indexOf(cur);
  idx = (idx + 1) % opts.length;          // if current isn't a listed ion, indexOf=-1 -> start at 0
  setIonCharge(opts[idx]);
}

/* ---------- rendering ---------- */
function render(){
  const z = state.z, n = state.n, e = state.e, A = z+n, q = z-e;
  const el = elementFor(z);

  // identity
  $("elSymbol").textContent = el.symbol;
  $("elZ").textContent = "Z " + z;
  $("tile").style.background = `linear-gradient(135deg, var(--panel-2), ${ELEMENT_CATEGORIES[el.category].color}44)`;
  $("elName").textContent = el.name;
  const chStr = q===0 ? "" : (Math.abs(q)===1 ? (q>0?"⁺":"⁻") : sup(Math.abs(q))+(q>0?"⁺":"⁻"));
  $("isotope").textContent = sup(A)+sub(z)+el.symbol+chStr;
  $("isotopeName").textContent = el.name + "-" + A + (q!==0 ? " ion" : "");

  // existence badge (nuclide)
  const cls = classifyNuclide(z, n);
  const box = $("existence");
  box.className = "badge-existence exist-" + cls.key;
  const TAGS = { nature:"OCCURS IN NATURE", lab:"LAB-MADE ONLY", theoretical:"THEORETICAL", impossible:"IMPOSSIBLE" };
  $("existTag").textContent = TAGS[cls.key];
  $("existReason").textContent = cls.reason;

  // charge line
  $("chargeLine").innerHTML = chargeStatus(z, e).text;

  // readouts
  $("rZ").textContent = z; $("rN").textContent = n; $("rA").textContent = A;
  $("rE").textContent = e; $("rCharge").textContent = q>0?"+"+q:q;

  // electron structure + derivation
  renderElectronStructure(el, e, q);

  // common-ion cycler (nature mode only)
  renderIonRow();

  // expandable, category-specific explainer (+ chart, isotope breakdown)
  renderExplain(cls.key, z, n, e);

  syncControls();
}

function renderElectronStructure(el, e, q){
  const sh = shellsFor(e);
  const levels = sh.length;
  const valence = levels ? sh[levels-1] : 0;

  $("shellPills").innerHTML = sh.map((c,i)=>
    `<span class="shell-pill${i===levels-1?" outer":""}">n=${i+1}: ${c} e⁻</span>`).join("")
    || `<span class="shell-pill">no electrons</span>`;

  const periodNote = el.period
    ? `For a neutral atom this equals the element's <b>period</b> on the periodic table (period ${el.period}).`
    : `That's beyond the known periodic table — there's no confirmed period for this element.`;
  $("stepLevels").innerHTML =
    `<b>Electron levels (shells): ${levels}.</b> Electrons fill from the innermost shell out — ` +
    `<code>${sh.map((c,i)=>`n${i+1}=${c}`).join(", ")||"—"}</code>. ` +
    (q===0 ? periodNote : `(Shells are recomputed for this ion's ${e} electrons, not the neutral atom.)`);

  let valExpl;
  if (e === 0) valExpl = `No electrons, so no valence shell.`;
  else if (el.block === "f" && q===0) valExpl = `Valence is more complex for f-block elements; the outer shell holds ${valence} e⁻.`;
  else valExpl = `<b>Valence electrons: ${valence}</b> — the electrons in the outermost shell (n=${levels}). ` +
       (q===0 && el.group>=13 ? `For a main-group atom this matches the group's units digit (group ${el.group}).`
        : q===0 && (el.group===1||el.group===2) ? `That matches group ${el.group}.` : ``);
  $("stepValence").innerHTML = valExpl;

  $("stepWhy").innerHTML = el.systematic
    ? `Heads-up: for super-heavy atoms this filling is a <b>theoretical extrapolation</b> (extended aufbau with g-orbitals). ` +
      `Relativistic effects mean real configurations — if these atoms could ever be made — would likely differ.`
    : (e===0 ? "" :
      `Why it matters: the valence count drives how this atom <b>bonds</b> — losing, gaining, or sharing ` +
      `electrons to reach a full outer shell. That's the bridge to the bonding and periodic-table tools.`);
}

/* ---------- expandable existence explainer ---------- */
const bandPhysics =
  "Atoms are held together by the <b>strong nuclear force</b>, which only reaches between touching nucleons, while " +
  "every proton <b>electrically repels</b> every other proton across the whole nucleus. Neutrons add strong-force " +
  "“glue” without adding repulsion — so light nuclei are stable near N ≈ Z, and heavier ones need <b>more and more " +
  "neutrons</b> than protons. The stable nuclei trace a curving <b>band of stability</b> that bends above the N = Z " +
  "line. Stray off the band and the nucleus is radioactive; go far enough (past the <b>drip lines</b>) and it can't " +
  "hold together at all.";

function fmtCrust(ppm){
  if (ppm == null) return null;
  if (ppm >= 10000) return (ppm/10000).toFixed(ppm>=100000?0:1) + "% by mass";
  if (ppm >= 1)     return ppm + " ppm (mg/kg)";
  if (ppm >= 0.001) return ppm + " ppm — rare";
  return "< 0.001 ppm — extremely rare";
}

function renderExplain(category, z, n, e){
  const el = elementFor(z), info = (typeof ELEMENT_INFO!=="undefined" && ELEMENT_INFO[z]) || {};
  const A = z + n;
  const SUMMARY = {
    nature: "🌍 Where is it found? Isotope mix & facts",
    lab: "🔬 How & when was it made?",
    theoretical: "❓ Why only theoretical? (the band of stability)",
    impossible: "🚫 Why is this impossible?",
  };
  $("explainSummary").textContent = (SUMMARY[category] || "Learn more") + "  ▾";

  let html = "";
  if (category === "nature"){
    const crust = fmtCrust(info.crust);
    html += crust ? `<b>Abundance in Earth's crust</b><span class="big-num">${crust}</span>`
                  : `<b>Abundance:</b> negligible in the solid crust (often found only in air, seawater, or decay chains).<br><br>`;
    if (info.fact) html += info.fact;
  } else if (category === "lab"){
    const syn = (typeof SYNTHESIS!=="undefined") ? SYNTHESIS[z] : null;
    if (syn){
      html += `<b>First synthesised ${syn.year}</b><span class="big-num">${el.name}</span>By ${syn.by} — ${syn.how}`;
    } else {
      html += `<b>${el.name}-${A} doesn't occur naturally.</b> Isotopes like it are produced in <b>nuclear reactors</b> ` +
              `(neutron capture) or <b>particle accelerators / cyclotrons</b> (smashing nuclei together). Many lab-made ` +
              `isotopes are essential in medicine — PET scans, cancer therapy — and in research.`;
    }
    if (info.fact) html += `<br><br>${info.fact}`;
  } else if (category === "theoretical" && el.systematic){
    html += `<b>Element ${z} — ${el.name} (${el.symbol})</b><span class="big-num">never synthesised</span>` +
            `Every element has a ready-made <b>systematic IUPAC name</b> built from its digits ` +
            `(${String(z).split("").map(d=>SYS_ROOTS[d]).join("-")} → “${el.name.toLowerCase()}”), used as a placeholder ` +
            `until — if ever — it's actually made and given a permanent name. Elements up to 118 exist; beyond that we have ` +
            `names but no atoms. Some theorists predict an “<b>island of stability</b>” near Z≈114–126 where a few super-heavy ` +
            `nuclei might survive longer, but nothing this heavy has been created.<br><br>` + bandPhysics;
  } else if (category === "theoretical"){
    html += `${el.name}-${A} lies just <b>beyond the isotopes we've managed to observe</b>, near the predicted edge of ` +
            `what can exist.<br><br>` + bandPhysics;
  } else { // impossible
    html += (n < 0)
      ? `<b>A nucleus can't hold a negative number of neutrons.</b><br><br>` + bandPhysics
      : `${el.name}-${A} sits <b>far outside the band of stability</b> — past the drip line, where the strong force ` +
        `can't bind that lopsided mix of protons and neutrons; an added nucleon would fall straight back out.<br><br>` + bandPhysics;
  }
  $("explainBody").innerHTML = html;

  renderIsotopes(z, A);
  drawNuclideChart();
  $("chartCaption").innerHTML =
    "Each dot is a <span style='color:#4ad6ff'>naturally occurring nuclide</span> — together they trace the band of " +
    "stability. Your atom is the <span style='color:#fff'>ringed</span> marker.";
}

/* isotope abundance breakdown for the current element */
function renderIsotopes(z, curA){
  const box = $("isoBreakdown");
  const el = elementFor(z), natList = natOf(z), sym = el.symbol;
  if (!natList.length){
    const msg = z > 118
      ? `${el.name} has never been synthesised, so none of its isotopes exist yet — they're entirely predicted.`
      : `${el.name} has no stable or naturally occurring isotopes — every isotope is radioactive and made artificially.`;
    box.innerHTML = `<div class="iso-title">Isotopes</div>` +
      `<div style="color:var(--ink-soft);font-size:.84rem">${msg}</div>`;
    return;
  }
  const ab = (typeof ISO_ABUND!=="undefined") ? ISO_ABUND[z] : null;
  let html = `<div class="iso-title">Natural isotope breakdown of ${sym}</div>`;
  if (ab){
    const mainA = +Object.keys(ab).reduce((a,b)=> ab[b]>ab[a] ? b : a);
    for (const A of natList){
      const pct = ab[A]; if (pct == null) continue;
      const isCur = A===curA, isMain = A===mainA;
      html += `<div class="iso-bar-row">` +
        `<span class="lbl${isCur?" cur":""}">${sym}-${A}</span>` +
        `<div class="iso-track"><div class="iso-fill${isMain?" main":""}${isCur?" cur":""}" style="width:${Math.max(pct,0.6)}%"></div></div>` +
        `<span class="pctv">${pct>=0.01 ? pct.toFixed(pct<1?3:2) : "<0.01"}%</span></div>`;
    }
    const mp = ab[mainA];
    html += `<div style="color:var(--ink-dim);font-size:.78rem;margin-top:6px">Most abundant: ` +
      `<b style="color:var(--accent-2)">${sym}-${mainA}</b> at ${mp.toFixed(mp<1?3:2)}%.` +
      (curA && ab[curA]==null ? ` Your isotope (${sym}-${curA}) isn't one of the abundant natural ones.` : ``) + `</div>`;
  } else {
    html += `<div class="iso-chips">` + natList.map(A =>
      `<span class="iso-masschip${A===curA?" cur":""}">${sym}-${A}</span>`).join("") + `</div>` +
      `<div style="color:var(--ink-dim);font-size:.78rem;margin-top:6px">${natList.length} natural isotope` +
      `${natList.length>1?"s":""}; exact % breakdown isn't catalogued here yet.</div>`;
  }
  box.innerHTML = html;
}

/* band-of-stability chart of nuclides (N vs Z) */
let NATURAL_POINTS = null;
function naturalPoints(){
  if (NATURAL_POINTS) return NATURAL_POINTS;
  NATURAL_POINTS = [];
  for (const z in NAT) for (const A of NAT[z]) NATURAL_POINTS.push({ n: A - (+z), z: +z });
  return NATURAL_POINTS;
}
function drawNuclideChart(){
  const cv = $("nuclideChart");
  if (!$("explain").open) return;                 // collapsed => 0 size, nothing to draw
  const W = cv.clientWidth, H = cv.clientHeight, d = window.devicePixelRatio || 1;
  if (!W || !H) return;
  cv.width = W*d; cv.height = H*d;
  const g = cv.getContext("2d"); g.setTransform(d,0,0,d,0,0); g.clearRect(0,0,W,H);

  const curN = state.n, curZ = state.z;
  const pad = { l:34, r:10, t:10, b:26 };
  const xMax = Math.max(180, curN + 6), yMax = Math.max(118, curZ + 10);
  const px = (nn)=> pad.l + (nn/xMax)*(W-pad.l-pad.r);
  const py = (zz)=> H-pad.b - (zz/yMax)*(H-pad.t-pad.b);

  // axes
  g.strokeStyle="rgba(255,255,255,.18)"; g.lineWidth=1;
  g.beginPath(); g.moveTo(pad.l,pad.t); g.lineTo(pad.l,H-pad.b); g.lineTo(W-pad.r,H-pad.b); g.stroke();
  g.fillStyle="#6f78a3"; g.font="10px system-ui"; g.textAlign="center";
  g.fillText("Neutrons (N) →", (pad.l+W)/2, H-7);
  g.save(); g.translate(11,(pad.t+H-pad.b)/2); g.rotate(-Math.PI/2); g.fillText("Protons (Z) →",0,0); g.restore();

  // N = Z reference
  const diag = Math.min(xMax, yMax);
  g.strokeStyle="rgba(255,255,255,.16)"; g.setLineDash([4,4]);
  g.beginPath(); g.moveTo(px(0),py(0)); g.lineTo(px(diag),py(diag)); g.stroke(); g.setLineDash([]);
  g.fillStyle="rgba(255,255,255,.35)"; g.font="9px system-ui"; g.textAlign="left";
  g.fillText("N = Z", px(diag)-32, py(diag)-4);

  // natural nuclides = the band
  g.fillStyle="rgba(74,214,255,.55)";
  for (const p of naturalPoints()) g.fillRect(px(p.n)-1, py(p.z)-1, 2.3, 2.3);

  // current marker, coloured by category
  const COLORS = { nature:"#36d399", lab:"#5b8cff", theoretical:"#ffc857", impossible:"#ff6b6b" };
  const cat = classifyNuclide(curZ, curN).key;
  const mx = px(Math.max(0,curN)), my = py(Math.min(yMax,curZ));
  g.strokeStyle = COLORS[cat]; g.lineWidth = 2;
  g.beginPath(); g.arc(mx,my,6,0,7); g.stroke();
  g.globalAlpha=.5; g.beginPath(); g.moveTo(mx-11,my); g.lineTo(mx+11,my); g.moveTo(mx,my-11); g.lineTo(mx,my+11); g.stroke(); g.globalAlpha=1;
  if (curN < 0){ g.fillStyle=COLORS[cat]; g.font="9px system-ui"; g.textAlign="left"; g.fillText("N<0 (off chart)", pad.l+4, py(curZ)-9); }
}

/* ---------- controls sync ---------- */
function syncControls(){
  $("pNum").value = state.z; $("pRange").value = state.z;
  $("nNum").value = state.n; $("eNum").value = state.e; $("eRange").value = state.e;

  // neutron slider range follows the filter
  const r = neutronRange();
  const rowN = $("rowN");
  if (state.filter !== "anything" && r){
    $("nRange").min = r.min; $("nRange").max = Math.max(r.max, r.min+1);
    rowN.classList.toggle("locked", state.filter==="nature");
  } else {
    $("nRange").min = 0; $("nRange").max = Math.max(200, Math.round(state.z * 2.2)); rowN.classList.remove("locked");
  }
  $("nRange").value = state.n;

  // filter hint
  const list = natOf(state.z);
  const hints = {
    nature: list.length ? `Neutrons snap to ${elementFor(state.z).symbol}'s ${list.length} natural isotope${list.length>1?"s":""}; electrons set to neutral.`
                        : (state.z>118 ? `${elementFor(state.z).name} is purely theoretical — no natural isotopes exist.`
                                       : `${elementFor(state.z).name} has no natural isotopes — it's synthetic. Try Lab-made or Anything.`),
    lab: `Neutrons range over isotopes that have been produced; electrons set to neutral.`,
    anything: `No limits — explore freely, including impossible nuclei and exotic ions.`,
  };
  $("filterHint").textContent = hints[state.filter];
}

/* ---------- common-ion cycler ---------- */
function renderIonRow(){
  const row = $("ionRow");
  const list = natOf(state.z);
  // only meaningful in nature mode for elements that actually occur in nature
  if (state.filter !== "nature" || !list.length){ row.style.display = "none"; return; }
  row.style.display = "block";
  const opts = ionOptions(state.z);
  const cur = state.z - state.e;
  $("ionChips").innerHTML = opts.map(c =>
    `<span class="ion-chip${c===cur?" on":""}" data-c="${c}">${ionLabel(state.z, c)}</span>`).join("");
  for (const chip of $("ionChips").children)
    chip.onclick = () => setIonCharge(+chip.dataset.c);
}

/* ---------- nucleus canvas ---------- */
function rebuildNucleus(){
  const total = state.z + state.n;
  nucleusOrder = [];
  for (let i=0;i<total;i++) nucleusOrder.push(i < state.z ? "p" : "n");
  nucleusOrder.sort((a,b)=>((a.charCodeAt(0)*7)%5)-((b.charCodeAt(0)*7)%5));
}
function nucleusLayout(total){
  const pts=[]; let placed=0, ring=0;
  while(placed<total){
    const inRing = ring===0?1:Math.floor(ring*6), r=ring*9;
    for(let i=0;i<inRing && placed<total;i++){
      const a=(i/inRing)*Math.PI*2+ring*0.7;
      pts.push({x:Math.cos(a)*r,y:Math.sin(a)*r}); placed++;
    }
    ring++;
  }
  return pts;
}
function resize(){ const r=canvas.getBoundingClientRect(), d=window.devicePixelRatio||1;
  canvas.width=r.width*d; canvas.height=r.height*d; ctx.setTransform(d,0,0,d,0,0); }
function draw(t){
  const w=canvas.clientWidth, h=canvas.clientHeight, cx=w/2, cy=h/2;
  ctx.clearRect(0,0,w,h);
  const sh = shellsFor(state.e);
  const baseR=Math.min(w,h)*0.12, gap=(Math.min(w,h)*0.46-baseR)/Math.max(sh.length,1);
  for(let i=0;i<sh.length;i++){
    const r=baseR+gap*(i+1);
    ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.strokeStyle="rgba(74,214,255,.20)"; ctx.lineWidth=1.1; ctx.stroke();
    const c=sh[i], speed=0.0004/(i+1);
    for(let k=0;k<c;k++){
      const a=(k/c)*Math.PI*2+t*speed+i, x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r;
      ctx.beginPath(); ctx.arc(x,y,5,0,7); ctx.fillStyle="#4ad6ff"; ctx.shadowColor="#4ad6ff"; ctx.shadowBlur=9; ctx.fill(); ctx.shadowBlur=0;
    }
  }
  const layout=nucleusLayout(state.z+state.n), wob=Math.sin(t*0.002)*1.4;
  for(let i=0;i<layout.length;i++){
    const kind=nucleusOrder[i]||(i<state.z?"p":"n");
    const px=cx+layout[i].x+Math.sin(i+t*0.001)*wob, py=cy+layout[i].y+Math.cos(i+t*0.001)*wob;
    ctx.beginPath(); ctx.arc(px,py,7,0,7); ctx.fillStyle=kind==="p"?"#ff5d6c":"#9aa3c7"; ctx.fill();
  }
  requestAnimationFrame(draw);
}

/* ---------- module hooks (for the Learn/Quiz shell) ---------- */
// Read the current build so the quiz can grade "build this atom" tasks.
window.moduleState = () => ({ z: state.z, n: state.n, e: state.e, charge: state.z - state.e });
// Configure the atom from a lesson preset. Uses the "anything" filter so exact
// values hold (no isotope snapping), defaulting to a neutral atom if e is omitted.
window.moduleSetState = (s) => {
  if (!s) return;
  state.filter = "anything";
  for (const b of $("filterSeg").children) b.classList.toggle("on", b.dataset.f === "anything");
  if (s.z != null) state.z = Math.max(1, Math.min(MAX_Z, s.z | 0));
  if (s.n != null) state.n = Math.max(0, Math.min(3000, s.n | 0));
  if (s.e != null) state.e = Math.max(0, Math.min(MAX_Z + 10, s.e | 0));
  else if (s.z != null) state.e = state.z;   // neutral by default
  rebuildNucleus(); render();
};

/* ---------- wiring ---------- */
function wire(){
  $("pPlus").onclick=()=>setProtons(state.z+1); $("pMinus").onclick=()=>setProtons(state.z-1);
  $("nPlus").onclick=()=>setNeutrons(state.n+1); $("nMinus").onclick=()=>setNeutrons(state.n-1);
  $("ePlus").onclick=()=>setElectrons(state.e+1); $("eMinus").onclick=()=>setElectrons(state.e-1);
  $("pRange").oninput=(e)=>setProtons(+e.target.value);
  $("pNum").oninput=(e)=>setProtons(+e.target.value||1);
  $("nRange").oninput=(e)=>setNeutrons(+e.target.value);
  $("nNum").oninput=(e)=>setNeutrons(+e.target.value||0);
  $("eRange").oninput=(e)=>setElectrons(+e.target.value);
  $("eNum").oninput=(e)=>setElectrons(+e.target.value||0);
  $("neutralBtn").onclick=()=>setElectrons(state.z);
  $("ionCycle").onclick=cycleIon;
  $("explain").addEventListener("toggle", ()=>{ if ($("explain").open) drawNuclideChart(); });
  for (const b of $("filterSeg").children) b.onclick=()=>setFilter(b.dataset.f);
}

window.addEventListener("DOMContentLoaded", ()=>{
  canvas=$("stage"); ctx=canvas.getContext("2d"); resize();
  window.addEventListener("resize", ()=>{ resize(); drawNuclideChart(); });
  wire();
  state.z=6; setFilter("nature");   // initializes carbon defaults and renders
  requestAnimationFrame(draw);
});
