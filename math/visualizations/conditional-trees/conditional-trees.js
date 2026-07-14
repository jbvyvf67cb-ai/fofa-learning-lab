/* ============================================================
   Lesson 6 · Conditional Probability & Trees — interactives
     1. draw without replacement → the 2nd draw's chances change
     2. a probability tree: multiply the branch chances ALONG a path
     3. add ACROSS the leaves that make up an event
   Bag = R red + B blue marbles; draw two, keeping the first.
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);
let R = 3, B = 2;
const total = () => R + B;

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a || 1; }
function fr(n, d) { if (d === 0) return "0"; const g = gcd(n, d); return (g > 1 && n !== 0) ? n + "/" + d + " = " + (n / g) + "/" + (d / g) : n + "/" + d; }
const pctOf = (n, d) => d ? (n / d * 100).toFixed((n / d * 100) % 1 === 0 ? 0 : 1) + "%" : "0%";
function marble(c) { const m = document.createElement("span"); m.className = "marble " + c; return m; }

/* ---------- Step 1: the bag + what-ifs ---------- */
function stepBag() {
  document.querySelectorAll("[data-adj]").forEach((b) => {
    b.onclick = () => {
      const a = b.dataset.adj;
      if (a === "r+" && R < 5 && total() < 6) R++;
      if (a === "r-" && R > 1) R--;
      if (a === "b+" && B < 5 && total() < 6) B++;
      if (a === "b-" && B > 1) B--;
      drawBag(); drawTrees();
    };
  });
  drawBag();
}
function drawBag() {
  $("rv").textContent = R; $("bv").textContent = B;
  const bag = $("bag"); bag.innerHTML = "";
  for (let i = 0; i < R; i++) bag.appendChild(marble("r"));
  for (let i = 0; i < B; i++) bag.appendChild(marble("b"));
  const N = total();
  $("beforeP").innerHTML = "Before any draw: P(red) = <b>" + fr(R, N) + "</b> = " + pctOf(R, N);

  // if first is RED
  const wr = $("wIfRed");
  wr.innerHTML = '<h4>If the 1st marble is <span style="color:#e5556f">Red</span> '
    + '<span style="color:var(--ink-dim);font-weight:400">(chance ' + fr(R, N) + ')</span></h4>';
  const remR = document.createElement("div"); remR.className = "rem";
  for (let i = 0; i < R - 1; i++) remR.appendChild(marble("r"));
  for (let i = 0; i < B; i++) remR.appendChild(marble("b"));
  wr.appendChild(remR);
  wr.insertAdjacentHTML("beforeend", 'Now P(red) = <span class="p">' + fr(R - 1, N - 1) + "</span> = " + pctOf(R - 1, N - 1));

  // if first is BLUE
  const wb = $("wIfBlue");
  wb.innerHTML = '<h4>If the 1st marble is <span style="color:#5b7bf0">Blue</span> '
    + '<span style="color:var(--ink-dim);font-weight:400">(chance ' + fr(B, N) + ')</span></h4>';
  const remB = document.createElement("div"); remB.className = "rem";
  for (let i = 0; i < R; i++) remB.appendChild(marble("r"));
  for (let i = 0; i < B - 1; i++) remB.appendChild(marble("b"));
  wb.appendChild(remB);
  wb.insertAdjacentHTML("beforeend", 'Now P(red) = <span class="p">' + fr(R, N - 1) + "</span> = " + pctOf(R, N - 1));

  $("s1cap").innerHTML = "Drawing red leaves <b>" + (R - 1) + "</b> red of <b>" + (N - 1) + "</b>; drawing blue leaves <b>"
    + R + "</b> red of <b>" + (N - 1) + "</b>. The first draw rewrote the odds.";
}

/* ---------- the probability tree (shared) ---------- */
function outcomes() {
  const N = total(), d = N * (N - 1);
  return [
    { id: "RR", c1: "r", c2: "r", n: R * (R - 1), d, l1: [R, N], l2: [R - 1, N - 1] },
    { id: "RB", c1: "r", c2: "b", n: R * B, d, l1: [R, N], l2: [B, N - 1] },
    { id: "BR", c1: "b", c2: "r", n: B * R, d, l1: [B, N], l2: [R, N - 1] },
    { id: "BB", c1: "b", c2: "b", n: B * (B - 1), d, l1: [B, N], l2: [B - 1, N - 1] },
  ];
}
const COL = { r: "#e5556f", b: "#5b7bf0" };
function buildTree6(mount, hiSet) {
  hiSet = hiSet || new Set();
  const W = 600, H = 300;
  const pos = { root: [300, 26], R: [165, 128], B: [435, 128], RR: [82, 240], RB: [250, 240], BR: [350, 240], BB: [518, 240] };
  const o = outcomes();
  const onEdge1 = (c) => Array.from(hiSet).some((id) => id[0] === c);
  const marbleSvg = (x, y, c, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 15) + '" fill="' + COL[c] + '" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>';
  const edge = (a, b, on, label) => {
    const [x1, y1] = pos[a], [x2, y2] = pos[b];
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    let s = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (on ? "var(--prob-hi)" : "var(--line)") + '" stroke-width="' + (on ? 3.5 : 2) + '"/>';
    s += '<rect x="' + (mx - 17) + '" y="' + (my - 10) + '" width="34" height="18" rx="5" fill="var(--panel-2)" stroke="var(--line)"/>';
    s += '<text x="' + mx + '" y="' + (my + 3) + '" text-anchor="middle" font-size="11" fill="var(--ink-soft)">' + label + "</text>";
    return s;
  };
  let svg = "";
  // edges level 1
  svg += edge("root", "R", onEdge1("R"), R + "/" + total());
  svg += edge("root", "B", onEdge1("B"), B + "/" + total());
  // edges level 2
  o.forEach((x) => { svg += edge(x.id[0], x.id, hiSet.has(x.id), x.l2[0] + "/" + x.l2[1]); });
  // nodes
  svg += marbleSvg(pos.root[0], pos.root[1], "r", 0); // hidden root
  svg += '<circle cx="' + pos.root[0] + '" cy="' + pos.root[1] + '" r="7" fill="var(--panel-2)" stroke="var(--line)"/>';
  svg += marbleSvg(pos.R[0], pos.R[1], "r");
  svg += marbleSvg(pos.B[0], pos.B[1], "b");
  o.forEach((x) => {
    const on = hiSet.has(x.id);
    svg += '<g data-leaf="' + x.id + '" style="cursor:pointer">';
    svg += '<circle cx="' + pos[x.id][0] + '" cy="' + pos[x.id][1] + '" r="15" fill="' + COL[x.c2] + '" stroke="' + (on ? "var(--prob-hi)" : "rgba(255,255,255,.35)") + '" stroke-width="' + (on ? 3.5 : 1.5) + '"/>';
    svg += '<text x="' + pos[x.id][0] + '" y="' + (pos[x.id][1] + 40) + '" text-anchor="middle" font-size="11" fill="' + (on ? "var(--prob-hi)" : "var(--ink-dim)") + '">' + x.n + "/" + x.d + "</text>";
    svg += "</g>";
  });
  mount.innerHTML = '<svg width="' + W + '" height="' + (H + 20) + '" viewBox="0 0 ' + W + " " + (H + 20) + '">' + svg + "</svg>";
}

