/* ============================================================
   Lesson 2 · Two Dice & the Sample Space — interactives
     1. draw the 36-square grid (rows = die A, cols = die B)
     2. every square equally likely: roll → land on a square (+heat),
        click a square → P(that exact pair) = 1/36
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);

/* ---------- Step 1: static grid (just see all 36) ---------- */
function stepOne() {
  Lesson.grid($("gridA"));
  $("capA").innerHTML =
    "Read a square like a map: the <b>row</b> is die A, the <b>column</b> is die B. " +
    "The square marked <span class='mono'>2,5</span> means die A showed 2 and die B showed 5. " +
    "Count every square in the grid — there are <b>36</b> of them.";
}

/* ---------- Step 2: equally likely — a 6×6 count table ----------
   Each square shows how many times it has been rolled. A light heat tint tracks
   the counts too, but the numbers are the point: after many rolls every square
   sits near total ÷ 36, so no square is special. */
const hits = {};
let rolls = 0;
function stepTwo() {
  const g = Lesson.grid($("gridB"), { mini: false, showPair: false });
  const cells = g.cells;
  g.forEach((cell, a, b) => {
    const cnt = document.createElement("div");
    cnt.className = "cellcount zero";
    cnt.textContent = "0";
    cell.appendChild(cnt);
    cell._cnt = cnt;
    cell.classList.add("clickable");
    cell.onclick = () => selectPair(cells, cell);
  });

  function refresh() {
    const max = Math.max(1, ...Object.values(hits));
    g.forEach((cell, a, b) => {
      const h = hits[a + "," + b] || 0;
      cell._cnt.textContent = h;
      cell._cnt.classList.toggle("zero", h === 0);
      cell.style.background = h ? "rgba(79,214,201," + (0.08 + 0.4 * (h / max)).toFixed(3) + ")" : "";
    });
    $("rollTotal").textContent = rolls ? rolls.toLocaleString() + " rolls" : "";
    $("rollExpect").innerHTML = rolls
      ? "Expected per square if perfectly even: <b>" + rolls.toLocaleString() + " ÷ 36 ≈ " + (rolls / 36).toFixed(1) + "</b> — compare it to the tallies."
      : "";
  }
  function land(a, b) {
    g.forEach((c) => c.classList.remove("land"));
    hits[a + "," + b] = (hits[a + "," + b] || 0) + 1;
    rolls++;
    refresh();
    cells[a + "," + b].classList.add("land");
    $("capB").innerHTML = "Rolled <b>" + a + "," + b + "</b>. Its tally ticked up by one. Roll a lot and every " +
      "square's count stays close to the others — that's what equally likely looks like.";
  }
  const rnd = () => 1 + (Math.random() * 6 | 0);

  function batch(n) { for (let i = 0; i < n - 1; i++) { const a = rnd(), b = rnd(); hits[a + "," + b] = (hits[a + "," + b] || 0) + 1; rolls++; } land(rnd(), rnd()); }
  $("rollOne").onclick = () => land(rnd(), rnd());
  $("roll200").onclick = () => batch(200);
  $("roll2000").onclick = () => batch(2000);
  $("rollReset").onclick = () => {
    for (const k in hits) delete hits[k];
    rolls = 0; refresh();
    g.forEach((c) => c.classList.remove("land"));
    $("capB").innerHTML = "Each square shows its tally. <b>Click any square</b> to pick one exact roll and see its chance.";
  };
  refresh();

  function selectPair(cellsRef, cell) {
    g.forEach((c) => c.classList.remove("land"));
    cell.classList.add("land");
    const a = cell.dataset.a, b = cell.dataset.b;
    $("capB").innerHTML =
      "You picked the square <b>" + a + "," + b + "</b>. It's <b>one</b> square out of <b>36</b>, so the " +
      "chance of rolling exactly that is <b class='mono'>1/36</b> ≈ 2.8% — the same tiny chance for every square.";
  }
}

/* ---------- Step 3: checks ---------- */
function buildChecks() {
  Lesson.check("checks", {
    q: "Die A can land 6 ways and die B can land 6 ways. How many squares (outcomes) are in the two-dice sample space?",
    choices: ["12 (6 + 6)", "36 (6 × 6)", "6", "66"],
    answer: 1,
    explain: "For each of die A's 6 outcomes, die B adds 6 more: 6 × 6 = 36. You multiply, not add.",
  });
  Lesson.check("checks", {
    q: "What is the probability of rolling exactly the pair <b>(3, 5)</b> — die A = 3, die B = 5?",
    choices: ["1/6", "1/12", "1/36", "5/36"],
    answer: 2,
    explain: "It's one specific square out of 36 equally-likely squares → 1/36.",
  });
  Lesson.check("checks", {
    q: "True or false: some squares in the grid are more likely than others.",
    choices: ["True — the middle ones are more likely", "False — all 36 squares are equally likely"],
    answer: 1,
    explain: "Every single square is equally likely (1/36). Soon we'll see that some SUMS are more likely — but that's because more squares add up to them, not because any square is special.",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  stepOne();
  stepTwo();
  buildChecks();
  Lesson.setup({ module: "two-dice", next: { title: "Sums & Permutations", url: "../sums-and-permutations/" } });
});
