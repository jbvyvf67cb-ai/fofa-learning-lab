/* ============================================================
   Dice & Probability — the interactive lab
   ------------------------------------------------------------
   One tool that grows with three ideas:
     1. One die  → probability of a single number is 1/N.
     2. Many dice → independent outcomes MULTIPLY: N^k equally
        likely ordered outcomes, each with probability (1/N)^k.
     3. Sums     → P(sum = s) = (ways to make s) / N^k. The "ways"
        are counted by listing the ordered outcomes (permutations),
        which is why 7 beats 2 on two dice.
   Everything is exact integer counting (convolution of the uniform
   single-die distribution). A Monte-Carlo roller lets you watch the
   observed frequencies close in on the exact probabilities.
   Only arithmetic + a little algebra is used anywhere.
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);

/* ---------- state ---------- */
let sides = 6;      // N — faces per die
let dice = 2;       // k — number of dice
let target = 7;     // s — the sum we're asking about (a single face when k = 1)
let faces = [3, 4]; // what the tray currently shows (an example, or the last roll)
let fromRoll = false;

/* Monte-Carlo tally */
let observed = [];  // observed[sum] = times that sum came up
let rolls = 0;
let hits = 0;       // times the target sum came up

const SIDE_PRESETS = [2, 4, 6, 8, 10, 12, 20, 100];
const MAX_SIDES = 100, MAX_DICE = 6;

/* ---------- exact counting (convolution) ---------- */
// counts[s] = number of ordered outcomes of k N-sided dice that sum to s.
// Built by convolving the single-die distribution (a flat 1..N) k times.
function sumCounts(N, k) {
  let counts = [1]; // 0 dice: exactly one way to make the sum 0
  for (let d = 0; d < k; d++) {
    const next = new Array(counts.length + N).fill(0);
    for (let s = 0; s < counts.length; s++) {
      const c = counts[s];
      if (!c) continue;
      for (let f = 1; f <= N; f++) next[s + f] += c;
    }
    counts = next;
  }
  return counts; // index = absolute sum; 0 for sums below k
}
let COUNTS = sumCounts(sides, dice);
const totalOutcomes = () => Math.pow(sides, dice);          // N^k
const waysFor = (s) => COUNTS[s] || 0;
const pFor = (s) => waysFor(s) / totalOutcomes();

/* greatest common divisor, for showing reduced fractions */
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
function reduce(n, d) { const g = gcd(n, d); return [n / g, d / g]; }

/* enumerate the ordered outcomes that make a sum — the concrete "ways".
   Guarded: only for small dice counts and a small number of ways. */
function enumerateWays(N, k, s, cap) {
  const out = [];
  (function rec(pos, left, acc) {
    if (out.length > cap) return;
    if (pos === k) { if (left === 0) out.push(acc.slice()); return; }
    const remaining = k - pos - 1;
    // prune: each remaining die contributes 1..N
    const lo = Math.max(1, left - remaining * N);
    const hi = Math.min(N, left - remaining * 1);
    for (let f = lo; f <= hi; f++) { acc.push(f); rec(pos + 1, left - f, acc); acc.pop(); }
  })(0, s, []);
  return out;
}

/* one example decomposition of the target (to show in the tray) */
function exampleFor(s) {
  const ways = enumerateWays(sides, dice, s, 1);
  return ways.length ? ways[0] : new Array(dice).fill(1);
}

/* ---------- module hooks (Learn/Quiz shell) ---------- */
window.moduleState = () => ({
  sides, dice, sum: target,
  ways: waysFor(target), total: totalOutcomes(),
  pSum: pFor(target), pFace: 1 / sides,
});
window.moduleSetState = (o) => {
  if (!o) return;
  if (o.sides != null) sides = clampInt(o.sides, 2, MAX_SIDES);
  if (o.dice != null) dice = clampInt(o.dice, 1, MAX_DICE);
  recount();
  if (o.sum != null) target = clampInt(o.sum, dice, dice * sides);
  else target = clampInt(target, dice, dice * sides);
  faces = exampleFor(target); fromRoll = false;
  render();
};

function clampInt(v, lo, hi) { v = Math.round(+v); if (!isFinite(v)) v = lo; return Math.max(lo, Math.min(hi, v)); }
function recount() { COUNTS = sumCounts(sides, dice); observed = []; rolls = 0; hits = 0; }

