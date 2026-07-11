/* ============================================================
   Electron Configuration & Shells
   ------------------------------------------------------------
   Build any atom's electron structure one electron at a time.
   The aufbau (Madelung) order drives the animation; the shared
   dataset supplies the true ground-state config so we can flag
   the elements where reality breaks the simple rule.
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);

const FILL_ORDER = ["1s","2s","2p","3s","3p","4s","3d","4p","5s","4d","5p",
                    "6s","4f","5d","6p","7s","5f","6d","7p"];
const CAP = { s:2, p:6, d:10, f:14 };
const ORBS = { s:1, p:3, d:5, f:7 };
const SUP = {0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹"};
const sup = (n) => String(n).split("").map(d=>SUP[d]).join("");

const state = { z: 6, shown: 6, timer: null };
let canvas, ctx;

/* aufbau occupation for the first `count` electrons */
function aufbauOcc(count) {
  const occ = {}; let left = count;
  for (const s of FILL_ORDER) {
    if (left <= 0) break;
    const put = Math.min(CAP[s[1]], left);
    occ[s] = put; left -= put;
  }
  return occ;
}
/* highest principal shell present -> defines valence shell */
function maxShell(occ){ return Math.max(0, ...Object.keys(occ).map(s=>+s[0])); }

/* ---------- render: aufbau ladder ---------- */
function renderLadder(occ) {
  const cur = currentSubshell(state.shown);
  $("ladder").innerHTML = FILL_ORDER.map(s => {
    const filled = (occ[s] || 0) > 0;
    const isCur = s === cur;
    const cls = "rung" + (filled ? " filled" : "") + (isCur ? " current" : "");
    const n = occ[s] || 0;
    return `<div class="${cls}">${s}${n?sup(n):""}<span class="cap">·${CAP[s[1]]}</span></div>`;
  }).join("");
}
/* which subshell the most recently placed electron went into */
function currentSubshell(count) {
  let left = count;
  for (const s of FILL_ORDER) {
    const cap = CAP[s[1]];
    if (left <= cap) return left > 0 ? s : null;
    left -= cap;
  }
  return null;
}

/* ---------- render: orbital boxes ---------- */
function renderOrbitals(occ) {
  const vShell = maxShell(occ);
  const html = FILL_ORDER.filter(s => occ[s] > 0).map(s => {
    const n = occ[s], type = s[1], nOrb = ORBS[type];
    const isValence = +s[0] === vShell;       // outer shell
    let boxes = "";
    for (let o = 0; o < nOrb; o++) {
      // Hund: first pass single (up), second pass pair (down)
      const up = o < n ? 1 : 0;
      const dn = (o + nOrb) < n ? 1 : 0;
      boxes += `<div class="orb${isValence?" valence":""}">` +
        (up?'<span class="arrow up">↑</span>':"") +
        (dn?'<span class="arrow dn">↓</span>':"") + `</div>`;
    }
    return `<div class="subshell"><div class="lbl">${s}${sup(n)} ` +
           `${isValence?'<span style="color:var(--accent-2)">· valence shell</span>':''}</div>` +
           `<div class="orbs">${boxes}</div></div>`;
  }).join("");
  $("orbitals").innerHTML = html || '<div style="color:var(--ink-dim)">No electrons placed yet.</div>';
}

/* ---------- render: shell rings (canvas) ---------- */
function shellsFromOcc(occ){
  const sh=[]; for(const s of Object.keys(occ)){const n=+s[0]; sh[n-1]=(sh[n-1]||0)+occ[s];}
  for(let i=0;i<sh.length;i++) sh[i]=sh[i]||0;
  return sh;
}
function drawShells(occ, tMs) {
  const w=canvas.clientWidth, h=canvas.clientHeight, cx=w/2, cy=h/2;
  ctx.clearRect(0,0,w,h);
  const sh = shellsFromOcc(occ);
  // nucleus
  ctx.beginPath(); ctx.arc(cx,cy,16,0,7); ctx.fillStyle="#ff5d6c"; ctx.fill();
  ctx.fillStyle="#0a0f24"; ctx.font="bold 12px system-ui"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText("+"+state.z, cx, cy);
  const baseR=34, gap=(Math.min(w,h)*0.46-baseR)/Math.max(sh.length,1);
  for(let i=0;i<sh.length;i++){
    const r=baseR+gap*(i+1);
    ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.strokeStyle="rgba(74,214,255,.20)"; ctx.lineWidth=1; ctx.stroke();
    const c=sh[i], speed=0.0003/(i+1);
    for(let k=0;k<c;k++){
      const a=(k/c)*Math.PI*2 + tMs*speed + i;
      const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r;
      ctx.beginPath(); ctx.arc(x,y,4.5,0,7);
      ctx.fillStyle="#4ad6ff"; ctx.shadowColor="#4ad6ff"; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
    }
  }
  $("shellReadout").textContent = sh.length ? "Shells: " + sh.map((c,i)=>`n=${i+1}: ${c}e⁻`).join("   ") : "";
}

/* ---------- pretty config strings ---------- */
function cfgString(occ, vShell, useCore) {
  const subs = FILL_ORDER.filter(s => occ[s] > 0);
  // noble-gas core
  let coreZ = 0, coreSym = "";
  if (useCore) {
    const NOBLE=[[2,"He"],[10,"Ne"],[18,"Ar"],[36,"Kr"],[54,"Xe"],[86,"Rn"]];
    const total=Object.values(occ).reduce((a,b)=>a+b,0);
    for(const [z,sym] of NOBLE){ if(z<total){coreZ=z;coreSym=sym;} }
  }
  const coreOcc = coreZ ? aufbauOcc(coreZ) : {};
  let out = coreZ ? `<span class="core">[${coreSym}]</span> ` : "";
  out += subs.filter(s => (occ[s]-(coreOcc[s]||0))>0).map(s => {
    const n = occ[s]-(coreOcc[s]||0);
    const cls = (+s[0]===vShell) ? "valence" : "";
    return `<span class="${cls}">${s}${sup(n)}</span>`;
  }).join(" ");
  return out;
}

