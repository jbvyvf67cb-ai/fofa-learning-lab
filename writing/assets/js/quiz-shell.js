/* ============================================================================
   quiz-shell.js — graded checkpoint quiz for the Writing subject.
   ----------------------------------------------------------------------------
   Renders an authored quiz bank (quizzes/writing/<quizId>.json), collects the
   student's ANSWERS, and submits them through the Lab-owned client
   FofaAccount.quiz() — which POSTs /api/fofa/quiz (or grades in the built-in
   mock). The SERVER grades every question, records the result (so it counts
   toward gating + stars), and returns per-question results. The browser never
   grades and never decides the score itself — same contract science and math
   use (see docs/MULTI-SESSION.md §2).

   The page sets:  window.WL_QUIZ = { quizId, module, passMin }
   and provides an empty <div id="app"></div>.
   ============================================================================ */
(function () {
  "use strict";

  var cfg = window.WL_QUIZ || {};
  var app = document.getElementById("app");
  if (!cfg.quizId || !app) { if (app) app.textContent = "This checkpoint could not load."; return; }

  injectStyles();

  var quiz, answers = {}, submitted = false;
  var url = new URL("../../../quizzes/writing/" + cfg.quizId + ".json", location.href).href;
  fetch(url).then(function (r) { if (!r.ok) throw new Error("not found"); return r.json(); })
    .then(build)
    .catch(function () { app.innerHTML = '<p class="muted">Could not load this checkpoint’s questions.</p>'; });

  function build(q) {
    quiz = q;
    var total = (quiz.questions || []).length;
    var passMin = cfg.passMin != null ? cfg.passMin : (quiz.passMin != null ? quiz.passMin : 0.8);
    var need = Math.ceil(passMin * total);

    document.title = quiz.title + " — Writing Lab";
    app.innerHTML =
      '<div class="eyebrow">' + esc(quiz.unit || "Checkpoint") + ' · Checkpoint</div>' +
      '<h1 class="wq-title">' + esc(quiz.title) + '</h1>' +
      '<p class="muted wq-intro">' + esc(quiz.intro || "") + '</p>' +
      '<div class="wq-scorebar panel" id="wqBar">' +
        '<span class="wq-score" id="wqAnswered" aria-live="polite">0 / ' + total + ' answered</span>' +
        '<span class="wq-need">Pass: ' + need + ' / ' + total + ' (' + Math.round(passMin * 100) + '%)</span>' +
        '<span class="wq-spacer"></span>' +
        '<button class="btn primary" id="wqSubmit" disabled>Submit for grading</button>' +
      '</div>' +
      '<div class="wq-result" id="wqResult" hidden aria-live="polite"></div>' +
      '<div id="wqCards"></div>';

    var cards = document.getElementById("wqCards");
    (quiz.questions || []).forEach(function (Q, i) { cards.appendChild(card(Q, i)); });
    document.getElementById("wqSubmit").addEventListener("click", submit);
    updateCount();
  }

  function card(Q, i) {
    var c = el('<div class="panel pad wq-card" id="wq-' + Q.id + '">' +
      '<div class="wq-num">Question ' + (i + 1) + ' of ' + (quiz.questions || []).length + '</div>' +
      '<div class="wq-q">' + esc(Q.prompt) + '</div></div>');

    if (Q.type === "mc") {
      var wrap = el('<div class="wq-choices"></div>');
      (Q.choices || []).forEach(function (label, ci) {
        var b = el('<button class="wq-opt" type="button">' + esc(label) + '</button>');
        b.addEventListener("click", function () {
          if (submitted) return;
          answers[Q.id] = { id: Q.id, type: "mc", choice: ci };
          [].forEach.call(wrap.children, function (x) { x.classList.remove("sel"); });
          b.classList.add("sel"); updateCount();
        });
        wrap.appendChild(b);
      });
      c.appendChild(wrap);

    } else if (Q.type === "tf") {
      var tf = el('<div class="wq-tf"></div>');
      [["True", true], ["False", false]].forEach(function (pair) {
        var b = el('<button class="wq-opt" type="button">' + pair[0] + '</button>');
        b.addEventListener("click", function () {
          if (submitted) return;
          answers[Q.id] = { id: Q.id, type: "tf", choice: pair[1] };
          [].forEach.call(tf.children, function (x) { x.classList.remove("sel"); });
          b.classList.add("sel"); updateCount();
        });
        tf.appendChild(b);
      });
      c.appendChild(tf);
    }
    return c;
  }

  function updateCount() {
    var total = (quiz.questions || []).length;
    var done = Object.keys(answers).length;
    var a = document.getElementById("wqAnswered");
    if (a) a.textContent = done + " / " + total + (submitted ? " graded" : " answered");
    var b = document.getElementById("wqSubmit");
    if (b) b.disabled = done < total || submitted;
  }

  function submit() {
    if (submitted) return;
    var total = (quiz.questions || []).length;
    if (Object.keys(answers).length < total) return;
    submitted = true;
    var btn = document.getElementById("wqSubmit");
    btn.disabled = true; btn.textContent = "Grading…";

    var payload = {
      subject: "writing", module: cfg.module || quiz.slug, quizId: cfg.quizId,
      answers: (quiz.questions || []).map(function (Q) { return answers[Q.id]; })
    };
    FofaAccount.quiz(payload).then(function (res) {
      if (!res || !res.ok) {
        submitted = false; btn.disabled = false; btn.textContent = "Submit for grading";
        say("fail", "<b>Couldn't grade.</b> " + esc((res && res.error) || "Check your connection and try again."));
        return;
      }
      btn.style.display = "none";
      renderResults(res);
    });
  }

  function renderResults(res) {
    var byId = {}; (res.results || []).forEach(function (r) { byId[r.id] = r; });
    (quiz.questions || []).forEach(function (Q) {
      var r = byId[Q.id] || {}, c = document.getElementById("wq-" + Q.id);
      c.classList.add("done");
      var mine = answers[Q.id] || {};
      var ok = r.correct === true || (r.of && r.earned === r.of);

      var opts = c.querySelectorAll(".wq-opt");
      if (Q.type === "mc") {
        [].forEach.call(opts, function (b, i) {
          if (i === Q.answer) b.classList.add("correct");
          if (i === mine.choice && i !== Q.answer) b.classList.add("wrong");
        });
      } else if (Q.type === "tf") {
        var rightIdx = Q.answer === true ? 0 : 1, myIdx = mine.choice === true ? 0 : 1;
        opts[rightIdx].classList.add("correct");
        if (myIdx !== rightIdx) opts[myIdx].classList.add("wrong");
      }
      var box = el('<div class="wq-explain ' + (ok ? "ok" : "no") + '">' +
        (ok ? "✓ Correct. " : "✗ Not quite. ") + (Q.explain ? esc(Q.explain) : "") + '</div>');
      c.appendChild(box);
    });
    updateCount();

    var pct = res.max ? res.score / res.max : 0;
    var passMin = cfg.passMin != null ? cfg.passMin : 0.8;
    var pass = pct >= passMin;
    var stars = (res.stars != null) ? (" · ⭐ " + res.stars) : "";
    if (pass) {
      say("pass", "<b>✓ You passed — " + res.score + " / " + res.max + " (" + Math.round(pct * 100) + "%)" + stars +
        ".</b> Unit 1 complete! Tap Next below to keep going.");
      var cta = document.querySelector(".wl-next-cta");
      if (cta) cta.classList.add("is-ready");
    } else {
      say("fail", "<b>Not yet — " + res.score + " / " + res.max + " (" + Math.round(pct * 100) + "%).</b> " +
        "You need " + Math.round(passMin * 100) + "% to pass. Review the ✗ answers, then " +
        '<button class="wq-retry" type="button" onclick="location.reload()">try again</button>.');
    }
    document.getElementById("wqResult").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function say(kind, html) {
    var box = document.getElementById("wqResult");
    box.hidden = false; box.className = "wq-result " + kind; box.innerHTML = html;
  }

  /* ---- helpers ----------------------------------------------------------- */
  function el(html) { var d = document.createElement("template"); d.innerHTML = html.trim(); return d.content.firstElementChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  function injectStyles() {
    if (document.getElementById("wq-styles")) return;
    var css = "" +
      ".wq-title{font-family:var(--font);margin:.2em 0 .1em}" +
      ".wq-intro{max-width:64ch;font-size:16px;margin-top:0}" +
      ".wq-scorebar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:12px 16px;margin:16px 0 8px;position:sticky;top:64px;z-index:5}" +
      ".wq-score{font-weight:800;font-family:var(--ui-font);font-variant-numeric:tabular-nums}" +
      ".wq-need{color:var(--ink-mute);font-size:13px}" +
      ".wq-spacer{flex:1}" +
      ".wq-result{border-radius:12px;padding:14px 16px;margin:8px 0 4px;border:1px solid var(--line);font-size:15px}" +
      ".wq-result.pass{background:rgba(154,208,122,.12);border-color:rgba(154,208,122,.5)}" +
      ".wq-result.fail{background:rgba(255,154,168,.10);border-color:rgba(255,154,168,.45)}" +
      ".wq-retry{appearance:none;background:none;border:none;color:var(--accent);font:inherit;text-decoration:underline;cursor:pointer;padding:0}" +
      ".wq-card{margin:14px 0}" +
      ".wq-num{font-family:var(--ui-font);font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--accent)}" +
      ".wq-q{font-family:var(--font);font-size:19px;margin:6px 0 12px;line-height:1.4}" +
      ".wq-choices{display:grid;gap:8px}" +
      ".wq-tf{display:flex;gap:10px}" +
      ".wq-opt{appearance:none;text-align:left;cursor:pointer;border:1px solid var(--line);background:var(--panel-2);color:var(--ink);" +
        "font:600 15px/1.3 var(--ui-font);padding:11px 14px;border-radius:10px;transition:background .12s ease,border-color .12s ease}" +
      ".wq-tf .wq-opt{flex:1;text-align:center}" +
      ".wq-opt:hover:not(:disabled){background:#2c3454;border-color:#45507e}" +
      ".wq-opt.sel{background:#33407a;border-color:var(--accent)}" +
      ".wq-card.done .wq-opt{cursor:default}" +
      ".wq-opt.correct{background:rgba(154,208,122,.22);border-color:var(--good,#9ad07a);color:var(--ink)}" +
      ".wq-opt.wrong{background:rgba(255,122,144,.18);border-color:#ff7a90}" +
      ".wq-explain{margin-top:12px;font-size:14.5px;color:var(--ink-soft);border-top:1px dashed var(--line);padding-top:10px}" +
      ".wq-explain.ok{color:var(--good,#9ad07a)}" +
      ".wq-explain.no{color:#ffb3bd}" +
      ".wq-opt:focus-visible{outline:2px solid var(--accent);outline-offset:2px}";
    var st = document.createElement("style");
    st.id = "wq-styles"; st.textContent = css;
    document.head.appendChild(st);
  }
})();
