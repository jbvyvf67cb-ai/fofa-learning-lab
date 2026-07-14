/* ============================================================
   Lesson 5 · Combinations — interactives
     1. group coin sequences by # of Heads → the bin sizes are C(n,k)
     2. stack the counts → Pascal's triangle (each = sum of two above)
     3. C(n,k) = ways to choose which k of n flips are Heads
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);
const pctOf = (p) => (p * 100).toFixed(p * 100 % 1 === 0 ? 0 : 1) + "%";

// C(n,k) by Pascal addition (exact, integer)
const Cmemo = {};
function C(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  const key = n + "," + k;
  if (Cmemo[key] != null) return Cmemo[key];
  return (Cmemo[key] = C(n - 1, k - 1) + C(n - 1, k));
}

function miniSeq(m, n) {
  const d = document.createElement("div");
  d.className = "miniseq";
  for (let b = n - 1; b >= 0; b--) d.appendChild(Lesson.coin((m >> b) & 1 ? "T" : "H", 15));
  return d;
}
function popcount(m) { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; }

/* ---------- Step 1: bins ---------- */
let binN = 4, binSel = -1;
function stepBins() {
  const host = $("binN");
  [2, 3, 4].forEach((n) => {
    const b = document.createElement("button");
    b.className = "ghost pillbtn"; b.textContent = n;
    b.onclick = () => { binN = n; binSel = -1; drawBins(); };
    host.appendChild(b);
  });
  drawBins();
}
function drawBins() {
  document.querySelectorAll("#binN button").forEach((b) => b.classList.toggle("on", +b.textContent === binN));
  const total = Math.pow(2, binN);
  $("binTotal").textContent = total + " sequences";
  // collect sequences per head-count
  const groups = Array.from({ length: binN + 1 }, () => []);
  for (let m = 0; m < total; m++) groups[popcount(m)].push(m);

  const wrap = $("bins"); wrap.innerHTML = "";
  groups.forEach((seqs, k) => {
    const bin = document.createElement("div");
    bin.className = "bin" + (binSel === k ? " on" : "");
    bin.onclick = () => { binSel = k; drawBins(); };
    const head = document.createElement("div");
    head.className = "bh";
    head.innerHTML = "<b>" + k + "</b> Head" + (k === 1 ? "" : "s") +
      ' <span style="color:var(--ink-dim)">— C(' + binN + "," + k + ")</span>" +
      '<span class="cnt">' + seqs.length + "</span>";
    bin.appendChild(head);
    const sq = document.createElement("div"); sq.className = "seqs";
    seqs.forEach((m) => sq.appendChild(miniSeq(m, binN)));
    bin.appendChild(sq);
    wrap.appendChild(bin);
  });

  if (binSel >= 0) {
    const c = C(binN, binSel);
    $("binOut").innerHTML = "P(exactly <b>" + binSel + "</b> Head" + (binSel === 1 ? "" : "s") + " in " + binN +
      " flips) = <b>" + c + "/" + total + "</b> = " + pctOf(c / total);
    $("binCap").innerHTML = "That bin has <b>" + c + "</b> of the " + total + " equally-likely sequences.";
  } else {
    $("binOut").innerHTML = "";
    $("binCap").innerHTML = "Click a bin above to see the chance of exactly that many Heads.";
  }
}