/* ---------- facts + anomaly note ---------- */
function renderFacts(e, occ) {
  const vShell = maxShell(occ);
  const valenceCount = shellsFromOcc(occ)[vShell-1] || 0;
  $("facts").innerHTML = [
    ["Element", `${e.name} (${e.symbol})`],
    ["Atomic number", e.number],
    ["Period · Group · Block", `${e.period} · ${e.group||"f"} · ${e.block}`],
    ["Outer shell (n)", vShell || "—"],
    ["Valence electrons", valenceCount],
  ].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");

  // Anomaly: compare aufbau-predicted to the dataset's true ground state
  const note = $("anomNote");
  if (state.shown === e.number && e.anomalous) {
    note.className = "note anom";
    note.innerHTML = `<strong>⚠ Exception!</strong> Aufbau predicts <code>${aufbauPretty(e.number)}</code>, ` +
      `but the measured ground state is <code>${e.configShorthand}</code>. A half-filled or completely ` +
      `filled d/f subshell is extra stable, so an electron shifts to reach it.`;
  } else if (state.shown === e.number) {
    note.className = "note info";
    note.innerHTML = `This matches the measured ground-state configuration. The outer-shell electrons ` +
      `(<span style="color:var(--accent-2)">teal</span>) are the ones that form bonds.`;
  } else {
    note.className = ""; note.innerHTML = "";
  }
}
function aufbauPretty(z){
  const occ=aufbauOcc(z); const v=maxShell(occ);
  // plain shorthand
  const NOBLE=[[2,"He"],[10,"Ne"],[18,"Ar"],[36,"Kr"],[54,"Xe"],[86,"Rn"]];
  let coreZ=0,sym=""; for(const [zz,s] of NOBLE){ if(zz<z){coreZ=zz;sym=s;} }
  const coreOcc=coreZ?aufbauOcc(coreZ):{};
  const body=FILL_ORDER.filter(s=>(occ[s]-(coreOcc[s]||0))>0)
    .map(s=>`${s}${sup(occ[s]-(coreOcc[s]||0))}`).join(" ");
  return (coreZ?`[${sym}] `:"")+body;
}

/* ---------- master render ---------- */
function render() {
  const e = ELEMENT_BY_Z[state.z];
  const occ = aufbauOcc(state.shown);
  const vShell = maxShell(aufbauOcc(state.z)); // valence shell of the full atom
  renderLadder(occ);
  renderOrbitals(occ);
  renderFacts(e, occ);
  $("cfgFull").innerHTML  = cfgString(occ, maxShell(occ), false) || "—";
  $("cfgShort").innerHTML = cfgString(occ, maxShell(occ), true)  || "—";
  $("zLabel").textContent = state.z;
  $("shownCount").textContent = state.shown;
  $("totalCount").textContent = state.z;
  $("zRange").value = state.z;
  $("elPick").value = state.z;
}

/* ---------- animation loop ---------- */
function loop(t){ drawShells(aufbauOcc(state.shown), t); requestAnimationFrame(loop); }

/* ---------- controls ---------- */
function setZ(z){ state.z=Math.max(1,Math.min(118,z)); state.shown=state.z; stopPlay(); render(); }
function setShown(n){ state.shown=Math.max(0,Math.min(state.z,n)); render(); }
function stopPlay(){ if(state.timer){clearInterval(state.timer); state.timer=null; $("playBtn").textContent="Auto-fill";} }

/* ---------- module hooks (Learn/Quiz shell) ---------- */
window.moduleState = () => {
  const sh = shellsFromOcc(aufbauOcc(state.z));
  return { z: state.z, shown: state.shown, levels: sh.length, valence: sh.length ? sh[sh.length-1] : 0,
           filled: state.shown >= state.z };
};
window.moduleSetState = (s) => { if (s && s.z != null) setZ(Math.max(1, Math.min(118, s.z|0))); };

function wire() {
  const pick = $("elPick");
  for (const e of ELEMENTS) {
    const o=document.createElement("option"); o.value=e.number;
    o.textContent=`${e.number} — ${e.name} (${e.symbol})`; pick.appendChild(o);
  }
  pick.addEventListener("change", ev => setZ(+ev.target.value));
  $("zRange").addEventListener("input", ev => setZ(+ev.target.value));
  $("clearBtn").addEventListener("click", () => { stopPlay(); setShown(0); });
  $("stepBack").addEventListener("click", () => { stopPlay(); setShown(state.shown-1); });
  $("stepFwd").addEventListener("click", () => { stopPlay(); setShown(state.shown+1); });
  $("fillBtn").addEventListener("click", () => { stopPlay(); setShown(state.z); });
  $("playBtn").addEventListener("click", () => {
    if (state.timer) { stopPlay(); return; }
    if (state.shown >= state.z) state.shown = 0;
    $("playBtn").textContent = "Pause";
    state.timer = setInterval(() => {
      if (state.shown >= state.z) { stopPlay(); return; }
      setShown(state.shown + 1);
    }, 220);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  canvas = $("shellCanvas"); ctx = canvas.getContext("2d");
  function size(){ const r=canvas.getBoundingClientRect(); const d=window.devicePixelRatio||1;
    canvas.width=r.width*d; canvas.height=r.height*d; ctx.setTransform(d,0,0,d,0,0); }
  size(); window.addEventListener("resize", size);
  wire(); render(); requestAnimationFrame(loop);
});
