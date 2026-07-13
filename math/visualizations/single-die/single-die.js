/* ============================================================
   Lesson 1 · The Single Die — interactives
   All on one page, in reading order. Each widget teaches ONE idea:
     1. sample space (the 6 faces, drawn)   2. equally likely (tally)
     3. probability = favourable / 6         4. many-sided dice (1/N)
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a || 1; }
const pctOf = (p) => (p * 100).toFixed(p * 100 % 1 === 0 ? 0 : 1) + "%";

/* ---------- Step 1: the sample space, drawn ---------- */
function buildSampleSpace() {
  const row = $("ssRow");
  for (let v = 1; v <= 6; v++) row.appendChild(Lesson.die(v, { size: 58 }));
  const tiles = () => Array.from(row.children);

  $("ssRoll").onclick = () => {
    tiles().forEach((t) => t.classList.remove("land"));
    // quick shuffle of the highlight, then land
    let ticks = 0;
    const iv = setInterval(() => {
      tiles().forEach((t) => t.classList.remove("land"));
      tiles()[Math.floor(Math.random() * 6)].classList.add("land");
      if (++ticks > 8) {
        clearInterval(iv);
        const v = 1 + Math.floor(Math.random() * 6);
        tiles().forEach((t, i) => t.classList.toggle("land", i === v - 1));
        $("ssCap").innerHTML = "You rolled a <b>" + v + "</b> — one of the six. 🎲";
      }
    }, 55);
  };
}

/* ---------- Step 2: equally likely (converging share bars) ----------
   Each bar shows the SHARE of rolls for that face (a percentage), not a raw
   count. Shares are drawn against a fixed axis (AXIS) with a dashed line at the
   "fair share" 1/6, so as you roll more the bars visibly settle onto the line —
   the law of large numbers, made concrete. (Counts alone were confusing because
   normalising to the tallest bar made bars appear to shrink.) */
const TRACK = 150, AXIS = 0.5; // track px height; top of axis = 50% share
const counts = [0, 0, 0, 0, 0, 0];
function buildTally() {
  const t = $("tally");
  t.innerHTML = "";
  for (let v = 1; v <= 6; v++) {
    const col = document.createElement("div");
    col.className = "col";
    const track = document.createElement("div");
    track.className = "track";
    const fill = document.createElement("div");
    fill.className = "fill"; fill.id = "fill" + v; fill.style.height = "0%";
    track.appendChild(fill);
    const face = Lesson.die(v, { size: 30 });
    const pct = document.createElement("div"); pct.className = "pct"; pct.id = "pct" + v; pct.textContent = "—";
    const cnt = document.createElement("div"); cnt.className = "cnt"; cnt.id = "cnt" + v; cnt.textContent = "0 rolls";
    col.appendChild(track); col.appendChild(face); col.appendChild(pct); col.appendChild(cnt);
    t.appendChild(col);
  }
  // dashed "fair share" line at share = 1/6
  const fair = document.createElement("div");
  fair.className = "fairline";
  fair.style.top = (TRACK * (1 - (1 / 6) / AXIS)) + "px";
  fair.innerHTML = '<span class="flab">fair share = 1/6 ≈ 16.7%</span>';
  t.appendChild(fair);

  drawTally();
  $("t10").onclick = () => rollTally(10);
  $("t100").onclick = () => rollTally(100);
  $("t1000").onclick = () => rollTally(1000);
  $("tReset").onclick = () => { for (let i = 0; i < 6; i++) counts[i] = 0; drawTally(); };
}
function rollTally(n) { for (let i = 0; i < n; i++) counts[Math.floor(Math.random() * 6)]++; drawTally(); }
function drawTally() {
  const total = counts.reduce((a, b) => a + b, 0);
  let worst = 0;
  for (let v = 1; v <= 6; v++) {
    const share = total ? counts[v - 1] / total : 0;
    $("fill" + v).style.height = Math.min(100, share / AXIS * 100) + "%";
    $("pct" + v).textContent = total ? (share * 100).toFixed(1) + "%" : "—";
    $("cnt" + v).textContent = counts[v - 1] + (counts[v - 1] === 1 ? " roll" : " rolls");
    if (total) worst = Math.max(worst, Math.abs(share - 1 / 6));
  }
  $("tTotal").textContent = total ? total.toLocaleString() + " rolls" : "";
  const cap = $("tallyCap");
  if (cap && total >= 10) {
    const off = (worst * 100).toFixed(1);
    cap.innerHTML = total < 100
      ? `Only <b>${total}</b> rolls so far — the bars are still jumpy (the furthest is <b>${off}%</b> from fair). Keep rolling…`
      : `After <b>${total.toLocaleString()}</b> rolls every bar is within <b>${off}%</b> of the dashed fair line. ` +
        `That settling toward equal is what <b>equally likely</b> means — the more you roll, the closer they hug the line.`;
  }
}

