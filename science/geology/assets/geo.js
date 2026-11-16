/* ============================================================
   geo.js — the geology unit's small lesson engine
   ------------------------------------------------------------
     Geo.init({ lesson, title, module })   wire the steps, restore his place
     Geo.unlock(stepId)                    open the Next button on a gated step
     Geo.track("what he did")              record a milestone (Claude sees these)
     Geo.check(host, q)                    a multiple-choice check (first try counts)
     Geo.claudeTask(host, opts)            a "Send to Claude" task (claude-channel.js)

   Steps are <section class="step" id="..."> blocks, revealed one at a time.
   data-gate="Try … to go on." keeps Next locked until Geo.unlock(id).
   The lesson is complete when every check is answered and every Claude task
   is marked "got it"; then it is reported to the lab (Fofa.report) and the
   unit page shows it as done.
   ============================================================ */
(function () {
  "use strict";
  var cfg, st, steps = [], checks = [], tasks = [];

  function readJSON(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f; } catch (e) { return f; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function key() { return "geo:lesson:" + cfg.lesson; }
  function save() { writeJSON(key(), st); }

  function dots() {
    var d = document.getElementById("geoDots");
    if (!d) return;
    d.innerHTML = "";
    steps.forEach(function (_, i) { d.appendChild(el("span", i < st.at ? "done" : i === st.at ? "now" : "")); });
  }
  function show(i) {
    st.at = Math.max(st.at, Math.min(i, steps.length - 1));
    steps.forEach(function (s, j) { s.hidden = j > st.at; });
    dots(); save();
  }

  function init(c) {
    cfg = c;
    st = readJSON(key(), null) || { at: 0, unlocked: [], answers: {}, explored: [], started: Date.now() };
    steps = [].slice.call(document.querySelectorAll(".step"));
    steps.forEach(function (s, i) {
      if (i === steps.length - 1) return;
      var b = el("button", "primary geo-next", s.getAttribute("data-next") || "Next →");
      var gated = s.hasAttribute("data-gate") && st.unlocked.indexOf(s.id) < 0;
      if (gated) {
        b.disabled = true;
        s._gateNote = el("div", "geo-gate", s.getAttribute("data-gate"));
        s.appendChild(s._gateNote);
      }
      s._next = b;
      b.onclick = function () { show(i + 1); steps[i + 1].scrollIntoView({ behavior: "smooth", block: "start" }); };
      s.appendChild(b);
    });
    show(st.at);
    if (readJSON("geo:done", {})[cfg.lesson]) banner();
  }

  function unlock(id) {
    var s = document.getElementById(id);
    if (!s || !s._next || !s._next.disabled) return;
    s._next.disabled = false;
    if (s._gateNote) s._gateNote.remove();
    if (st.unlocked.indexOf(id) < 0) { st.unlocked.push(id); save(); }
  }

  function track(m) {
    if (st.explored.indexOf(m) >= 0) return;
    st.explored.push(m); save();
  }

  // q: { id, q, choices:[], answer, explain }
  function check(host, q) {
    checks.push(q);
    host.classList.add("check");
    host.appendChild(el("div", "q", q.q));
    var list = host.appendChild(el("div", "choices"));
    var fb = host.appendChild(el("div", "fb"));
    q.choices.forEach(function (c, i) {
      var b = list.appendChild(el("button", "", c));
      b.onclick = function () {
        if (st.answers[q.id]) return;               // first try counts
        st.answers[q.id] = { choice: i, correct: i === q.answer };
        save(); paint(); maybeDone();
      };
    });
    function paint() {
      var a = st.answers[q.id];
      if (!a) return;
      [].forEach.call(list.children, function (b, i) {
        b.disabled = true;
        if (i === q.answer) b.className = "right"; else if (i === a.choice) b.className = "wrong";
      });
      fb.className = "fb " + (a.correct ? "good" : "bad");
      fb.textContent = (a.correct ? "Yes! " : "Not quite. ") + (q.explain || "");
    }
    paint();
  }

  function claudeTask(host, opts) {
    var t = window.ClaudeChannel.mount(host, {
      unit: "geology", lesson: cfg.lesson, lessonTitle: cfg.title, task: opts.task,
      prompt: opts.prompt, rubric: opts.rubric,
      context: function () {
        var extra = opts.context ? opts.context() : {};
        extra.explored = st.explored.slice();
        extra.checks = score();
        return extra;
      },
      onDone: maybeDone
    });
    tasks.push(t);
    return t;
  }

  function score() {
    var got = checks.filter(function (q) { return st.answers[q.id] && st.answers[q.id].correct; }).length;
    var answered = checks.filter(function (q) { return st.answers[q.id]; }).length;
    return got + "/" + checks.length + (answered < checks.length ? " (" + (checks.length - answered) + " not answered yet)" : "");
  }

  function maybeDone() {
    var allChecks = checks.every(function (q) { return st.answers[q.id]; });
    var allTasks = tasks.every(function (t) { return t.isDone(); });
    if (!allChecks || !allTasks) return;
    var done = readJSON("geo:done", {});
    if (done[cfg.lesson]) return;
    done[cfg.lesson] = { at: new Date().toISOString(), checks: score() };
    writeJSON("geo:done", done);
    var got = checks.filter(function (q) { return st.answers[q.id].correct; }).length;
    try { if (window.Fofa) Fofa.report({ subject: "science", module: cfg.module, activity: "lesson", kind: "complete", score: got, max: checks.length }); } catch (e) {}
    banner();
  }

  function banner() {
    if (document.getElementById("geoDone")) return;
    var last = steps[steps.length - 1];
    var b = el("div", "done-banner");
    b.id = "geoDone";
    b.innerHTML = "<b>Lesson complete!</b> Nice geology. <a href='../'>Back to the unit →</a>";
    last.appendChild(b);
  }

  window.Geo = { init: init, unlock: unlock, track: track, check: check, claudeTask: claudeTask };
})();
