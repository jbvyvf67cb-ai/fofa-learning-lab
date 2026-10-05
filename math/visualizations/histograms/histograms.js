/* ============================================================
   S3 · Histograms — bin & count; the dice-sum triangle; skew
   ============================================================ */
"use strict";

var $ = function (id) { return document.getElementById(id); };

/* ---- dice-sum histogram ---- */
var counts = {}; for (var s = 2; s <= 12; s++) counts[s] = 0;
var total = 0;
function rollDice(n) {
  for (var i = 0; i < n; i++) { var a = 1 + (Math.random() * 6 | 0), b = 1 + (Math.random() * 6 | 0); counts[a + b]++; total++; }
  drawDice();
}
function drawDice() {
  var hist = $("hist"), axis = $("axis");
  if (!hist.children.length) {
    for (var s = 2; s <= 12; s++) {
      hist.insertAdjacentHTML("beforeend", '<div class="hb" id="hb' + s + '"><span class="ct" id="ct' + s + '"></span></div>');
      axis.insertAdjacentHTML("beforeend", "<span>" + s + "</span>");
    }
  }
  var max = 1; for (var k = 2; k <= 12; k++) max = Math.max(max, counts[k]);
  var peak = 2; for (var j = 2; j <= 12; j++) if (counts[j] > counts[peak]) peak = j;
  for (var v = 2; v <= 12; v++) {
    $("hb" + v).style.height = (counts[v] / max * 100) + "%";
    $("ct" + v).textContent = total ? counts[v] : "";
    $("hb" + v).classList.toggle("on", total > 50 && v === 7);
  }
  $("rollTotal").textContent = total ? total.toLocaleString() + " rolls" : "";
  if (total >= 1000) $("cap").innerHTML = "There it is — a <b>symmetric</b> hump peaking at <b>7</b>, exactly the " +
    "Lesson-3 triangle (ways: 1·2·3·4·5·6·5·4·3·2·1). Real rolls grew into the theory.";
}

/* ---- shape examples ---- */
var SHAPES = {
  symmetric: { label: "Symmetric (bell)", data: [1, 3, 6, 9, 9, 6, 3, 1], cap: "Piles up in the middle, even tails on both sides — like the dice sums or people's heights." },
  right: { label: "Right-skewed", data: [11, 7, 4, 3, 2, 1, 1, 1], cap: "Most values are small, with a long tail of a few big ones to the right — like pets per family or income." },
  left: { label: "Left-skewed", data: [1, 1, 1, 2, 3, 4, 7, 11], cap: "A long tail of small values to the left, most data bunched high — like scores on an easy test." },
};
var shapeSel = "symmetric";
function drawShapes() {
  var btns = $("shapeBtns");
  if (!btns.children.length) {
    Object.keys(SHAPES).forEach(function (k) {
      var b = document.createElement("button"); b.className = "ghost pillbtn"; b.textContent = SHAPES[k].label;
      b.onclick = function () { shapeSel = k; drawShapes(); }; btns.appendChild(b);
    });
  }
  Array.prototype.forEach.call(btns.children, function (b) { b.classList.toggle("on", SHAPES[shapeSel].label === b.textContent); });
  var data = SHAPES[shapeSel].data, max = Math.max.apply(null, data);
  var hist = $("shapeHist"); hist.innerHTML = "";
  data.forEach(function (c) {
    var d = document.createElement("div"); d.className = "hb"; d.style.height = (c / max * 100) + "%";
    hist.appendChild(d);
  });
  $("shapeCap").innerHTML = SHAPES[shapeSel].cap;
}

window.addEventListener("DOMContentLoaded", function () {
  drawDice(); drawShapes();
  $("roll100").onclick = function () { rollDice(100); };
  $("roll1000").onclick = function () { rollDice(1000); };
  $("rollReset").onclick = function () { for (var s = 2; s <= 12; s++) counts[s] = 0; total = 0; drawDice(); $("cap").innerHTML = "Press <b>Roll ×1000</b> a few times and watch the bars settle into a shape."; };

  Lesson.check("checks", {
    q: "In a histogram, what does the <b>height</b> of a bar tell you?",
    choices: ["The biggest value in that bin", "How many values fell into that bin", "The average", "Nothing — it's decoration"],
    answer: 1,
    explain: "Bar height = the count of data values that landed in that bin.",
  });
  Lesson.check("checks", {
    q: "Why does the two-dice histogram peak at 7?",
    choices: ["7 is lucky", "7 has the most ways to be made (6 of them)", "The dice are loaded", "It doesn't — it's flat"],
    answer: 1,
    explain: "More combinations make 7 than any other sum, so over many rolls its bar is tallest — the symmetric triangle from Lesson 3.",
  });
  Lesson.check("checks", {
    q: "Most families have 0–2 pets, but a few have 10+. The histogram of pets-per-family is…",
    choices: ["Symmetric", "Right-skewed (long tail to the right)", "Left-skewed", "Flat"],
    answer: 1,
    explain: "A big pile at the low end with a long tail of large values stretching right = right-skewed.",
  });

  Lesson.setup({ module: "histograms", next: { title: "Expected Value & Fair Games", url: "../expected-value/" } });
});
