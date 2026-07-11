/* ============================================================
   Isotopes & Average Atomic Mass
   ------------------------------------------------------------
   Each element here has its naturally occurring stable isotopes
   with exact masses and natural abundances. The student drags
   abundance sliders; the weighted-average mass updates live and
   is compared to the periodic-table value. This is the concrete
   bridge to molar mass and the mole (Fork A).
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);

/* Curated isotope data: symbol -> [{a (mass number), mass (u), nat (% abundance)}].
   Masses are exact isotope masses; nat are natural % abundances. */
const ISO = {
  H:  [ {a:1, mass:1.007825, nat:99.9885}, {a:2, mass:2.014102, nat:0.0115} ],
  Li: [ {a:6, mass:6.015123, nat:7.59},   {a:7, mass:7.016003, nat:92.41} ],
  B:  [ {a:10, mass:10.012937, nat:19.9}, {a:11, mass:11.009305, nat:80.1} ],
  C:  [ {a:12, mass:12.000000, nat:98.93}, {a:13, mass:13.003355, nat:1.07} ],
  N:  [ {a:14, mass:14.003074, nat:99.636}, {a:15, mass:15.000109, nat:0.364} ],
  O:  [ {a:16, mass:15.994915, nat:99.757}, {a:17, mass:16.999132, nat:0.038}, {a:18, mass:17.999160, nat:0.205} ],
  Ne: [ {a:20, mass:19.992440, nat:90.48}, {a:21, mass:20.993847, nat:0.27}, {a:22, mass:21.991385, nat:9.25} ],
  Mg: [ {a:24, mass:23.985042, nat:78.99}, {a:25, mass:24.985837, nat:10.00}, {a:26, mass:25.982593, nat:11.01} ],
  Si: [ {a:28, mass:27.976927, nat:92.223}, {a:29, mass:28.976495, nat:4.685}, {a:30, mass:29.973770, nat:3.092} ],
  S:  [ {a:32, mass:31.972071, nat:94.99}, {a:33, mass:32.971459, nat:0.75}, {a:34, mass:33.967867, nat:4.25}, {a:36, mass:35.967081, nat:0.01} ],
  Cl: [ {a:35, mass:34.968853, nat:75.76}, {a:37, mass:36.965903, nat:24.24} ],
  K:  [ {a:39, mass:38.963707, nat:93.258}, {a:40, mass:39.963998, nat:0.012}, {a:41, mass:40.961825, nat:6.730} ],
  Ca: [ {a:40, mass:39.962591, nat:96.941}, {a:42, mass:41.958618, nat:0.647}, {a:43, mass:42.958767, nat:0.135}, {a:44, mass:43.955481, nat:2.086}, {a:48, mass:47.952534, nat:0.187} ],
  Fe: [ {a:54, mass:53.939609, nat:5.845}, {a:56, mass:55.934936, nat:91.754}, {a:57, mass:56.935393, nat:2.119}, {a:58, mass:57.933274, nat:0.282} ],
  Cu: [ {a:63, mass:62.929598, nat:69.15}, {a:65, mass:64.927790, nat:30.85} ],
  Br: [ {a:79, mass:78.918338, nat:50.69}, {a:81, mass:80.916290, nat:49.31} ],
  Ag: [ {a:107, mass:106.905097, nat:51.839}, {a:109, mass:108.904752, nat:48.161} ],
};

