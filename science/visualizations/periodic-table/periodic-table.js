/* ============================================================
   Periodic Table Explorer
   ------------------------------------------------------------
   Renders all 118 elements from the shared dataset and lets the
   student interrogate it three ways:
     1. Colour by category, or by a numeric trend (heat-map).
     2. Highlight a group / period / block and read the shared
        property in plain language.
     3. Click any element for a full reference card.
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);
const tableEl = $("ptable");

/* numeric trend metadata: accessor + unit + label + direction note */
const TRENDS = {
  electronegativity: { unit: "(Pauling)", label: "Electronegativity",
    note: "Increases ↑ across a period and ↓ up a group — toward fluorine, the most electronegative element." },
  ionizationEnergy:  { unit: "kJ/mol", label: "1st ionization energy",
    note: "Energy to remove the outermost electron. Rises across a period (tighter hold) and falls down a group (electron is farther out)." },
  covalentRadius:    { unit: "pm", label: "Covalent radius",
    note: "Atoms get smaller across a period (stronger nuclear pull) and larger down a group (more shells)." },
  mass:              { unit: "u", label: "Atomic mass",
    note: "Rises with atomic number — the basis for molar mass in stoichiometry." },
  valence:           { unit: "e⁻", label: "Valence electrons",
    note: "Outer-shell electrons. Constant down a main group — which is exactly why a group shares chemistry." },
};

let pinned = null;           // pinned element (click)
let colorMode = "category";
let highlightMode = "none";
let highlightValue = null;

/* ---------- colour helpers ---------- */
function lerp(a, b, t) { return a + (b - a) * t; }
function hexToRgb(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];}
/* multi-stop heat scale matching the gradient legend */
const HEAT = ["#2a3566","#5b8cff","#00d0c0","#ffd35c","#ff5d6c"].map(hexToRgb);
function heat(t){
  t = Math.max(0, Math.min(1, t));
  const seg = t * (HEAT.length - 1);
  const i = Math.floor(seg), f = seg - i;
  const a = HEAT[i], b = HEAT[Math.min(i+1, HEAT.length-1)];
  return `rgb(${Math.round(lerp(a[0],b[0],f))},${Math.round(lerp(a[1],b[1],f))},${Math.round(lerp(a[2],b[2],f))})`;
}

