/* ============================================================
   Lesson 4 · Coins & "At Least One" — interactives
     1. the complement rule: P(not A) = 1 − P(A), shown as a green/red
        bar that always fills to 1
     2. each coin doubles the sample space → a tree of 2^N sequences
     3. "at least one" = 1 − P(none): count the single way to fail
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);
const pctOf = (p) => (p * 100).toFixed(p > 0 && p < 0.1 ? 2 : p * 100 % 1 === 0 ? 0 : 1) + "%";

function coin(face, size) {
  const c = document.createElement("div");
  c.className = "coin" + (face === "T" ? " t" : "");
  c.style.width = c.style.height = size + "px";
  c.style.fontSize = (size * 0.42) + "px";
  c.textContent = face;
  return c;
}

/* ---------- Step 1: complement ---------- */
function stepComplement() {
  // the coin sample space
  const ss = $("coinSS");
  [["H", "Heads"], ["T", "Tails"]].forEach(([f, name]) => {
    const wrap = document.createElement("div");
    wrap.style.textAlign = "center";
    wrap.appendChild(coin(f, 66));
    const lab = document.createElement("div");
    lab.className = "cap"; lab.style.marginTop = "6px";
    lab.innerHTML = name + " · <b>1/2</b>";
    wrap.appendChild(lab);
    ss.appendChild(wrap);
  });

  // complement on a die (event A = green faces)
  const A = new Set([6]);
  const row = $("compRow");
  for (let v = 1; v <= 6; v++) {
    const d = Lesson.die(v, { size: 50 });
    d.classList.add("clickable"); d.style.cursor = "pointer";
    d.onclick = () => { A.has(v) ? A.delete(v) : A.add(v); draw(); };
    row.appendChild(d);
  }
  document.querySelectorAll("[data-ev]").forEach((b) => {
    b.onclick = () => {
      A.clear();
      const e = b.dataset.ev;
      if (e === "6") A.add(6);
      else if (e === "even") [2, 4, 6].forEach((x) => A.add(x));
      else if (e === "gt2") [3, 4, 5, 6].forEach((x) => A.add(x));
      draw();
    };
  });

  function draw() {
    Array.from(row.children).forEach((d) => d.classList.toggle("win", A.has(+d.dataset.v)));
    const k = A.size;
    const bar = $("compBar");
    bar.innerHTML = "";
    const a = document.createElement("div"); a.className = "a"; a.style.flex = k + " 0 0"; a.textContent = k ? "A = " + k + "/6" : "";
    const na = document.createElement("div"); na.className = "na"; na.style.flex = (6 - k) + " 0 0"; na.textContent = (6 - k) ? "not A = " + (6 - k) + "/6" : "";
    bar.appendChild(a); bar.appendChild(na);
    $("compOut").innerHTML =
      'P(A) = <b>' + k + "/6</b> = " + pctOf(k / 6) +
      '<span class="sep" style="margin:0 10px">·</span>' +
      'P(not A) = <b>1 − ' + k + "/6 = " + (6 - k) + "/6</b> = " + pctOf((6 - k) / 6);
    $("compCap").innerHTML = "Green + red always fill the whole bar (that's <b>6/6 = 1</b>), so the red part " +
      "is just <b>1 minus</b> the green part. That's the complement rule.";
  }
  draw();
}

/* ---------- Step 2: the doubling tree ---------- */
let nCoins = 3;
function stepTree() {
  $("tree").classList.add("tree");
  const host = $("treeN");
  const btns = {};
  [1, 2, 3, 4].forEach((n) => {
    const b = document.createElement("button");
    b.className = "ghost pillbtn"; b.textContent = n;
    b.onclick = () => { nCoins = n; sel(); render(null); };
    host.appendChild(b); btns[n] = b;
  });
  function sel() { for (const k in btns) btns[k].classList.toggle("on", +k === nCoins); }

  function render(hi) {
    $("tree").innerHTML = buildTreeSVG(nCoins, hi);
    const total = Math.pow(2, nCoins);
    $("treeCount").innerHTML = '<span class="mono">2<sup>' + nCoins + "</sup> = " +
      new Array(nCoins).fill(2).join(" × ") + " = <b>" + total + "</b></span> equally-likely sequences at the bottom.";
    if (!hi) $("treeCap").innerHTML = "Follow any path from the top down to a leaf — that's one possible result, " +
      'like <span class="mono">' + exampleSeq(nCoins) + "</span>. Count the leaves at the bottom: that's the whole sample space.";
  }
  $("flipTree").onclick = () => {
    const seq = Array.from({ length: nCoins }, () => (Math.random() < 0.5 ? "H" : "T"));
    render(seq);
    $("treeCap").innerHTML = "You flipped <b class='mono'>" + seq.join(",") + "</b> — one path highlighted, " +
      "one of <b>" + Math.pow(2, nCoins) + "</b> equally-likely sequences.";
  };
  sel(); render(null);
}
function exampleSeq(n) { return ["H", "T", "H", "T"].slice(0, n).join(","); }

