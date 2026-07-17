/* ============================================================
   quiz-shell.js — a graded quiz for the math subject
   ------------------------------------------------------------
   Renders a quiz bank (from quizzes/<subject>/<quizId>.json), collects the
   student's ANSWERS, and submits them to the authenticated backend via the
   Lab-owned client `FofaAccount.quiz()` (which POSTs /api/fofa/quiz, or grades
   in the built-in mock). The server grades every question by type — including
   free-response via Claude — records the result (so it counts toward gating and
   stars), and returns per-question results + updated state. The client never
   grades and never sends answer keys.

   The page sets:  window.QUIZ = { subject, module, quizId, passMin, next? }
   and provides an empty <div id="quiz-root"></div>.
   ============================================================ */
"use strict";

(function () {
  var src = (document.currentScript && document.currentScript.src) || "";
  var ROOT = src.replace(/math\/assets\/js\/quiz-shell\.js.*$/, "");

  var cfg, quiz, answers = {}, root, submitted = false;

  document.addEventListener("DOMContentLoaded", function () {
    cfg = window.QUIZ || {};
    root = document.getElementById("quiz-root");
    if (!root) return;
    fetch(ROOT + "quizzes/" + cfg.subject + "/" + cfg.quizId + ".json")
      .then(function (r) { if (!r.ok) throw new Error("quiz not found"); return r.json(); })
      .then(build)
      .catch(function (e) { root.innerHTML = '<div class="qz">Could not load the quiz (' + esc(String(e.message || e)) + ").</div>"; });
  });

  var esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]; }); };
  var TYPE_LABEL = { mc: "choose one", tf: "true / false", numeric: "number", free: "written" };

  function build(q) {
    quiz = q;
    root.innerHTML = "";
    (quiz.questions || []).forEach(function (Q, i) { root.appendChild(card(Q, i)); });

    var row = el('<div class="qz-submitrow"></div>');
    var btn = el('<button id="qzSubmit" disabled>Submit for grading</button>');
    var cnt = el('<span class="qz-answered" id="qzAnswered"></span>');
    btn.onclick = submit;
    row.appendChild(btn); row.appendChild(cnt);
    root.appendChild(row);
    root.appendChild(el('<div id="qzResult"></div>'));
    updateCount();
  }

  function card(Q, i) {
    var c = el('<div class="qz" id="qz-' + Q.id + '"></div>');
    c.innerHTML = '<span class="qz-type">' + (TYPE_LABEL[Q.type] || Q.type) + '</span>' +
      '<div class="qz-num">Question ' + (i + 1) + '</div>' +
      '<div class="qz-prompt">' + Q.prompt + '</div>';

    if (Q.type === "mc") {
      var ch = el('<div class="qz-choices"></div>');
      (Q.choices || []).forEach(function (label, ci) {
        var b = el('<button class="qz-choice">' + esc(label) + '</button>');
        b.onclick = function () {
          if (submitted) return;
          answers[Q.id] = { id: Q.id, type: "mc", choice: ci };
          ch.querySelectorAll(".qz-choice").forEach(function (x) { x.classList.remove("sel"); });
          b.classList.add("sel"); updateCount();
        };
        ch.appendChild(b);
      });
      c.appendChild(ch);
    } else if (Q.type === "tf") {
      var tf = el('<div class="qz-tf"></div>');
      [["True", true], ["False", false]].forEach(function (pair) {
        var b = el('<button class="qz-choice">' + pair[0] + '</button>');
        b.onclick = function () {
          if (submitted) return;
          answers[Q.id] = { id: Q.id, type: "tf", choice: pair[1] };
          tf.querySelectorAll(".qz-choice").forEach(function (x) { x.classList.remove("sel"); });
          b.classList.add("sel"); updateCount();
        };
        tf.appendChild(b);
      });
      c.appendChild(tf);
    } else if (Q.type === "numeric") {
      var inp = el('<input class="qz-num-input" type="number" inputmode="decimal" placeholder="your answer" />');
      inp.oninput = function () {
        if (submitted) return;
        if (inp.value.trim() === "") delete answers[Q.id];
        else answers[Q.id] = { id: Q.id, type: "numeric", value: parseFloat(inp.value) };
        updateCount();
      };
      c.appendChild(inp);
    } else if (Q.type === "free") {
      var ta = el('<textarea class="qz-free-input" placeholder="Write a sentence or two…"></textarea>');
      ta.oninput = function () {
        if (submitted) return;
        var t = ta.value.trim();
        if (!t) delete answers[Q.id];
        else answers[Q.id] = { id: Q.id, type: "free", response: { kind: "text", text: ta.value } };
        updateCount();
      };
      c.appendChild(ta);
    }
    return c;
  }

  function updateCount() {
    var total = (quiz.questions || []).length;
    var done = Object.keys(answers).length;
    var a = document.getElementById("qzAnswered");
    if (a) a.textContent = done + " / " + total + " answered";
    var b = document.getElementById("qzSubmit");
    if (b) b.disabled = done < total || submitted;
  }

  function submit() {
    if (submitted) return;
    var total = (quiz.questions || []).length;
    if (Object.keys(answers).length < total) return;
    submitted = true;
    var btn = document.getElementById("qzSubmit");
    btn.disabled = true; btn.textContent = "Grading…";
    var payload = { subject: cfg.subject, module: cfg.module, quizId: cfg.quizId,
      answers: (quiz.questions || []).map(function (Q) { return answers[Q.id]; }) };

    FofaAccount.quiz(payload).then(function (res) {
      btn.style.display = "none";
      if (!res || !res.ok) {
        document.getElementById("qzResult").innerHTML = '<div class="qz-result fail"><h2>Couldn\'t grade</h2>' +
          '<div class="sub">' + esc((res && res.error) || "unknown error") + " — check your connection and try again.</div></div>";
        submitted = false; return;
      }
      renderResults(res);
    });
  }

  function renderResults(res) {
    var byId = {}; (res.results || []).forEach(function (r) { byId[r.id] = r; });
    var qById = {}; (quiz.questions || []).forEach(function (Q) { qById[Q.id] = Q; });

    (quiz.questions || []).forEach(function (Q) {
      var r = byId[Q.id] || {}, c = document.getElementById("qz-" + Q.id);
      c.classList.add("graded", "locked");
      var mine = answers[Q.id] || {};
      var full = r.correct === true || (r.of && r.earned === r.of);
      var part = !full && r.earned > 0;
      var cls = full ? "ok" : (part ? "part" : "no");

      // mark the choices
      if (Q.type === "mc") {
        var btns = c.querySelectorAll(".qz-choice");
        btns.forEach(function (b, i) {
          if (i === Q.answer) b.classList.add("right");
          if (i === mine.choice && i !== Q.answer) b.classList.add("wrongsel");
        });
      } else if (Q.type === "tf") {
        var tfb = c.querySelectorAll(".qz-choice"); // [True, False]
        var rightIdx = Q.answer === true ? 0 : 1, myIdx = mine.choice === true ? 0 : 1;
        tfb[rightIdx].classList.add("right");
        if (myIdx !== rightIdx) tfb[myIdx].classList.add("wrongsel");
      } else if (Q.type === "numeric") {
        var inp = c.querySelector(".qz-num-input"); inp.disabled = true;
      } else if (Q.type === "free") {
        var ta = c.querySelector(".qz-free-input"); ta.disabled = true;
      }

      var mark = full ? "✓ " + (r.earned != null ? r.earned + "/" + r.of : "correct")
        : (part ? "◐ " + r.earned + "/" + r.of : "✗ " + (r.earned != null ? r.earned + "/" + r.of : "0"));
      c.querySelector(".qz-num").insertAdjacentHTML("beforeend", '<span class="qz-mark ' + cls + '">' + mark + "</span>");

      var fb = "";
      if (r.feedback) fb += "<b>Feedback:</b> " + esc(r.feedback) + "<br>";
      if (Q.explain) fb += esc(Q.explain);
      if (fb) { var e = el('<div class="qz-explain ' + cls + '">' + fb + "</div>"); c.appendChild(e); }
    });

    // summary
    var pct = res.max ? res.score / res.max : 0;
    var passMin = cfg.passMin != null ? cfg.passMin : 0.7;
    var pass = pct >= passMin;
    var box = el('<div class="qz-result ' + (pass ? "pass" : "fail") + '"></div>');
    var actHtml = pass
      ? (cfg.next ? '<a class="fofa-btn primary next" href="' + cfg.next.url + '">' + esc(cfg.next.title) + " →</a>" : "") +
        '<a class="fofa-btn" href="../../">← Back to Math</a>'
      : '<button class="fofa-btn primary" onclick="location.reload()">Try again</button>' +
        '<a class="fofa-btn" href="../../">Review the lessons</a>';
    box.innerHTML =
      "<h2>" + (pass ? "🎉 Unit passed!" : "Almost there") + "</h2>" +
      '<div class="pctbig">' + Math.round(pct * 100) + "%</div>" +
      '<div class="sub">You scored <b>' + res.score + " / " + res.max + "</b>" +
      (pass ? " — above the " + Math.round(passMin * 100) + "% needed to pass." :
        " — you need " + Math.round(passMin * 100) + "% to pass. Look over the ✗ questions and try again.") + "</div>" +
      (window.FofaAccount && FofaAccount.isMock() ? '<div class="sub" style="font-size:.82rem;color:var(--ink-dim)">Demo mode: written answers auto-pass; connect Home Assistant for real AI grading &amp; stars.</div>' : "") +
      '<div class="act">' + actHtml + "</div>";
    document.getElementById("qzResult").appendChild(box);
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
})();