/* min/max for the active trend (ignoring nulls) */
function trendRange(key) {
  const vals = ELEMENTS.map(e => e[key]).filter(v => v != null);
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

function cellColor(e) {
  if (colorMode === "category") return ELEMENT_CATEGORIES[e.category].color;
  const v = e[colorMode];
  if (v == null) return "#11183a";          // no data
  const { min, max } = trendRange(colorMode);
  return heat((v - min) / (max - min || 1));
}

/* ---------- build the grid ---------- */
function build() {
  tableEl.innerHTML = "";
  // f-block row labels
  for (const e of ELEMENTS) {
    const c = document.createElement("div");
    c.className = "cell";
    c.style.gridColumn = e.x;
    c.style.gridRow = e.y;
    c.dataset.z = e.number;
    c.innerHTML =
      `<span class="z">${e.number}</span>` +
      `<span class="sym">${e.symbol}</span>` +
      `<span class="val" data-role="val"></span>`;
    c.addEventListener("mouseenter", () => showDetail(e, false));
    c.addEventListener("click", () => { pinned = e; showDetail(e, true); });
    tableEl.appendChild(c);
  }
  // little labels pointing to the detached f-block rows
  addFLabel(9, "57–71 →");
  addFLabel(10, "89–103 →");
  paint();
}
function addFLabel(row, text) {
  const l = document.createElement("div");
  l.className = "flabel"; l.textContent = text;
  l.style.gridColumn = "1 / 3"; l.style.gridRow = row;
  tableEl.appendChild(l);
}

/* ---------- paint colours / highlight / trend value ---------- */
function paint() {
  const showVal = colorMode in TRENDS;
  for (const cell of tableEl.querySelectorAll(".cell")) {
    const e = ELEMENT_BY_Z[+cell.dataset.z];
    cell.style.background = cellColor(e);
    // optional small trend value
    const valEl = cell.querySelector('[data-role="val"]');
    if (showVal) {
      const v = e[colorMode];
      valEl.textContent = v == null ? "·" : (colorMode === "mass" ? Math.round(v) : v);
    } else valEl.textContent = "";
    // highlight / dim
    cell.classList.remove("dim", "sel-highlight");
    if (highlightMode !== "none" && highlightValue != null) {
      const match =
        highlightMode === "group"  ? e.group === +highlightValue :
        highlightMode === "period" ? e.period === +highlightValue :
        highlightMode === "block"  ? e.block === highlightValue : false;
      if (match) cell.classList.add("sel-highlight"); else cell.classList.add("dim");
    }
  }
  // legends
  $("legend").style.display = showVal ? "none" : "flex";
  $("gradientLegend").style.display = showVal ? "flex" : "none";
  if (showVal) {
    const { min, max } = trendRange(colorMode);
    $("gradMin").textContent = (colorMode === "mass" ? Math.round(min) : min);
    $("gradMax").textContent = (colorMode === "mass" ? Math.round(max) : max);
    $("gradUnit").textContent = TRENDS[colorMode].unit + " — " + TRENDS[colorMode].label;
  }
  renderCallout();
}

/* ---------- detail card ---------- */
function showDetail(e, pin) {
  $("dName").textContent = `${e.name} (${e.symbol})`;
  $("dSub").textContent = `${ELEMENT_CATEGORIES[e.category].label} · ${e.phase} at 25 °C` +
                          (e.noStableIsotope ? " · radioactive" : "");
  const rows = [
    ["Atomic number (Z)", e.number],
    ["Atomic mass", e.mass + " u" + (e.noStableIsotope ? " *" : "")],
    ["Group · Period · Block", `${e.group || "f"} · ${e.period} · ${e.block}`],
    ["Electron configuration", e.configShorthandPretty],
    ["Shells (e⁻ per level)", e.shells.join(" · ")],
    ["Valence electrons", e.valence == null ? "—" : e.valence],
    ["Electronegativity", e.electronegativity ?? "—"],
    ["1st ionization energy", e.ionizationEnergy == null ? "—" : e.ionizationEnergy + " kJ/mol"],
    ["Covalent radius", e.covalentRadius == null ? "—" : e.covalentRadius + " pm"],
  ];
  $("dTable").innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");
}

/* ---------- shared-property callout ---------- */
function renderCallout() {
  const box = $("callout");
  // trend note takes priority when a trend is being shown
  if (colorMode in TRENDS) {
    box.style.display = "block";
    box.innerHTML = `<strong>${TRENDS[colorMode].label} trend.</strong> ${TRENDS[colorMode].note}`;
    return;
  }
  if (highlightMode === "none" || highlightValue == null) { box.style.display = "none"; return; }
  box.style.display = "block";
  if (highlightMode === "group") {
    const members = ELEMENTS.filter(e => e.group === +highlightValue && e.block !== "f");
    const v = members.length ? members[0].valence : null;
    const same = members.every(e => e.valence === v);
    let msg = `<strong>Group ${highlightValue}.</strong> `;
    if (same && v != null) {
      msg += `Every element here has <strong>${v} valence electron${v===1?"":"s"}</strong> in its outer shell. ` +
             `Because the outer shell drives chemistry, the whole column reacts in similar ways — that's what makes it a "group."`;
      msg += groupBlurb(+highlightValue);
    } else {
      msg += `These elements share a column of the table.`;
    }
    box.innerHTML = msg;
  } else if (highlightMode === "period") {
    const members = ELEMENTS.filter(e => e.period === +highlightValue);
    box.innerHTML = `<strong>Period ${highlightValue}.</strong> Every element in this row is filling the ` +
      `<strong>same outermost shell (n = ${members[0].shells.length})</strong>. Moving left → right, protons ` +
      `pile in and pull the electrons tighter, so atoms shrink and electronegativity climbs across the row.`;
  } else if (highlightMode === "block") {
    const names = { s:"s-block", p:"p-block", d:"d-block (transition metals)", f:"f-block (inner transition)" };
    const fills = { s:"an s subshell (holds 2)", p:"a p subshell (holds 6)", d:"a d subshell (holds 10)", f:"an f subshell (holds 14)" };
    box.innerHTML = `<strong>${names[highlightValue]}.</strong> The last electrons of these elements go into ` +
      `${fills[highlightValue]}. The block's width on the table is exactly that capacity — the table's shape ` +
      `is a map of how subshells fill.`;
  }
}
function groupBlurb(g) {
  const map = {
    1: " Group 1 are the alkali metals: 1 electron to lose, so they're violently reactive.",
    2: " Group 2 are the alkaline earth metals: they lose 2 electrons to form 2+ ions.",
    17:" Group 17 are the halogens: 7 valence electrons means they grab 1 more to complete an octet — very reactive nonmetals.",
    18:" Group 18 are the noble gases: a full outer shell means they barely react at all.",
  };
  return map[g] || "";
}

/* ---------- highlight selector population ---------- */
function populateHighlight() {
  const sel = $("highlightValue");
  sel.innerHTML = "";
  if (highlightMode === "none") { sel.style.display = "none"; highlightValue = null; return; }
  sel.style.display = "inline-block";
  let opts = [];
  if (highlightMode === "group")  opts = Array.from({length:18}, (_,i)=>[i+1, "Group "+(i+1)]);
  if (highlightMode === "period") opts = Array.from({length:7}, (_,i)=>[i+1, "Period "+(i+1)]);
  if (highlightMode === "block")  opts = [["s","s-block"],["p","p-block"],["d","d-block"],["f","f-block"]];
  for (const [v,label] of opts) {
    const o = document.createElement("option"); o.value=v; o.textContent=label; sel.appendChild(o);
  }
  highlightValue = opts[0][0];
}

/* ---------- legend (categories) ---------- */
function buildLegend() {
  const lg = $("legend");
  for (const key of Object.keys(ELEMENT_CATEGORIES)) {
    const c = ELEMENT_CATEGORIES[key];
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `<span class="sw" style="background:${c.color}"></span>${c.label}`;
    chip.addEventListener("mouseenter", () => flashCategory(key, true));
    chip.addEventListener("mouseleave", () => flashCategory(key, false));
    lg.appendChild(chip);
  }
}
function flashCategory(key, on) {
  if (colorMode !== "category") return;
  for (const cell of tableEl.querySelectorAll(".cell")) {
    const e = ELEMENT_BY_Z[+cell.dataset.z];
    cell.classList.toggle("dim", on && e.category !== key);
  }
}

/* ---------- search ---------- */
/* ---------- module hooks (Learn/Quiz shell) ---------- */
window.moduleState = () => ({
  symbol: pinned ? pinned.symbol : null,
  colorMode,
  highlightMode,
  highlightValue: highlightValue != null ? String(highlightValue) : null,
});
window.moduleSetState = (s) => {
  if (!s) return;
  if (s.colorMode) { colorMode = s.colorMode; $("colorMode").value = s.colorMode; }
  if (s.highlightMode) {
    highlightMode = s.highlightMode; $("highlightMode").value = s.highlightMode; populateHighlight();
    if (s.highlightValue != null) { highlightValue = String(s.highlightValue); $("highlightValue").value = String(s.highlightValue); }
  }
  if (s.symbol) { doSearch(s.symbol); }
  paint();
};

function doSearch(q) {
  q = q.trim().toLowerCase();
  if (!q) return;
  const e = ELEMENTS.find(el =>
    el.symbol.toLowerCase() === q || el.name.toLowerCase() === q || String(el.number) === q);
  if (!e) return;
  pinned = e; showDetail(e, true);
  const cell = tableEl.querySelector(`.cell[data-z="${e.number}"]`);
  if (cell) {
    cell.scrollIntoView({ behavior:"smooth", block:"center", inline:"center" });
    cell.style.transform = "scale(1.25)";
    setTimeout(() => { cell.style.transform = ""; }, 700);
  }
}

/* ---------- wire ---------- */
$("colorMode").addEventListener("change", (e) => { colorMode = e.target.value; paint(); });
$("highlightMode").addEventListener("change", (e) => { highlightMode = e.target.value; populateHighlight(); paint(); });
$("highlightValue").addEventListener("change", (e) => { highlightValue = e.target.value; paint(); });
$("search").addEventListener("change", (e) => doSearch(e.target.value));

build();
buildLegend();
showDetail(ELEMENT_BY_SYMBOL.C, false);
