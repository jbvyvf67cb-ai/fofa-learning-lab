/* ============================================================
   Lesson 7 · Monty Hall — interactives
     1. enumerate the 3-case sample space → switch wins 2 of 3
     2. play the game (pick → host reveals goat → stay/switch)
     3. simulate hundreds of games → switch → 2/3, stay → 1/3
   ============================================================ */
"use strict";

const $ = (id) => document.getElementById(id);
const CAR = "🚗", GOAT = "🐐";

/* ---------- Step 1: the sample space ---------- */
function stepCases() {
  // you always pick door 1. Host opens a goat door (≠ your pick, ≠ car).
  const wrap = $("cases");
  wrap.innerHTML = "";
  for (let car = 1; car <= 3; car++) {
    const pick = 1;
    // host opens a goat that isn't the pick
    let host = [1, 2, 3].filter((d) => d !== pick && d !== car)[0];
    const switchTo = [1, 2, 3].filter((d) => d !== pick && d !== host)[0];
    const stayWin = pick === car, switchWin = switchTo === car;

    const row = document.createElement("div");
    row.className = "case" + (switchWin ? " switchwin" : "");
    // mini doors
    let mini = '<div class="mini">';
    for (let d = 1; d <= 3; d++) {
      const cls = "md-door" + (d === pick ? " pick" : "") + (d === host ? " open" : "");
      const face = d === host ? GOAT : (d === car ? CAR : "");
      mini += '<div class="' + cls + '">' + face + "</div>";
    }
    mini += "</div>";
    row.innerHTML =
      '<div style="font-size:.82rem;color:var(--ink-soft)">Car behind<br><b>Door ' + car + "</b></div>" +
      mini +
      '<div class="verdict">Stay: <span class="' + (stayWin ? "w" : "s") + '">' + (stayWin ? "WIN" : "lose") + "</span><br>" +
      'Switch: <span class="' + (switchWin ? "w" : "s") + '">' + (switchWin ? "WIN" : "lose") + "</span></div>";
    wrap.appendChild(row);
  }
  $("caseSummary").innerHTML = "Tally the three equally-likely cases: <b>Stay wins 1 of 3</b> (only when your first " +
    "guess was already right), but <b>Switch wins 2 of 3</b>. So P(win by switching) = <b>2/3</b> ≈ 66.7%.";
}

/* ---------- Step 2: play ---------- */
let game = null;
const wins = { stay: 0, switch: 0, games: 0 };
function newGame() {
  game = { car: 1 + Math.floor(Math.random() * 3), pick: null, host: null, phase: "pick", result: null };
  render();
  $("gameMsg").textContent = "Pick a door.";
  $("stayBtn").disabled = true; $("switchBtn").disabled = true;
}
function pickDoor(d) {
  if (!game || game.phase !== "pick") return;
  game.pick = d;
  const goats = [1, 2, 3].filter((x) => x !== d && x !== game.car);
  game.host = goats[Math.floor(Math.random() * goats.length)];
  game.phase = "decide";
  render();
  $("gameMsg").innerHTML = "Host opens Door " + game.host + " — a goat 🐐. <b>Stay or switch?</b>";
  $("stayBtn").disabled = false; $("switchBtn").disabled = false;
}
function decide(sw) {
  if (!game || game.phase !== "decide") return;
  const final = sw ? [1, 2, 3].filter((x) => x !== game.pick && x !== game.host)[0] : game.pick;
  game.final = final; game.phase = "done";
  const won = final === game.car;
  wins.games++; if (won) wins[sw ? "switch" : "stay"]++;
  render();
  $("gameMsg").innerHTML = (won ? "🎉 You won the car!" : "🐐 A goat. Bad luck!") +
    " (You " + (sw ? "switched" : "stayed") + ".)";
  $("stayBtn").disabled = true; $("switchBtn").disabled = true;
  $("tally").innerHTML = "Your record — won by <b>switching</b>: " + wins.switch + " · won by <b>staying</b>: " +
    wins.stay + " · games: " + wins.games;
}
function render() {
  const doors = $("doors"); doors.innerHTML = "";
  for (let d = 1; d <= 3; d++) {
    const el = document.createElement("div");
    el.className = "door";
    let face = "";
    const opened = game.phase !== "pick" && d === game.host;
    const revealed = game.phase === "done";
    if (opened) { el.classList.add("open"); face = GOAT; }
    if (revealed) { face = d === game.car ? CAR : GOAT; el.classList.add("open"); }
    if (d === game.pick) el.classList.add("picked");
    if (revealed && d === game.final && d === game.car) el.classList.add("win");
    if (game.phase === "done") el.classList.add("dimmed");
    el.innerHTML = '<span class="dn">Door ' + d + "</span>" + (face || (game.phase === "pick" || (game.phase === "decide" && !opened) ? "🚪" : ""));
    if (game.phase === "pick") el.onclick = () => pickDoor(d);
    else el.onclick = null;
    doors.appendChild(el);
  }
}

