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

/* ---------- Step 2: equally likely + roll + click ---------- */
const hits = {};
let rolls = 0;
function stepTwo() {
  const cells = Lesson.grid($("gridB")).cells;
  Object.values(cells).forEach((c) => {
    c.classList.add("clickable");
    c.onclick = () => selectPair(cells, c);
  });

  function land(a, b) {
    Object.values(cells).forEach((c) => c.classList.remove("land"));
    const c = cells[a + "," + b];
    c.classList.add("land");
    const key = a + "," + b;
    hits[key] = (hits[key] || 0) + 1;
    rolls++;
    paintHeat(cells);
    $("rollTotal").textContent = rolls + " rolls";
    $("capB").innerHTML = "Rolled <b>" + a + "," + b + "</b> — one square out of 36. " +
      "Keep rolling: the whole grid fills in evenly because every square is equally likely.";
  }

  $("rollOne").onclick = () => land(1 + (Math.random() * 6 | 0), 1 + (Math.random() * 6 | 0));
  $("roll200").onclick = () => {
    for (let i = 0; i < 199; i++) { const a = 1 + (Math.random() * 6 | 0), b = 1 + (Math.random() * 6 | 0); hits[a + "," + b] = (hits[a + "," + b] || 0) + 1; rolls++; }
    land(1 + (Math.random() * 6 | 0), 1 + (Math.random() * 6 | 0));
  };
  $("rollReset").onclick = () => {
    for (const k in hits) delete hits[k];
    rolls = 0;
    paintHeat(cells);
    Object.values(cells).forEach((c) => c.classList.remove("land"));
    $("rollTotal").textContent = "";
    $("capB").innerHTML = "Or <b>click any square</b> to pick one exact roll and see its chance.";
  };
}
function paintHeat(cells) {
  const max = Math.max(1, ...Object.values(hits));
  for (const key in cells) {
    const h = hits[key] || 0;
    cells[key].style.background = h ? "rgba(79,214,201," + (0.12 + 0.55 * (h / max)).toFixed(3) + ")" : "";
  }
}
function selectPair(cells, cell) {
  Object.values(cells).forEach((c) => c.classList.remove("land"));
  cell.classList.add("land");
  const a = cell.dataset.a, b = cell.dataset.b;
  $("capB").innerHTML =
    "You picked the square <b>" + a + "," + b + "</b>. It's <b>one</b> square out of <b>36</b>, so the " +
    "chance of rolling exactly that is <b class='mono'>1/36</b> ≈ 2.8% — the same tiny chance for every square.";
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
