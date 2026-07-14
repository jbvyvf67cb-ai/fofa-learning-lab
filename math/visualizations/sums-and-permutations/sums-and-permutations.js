/* ============================================================
   Lesson 3 · Sums & Permutations — interactives
     1. mark the squares that add to a total (find game)   → count/36
     2. permutations: the marked squares mirror across the diagonal
     3. the distribution is just how many squares sit on each sum-stripe
   Every probability here = (squares) / 36. Nothing but counting.
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);

// ways to make each total with two 6-sided dice
const WAYS = {}; for (let s = 2; s <= 12; s++) WAYS[s] = 6 - Math.abs(7 - s);
function pairsFor(sum) {
  const out = [];
  for (let a = 1; a <= 6; a++) { const b = sum - a; if (b >= 1 && b <= 6) out.push([a, b]); }
  return out;
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a || 1; }
const pctOf = (p) => (p * 100).toFixed(p * 100 % 1 === 0 ? 0 : 1) + "%";
function frac(n, d) { const g = gcd(n, d); const r = (g > 1) ? " = " + n / g + "/" + d / g : ""; return n + "/" + d + r; }

// colour for a sum-stripe (teal → warm as the count grows toward 7)
function bandColor(sum) {
  const hue = 190 - (WAYS[sum] - 1) * 30; // 1 way→190 (teal), 6 ways→40 (orange)
  return `hsl(${hue} 70% 62%)`;
}

/* target-button strip helper */
function targetStrip(mount, initial, onPick) {
  const host = $(mount);
  host.innerHTML = "";
  const btns = {};
  for (let s = 2; s <= 12; s++) {
    const b = document.createElement("button");
    b.className = "ghost pillbtn";
    b.textContent = s;
    b.onclick = () => { setSel(s); onPick(s); };
    host.appendChild(b);
    btns[s] = b;
  }
  function setSel(s) { for (const k in btns) btns[k].classList.toggle("on", +k === s); }
  setSel(initial);
  return { setSel };
}

/* ---------- Step 1: find the squares ---------- */
function stepFind() {
  const g = Lesson.grid($("gridFind"));
  let target = 6, found = new Set(), revealed = false;

  g.forEach((cell, a, b) => {
    cell.classList.add("clickable");
    cell.onclick = () => {
      if (revealed) return;
      const ok = a + b === target;
      const key = a + "," + b;
      if (ok) {
        if (found.has(key)) return;
        found.add(key); cell.classList.add("correct");
        status();
      } else {
        cell.classList.add("wrongpick");
        setTimeout(() => cell.classList.remove("wrongpick"), 320);
      }
    };
  });

  function reset() {
    found = new Set(); revealed = false;
    g.forEach((c) => c.classList.remove("correct", "mark"));
    status();
  }
  function reveal() {
    revealed = true;
    found = new Set();
    pairsFor(target).forEach(([a, b]) => { found.add(a + "," + b); g.cells[a + "," + b].classList.add("correct"); });
    status();
  }
  function setTarget(s) { target = s; reset(); }
  function status() {
    const total = WAYS[target];
    $("findStatus").textContent = "found " + found.size + " / " + total;
    $("findCap").innerHTML = "Squares where die A + die B = <b>" + target + "</b>.";
    if (found.size === total) {
      $("findBig").innerHTML = "<b>" + total + "</b> square" + (total > 1 ? "s" : "") + " make a total of <b>" +
        target + "</b>, out of 36 → <b class='mono'>" + frac(total, 36) + "</b> = " + pctOf(total / 36) + ".";
    } else {
      $("findBig").innerHTML = "Keep clicking the squares that add up to <b>" + target + "</b>…";
    }
  }

  const strip = targetStrip("findTargets", 6, setTarget);
  $("findReveal").onclick = reveal;
  $("findClear").onclick = reset;
  reset();
}

