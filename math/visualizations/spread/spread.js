/* ============================================================
   S2 · Spread — range, average distance from the mean, box plot
   Reuses the draggable number line; two presets share mean 10 but differ
   wildly in spread. Teal sticks = each point's distance from the mean.
   ============================================================ */
"use strict";

var $ = function (id) { return document.getElementById(id); };
var BUNCHED = [9, 9, 10, 10, 10, 11, 11];   // mean 10, range 2
var SPREADY = [2, 6, 8, 10, 12, 14, 18];    // mean 10, range 16
var MIN = 0, MAX = 20;

function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length, m = Math.floor(n / 2); return n % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function quartiles(a) {
  var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length, m = Math.floor(n / 2);
  var lo = s.slice(0, m), hi = n % 2 ? s.slice(m + 1) : s.slice(m);
  return { min: s[0], max: s[n - 1], q1: median(lo), med: median(s), q3: median(hi) };
}
var round1 = function (x) { return Math.round(x * 10) / 10; };
var pct = function (v) { return (v - MIN) / (MAX - MIN) * 100; };

var nl;
function draw(values, overlay) {
  var mn = mean(values);
  var range = Math.max.apply(null, values) - Math.min.apply(null, values);
  var mad = mean(values.map(function (x) { return Math.abs(x - mn); }));
  $("vMean").textContent = round1(mn);
  $("vRange").textContent = range;
  $("vMad").textContent = round1(mad);

  overlay.innerHTML = "";
  // distance sticks
  values.forEach(function (v) {
    var a = pct(Math.min(v, mn)), b = pct(Math.max(v, mn));
    var st = document.createElement("div"); st.className = "nl-stick";
    st.style.left = a + "%"; st.style.width = (b - a) + "%";
    overlay.appendChild(st);
  });
  // mean caret
  var mEl = document.createElement("div"); mEl.className = "nl-mean"; mEl.style.left = pct(mn) + "%";
  mEl.innerHTML = "▲<span class=\"cap\">mean " + round1(mn) + "</span>";
  overlay.appendChild(mEl);

  drawBox(values);
}

function drawBox(values) {
  var q = quartiles(values), box = $("box"); box.innerHTML = "";
  function add(cls, left, width, html) {
    var d = document.createElement("div"); d.className = cls;
    d.style.left = left + "%"; if (width != null) d.style.width = width + "%";
    if (html) d.innerHTML = html; box.appendChild(d); return d;
  }
  add("bp-line", pct(q.min), pct(q.max) - pct(q.min));
  add("bp-whisk", pct(q.min), null);
  add("bp-whisk", pct(q.max), null);
  add("bp-box", pct(q.q1), pct(q.q3) - pct(q.q1));
  add("bp-med", pct(q.med), null);
  add("bp-cap", pct(q.min), null, "min " + q.min);
  add("bp-cap", pct(q.max), null, "max " + q.max);
  $("boxcap").innerHTML = "Box spans the middle half (" + q.q1 + " to " + q.q3 + "); green = median (" + q.med +
    "); whiskers reach min (" + q.min + ") and max (" + q.max + ").";
}

function setMode(which) {
  $("bunched").classList.toggle("on", which === "b");
  $("spread").classList.toggle("on", which === "s");
  nl.setValues(which === "b" ? BUNCHED : SPREADY);
  $("cap").innerHTML = which === "b"
    ? "<b>Bunched:</b> every dot hugs the mean — short sticks, small range. Same average as the spread set, totally different data."
    : "<b>Spread out:</b> dots flung wide — long sticks, big range. Same mean (10), but far less predictable.";
}

window.addEventListener("DOMContentLoaded", function () {
  nl = Lesson.numberLine("nl", { min: MIN, max: MAX, step: 1, tickEvery: 2, values: BUNCHED, onChange: draw });
  $("bunched").onclick = function () { setMode("b"); };
  $("spread").onclick = function () { setMode("s"); };

  Lesson.check("checks", {
    q: "A data set's smallest value is 4 and largest is 19. What is the <b>range</b>?",
    choices: ["4", "15", "19", "23"],
    answer: 1,
    explain: "Range = largest − smallest = 19 − 4 = 15.",
  });
  Lesson.check("checks", {
    q: "Team A's scores: 20, 21, 19, 20. Team B's: 0, 40, 39, 1. Both average 20. Which team is more <b>spread out</b>?",
    choices: ["Team A", "Team B", "They're the same", "Can't tell from the average"],
    answer: 1,
    explain: "Team B's scores swing from 0 to 40 (range 40); Team A barely moves (range 2). Same mean, very different spread.",
  });
  Lesson.check("checks", {
    q: "On a box plot, what does the <b>box</b> (not the whiskers) show?",
    choices: ["The single biggest value", "The middle half of the data", "The mean", "Every outlier"],
    answer: 1,
    explain: "The box covers the middle 50% — from the quarter mark (Q1) to the three-quarter mark (Q3).",
  });

  setMode("b");
  Lesson.setup({ module: "spread", next: { title: "Histograms", url: "../histograms/" } });
});
