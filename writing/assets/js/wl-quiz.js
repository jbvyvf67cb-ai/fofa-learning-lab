/* ============================================================================
   wl-quiz.js — shared engine for Writing Lab checkpoint quizzes.
   ----------------------------------------------------------------------------
   A checkpoint page sets `window.WL_QUIZ = "parts-of-speech"` and provides an
   empty <div id="app">. This script fetches quizzes/writing/<id>.json, renders
   the questions, scores them, and reports the result through the same pipeline
   science uses — FofaAccount.progress({ activity:"quiz", kind:"quiz", ... }) —
   so the curriculum's { "type":"quiz", "min":0.8 } gate can hard-gate the next
   unit exactly like a science module.

   Question types: mc (multiple choice), tf (true/false), tap (click the word).
   ============================================================================ */
(function () {
  "use strict";

  var id = window.WL_QUIZ;
  var app = document.getElementById("app");
  if (!id || !app) { if (app) app.textContent = "This checkpoint could not load."; return; }

  injectStyles();

  var url = new URL("../../../quizzes/writing/" + id + ".json", location.href).href;
  fetch(url).then(function (r) { return r.json(); }).then(build).catch(function () {
    app.innerHTML = '<p class="muted">Could not load this checkpoint’s questions.</p>';
  });

  function build(data) {
    var questions = data.questions || [];
    var total = questions.length;
    var pass = typeof data.pass === "number" ? data.pass : 0.8;
    var need = Math.ceil(pass * total);
    var answered = {};   // index -> boolean correct

    document.title = data.title + " — Writing Lab";
    app.innerHTML =
      '<div class="eyebrow">' + esc(data.unit || "Checkpoint") + ' · Checkpoint</div>' +
      '<h1 class="wq-title">' + esc(data.title) + '</h1>' +
      '<p class="muted wq-intro">' + esc(data.intro || "") + '</p>' +
      '<div class="wq-scorebar panel" id="wqBar">' +
        '<span class="wq-score" id="wqScore" aria-live="polite">0 / ' + total + ' answered</span>' +
        '<span class="wq-need">Pass: ' + need + ' / ' + total + ' (' + Math.round(pass * 100) + '%)</span>' +
        '<span class="wq-spacer"></span>' +
        '<button class="btn ghost" id="wqReset" hidden>Reset &amp; try again</button>' +
      '</div>' +
      '<div class="wq-result" id="wqResult" hidden aria-live="polite"></div>' +
      '<div id="wqCards"></div>';

    var cards = document.getElementById("wqCards");
    questions.forEach(function (q, i) { cards.appendChild(renderCard(q, i)); });
    document.getElementById("wqReset").addEventListener("click", function () { build(data); });

    function record(i, ok) {
      answered[i] = ok;
      var count = Object.keys(answered).length;
      var correct = Object.values(answered).filter(Boolean).length;
      document.getElementById("wqScore").textContent =
        count < total ? (count + " / " + total + " answered") : (correct + " / " + total + " correct");
      if (count === total) finish(correct);
    }

    function finish(correct) {
      var passed = correct >= need;
      var box = document.getElementById("wqResult");
      box.hidden = false;
      box.className = "wq-result " + (passed ? "pass" : "fail");
      box.innerHTML = passed
        ? "<b>✓ You passed — " + correct + " / " + total + ".</b> Unit 1 complete! Tap Next below to keep going."
        : "<b>Not yet — you scored " + correct + " / " + total + ".</b> You need " + need +
          " to pass. Review the ones marked ✗, then reset and try again.";
      document.getElementById("wqReset").hidden = false;
      if (passed) {
        var cta = document.querySelector(".wl-next-cta");
        if (cta) cta.classList.add("is-ready");
        box.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      report(correct, total);
    }

    function renderCard(q, i) {
      var card = el('<div class="panel pad wq-card" id="wq-' + i + '">' +
        '<div class="wq-num">Question ' + (i + 1) + ' of ' + total + '</div>' +
        '<div class="wq-q">' + esc(q.prompt) + '</div></div>');
      var body = document.createElement("div");
      body.className = "wq-body";
      card.appendChild(body);

      if (q.type === "mc") {
        var wrap = document.createElement("div"); wrap.className = "wq-choices";
        q.choices.forEach(function (ch, ci) {
          var b = el('<button class="wq-opt" type="button">' + esc(ch) + '</button>');
          b.addEventListener("click", function () {
            if (card.classList.contains("done")) return;
            var ok = ci === q.answer;
            b.classList.add(ok ? "correct" : "wrong");
            if (!ok) wrap.children[q.answer].classList.add("correct");
            lock(card, ok, q.explain, i); record(i, ok);
          });
          wrap.appendChild(b);
        });
        body.appendChild(wrap);

      } else if (q.type === "tf") {
        var tf = document.createElement("div"); tf.className = "wq-tf";
        [["True", true], ["False", false]].forEach(function (pair) {
          var b = el('<button class="wq-opt" type="button">' + pair[0] + '</button>');
          b.addEventListener("click", function () {
            if (card.classList.contains("done")) return;
            var ok = pair[1] === q.answer;
            b.classList.add(ok ? "correct" : "wrong");
            lock(card, ok, q.explain, i); record(i, ok);
          });
          tf.appendChild(b);
        });
        body.appendChild(tf);

      } else if (q.type === "tap") {
        var line = document.createElement("div"); line.className = "wq-sentence";
        q.sentence.forEach(function (w, wi) {
          var b = el('<button class="wq-word" type="button">' + esc(w) + '</button>');
          b.addEventListener("click", function () {
            if (card.classList.contains("done")) return;
            var ok = wi === q.answer;
            b.classList.add(ok ? "correct" : "wrong");
            if (!ok) line.children[q.answer].classList.add("correct");
            lock(card, ok, q.explain, i); record(i, ok);
          });
          line.appendChild(b);
          line.appendChild(document.createTextNode(" "));
        });
        body.appendChild(line);
      }
      return card;
    }
  }

  function lock(card, ok, explain, i) {
    card.classList.add("done");
    var box = el('<div class="wq-explain ' + (ok ? "ok" : "no") + '">' +
      (ok ? "✓ Correct. " : "✗ Not quite. ") + (explain ? esc(explain) : "") + '</div>');
    card.appendChild(box);
  }

  function report(correct, total) {
    if (!window.FofaAccount) return;
    var m = location.pathname.match(/\/visualizations\/([^\/]+)\//);
    var slug = m ? m[1] : "parts-of-speech-quiz";
    try {
      FofaAccount.progress({ subject: "writing", module: slug, activity: "quiz", kind: "quiz", score: correct, max: total });
    } catch (e) {}
  }

  /* ---- helpers ----------------------------------------------------------- */
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
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
      ".wq-result{border-radius:12px;padding:14px 16px;margin:8px 0 4px;border:1px solid var(--line)}" +
      ".wq-result.pass{background:rgba(154,208,122,.12);border-color:rgba(154,208,122,.5)}" +
      ".wq-result.fail{background:rgba(255,154,168,.10);border-color:rgba(255,154,168,.45)}" +
      ".wq-card{margin:14px 0}" +
      ".wq-card.done{opacity:.96}" +
      ".wq-num{font-family:var(--ui-font);font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--accent)}" +
      ".wq-q{font-family:var(--font);font-size:19px;margin:6px 0 12px;line-height:1.4}" +
      ".wq-choices{display:grid;gap:8px}" +
      ".wq-tf{display:flex;gap:10px}" +
      ".wq-opt{appearance:none;text-align:left;cursor:pointer;border:1px solid var(--line);background:var(--panel-2);color:var(--ink);" +
        "font:600 15px/1.3 var(--ui-font);padding:11px 14px;border-radius:10px;transition:background .12s ease,border-color .12s ease}" +
      ".wq-tf .wq-opt{flex:1;text-align:center}" +
      ".wq-opt:hover:not(:disabled){background:#2c3454;border-color:#45507e}" +
      ".wq-card.done .wq-opt{cursor:default}" +
      ".wq-opt.correct{background:rgba(154,208,122,.22);border-color:var(--good,#9ad07a);color:var(--ink)}" +
      ".wq-opt.wrong{background:rgba(255,122,144,.18);border-color:#ff7a90}" +
      ".wq-sentence{font-family:var(--font);font-size:clamp(20px,3.6vw,28px);line-height:2.1;text-align:center;padding:6px 4px}" +
      ".wq-word{font:inherit;cursor:pointer;color:var(--ink);background:transparent;border:2px solid transparent;" +
        "border-bottom-color:var(--line);border-radius:8px;padding:2px 8px;margin:2px 1px}" +
      ".wq-word:hover:not(:disabled){background:rgba(255,255,255,.06)}" +
      ".wq-card.done .wq-word{cursor:default}" +
      ".wq-word.correct{background:var(--good,#9ad07a);border-color:var(--good,#9ad07a);color:#10131f;font-weight:600}" +
      ".wq-word.wrong{background:rgba(255,122,144,.25);border-color:#ff7a90}" +
      ".wq-explain{margin-top:12px;font-size:14.5px;color:var(--ink-soft);border-top:1px dashed var(--line);padding-top:10px}" +
      ".wq-explain.ok{color:var(--good,#9ad07a)}" +
      ".wq-explain.no{color:#ffb3bd}" +
      ".wq-opt:focus-visible,.wq-word:focus-visible{outline:2px solid var(--accent);outline-offset:2px}";
    var st = document.createElement("style");
    st.id = "wq-styles"; st.textContent = css;
    document.head.appendChild(st);
  }
})();