const SUP = {0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
const sup = (n) => String(n).split("").map(d=>SUP[d]).join("");

const COLORS = ["#4ad6ff","#ffd35c","#7fd1a8","#ff8fc4","#b08cff"];
let symbol = "Cl";
let pct = [];   // current (possibly edited) abundances, parallel to ISO[symbol]

function load(sym) {
  symbol = sym;
  pct = ISO[sym].map(i => i.nat);
  render();
}
function resetNatural(){ pct = ISO[symbol].map(i => i.nat); render(); }
function makeEqual(){ const n = ISO[symbol].length; pct = ISO[symbol].map(()=>100/n); render(); }

/* ---------- module hooks (for the Learn/Quiz shell) ---------- */
// Read current element + weighted-average mass so the quiz can grade tasks.
window.moduleState = () => ({ symbol, avg: weightedAvg().avg });
// Load an element (and optionally set its isotope mix) from a lesson preset.
window.moduleSetState = (s) => {
  if (!s || !s.symbol || !ISO[s.symbol]) return;
  load(s.symbol);
  if (Array.isArray(s.pct)) { pct = s.pct.slice(); render(); }
};

/* weighted average using current abundances, normalized by their sum */
function weightedAvg() {
  const list = ISO[symbol];
  const sum = pct.reduce((a,b)=>a+b,0) || 1;
  let avg = 0;
  for (let i=0;i<list.length;i++) avg += (pct[i]/sum) * list[i].mass;
  return { avg, sum };
}

function render() {
  const list = ISO[symbol];
  const el = ELEMENT_BY_SYMBOL[symbol];
  const { avg, sum } = weightedAvg();

  // isotope sliders + bar
  let rows = "";
  for (let i=0;i<list.length;i++) {
    const iso = list[i], c = COLORS[i % COLORS.length];
    rows += `<div class="iso-row">
      <span class="tag"><b>${sup(iso.a)}${symbol}</b><small>${iso.mass.toFixed(4)} u</small></span>
      <input type="range" min="0" max="100" step="0.01" value="${pct[i]}" data-i="${i}"
             style="accent-color:${c}">
      <span class="pct" style="color:${c}">${pct[i].toFixed(2)}%</span>
    </div>`;
  }
  // stacked bar
  let segs = "";
  for (let i=0;i<list.length;i++) {
    const frac = (pct[i]/sum)*100, c = COLORS[i % COLORS.length];
    segs += `<div class="seg" style="flex-basis:${frac}%;background:${c}">${frac>7?sup(list[i].a)+symbol:""}</div>`;
  }
  $("isotopes").innerHTML = rows + `<div style="color:var(--ink-soft);font-size:.8rem;margin:6px 0 4px">
      Mixture (normalized to 100%):</div><div class="bars">${segs}</div>` +
      (Math.abs(sum-100)>0.1 ? `<div style="color:var(--warn);font-size:.78rem;margin-top:6px">
        Sliders sum to ${sum.toFixed(1)}% — the average is normalized, so only the <em>ratios</em> matter.</div>`:``);

  // wire sliders
  for (const r of $("isotopes").querySelectorAll('input[type=range]')) {
    r.addEventListener("input", (e) => { pct[+e.target.dataset.i] = +e.target.value; render(); });
  }

  // mass scale
  renderScale(list, avg);

  // big average + calc table
  $("avgMass").textContent = avg.toFixed(4) + " u";
  $("calc").innerHTML = list.map((iso,i)=>{
    const frac = (pct[i]/sum);
    return `<tr><td>${sup(iso.a)}${symbol}</td><td>${(frac*100).toFixed(2)}% × ${iso.mass.toFixed(4)} = ${(frac*iso.mass).toFixed(4)}</td></tr>`;
  }).join("") + `<tr><td><b>Total</b></td><td><b>${avg.toFixed(4)} u</b></td></tr>`;

  // compare with periodic-table value
  const std = el.mass;
  const diff = Math.abs(avg - std);
  const m = $("match");
  if (diff < 0.02) {
    m.className = "match ok";
    m.innerHTML = `✓ Matches the periodic-table mass of <b>${std} u</b>. These natural abundances are exactly why the table shows that number.`;
  } else {
    m.className = "match off";
    m.innerHTML = `Periodic-table mass is <b>${std} u</b>; you're at <b>${avg.toFixed(3)} u</b> ` +
      `(off by ${diff.toFixed(3)}). Change the mix back toward natural abundances to land on it.`;
  }

  // explanation
  const dom = list[pct.indexOf(Math.max(...pct))];
  $("explain").innerHTML =
    `${el.name} has <b>${list.length}</b> stable isotope${list.length>1?"s":""} — same protons, different neutrons, ` +
    `so different masses. The average is pulled toward the most abundant one ` +
    `(<b>${sup(dom.a)}${symbol}</b> here), which is why the periodic-table mass sits near ${Math.round(dom.mass)} ` +
    `but isn't a whole number: it's a <em>weighted</em> average of the real mixture.`;

  $("elPick").value = symbol;
}

function renderScale(list, avg) {
  const masses = list.map(i=>i.mass);
  const lo = Math.floor(Math.min(...masses)) - 1, hi = Math.ceil(Math.max(...masses)) + 1;
  const span = hi - lo;
  const x = (m) => ((m - lo)/span)*100;
  let html = `<div class="axis"></div>`;
  for (let t=lo;t<=hi;t++) {
    html += `<div class="tick" style="left:${x(t)}%"></div><div class="ticklabel" style="left:${x(t)}%">${t}</div>`;
  }
  for (const iso of list) {
    html += `<div class="marker iso" style="left:${x(iso.mass)}%"></div>` +
            `<div class="mlabel" style="left:${x(iso.mass)}%;color:var(--electron)">${sup(iso.a)}</div>`;
  }
  html += `<div class="marker avg" style="left:${x(avg)}%"></div>` +
          `<div class="mlabel" style="left:${x(avg)}%;color:var(--proton);top:54px">avg ${avg.toFixed(2)}</div>`;
  $("scale").innerHTML = html;
}

window.addEventListener("DOMContentLoaded", () => {
  const sel = $("elPick");
  for (const sym of Object.keys(ISO)) {
    const e = ELEMENT_BY_SYMBOL[sym];
    const o = document.createElement("option"); o.value=sym; o.textContent=`${e.name} (${sym})`;
    sel.appendChild(o);
  }
  sel.addEventListener("change", e => load(e.target.value));
  $("resetBtn").addEventListener("click", resetNatural);
  $("equalBtn").addEventListener("click", makeEqual);
  load("Cl");
});
