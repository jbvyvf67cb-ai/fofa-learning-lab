/* ============================================================
   S1 · Describing Data — mean, median, mode
   One draggable number line; the three measures update live, with the
   mean drawn as a balance-point ▲ and the median as a vertical line.
   ============================================================ */
"use strict";

var $ = function (id) { return document.getElementById(id); };
var START = [3, 5, 6, 6, 8, 9, 13];

function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
function median(a) {
  var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length, m = Math.floor(n / 2);
  return n % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mode(a) {
  var f = {}, best = 0;
  a.forEach(function (x) { f[x] = (f[x] || 0) + 1; if (f[x] > best) best = f[x]; });
  if (best <= 1) return { text: "none", vals: [] };
  var vals = Object.keys(f).filter(function (k) { return f[k] === best; }).map(Number).sort(function (x, y) { return x - y; });
  return { text: vals.join(", "), vals: vals };
}
var round1 = function (x) { return Math.round(x * 10) / 10; };
var PCT = function (v) { return (v - 0) / (20 - 0) * 100; }; // 0..20 scale (matches the number line)

var nl;
function draw(values, overlay) {
  var mn = mean(values), md = median(values), mo = mode(values);
  $("vMean").textContent = round1(mn);
  $("vMedian").textContent = md;
  $("vMode").textContent = mo.text;

  overlay.innerHTML = "";
  // mean = balance-point caret
  var mEl = document.createElement("div");
  mEl.className = "nl-mean"; mEl.style.left = PCT(mn) + "%";
  mEl.innerHTML = "▲<span class=\"cap\">mean " + round1(mn) + "</span>";
  overlay.appendChild(mEl);
  // median line
  var dEl = document.createElement("div");
  dEl.className = "nl-median"; dEl.style.left = PCT(md) + "%";
  dEl.innerHTML = "<span class=\"cap\">median " + md + "</span>";
  overlay.appendChild(dEl);
}

window.addEventListener("DOMContentLoaded", function () {
  nl = Lesson.numberLine("nl", { min: 0, max: 20, step: 1, tickEvery: 2, values: START, onChange: draw });

  $("addOutlier").onclick = function () {
    var v = nl.values.slice(); v[v.length - 1] = 20; nl.setValues(v);
    $("cap").innerHTML = "One dot jumped to <b>20</b>. See the <b style=\"color:var(--accent)\">mean</b> chase it while the " +
      "<b style=\"color:var(--good)\">median</b> hardly budges.";
  };
  $("reset").onclick = function () { nl.setValues(START); $("cap").innerHTML = "Drag any dot along the line. Dots that land on the same number stack up."; };

  Lesson.check("checks", {
    q: "The numbers 4, 4, 6, 10, 16 — what is the <b>mean</b>? &nbsp;<span style='color:var(--ink-dim)'>(add them, divide by 5)</span>",
    choices: ["6", "8", "10", "40"],
    answer: 1,
    explain: "4+4+6+10+16 = 40, and 40 ÷ 5 = 8.",
  });
  Lesson.check("checks", {
    q: "For 4, 4, 6, 10, 16, what is the <b>median</b> (the middle one when sorted)?",
    choices: ["4", "6", "8", "10"],
    answer: 1,
    explain: "Sorted: 4, 4, [6], 10, 16 — the middle value is 6.",
  });
  Lesson.check("checks", {
    q: "A town's house prices: most are around $300k, but one mansion is $20 million. Which better describes a <b>typical</b> house?",
    choices: ["The mean — the mansion makes it realistic", "The median — it ignores the one outlier", "They're always the same", "Neither works"],
    answer: 1,
    explain: "The median shrugs off the single huge outlier; the mean would be dragged way up by the mansion.",
  });

  Lesson.setup({ module: "describing-data", next: { title: "Spread", url: "../spread/" } });
});