/* ---------- rolling ---------- */
function rollOne() {
  const f = [];
  let s = 0;
  for (let i = 0; i < dice; i++) { const v = 1 + Math.floor(Math.random() * sides); f.push(v); s += v; }
  observed[s] = (observed[s] || 0) + 1;
  rolls++;
  if (s === target) hits++;
  return { f, s };
}
function rollMany(n) {
  let last = null;
  for (let i = 0; i < n; i++) last = rollOne();
  if (last) { faces = last.f; fromRoll = true; }
  render();
}
function resetRolls() { observed = []; rolls = 0; hits = 0; faces = exampleFor(target); fromRoll = false; render(); }

/* ============================================================
   Rendering
   ============================================================ */
function render() {
  syncControls();
  renderTray();
  renderReadouts();
  renderChart();
}

function syncControls() {
  // side presets highlight
  $("sidePresets").querySelectorAll("button").forEach((b) =>
    b.classList.toggle("on", +b.dataset.s === sides));
  $("sidesNum").value = sides;
  $("diceNum").value = dice;
  $("diceRange").value = dice;
  // target bounds follow N and k
  const lo = dice, hi = dice * sides;
  const sr = $("sumRange");
  sr.min = lo; sr.max = hi; sr.value = target;
  $("sumNum").min = lo; $("sumNum").max = hi; $("sumNum").value = target;
  $("sumBounds").textContent = `${lo}–${hi}`;
  $("sumLabelK").textContent = dice === 1 ? "face" : "sum";
  // little echo labels
  $("sidesTag").textContent = `N = ${sides}`;
  $("diceTag").textContent = `k = ${dice}`;
  $("sidesEcho").textContent = sides;
  $("chartWord").textContent = dice === 1 ? "face" : "sum";
}

/* ---- the dice tray ---- */
const PIPS = { // 3×3 grid slots (0..8) lit for each face on a classic d6
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};
function dieHTML(v) {
  if (sides === 6 && v >= 1 && v <= 6) {
    const cells = Array.from({ length: 9 }, (_, i) =>
      `<span class="pip${PIPS[v].includes(i) ? " on" : ""}"></span>`).join("");
    return `<div class="die pipdie">${cells}</div>`;
  }
  const scale = v >= 100 ? "font-size:1.2rem" : "";
  return `<div class="die numdie" style="${scale}">${v}</div>`;
}
function renderTray() {
  const sum = faces.reduce((a, b) => a + b, 0);
  $("tray").innerHTML = faces.map(dieHTML).join(`<span class="plus">+</span>`);
  const eq = faces.join(" + ") + " = " + sum;
  let note;
  if (fromRoll) {
    const ok = sum === target;
    note = `<b>You rolled:</b> ${eq} ${ok
      ? `<span class="hit">✓ that's the target (${target})</span>`
      : `<span class="miss">— target was ${target}</span>`}`;
  } else {
    note = dice === 1
      ? `Showing the face <b>${target}</b>. On a fair ${sides}-sided die every face is equally likely.`
      : `One way to make <b>${target}</b>: ${eq}. Press <b>Roll</b> to try the real thing.`;
  }
  $("trayNote").innerHTML = note;
}

/* ---- the numeric readouts ---- */
function renderReadouts() {
  const N = sides, k = dice, total = totalOutcomes();

  // 1) one die
  $("pFaceFrac").textContent = `1/${N}`;
  $("pFaceDec").textContent = (1 / N).toFixed(4);
  $("pFacePct").textContent = pct(1 / N);

  // 2) sample space (independent dice multiply)
  if (k === 1) {
    $("sampleFormula").innerHTML = `With <b>1</b> die there are simply <b>${N}</b> equally likely outcomes.`;
  } else {
    $("sampleFormula").innerHTML =
      `Each die is independent, so the outcomes <b>multiply</b>:<br>` +
      `<span class="mono">${new Array(k).fill(N).join(" × ")} = ${N}<sup>${k}</sup> = ${fmt(total)}</span> ` +
      `equally likely ordered rolls.<br>Any one exact roll has probability ` +
      `<span class="mono">(1/${N})<sup>${k}</sup> = 1/${fmt(total)}</span>.`;
  }

  // 3) the target sum
  const ways = waysFor(target), p = ways / total;
  const [rn, rd] = reduce(ways, total);
  $("waysOut").textContent = fmt(ways);
  $("totalOut").textContent = fmt(total);
  $("fracRaw").textContent = `${fmt(ways)}/${fmt(total)}`;
  $("fracRed").textContent = (rn === ways && rd === total) ? "" : `= ${rn}/${rd}`;
  $("decOut").textContent = p.toFixed(4);
  $("pctOut").textContent = pct(p);
  $("targetVerb").textContent = k === 1 ? "rolling" : "a sum of";
  $("targetVal").textContent = target;

  // the enumerated ways (the "sets / permutations" idea made concrete)
  const CAP = 60;
  const ex = enumerateWays(N, k, target, CAP + 1);
  const wrap = $("waysList");
  if (ways === 0) {
    wrap.innerHTML = `<span class="ink-dim">No way to make ${target} with ${k} ${k === 1 ? "die" : "dice"} of ${N} sides.</span>`;
    $("waysNote").textContent = "";
  } else if (ex.length > CAP) {
    wrap.innerHTML = `<span class="ink-dim">${fmt(ways)} ordered ways — too many to list here. Fewer dice/sides to see them all.</span>`;
    $("waysNote").textContent = "";
  } else {
    wrap.innerHTML = ex.map((t) =>
      `<span class="waychip">${t.join("+")}</span>`).join("");
    $("waysNote").innerHTML = k === 1
      ? `That's the <b>${ways}</b> way to roll ${target}.`
      : `Order matters: <span class="mono">(1,4)</span> and <span class="mono">(4,1)</span> are different rolls, so we count <b>${ways}</b> ordered ways — each equally likely.`;
  }

  // Monte-Carlo panel
  $("rollCount").textContent = fmt(rolls);
  if (rolls === 0) {
    $("observedNote").innerHTML = `Roll some dice and watch the observed share of <b>${target}</b> drift toward the exact ${pct(p)}.`;
  } else {
    const obsP = hits / rolls;
    $("observedNote").innerHTML =
      `Target <b>${target}</b> came up <b>${fmt(hits)}</b> / ${fmt(rolls)} = <b>${pct(obsP)}</b> ` +
      `<span class="ink-dim">(exact: ${pct(p)})</span>`;
  }
}