/* ---------- Step 2: permutations (mirror across the diagonal) ---------- */
function stepPerm() {
  const g = Lesson.grid($("gridPerm"));
  // draw the diagonal squares distinctly
  g.forEach((cell, a, b) => { if (a === b) cell.style.boxShadow = "inset 0 0 0 2px var(--ink-mute)"; });

  function show(sum) {
    g.forEach((cell, a, b) => cell.classList.toggle("mark", a + b === sum));
    const pairs = pairsFor(sum);
    const chips = pairs.map(([a, b]) => {
      const mirror = a !== b;
      return `<span class="waychip" style="display:inline-block;font-family:var(--mono);font-size:.82rem;margin:3px 5px 0 0;padding:4px 10px;border-radius:8px;background:var(--panel-2);border:1px solid ${mirror ? "var(--line)" : "var(--ink-mute)"};color:var(--ink-soft)">${a},${b}${a === b ? " ◇" : ""}</span>`;
    }).join("");
    const doubles = pairs.some(([a, b]) => a === b);
    $("permList").innerHTML =
      `<div style="font-size:.9rem;color:var(--ink-soft);margin-bottom:6px">The <b>${pairs.length}</b> ordered ways to make <b>${sum}</b>:</div>` +
      chips +
      `<div style="font-size:.82rem;color:var(--ink-dim);margin-top:8px">` +
      (doubles ? "The ◇ square sits on the diagonal — it's its own mirror. " : "") +
      `Each other square pairs with its flip across the diagonal.</div>`;
  }
  targetStrip("permTargets", 5, show);
  show(5);
}

/* ---------- Step 3: distribution from counting ---------- */
function stepDist() {
  const g = Lesson.grid($("gridBands"), { showPair: false, headerSize: 24 });
  g.forEach((cell, a, b) => {
    cell.classList.add("band");
    cell.style.setProperty("--band", bandColor(a + b));
  });

  // bars
  const bars = $("distBars"), axis = $("distAxis");
  bars.innerHTML = ""; axis.innerHTML = "";
  const barEl = {}, axEl = {};
  const maxWays = 6;
  for (let s = 2; s <= 12; s++) {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = (WAYS[s] / maxWays * 100) + "%";
    bar.style.background = bandColor(s);
    const w = document.createElement("div"); w.className = "ways"; w.textContent = WAYS[s];
    bar.appendChild(w);
    bars.appendChild(bar); barEl[s] = bar;
    const ax = document.createElement("span"); ax.textContent = s; axis.appendChild(ax); axEl[s] = ax;
  }

  function highlight(sum) {
    g.forEach((cell, a, b) => cell.classList.toggle("land", a + b === sum));
    for (let s = 2; s <= 12; s++) { barEl[s].classList.toggle("on", s === sum); axEl[s].classList.toggle("on", s === sum); }
    const w = WAYS[sum];
    $("distOut").innerHTML =
      `P(total = <b style="color:var(--prob-hi)">${sum}</b>) = <span class="big" style="font-size:1.4rem">${frac(w, 36)}</span> ` +
      `<span class="sep">=</span> ${pctOf(w / 36)}`;
    $("distCap").innerHTML = sum === 7
      ? "<b>7</b> is the tallest stripe — 6 squares land on it, more than any other total. That's the whole reason 7 is the most common roll."
      : (w === 1
        ? `<b>${sum}</b> sits in a corner — only 1 square makes it, so it's the rarest total (tied).`
        : `<b>${w}</b> squares make <b>${sum}</b>. Compare its bar to 7's — fewer squares, smaller chance.`);
  }
  targetStrip("distTargets", 7, highlight);
  highlight(7);
}

/* ---------- Step 4: checks ---------- */
function buildChecks() {
  Lesson.check("checks", {
    q: "How many squares of the 36-grid add up to a total of <b>5</b>? &nbsp;(1+4, 2+3, 3+2, 4+1)",
    choices: ["2", "3", "4", "5"],
    answer: 2,
    explain: "Four ordered squares: (1,4), (2,3), (3,2), (4,1) → 4/36 = 1/9.",
  });
  Lesson.check("checks", {
    q: "Which total is the <b>most likely</b> with two dice, and why?",
    choices: ["12 — it's the biggest", "7 — the most squares (6) land on it", "2 — the smallest", "They're all equally likely"],
    answer: 1,
    explain: "7 has 6 squares making it — more than any other total — so it's the most likely (6/36 = 1/6).",
  });
  Lesson.check("checks", {
    q: "Are the squares <b>(2,6)</b> and <b>(6,2)</b> counted as one way or two ways to make 8?",
    choices: ["One way — same numbers", "Two ways — they're different squares (permutations)"],
    answer: 1,
    explain: "Two different squares (die A=2,B=6 vs die A=6,B=2), so we count both. That's what 'order matters' means.",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  stepFind();
  stepPerm();
  stepDist();
  buildChecks();
  Lesson.setup({ module: "sums-permutations", next: { title: "Coins & “At Least One”", url: "../coins/" } });
});