/* ---------- Step 3: simulate ---------- */
const sim = { switchWins: 0, stayWins: 0, n: 0 };
function runSim(games) {
  for (let i = 0; i < games; i++) {
    const car = 1 + Math.floor(Math.random() * 3);
    const pick = 1 + Math.floor(Math.random() * 3);
    // host opens a goat ≠ pick; switching lands on the remaining door
    // switch wins exactly when the first pick was NOT the car
    if (pick === car) sim.stayWins++; else sim.switchWins++;
    sim.n++;
  }
  drawSim();
}
function drawSim() {
  const sw = sim.n ? sim.switchWins / sim.n : 0;
  const st = sim.n ? sim.stayWins / sim.n : 0;
  $("swFill").style.width = (sw * 100) + "%";
  $("stFill").style.width = (st * 100) + "%";
  $("swVal").textContent = sim.n ? (sw * 100).toFixed(1) + "% (" + sim.switchWins + ")" : "—";
  $("stVal").textContent = sim.n ? (st * 100).toFixed(1) + "% (" + sim.stayWins + ")" : "—";
  $("simN").textContent = sim.n ? sim.n.toLocaleString() + " games each strategy" : "";
  if (sim.n >= 100) {
    $("simCap").innerHTML = "After <b>" + sim.n.toLocaleString() + "</b> games, switching wins about <b>" +
      (sw * 100).toFixed(1) + "%</b> and staying about <b>" + (st * 100).toFixed(1) + "%</b> — landing right on " +
      "<b>2/3</b> and <b>1/3</b>, exactly what counting the sample space predicted.";
  } else {
    $("simCap").innerHTML = "Press a button to simulate games and watch the bars settle onto the dashed marks.";
  }
}
function resetSim() { sim.switchWins = 0; sim.stayWins = 0; sim.n = 0; drawSim(); }

/* ---------- Step 4: checks ---------- */
function buildChecks() {
  Lesson.check("checks", {
    q: "In the Monty Hall game, what's the probability of winning the car if you <b>always switch</b>?",
    choices: ["1/2", "1/3", "2/3", "3/4"],
    answer: 2,
    explain: "Switching wins in 2 of the 3 equally-likely cases → 2/3.",
  });
  Lesson.check("checks", {
    q: "Why does switching do better than staying?",
    choices: [
      "The host randomly helps you",
      "Your first pick is right only 1/3 of the time, so 2/3 of the time the car is elsewhere — and the host reveals which",
      "There are really only 2 doors",
      "It's just luck; they're actually equal",
    ],
    answer: 1,
    explain: "Your first guess is right 1/3 of the time. The other 2/3 gets concentrated onto the one door you can switch to.",
  });
  Lesson.check("checks", {
    q: "If you <b>stay</b> with your first door every time, your win probability is…",
    choices: ["1/3", "1/2", "2/3", "1"],
    answer: 0,
    explain: "Staying only wins when your first guess was already the car — that's 1/3.",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  stepCases();
  newGame();
  $("stayBtn").onclick = () => decide(false);
  $("switchBtn").onclick = () => decide(true);
  $("newBtn").onclick = newGame;
  $("sim100").onclick = () => runSim(100);
  $("sim1000").onclick = () => runSim(1000);
  $("simReset").onclick = resetSim;
  drawSim();
  buildChecks();
  Lesson.setup({ module: "monty-hall", next: null });
});