function buildTreeSVG(N, hi) {
  const topPad = 24, levelH = 66, leafW = 46;
  const W = Math.max(300, Math.pow(2, N) * leafW), H = topPad * 2 + N * levelH;
  const xAt = (L, i) => W * (i + 0.5) / Math.pow(2, L);
  const yAt = (L) => topPad + L * levelH;
  const hiIdx = [];
  if (hi) { let p = 0; hiIdx[0] = 0; for (let L = 1; L <= N; L++) { p = p * 2 + (hi[L - 1] === "H" ? 0 : 1); hiIdx[L] = p; } }

  let edges = "", nodes = "";
  for (let L = 1; L <= N; L++) {
    for (let i = 0; i < Math.pow(2, L); i++) {
      const px = xAt(L - 1, i >> 1), py = yAt(L - 1), x = xAt(L, i), y = yAt(L);
      const on = hi && hiIdx[L] === i;
      edges += '<line x1="' + px + '" y1="' + py + '" x2="' + x + '" y2="' + y +
        '" stroke="' + (on ? "var(--prob-hi)" : "var(--line)") + '" stroke-width="' + (on ? 3 : 2) + '"/>';
    }
  }
  for (let L = 0; L <= N; L++) {
    for (let i = 0; i < Math.pow(2, L); i++) {
      const x = xAt(L, i), y = yAt(L);
      const face = L === 0 ? null : (i % 2 === 0 ? "H" : "T");
      const on = hi && hiIdx[L] === i;
      const fill = L === 0 ? "var(--panel-2)" : (face === "H" ? "#e6ad35" : "#99a2c6");
      const r = L === 0 ? 9 : 13;
      nodes += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill +
        '" stroke="' + (on ? "var(--prob-hi)" : "var(--line)") + '" stroke-width="' + (on ? 3 : 1.5) + '"/>';
      if (face) nodes += '<text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle" font-size="13" fill="#20242f">' + face + "</text>";
    }
  }
  return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '">' + edges + nodes + "</svg>";
}

/* ---------- Step 3: at least one ---------- */
function stepAtLeastOne() {
  const range = $("alN");
  range.oninput = draw;

  function draw() {
    const N = +range.value;
    $("alNlab").textContent = N + (N === 1 ? " coin" : " coins");
    const total = Math.pow(2, N), pNo = 1 / total, pAtLeast = 1 - pNo;
    $("alFill").style.width = (pAtLeast * 100) + "%";
    $("alOut").innerHTML =
      'P(no Heads) = <b>1/' + total + "</b> = " + pctOf(pNo) +
      '<span class="sep" style="margin:0 10px">·</span>' +
      'P(at least one) = <b>1 − 1/' + total + " = " + (total - 1) + "/" + total + "</b> = " + pctOf(pAtLeast);

    const list = $("alList");
    list.innerHTML = "";
    if (N <= 4) {
      for (let m = 0; m < total; m++) {
        const seqDiv = document.createElement("div");
        let allT = true;
        for (let b = N - 1; b >= 0; b--) {
          const face = (m >> b) & 1 ? "T" : "H";
          if (face === "H") allT = false;
          seqDiv.appendChild(coin(face, 16));
        }
        seqDiv.className = "seq " + (allT ? "fail" : "win");
        list.appendChild(seqDiv);
      }
      $("alCap").innerHTML = "Only the <b style='color:var(--bad)'>1 red</b> sequence (all Tails) fails. The other " +
        "<b>" + (total - 1) + "</b> all have at least one Heads.";
    } else {
      list.innerHTML = '<div class="cap" style="margin:0">' + total + " sequences — too many to draw. But still only " +
        "<b>1</b> of them (all Tails) has no Heads, so " + (total - 1) + " of " + total + " win.</div>";
      $("alCap").innerHTML = "With " + N + " coins, getting zero Heads is a <b>1 in " + total + "</b> long shot — so " +
        "“at least one” is almost certain (" + pctOf(pAtLeast) + ").";
    }
  }
  draw();
}

/* ---------- Step 4: checks ---------- */
function buildChecks() {
  Lesson.check("checks", {
    q: "On a fair 6-sided die, what is the probability of <b>not</b> rolling a 6?",
    choices: ["1/6", "5/6", "1/2", "6/6"],
    answer: 1,
    explain: "Complement: P(not 6) = 1 − P(6) = 1 − 1/6 = 5/6.",
  });
  Lesson.check("checks", {
    q: "Flip <b>3</b> coins. How many possible sequences (outcomes) are there?",
    choices: ["3", "6", "8", "9"],
    answer: 2,
    explain: "Each coin doubles it: 2 × 2 × 2 = 2³ = 8.",
  });
  Lesson.check("checks", {
    q: "Flip 3 coins. What's the probability of <b>at least one Heads</b>? &nbsp;<span style='color:var(--ink-dim)'>Hint: only one outcome (TTT) has no Heads.</span>",
    choices: ["1/8", "3/8", "7/8", "1/2"],
    answer: 2,
    explain: "1 − P(no Heads) = 1 − 1/8 = 7/8.",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  stepComplement();
  stepTree();
  stepAtLeastOne();
  buildChecks();
  Lesson.setup({ module: "coins", next: null });
});