/* ---------- Step 2: click a leaf ---------- */
function drawTree2(sel) {
  const mount = $("tree6");
  buildTree6(mount, sel ? new Set([sel]) : new Set());
  mount.querySelectorAll("[data-leaf]").forEach((g) => (g.onclick = () => drawTree2(g.dataset.leaf)));
  const o = outcomes();
  if (sel) {
    const x = o.find((t) => t.id === sel);
    const names = { r: "Red", b: "Blue" };
    $("treeOut").innerHTML = "P(" + names[x.c1] + " then " + names[x.c2] + ") = <b class='mono'>" +
      x.l1[0] + "/" + x.l1[1] + " × " + x.l2[0] + "/" + x.l2[1] + " = " + fr(x.n, x.d) + "</b> = " + pctOf(x.n, x.d) +
      '<span style="color:var(--ink-dim)"> — multiplied along the path.</span>';
  } else {
    $("treeOut").innerHTML = "";
  }
}

/* ---------- Step 3: events (add across) ---------- */
const EVENTS = [
  { key: "bothred", label: "Both red", set: ["RR"] },
  { key: "onered", label: "Exactly one red", set: ["RB", "BR"] },
  { key: "1blue", label: "At least one blue", set: ["RB", "BR", "BB"] },
  { key: "same", label: "Both same colour", set: ["RR", "BB"] },
];
let evSel = "onered";
function stepEvents() {
  const host = $("evbtns"); host.innerHTML = "";
  EVENTS.forEach((e) => {
    const b = document.createElement("button");
    b.className = "ghost pillbtn"; b.textContent = e.label;
    b.onclick = () => { evSel = e.key; drawTree3(); };
    host.appendChild(b);
  });
  drawTree3();
}
function drawTree3() {
  document.querySelectorAll("#evbtns button").forEach((b, i) => b.classList.toggle("on", EVENTS[i].key === evSel));
  const ev = EVENTS.find((e) => e.key === evSel);
  buildTree6($("tree6b"), new Set(ev.set));
  const o = outcomes();
  const parts = ev.set.map((id) => o.find((t) => t.id === id));
  const sumN = parts.reduce((a, t) => a + t.n, 0), d = parts[0].d;
  const addStr = parts.map((t) => t.n + "/" + d).join(" + ");
  $("evOut").innerHTML = "P(" + ev.label.toLowerCase() + ") = <b class='mono'>" +
    (parts.length > 1 ? addStr + " = " : "") + fr(sumN, d) + "</b> = " + pctOf(sumN, d);
}

function drawTrees() { drawTree2(null); drawTree3(); }

/* ---------- Step 4: checks ---------- */
function buildChecks() {
  Lesson.check("checks", {
    q: "A bag has 3 red and 2 blue marbles. You draw one red and <b>keep it</b>. What's the probability the <b>next</b> marble is also red?",
    choices: ["3/5", "2/4 = 1/2", "3/4", "2/5"],
    answer: 1,
    explain: "After removing a red, 2 red remain out of 4 marbles → 2/4 = 1/2. The first draw changed the bag.",
  });
  Lesson.check("checks", {
    q: "On a probability tree, to get the chance of one full path (e.g. Red then Blue) you…",
    choices: ["add the branch numbers", "multiply the branch numbers along the path", "pick the bigger branch", "subtract them"],
    answer: 1,
    explain: "Multiply along the path: P(Red then Blue) = 3/5 × 2/4.",
  });
  Lesson.check("checks", {
    q: "3 red, 2 blue, draw two without replacement. P(both red) = 3/5 × 2/4. What is it?",
    choices: ["6/20 = 3/10", "5/9", "1/2", "6/25"],
    answer: 0,
    explain: "3/5 × 2/4 = 6/20 = 3/10 = 30%.",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  stepBag();
  drawTree2(null);
  stepEvents();
  buildChecks();
  Lesson.setup({ module: "conditional-trees", next: { title: "Monty Hall", url: "../monty-hall/" } });
});