/* ---------- Step 3: probability = favourable / 6 ---------- */
const winners = new Set();
function buildPicker() {
  const row = $("pickRow");
  for (let v = 1; v <= 6; v++) {
    const d = Lesson.die(v, { size: 54 });
    d.classList.add("clickable"); d.style.cursor = "pointer";
    d.onclick = () => { winners.has(v) ? winners.delete(v) : winners.add(v); drawPicker(); };
    row.appendChild(d);
  }
  document.querySelectorAll("[data-pick]").forEach((b) => {
    b.onclick = () => {
      winners.clear();
      const p = b.dataset.pick;
      if (p === "4") winners.add(4);
      else if (p === "even") [2, 4, 6].forEach((x) => winners.add(x));
      else if (p === "gt4") [5, 6].forEach((x) => winners.add(x));
      else if (p === "all") [1, 2, 3, 4, 5, 6].forEach((x) => winners.add(x));
      drawPicker();
    };
  });
  // start with "roll a 4" so the first thing shown is 1/6
  winners.add(4);
  drawPicker();
}
function drawPicker() {
  Array.from($("pickRow").children).forEach((d) => d.classList.toggle("win", winners.has(+d.dataset.v)));
  // slice bar (6 segments)
  const slice = $("pickSlice");
  slice.innerHTML = "";
  for (let v = 1; v <= 6; v++) {
    const s = document.createElement("div");
    s.className = "seg" + (winners.has(v) ? " on" : "");
    slice.appendChild(s);
  }
  const k = winners.size;
  const out = $("pickOut"), cap = $("pickCap");
  if (k === 0) {
    out.innerHTML = '<span class="big">0</span>';
    cap.innerHTML = "No faces chosen → probability <b>0</b>. That event can never happen.";
    return;
  }
  const g = gcd(k, 6), rn = k / g, rd = 6 / g;
  const dec = (k / 6).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  const redu = (rn === k && rd === 6) ? "" : ' <span class="sep">=</span> ' + rn + "/" + rd;
  out.innerHTML =
    '<span class="big">' + k + "/6</span>" + redu +
    ' <span class="sep">=</span> ' + dec + ' <span class="sep">=</span> ' + pctOf(k / 6);
  const names = Array.from(winners).sort((a, b) => a - b).join(", ");
  cap.innerHTML = "<b>" + k + "</b> face" + (k > 1 ? "s" : "") + " count (" + names + ") out of <b>6</b> → " +
    "the chance is <b>" + k + "/6</b>" + (k === 6 ? " = 1 (certain!)" : "") + ".";
}

/* ---------- Step 4: many-sided dice ---------- */
function buildNSides() {
  document.querySelectorAll("[data-n]").forEach((b) => (b.onclick = () => setN(+b.dataset.n)));
  setN(6);
}
function setN(N) {
  document.querySelectorAll("[data-n]").forEach((b) => b.classList.toggle("on", +b.dataset.n === N));
  const row = $("nsRow");
  row.innerHTML = "";
  const size = N > 12 ? 34 : 44;
  for (let v = 1; v <= N; v++) row.appendChild(Lesson.die(v, { size, sides: N }));
  const dec = (1 / N).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  $("nsOut").innerHTML =
    '<span class="big">1/' + N + "</span>" + ' <span class="sep">=</span> ' + dec +
    ' <span class="sep">=</span> ' + pctOf(1 / N) +
    '  <span class="sep" style="font-size:.9rem">— one number out of ' + N + " faces</span>";
}

/* ---------- Step 5: checks ---------- */
function buildChecks() {
  Lesson.check("checks", {
    q: "A fair die has 6 faces. What is the probability of rolling a <b>2</b>?",
    choices: ["1/6", "2/6", "1/2", "6/6"],
    answer: 0,
    explain: "Just one face is a 2, out of six faces → 1/6.",
  });
  Lesson.check("checks", {
    q: "What's the probability of rolling an <b>even number</b>? &nbsp;<span style='color:var(--ink-dim)'>Hint: how many faces are even?</span>",
    choices: ["1/6", "2/6", "3/6 = 1/2", "5/6"],
    answer: 2,
    explain: "Three faces are even (2, 4, 6) out of six → 3/6, which is the same as 1/2.",
  });
  Lesson.check("checks", {
    q: "On a <b>20-sided</b> die, what is the probability of rolling any one particular number?",
    choices: ["1/6", "1/10", "1/20", "20/20"],
    answer: 2,
    explain: "One number out of twenty faces → 1/20 (which is 5%). More sides make each number rarer.",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  buildSampleSpace();
  buildTally();
  buildPicker();
  buildNSides();
  buildChecks();
  Lesson.setup({ module: "single-die", next: { title: "Two Dice & the Sample Space", url: "../two-dice/" } });
});