const pct = (p) => (p * 100).toFixed(p < 0.01 ? 3 : p < 0.1 ? 2 : 1) + "%";
function fmt(n) { // thousands separators without locale surprises
  if (!isFinite(n)) return String(n);
  const s = String(Math.round(n));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* ---- the distribution bar chart (canvas) ---- */
function renderChart() {
  const cv = $("distChart");
  const dpr = window.devicePixelRatio || 1;
  const cssW = cv.clientWidth || 640, cssH = cv.clientHeight || 260;
  cv.width = cssW * dpr; cv.height = cssH * dpr;
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const css = getComputedStyle(document.documentElement);
  const c = (name, fb) => (css.getPropertyValue(name).trim() || fb);
  const cLine = c("--line", "#333a5c"), cInk = c("--ink-soft", "#b7bede"),
        cDim = c("--ink-mute", "#8891b4"), cProb = c("--prob", "#4fd6c9"),
        cHi = c("--prob-hi", "#ffb86b"), cObs = c("--observed", "#c792ea");

  const lo = dice, hi = dice * sides, nBars = hi - lo + 1;
  const total = totalOutcomes();
  const padL = 40, padR = 12, padT = 14, padB = 26;
  const W = cssW - padL - padR, H = cssH - padT - padB;

  // y-scale from the largest theoretical probability (with a little headroom)
  let maxP = 0;
  for (let s = lo; s <= hi; s++) maxP = Math.max(maxP, pFor(s));
  if (rolls > 0) for (let s = lo; s <= hi; s++) maxP = Math.max(maxP, (observed[s] || 0) / rolls);
  maxP = maxP * 1.12 || 1;

  const x = (s) => padL + ((s - lo) + 0.5) / nBars * W;
  const y = (p) => padT + H - (p / maxP) * H;
  const bw = Math.max(1, (W / nBars) * 0.72);

  // axis
  ctx.strokeStyle = cLine; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL, padT + H); ctx.lineTo(padL + W, padT + H); ctx.stroke();

  // y ticks (as %)
  ctx.fillStyle = cDim; ctx.font = "10px ui-monospace, monospace"; ctx.textAlign = "right";
  const yticks = 4;
  for (let i = 0; i <= yticks; i++) {
    const p = (maxP / yticks) * i, yy = y(p);
    ctx.strokeStyle = cLine; ctx.globalAlpha = i ? 0.35 : 1;
    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + W, yy); ctx.stroke();
    ctx.globalAlpha = 1; ctx.fillText((p * 100).toFixed(maxP < 0.05 ? 1 : 0) + "%", padL - 5, yy + 3);
  }

  // bars = theoretical probability
  for (let s = lo; s <= hi; s++) {
    const p = pFor(s); if (p <= 0) continue;
    const bx = x(s) - bw / 2, by = y(p), bh = padT + H - by;
    ctx.fillStyle = (s === target) ? cHi : cProb;
    ctx.globalAlpha = (s === target) ? 1 : 0.85;
    ctx.fillRect(bx, by, bw, bh);
    ctx.globalAlpha = 1;
  }

  // observed frequencies (Monte-Carlo) as violet markers
  if (rolls > 0) {
    ctx.fillStyle = cObs;
    for (let s = lo; s <= hi; s++) {
      const o = (observed[s] || 0) / rolls; if (o <= 0) continue;
      const mx = x(s), my = y(o), r = Math.min(3.4, bw / 2 + 1);
      ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  // x labels — thin out when crowded
  ctx.fillStyle = cInk; ctx.textAlign = "center";
  const step = Math.ceil(nBars / 16);
  for (let s = lo; s <= hi; s++) {
    if ((s - lo) % step !== 0 && s !== target && s !== hi) continue;
    ctx.fillStyle = (s === target) ? cHi : cDim;
    ctx.fillText(String(s), x(s), padT + H + 14);
  }

  $("distCaption").innerHTML = dice === 1
    ? `Every one of the ${sides} faces has the same height — a <b>flat (uniform)</b> distribution. Each bar is 1/${sides} = ${pct(1 / sides)}.`
    : `Height of each bar = probability of that <b>sum</b>. The middle sums are tallest because more ordered outcomes land there. ` +
      (rolls > 0 ? `Violet dots = your <b>${fmt(rolls)}</b> real rolls closing in on the exact bars.` : `Roll the dice to drop the observed dots on top.`);
}

/* ============================================================
   Wiring
   ============================================================ */
function setSides(N) { sides = clampInt(N, 2, MAX_SIDES); recount(); target = clampInt(target, dice, dice * sides); faces = exampleFor(target); fromRoll = false; render(); }
function setDice(k) { dice = clampInt(k, 1, MAX_DICE); recount(); target = clampInt(target, dice, dice * sides); faces = exampleFor(target); fromRoll = false; render(); }
function setTarget(s) { target = clampInt(s, dice, dice * sides); if (!fromRoll) faces = exampleFor(target); render(); }

window.addEventListener("DOMContentLoaded", () => {
  // side presets
  const pres = $("sidePresets");
  pres.innerHTML = SIDE_PRESETS.map((s) =>
    `<button class="ghost" data-s="${s}">d${s}</button>`).join("");
  pres.querySelectorAll("button").forEach((b) => (b.onclick = () => setSides(+b.dataset.s)));

  $("sidesNum").addEventListener("change", (e) => setSides(+e.target.value));
  $("diceRange").addEventListener("input", (e) => setDice(+e.target.value));
  $("diceNum").addEventListener("change", (e) => setDice(+e.target.value));
  $("diceMinus").onclick = () => setDice(dice - 1);
  $("dicePlus").onclick = () => setDice(dice + 1);

  $("sumRange").addEventListener("input", (e) => setTarget(+e.target.value));
  $("sumNum").addEventListener("change", (e) => setTarget(+e.target.value));
  $("sumMinus").onclick = () => setTarget(target - 1);
  $("sumPlus").onclick = () => setTarget(target + 1);

  $("roll1").onclick = () => rollMany(1);
  $("roll100").onclick = () => rollMany(100);
  $("roll1k").onclick = () => rollMany(1000);
  $("rollReset").onclick = resetRolls;

  faces = exampleFor(target);
  render();
  window.addEventListener("resize", renderChart);
});