/* ---------- Step 2: Pascal's triangle ---------- */
const PASCAL_ROWS = 6;
function stepPascal() {
  const wrap = $("pascal"); wrap.innerHTML = "";
  for (let n = 0; n <= PASCAL_ROWS; n++) {
    const row = document.createElement("div"); row.className = "prow"; row.dataset.n = n;
    for (let k = 0; k <= n; k++) {
      const cell = document.createElement("div");
      cell.className = "pcell"; cell.dataset.n = n; cell.dataset.k = k;
      cell.textContent = C(n, k);
      cell.onclick = () => selectCell(n, k);
      row.appendChild(cell);
    }
    wrap.appendChild(row);
  }
}
function selectCell(n, k) {
  document.querySelectorAll(".pcell").forEach((c) => c.classList.remove("on", "parent"));
  const sel = document.querySelector('.pcell[data-n="' + n + '"][data-k="' + k + '"]');
  sel.classList.add("on");
  const p1 = document.querySelector('.pcell[data-n="' + (n - 1) + '"][data-k="' + (k - 1) + '"]');
  const p2 = document.querySelector('.pcell[data-n="' + (n - 1) + '"][data-k="' + k + '"]');
  if (p1) p1.classList.add("parent");
  if (p2) p2.classList.add("parent");
  const val = C(n, k);
  $("pasOut").innerHTML = "<b class='mono'>C(" + n + "," + k + ") = " + val + "</b> — the number of ways to get " +
    "<b>" + k + "</b> Head" + (k === 1 ? "" : "s") + " in <b>" + n + "</b> flips.";
  $("pasCap").innerHTML = (p1 && p2)
    ? "It's the sum of the two highlighted numbers above: <b class='mono'>" + C(n - 1, k - 1) + " + " + C(n - 1, k) + " = " + val + "</b>."
    : "An edge of the triangle is always <b>1</b> — there's exactly one way to get all Heads or all Tails.";
}

/* ---------- Step 3: choose positions ---------- */
let chooseK = 2;
function stepChoose() {
  const host = $("chooseK");
  [0, 1, 2, 3, 4].forEach((k) => {
    const b = document.createElement("button");
    b.className = "ghost pillbtn"; b.textContent = k;
    b.onclick = () => { chooseK = k; drawChoose(); };
    host.appendChild(b);
  });
  drawChoose();
}
function drawChoose() {
  document.querySelectorAll("#chooseK button").forEach((b) => b.classList.toggle("on", +b.textContent === chooseK));
  const n = 4;
  const combos = [];
  for (let m = 0; m < Math.pow(2, n); m++) if (popcount(m) === chooseK) combos.push(m);
  const wrap = $("poslots"); wrap.innerHTML = "";
  combos.forEach((m) => {
    const row = document.createElement("div"); row.className = "poslot-row";
    for (let i = n - 1; i >= 0; i--) {
      const s = document.createElement("div");
      const on = (m >> i) & 1;
      s.className = "slot" + (on ? " on" : "");
      s.textContent = on ? "H" : "T";
      row.appendChild(s);
    }
    wrap.appendChild(row);
  });
  $("chooseOut").innerHTML = "Ways to choose <b>" + chooseK + "</b> of 4 flips to be Heads: <b class='mono'>C(4," +
    chooseK + ") = " + C(n, chooseK) + "</b>.";
}

/* ---------- Step 4: checks ---------- */
function buildChecks() {
  Lesson.check("checks", {
    q: "How many ways are there to get <b>exactly 2 Heads</b> in 4 coin flips?",
    choices: ["2", "4", "6", "8"],
    answer: 2,
    explain: "C(4,2) = 6 — the middle bin. (HHTT, HTHT, HTTH, THHT, THTH, TTHH.)",
  });
  Lesson.check("checks", {
    q: "In Pascal's triangle, each number is…",
    choices: ["double the one above it", "the sum of the two numbers above it", "always a prime", "the row number times the column"],
    answer: 1,
    explain: "Each entry = the sum of the two directly above: C(n,k) = C(n−1,k−1) + C(n−1,k).",
  });
  Lesson.check("checks", {
    q: "What is <b>C(4, 0)</b> — the number of ways to get 0 Heads in 4 flips?",
    choices: ["0", "1", "4", "16"],
    answer: 1,
    explain: "Exactly one way: all four flips are Tails (TTTT). Edges of the triangle are always 1.",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  stepBins();
  stepPascal();
  stepChoose();
  buildChecks();
  Lesson.setup({ module: "combinations", next: { title: "Conditional Probability & Trees", url: "../conditional-trees/" } });
});
