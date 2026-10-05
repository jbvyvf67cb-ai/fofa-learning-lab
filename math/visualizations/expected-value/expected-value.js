/* ============================================================
   S4 · Expected Value & Fair Games
   Roll one fair die; editable payoff per face; EV = Σ(payoff × 1/6).
   Compare to the cost to play; simulate to watch the average → EV.
   ============================================================ */
"use strict";

var $ = function (id) { return document.getElementById(id); };
var DEFAULT = [1, 2, 3, 4, 5, 6];
var pays = DEFAULT.slice();
var sim = { plays: 0, totalWin: 0 };
var money = function (x) { return (x < 0 ? "−$" : "$") + Math.abs(x).toFixed(2); };

function ev() { return pays.reduce(function (s, p) { return s + p; }, 0) / 6; }

function buildTable() {
  var body = $("evBody"); body.innerHTML = "";
  for (var f = 1; f <= 6; f++) {
    var tr = document.createElement("tr");
    tr.innerHTML = '<td></td><td class="term">1/6</td><td></td><td class="term" id="term' + f + '"></td>';
    // die face
    var dcell = tr.children[0]; dcell.appendChild(Lesson.die(f, { size: 30 }));
    // payoff input
    var inp = document.createElement("input"); inp.className = "pay"; inp.type = "number"; inp.step = "1";
    inp.value = pays[f - 1]; inp.dataset.f = f;
    inp.oninput = function () { pays[+this.dataset.f - 1] = parseFloat(this.value) || 0; resetSim(); draw(); };
    tr.children[2].appendChild(inp);
    body.appendChild(tr);
  }
}

function draw() {
  var e = ev(), cost = parseFloat($("cost").value) || 0, net = e - cost;
  for (var f = 1; f <= 6; f++) $("term" + f).textContent = money(pays[f - 1]) + " × 1/6 = " + money(pays[f - 1] / 6);
  $("evWin").textContent = money(e);
  var netEl = $("evNet"); netEl.textContent = (net >= 0 ? "+" : "") + money(net).replace("$", "$");
  netEl.style.color = net > 0.001 ? "var(--good)" : (net < -0.001 ? "var(--bad)" : "var(--ink-soft)");
  var v = $("evVerd");
  if (Math.abs(net) < 0.001) { v.textContent = "⚖️ Fair"; v.style.color = "var(--ink-soft)"; }
  else if (net > 0) { v.textContent = "😀 In your favor"; v.style.color = "var(--good)"; }
  else { v.textContent = "💸 Rip-off"; v.style.color = "var(--bad)"; }
}

function playN(n) {
  var cost = parseFloat($("cost").value) || 0;
  for (var i = 0; i < n; i++) { sim.totalWin += pays[(Math.random() * 6 | 0)]; sim.plays++; }
  var avgWin = sim.totalWin / sim.plays;
  $("simOut").innerHTML = "avg win over <b>" + sim.plays.toLocaleString() + "</b> plays: <b>" + money(avgWin) +
    "</b> (expected " + money(ev()) + ") · net " + money(avgWin - cost);
  $("cap").innerHTML = "See how the average winnings land on the <b>expected value</b> — that's what “long-run average” means.";
}
function resetSim() { sim.plays = 0; sim.totalWin = 0; $("simOut").textContent = ""; }

window.addEventListener("DOMContentLoaded", function () {
  buildTable(); draw();
  $("cost").oninput = function () { resetSim(); draw(); };
  $("resetPay").onclick = function () { pays = DEFAULT.slice(); buildTable(); resetSim(); draw(); };
  $("play1000").onclick = function () { playN(1000); };
  $("playReset").onclick = function () { resetSim(); };

  Lesson.check("checks", {
    q: "A game pays $10 if a coin lands Heads and $0 if Tails. What is the <b>expected value</b> per flip?",
    choices: ["$0", "$5", "$10", "$2.50"],
    answer: 1,
    explain: "$10 × 1/2 + $0 × 1/2 = $5 — the long-run average, even though you never actually win exactly $5.",
  });
  Lesson.check("checks", {
    q: "That game ($5 expected value) costs <b>$5</b> to play. The game is…",
    choices: ["A rip-off", "Fair (net $0 in the long run)", "In your favor", "Impossible to judge"],
    answer: 1,
    explain: "Expected win ($5) equals the cost ($5), so on average you break even — a fair game.",
  });
  Lesson.check("checks", {
    q: "Why can a lottery have a tiny expected value but still take your money over time?",
    choices: [
      "The jackpot is huge but its probability is so small that payoff × chance is tiny",
      "Lotteries are actually fair",
      "Expected value doesn't apply to lotteries",
      "Because the tickets are cheap",
    ],
    answer: 0,
    explain: "A giant prize times a minuscule probability is a small expected value — usually far less than the ticket price.",
  });

  Lesson.setup({ module: "expected-value", next: { title: "Unit B Quiz", url: "../unit-b-statistics/" } });
});
