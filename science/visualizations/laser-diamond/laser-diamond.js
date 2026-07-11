/* ============================================================
   Laser on Diamond — CW thermal model
   ------------------------------------------------------------
   Spot temperature = bulk baseline (finite-size surface heat loss
   over time) + local rise (lattice conduction). The headline
   interaction is the Boundary switch that flips whether infinite
   time can ever cut the stone. Physics: ideas/laser-on-diamond.md.
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);

/* constants */
const RHO = 3515, CP = 509, SIGMA = 5.67e-8;
const Tg = 1900, Tinf = 300, EPS = 0.05;

/* state (knobs) */
const S = { PL: 5, absPct: 10, w0: 1, b: 1, k: 2000, boundary: "isolated", atmos: "air", t: 100 };
let stageC, stageX, plotC, plotX, traj = null;

/* ---------- physics ---------- */
function hCoeff() {
  if (S.boundary === "sink") return Infinity;          // handled specially
  const base = S.boundary === "convective" ? 50 : 8;    // isolated = natural convection
  return S.atmos === "air" ? base : 0;                  // vacuum kills convection
}
function statics() {
  const a = S.w0 * 1e-6, bm = S.b * 1e-3;
  const A = 4 * Math.PI * bm * bm;
  const C = RHO * CP * (4 / 3) * Math.PI * bm ** 3;
  const Pabs = S.PL * S.absPct / 100;
  const dTloc = Pabs / (4 * Math.PI * S.k) * (1 / a - 1 / bm);
  const I = S.PL / (Math.PI * a * a);
  const alpha = S.k / (RHO * CP);
  return { a, bm, A, C, Pabs, dTloc, I, alpha, h: hCoeff() };
}
function derivT(T, st) {
  const conv = isFinite(st.h) ? st.h * st.A * (T - Tinf) : 0;
  const rad = EPS * SIGMA * st.A * (T ** 4 - Tinf ** 4);
  return (st.Pabs - conv - rad) / st.C;
}
/* steady-state bulk temperature (bisection); Infinity if none below cap */
function steadyBulk(st) {
  if (S.boundary === "sink") return Tinf;
  if (derivT(6000, st) > 0) return Infinity;            // never balances → runs away
  let lo = Tinf, hi = 6000;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (derivT(mid, st) > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
/* integrate the bulk transient with RK4 on a geometrically growing step */
function integrate(st) {
  const horizon = 1e3;
  const ts = [1e-6], Tb = [Tinf];
  if (S.boundary === "sink") { ts.push(horizon); Tb.push(Tinf); return finalize(ts, Tb, st); }
  let t = 0, T = Tinf, dt = 1e-5;
  while (t < horizon) {
    dt = Math.min(dt, horizon - t);
    const k1 = derivT(T, st), k2 = derivT(T + 0.5 * dt * k1, st),
          k3 = derivT(T + 0.5 * dt * k2, st), k4 = derivT(T + dt * k3, st);
    T += dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
    t += dt; dt *= 1.05;
    ts.push(t); Tb.push(T);
    if (T + st.dTloc >= Tg) break;                      // spot reached graphitization
  }
  return finalize(ts, Tb, st);
}
function finalize(ts, Tb, st) {
  let cutT = null;
  for (let i = 0; i < ts.length; i++) if (Tb[i] + st.dTloc >= Tg) { cutT = ts[i]; break; }
  const Tss = steadyBulk(st);
  return { ts, Tb, cutT, Tss, TspotSS: (isFinite(Tss) ? Tss : 1e9) + st.dTloc };
}
function classify(st, tr) {
  const spot0 = Tinf + st.dTloc;
  if (spot0 >= Tg) return { key: "runaway", cuts: true, instant: true };
  if (st.Pabs < 1e-4 || (isFinite(tr.Tss) && tr.TspotSS - Tinf < 60))
    return { key: "transparent", cuts: false };
  if (S.boundary === "sink") return { key: "local", cuts: false };
  if (tr.TspotSS >= Tg) return { key: "bulk", cuts: true, instant: false };
  return { key: "stable", cuts: false };
}
/* value at the selected time (log slider 0..100 → 1e-6..horizon) */
function timeSeconds() { return Math.pow(10, -6 + (S.t / 100) * 9); }   // 1e-6 .. 1e3
function bulkAt(tr, tSec) {
  if (tSec <= tr.ts[0]) return tr.Tb[0];
  for (let i = 1; i < tr.ts.length; i++) if (tr.ts[i] >= tSec) {
    const f = (tSec - tr.ts[i - 1]) / (tr.ts[i] - tr.ts[i - 1]);
    return tr.Tb[i - 1] + f * (tr.Tb[i] - tr.Tb[i - 1]);
  }
  return tr.Tb[tr.Tb.length - 1];
}

/* ---------- colour ---------- */
function tempColor(T) {
  const t = Math.max(0, Math.min(1, (T - 300) / 2400));
  // dark -> deep red -> orange -> yellow -> white
  const stops = [[20,24,40],[120,20,20],[220,60,10],[255,170,40],[255,240,210],[255,255,255]];
  const seg = t * (stops.length - 1), i = Math.floor(seg), f = seg - i;
  const a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
  return `rgb(${a[0]+(b[0]-a[0])*f|0},${a[1]+(b[1]-a[1])*f|0},${a[2]+(b[2]-a[2])*f|0})`;
}

/* ---------- render ---------- */
function render() {
  const st = statics();
  traj = integrate(st);
  const cls = classify(st, traj);
  const tSec = timeSeconds();
  const Tb = bulkAt(traj, tSec);
  const cutNow = traj.cutT != null && tSec >= traj.cutT;
  const Tspot = cutNow ? Tg + 200 : Tb + st.dTloc;

  drawStage(st, Tb, Tspot, cutNow);
  drawPlot(st, traj, tSec);

  // regime badge
  const R = {
    transparent: ["r-transparent", "TRANSPARENT / SUB-THRESHOLD", "Barely any heat deposited — the diamond stays cold and clear."],
    local: ["r-local", "LOCAL CONDUCTION-LIMITED", "Heat-sunk: the lattice whisks heat away. Only a huge local rise (~40 W absorbed at 1 µm) could cut — and time doesn't help."],
    bulk: ["r-bulk", "BULK BOUNDARY-LIMITED", "The whole stone slowly preheats because its surface can't shed the power. Given enough time it WILL cut."],
    stable: ["r-stable", "STABLE (WON'T CUT)", "Heat in balances heat out below the threshold. It settles and never reaches graphitization."],
    runaway: ["r-runaway", "RUNAWAY / GRAPHITIZATION (CUT)", "The spot alone already exceeds the threshold — sp³→sp² graphite forms and runs away."],
  }[cls.key];
  $("regime").className = "badge-regime " + R[0];
  $("regimeTag").textContent = R[1];
  $("regimeWhy").textContent = R[2];

  // headline
  const helps = cls.key === "bulk";
  $("headline").innerHTML = `Does <b>infinite time</b> help cut this diamond? ` +
    (cls.key === "runaway" ? `It already cuts instantly — no waiting needed.` :
     helps ? `<b>Yes.</b> The isolated stone keeps preheating, so a weak beam eventually cuts it (in ` +
             (traj.cutT != null ? fmtTime(traj.cutT) : "a while") + `).` :
     cls.key === "local" ? `<b>No.</b> It reaches a steady temperature almost instantly and stays there — waiting changes nothing.` :
     `<b>No.</b> It settles below the threshold; more time won't cut it.`);

  // readout
  const rows = [
    ["Absorbed power P_abs", st.Pabs.toExponential(2) + " W"],
    ["Intensity at spot", st.I.toExponential(2) + " W/m²"],
    ["Local rise ΔT_loc", fmtK(st.dTloc)],
    ["Bulk baseline T_bulk", fmtK(Tb)],
    ["Spot temperature T_spot", fmtK(Tspot)],
    ["Graphitization T_g", Tg + " K"],
    ["Steady bulk (t→∞)", isFinite(traj.Tss) ? fmtK(traj.Tss) : "never balances"],
    ["Time to cut", traj.cutT != null ? fmtTime(traj.cutT) : "never"],
    ["Thermal diffusivity α", st.alpha.toExponential(2) + " m²/s"],
    ["Heat capacity C", st.C.toExponential(2) + " J/K"],
  ];
  $("readout").innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");

  syncKnobs();
}
function fmtK(T){ return (T>=1e6? "≫ Tg" : Math.round(T) + " K"); }
function fmtTime(s){ if(s<1e-3) return (s*1e6).toFixed(0)+" µs"; if(s<1) return (s*1e3).toFixed(0)+" ms"; if(s<90) return s.toFixed(1)+" s"; return (s/60).toFixed(1)+" min"; }

function drawStage(st, Tb, Tspot, cut) {
  const w = stageC.clientWidth, h = stageC.clientHeight, cx = w/2, cy = h/2;
  stageX.clearRect(0,0,w,h);
  const R = Math.min(w,h) * 0.4;
  // bulk body
  stageX.beginPath(); stageX.arc(cx,cy,R,0,7); stageX.fillStyle = tempColor(Tb); stageX.fill();
  stageX.strokeStyle="rgba(255,255,255,.25)"; stageX.lineWidth=1.5; stageX.stroke();
  // focal spot (radius exaggerated so it's visible)
  const sr = Math.max(10, R*0.14);
  const g = stageX.createRadialGradient(cx,cy,1,cx,cy,sr);
  if (cut) { g.addColorStop(0,"#000"); g.addColorStop(.5,"#3a0a0a"); g.addColorStop(1,tempColor(Tb)); }
  else { g.addColorStop(0, tempColor(Tspot)); g.addColorStop(1, tempColor(Tb)); }
  stageX.beginPath(); stageX.arc(cx,cy,sr,0,7); stageX.fillStyle=g; stageX.fill();
  // laser beam
  stageX.strokeStyle="rgba(120,200,255,.5)"; stageX.lineWidth=3;
  stageX.beginPath(); stageX.moveTo(cx, 0); stageX.lineTo(cx, cy); stageX.stroke();
  stageX.fillStyle="#e8ecff"; stageX.font="11px system-ui"; stageX.textAlign="center";
  stageX.fillText("laser", cx, 14);
  if (cut) { stageX.fillStyle="#ff6b6b"; stageX.font="bold 13px system-ui"; stageX.fillText("● GRAPHITIZED (cut)", cx, cy + R + 18); }
}

function drawPlot(st, tr, tSec) {
  const w = plotC.clientWidth, h = plotC.clientHeight;
  plotX.clearRect(0,0,w,h);
  const pad = {l:44,r:10,t:10,b:22};
  const tMin = 1e-6, tMax = 1e3;
  const Tmax = 2600;
  const px = (t) => pad.l + (Math.log10(Math.max(t,tMin)) - Math.log10(tMin)) / (Math.log10(tMax)-Math.log10(tMin)) * (w-pad.l-pad.r);
  const py = (T) => h-pad.b - (Math.min(T,Tmax)-300)/(Tmax-300) * (h-pad.t-pad.b);
  // axes
  plotX.strokeStyle="rgba(255,255,255,.18)"; plotX.lineWidth=1;
  plotX.beginPath(); plotX.moveTo(pad.l,pad.t); plotX.lineTo(pad.l,h-pad.b); plotX.lineTo(w-pad.r,h-pad.b); plotX.stroke();
  plotX.fillStyle="#6f78a3"; plotX.font="9px system-ui"; plotX.textAlign="center";
  for (let e=-6;e<=3;e++){ const x=px(Math.pow(10,e)); plotX.fillText("1e"+e, x, h-6); }
  plotX.textAlign="right"; for(const T of [300,900,1900,2500]){ plotX.fillText(T, pad.l-4, py(T)+3); }
  // Tg line
  plotX.strokeStyle="rgba(255,107,107,.6)"; plotX.setLineDash([5,4]); plotX.beginPath();
  plotX.moveTo(pad.l,py(Tg)); plotX.lineTo(w-pad.r,py(Tg)); plotX.stroke(); plotX.setLineDash([]);
  // bulk + spot curves
  const drawCurve = (fn,color)=>{ plotX.strokeStyle=color; plotX.lineWidth=2; plotX.beginPath();
    for(let i=0;i<tr.ts.length;i++){ const x=px(tr.ts[i]), y=py(fn(i)); i?plotX.lineTo(x,y):plotX.moveTo(x,y); } plotX.stroke(); };
  drawCurve(i=>tr.Tb[i], "#5b8cff");
  drawCurve(i=>Math.min(tr.Tb[i]+st.dTloc, Tg+50), "#ffb24d");
  // current-time marker
  const mx = px(tSec); plotX.strokeStyle="rgba(255,255,255,.5)"; plotX.lineWidth=1;
  plotX.beginPath(); plotX.moveTo(mx,pad.t); plotX.lineTo(mx,h-pad.b); plotX.stroke();
  if (tr.cutT!=null){ const cxp=px(tr.cutT); plotX.fillStyle="#ff6b6b"; plotX.beginPath(); plotX.arc(cxp,py(Tg),4,0,7); plotX.fill(); }
}

/* ---------- knobs ---------- */
function syncKnobs() {
  $("kPL").value = Math.log10(S.PL); $("vPL").textContent = fmtW(S.PL);
  $("kAbs").value = Math.log10(S.absPct); $("vAbs").textContent = S.absPct.toPrecision(2) + "%";
  $("kW0").value = S.w0; $("vW0").textContent = S.w0 + " µm";
  $("kB").value = S.b; $("vB").textContent = S.b + " mm";
  $("kK").value = S.k; $("vK").textContent = S.k + "";
  $("kT").value = S.t; $("vT").textContent = fmtTime(timeSeconds());
  for (const btn of $("segBoundary").children) btn.classList.toggle("on", btn.dataset.v === S.boundary);
  for (const btn of $("segAtmos").children) btn.classList.toggle("on", btn.dataset.v === S.atmos);
}
function fmtW(p){ return p>=1? p.toPrecision(2)+" W" : p>=1e-3? (p*1e3).toPrecision(2)+" mW" : (p*1e6).toPrecision(2)+" µW"; }

function wire() {
  $("kPL").oninput = e => { S.PL = Math.pow(10, +e.target.value); render(); };
  $("kAbs").oninput = e => { S.absPct = Math.min(100, Math.pow(10, +e.target.value)); render(); };
  $("kW0").oninput = e => { S.w0 = +e.target.value; render(); };
  $("kB").oninput = e => { S.b = +e.target.value; render(); };
  $("kK").oninput = e => { S.k = +e.target.value; render(); };
  $("kT").oninput = e => { S.t = +e.target.value; render(); };
  $("infBtn").onclick = () => { S.t = 100; render(); };
  for (const btn of $("segBoundary").children) btn.onclick = () => { S.boundary = btn.dataset.v; render(); };
  for (const btn of $("segAtmos").children) btn.onclick = () => { S.atmos = btn.dataset.v; render(); };
}

/* ---------- module hooks ---------- */
window.moduleState = () => {
  const st = statics(); const tr = integrate(st); const cls = classify(st, tr);
  return { regime: cls.key, cuts: !!cls.cuts, timeHelps: cls.key === "bulk", boundary: S.boundary, atmos: S.atmos };
};
window.moduleSetState = (s) => {
  if (!s) return;
  for (const k of ["PL","absPct","w0","b","k","boundary","atmos","t"]) if (s[k] != null) S[k] = s[k];
  render();
};

window.addEventListener("DOMContentLoaded", () => {
  stageC = $("stage"); stageX = stageC.getContext("2d");
  plotC = $("plot"); plotX = plotC.getContext("2d");
  const size = () => { for (const c of [stageC, plotC]) { const r=c.getBoundingClientRect(), d=window.devicePixelRatio||1;
    c.width=r.width*d; c.height=r.height*d; c.getContext("2d").setTransform(d,0,0,d,0,0); } render(); };
  size(); window.addEventListener("resize", size);
  wire(); render();
});
