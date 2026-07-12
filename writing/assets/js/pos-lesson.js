/* ============================================================================
   pos-lesson.js — shared engine for the part-of-speech "learn to spot it"
   lessons (nouns, verbs, adjectives, adverbs).
   ----------------------------------------------------------------------------
   A lesson page sets `window.WL_POS` (e.g. "noun") and provides an empty
   <div id="app"></div>. This script then builds the whole lesson from the
   shared dataset in grammar.js, so all four lessons stay perfectly consistent
   and there is one place to improve them.

   Each lesson has three parts:
     1. What it is        — the plain-language definition + colored examples.
     2. How to spot it    — quick tests, plus an OPTIONAL color-coded worked
                            example the learner can reveal.
     3. Practice          — tap every word of this part of speech across a set
                            of sentences. A wrong tap never just buzzes: it
                            explains what that word actually is and nudges you
                            back toward the target.

   Requires grammar.js. Uses FofaAccount (if present) to record a visit on load
   and completion when every sentence is solved.
   ============================================================================ */
(function () {
  "use strict";

  var G = window.WL_GRAMMAR;
  var POS = window.WL_POS;
  var app = document.getElementById("app");
  if (!G || !POS || !app) {
    if (app) app.textContent = "This lesson could not load its data.";
    return;
  }

  var part   = G.PARTS[POS];              // label / color / blurb / examples
  var lesson = G.POS_LESSONS[POS];        // task / intro / nudge / spot / example
  var COLOR  = part.color;

  /* Sentences that contain at least one target word (all of ours do), capped
     so a lesson stays short and finishable. */
  var SENTENCES = G.SPOT_SENTENCES
    .filter(function (s) { return s.tokens.some(function (t) { return t.pos === POS; }); })
    .slice(0, 6);

  /* ---- one-time styles --------------------------------------------------- */
  injectStyles();

  /* ---- page scaffold ----------------------------------------------------- */
  document.title = part.label + "s — Writing Lab";
  app.innerHTML =
    '<div class="eyebrow">Unit 1 · Parts of speech</div>' +
    '<h1 class="pl-title">' + part.label + 's</h1>' +
    '<p class="muted pl-tagline">' + esc(lesson.intro) + '</p>' +

    '<section class="panel pad pl-teach">' +
      '<h2 class="pl-h2">What is ' + article(part.label) + ' ' + part.label.toLowerCase() + '?</h2>' +
      '<p class="pl-blurb">' + esc(part.blurb) + '</p>' +
      '<div class="pl-exwrap"><span class="pl-exlabel">For example:</span> <span id="plExamples"></span></div>' +

      '<h2 class="pl-h2" style="margin-top:22px">How to spot ' + article(part.label) + ' ' + part.label.toLowerCase() + '</h2>' +
      '<ol class="pl-spot" id="plSpot"></ol>' +

      '<button class="btn ghost pl-reveal-toggle" id="plExplainBtn" aria-expanded="false">' +
        'Show a worked example ▾</button>' +
      '<div class="pl-explain" id="plExplain" hidden></div>' +
    '</section>' +

    '<section class="panel pad pl-practice">' +
      '<div class="pl-practice-head">' +
        '<h2 class="pl-h2" style="margin:0">Now you try</h2>' +
        '<span class="pl-progress" id="plProgress"></span>' +
      '</div>' +
      '<p class="pl-task" id="plTask"><span class="pl-dot" style="background:' + COLOR + '"></span>' +
        esc(lesson.task) + '</p>' +
      '<div class="pl-sentence" id="plSentence" role="group" aria-label="Tap words in the sentence."></div>' +
      '<p class="pl-feedback" id="plFeedback" aria-live="polite"></p>' +
      '<div class="pl-controls">' +
        '<button class="btn ghost" id="plReveal">Show me</button>' +
        '<button class="btn primary" id="plNext" hidden>Next sentence ›</button>' +
      '</div>' +
    '</section>';

  /* ---- examples chips ---------------------------------------------------- */
  var elExamples = document.getElementById("plExamples");
  part.examples.forEach(function (w, i) {
    var chip = document.createElement("span");
    chip.className = "pl-chip";
    chip.style.borderColor = COLOR;
    chip.style.color = COLOR;
    chip.textContent = w;
    elExamples.appendChild(chip);
    if (i < part.examples.length - 1) elExamples.appendChild(document.createTextNode(" "));
  });

  /* ---- how-to-spot list -------------------------------------------------- */
  var elSpot = document.getElementById("plSpot");
  lesson.spot.forEach(function (s) {
    var li = document.createElement("li");
    li.innerHTML = '<b>' + esc(s.test) + '</b><span class="pl-spot-ex">' + esc(s.ex) + '</span>';
    elSpot.appendChild(li);
  });

  /* ---- optional worked example (color-coded parse) ----------------------- */
  var explainBtn = document.getElementById("plExplainBtn");
  var explainBox = document.getElementById("plExplain");
  explainBox.appendChild(buildWorkedExample());
  explainBtn.addEventListener("click", function () {
    var open = explainBox.hidden;
    explainBox.hidden = !open;
    explainBtn.setAttribute("aria-expanded", String(open));
    explainBtn.textContent = open ? "Hide worked example ▴" : "Show a worked example ▾";
  });

  function buildWorkedExample() {
    var s = SENTENCES[lesson.example] || SENTENCES[0];
    var frag = document.createElement("div");
    frag.innerHTML =
      '<p class="pl-explain-lead">Every word has a color for its job. The ' +
      '<b style="color:' + COLOR + '">' + part.label.toLowerCase() + 's</b> are underlined and labeled — ' +
      'notice what makes each one ' + article(part.label) + ' ' + part.label.toLowerCase() + '.</p>';
    var line = document.createElement("div");
    line.className = "pl-explain-sentence";
    s.tokens.forEach(function (t) {
      var c = G.PARTS[t.pos].color;
      var isTarget = t.pos === POS;
      var span = document.createElement("span");
      span.className = "pl-ex-word" + (isTarget ? " is-target" : "");
      span.style.color = c;
      if (isTarget) span.style.borderColor = c;
      span.textContent = t.w;
      if (isTarget) {
        var tag = document.createElement("span");
        tag.className = "pl-ex-tag";
        tag.style.background = c;
        tag.textContent = G.PARTS[t.pos].label;
        span.appendChild(tag);
      }
      line.appendChild(span);
      line.appendChild(document.createTextNode(" "));
    });
    frag.appendChild(line);
    return frag;
  }

  /* ---- practice game ----------------------------------------------------- */
  var elSentence = document.getElementById("plSentence");
  var elFeedback = document.getElementById("plFeedback");
  var elProgress = document.getElementById("plProgress");
  var btnReveal  = document.getElementById("plReveal");
  var btnNext    = document.getElementById("plNext");

  var sIndex = 0;
  var solved = 0;           // sentences fully solved
  var targetsLeft = 0;
  var finished = false;

  function renderSentence() {
    var s = SENTENCES[sIndex];
    elSentence.innerHTML = "";
    elFeedback.textContent = "";
    elFeedback.className = "pl-feedback";
    btnNext.hidden = true;
    btnReveal.disabled = false;

    targetsLeft = s.tokens.filter(function (t) { return t.pos === POS; }).length;

    s.tokens.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pl-word";
      b.textContent = t.w;
      b.dataset.pos = t.pos;
      b.dataset.target = String(t.pos === POS);
      b.addEventListener("click", function () { onWord(b, t); });
      elSentence.appendChild(b);
      elSentence.appendChild(document.createTextNode(" "));
    });

    updateProgress();
  }

  function onWord(btn, token) {
    if (btn.classList.contains("found") || btn.disabled) return;

    if (token.pos === POS) {
      btn.classList.add("found");
      btn.style.background = COLOR;
      btn.style.borderColor = COLOR;
      btn.style.color = "#10131f";
      btn.insertAdjacentHTML("beforeend", '<span class="pl-check">✓</span>');
      targetsLeft--;
      if (targetsLeft === 0) {
        say("Nice — you found every " + part.label.toLowerCase() + " in this sentence!", "good");
        sentenceSolved();
      } else {
        say("Yes! " + cap(targetsLeft) + " to go.", "good");
      }
    } else {
      // Wrong tap: never just buzz — explain what the word actually is.
      btn.classList.remove("miss"); void btn.offsetWidth; btn.classList.add("miss");
      var real = G.PARTS[token.pos];
      say("“" + token.w + "” is " + article(real.label).toLowerCase() + " " +
          real.label.toLowerCase() + ", not " + article(part.label).toLowerCase() + " " +
          part.label.toLowerCase() + ". " + lesson.nudge, "bad");
    }
  }

  function sentenceSolved() {
    solved++;
    // Lock the sentence's remaining words so it reads as "done".
    [].forEach.call(elSentence.querySelectorAll(".pl-word"), function (w) {
      if (!w.classList.contains("found")) w.disabled = true;
    });
    btnReveal.disabled = true;
    updateProgress();
    if (sIndex < SENTENCES.length - 1) {
      btnNext.hidden = false;
      btnNext.focus();
    } else {
      finish();
    }
  }

  function updateProgress() {
    elProgress.textContent = "Sentence " + (sIndex + 1) + " of " + SENTENCES.length +
      "  ·  " + solved + " solved";
  }

  btnNext.addEventListener("click", function () {
    if (sIndex < SENTENCES.length - 1) { sIndex++; renderSentence(); }
  });

  btnReveal.addEventListener("click", function () {
    [].forEach.call(elSentence.querySelectorAll(".pl-word"), function (w) {
      if (w.dataset.target === "true" && !w.classList.contains("found")) {
        w.classList.add("hint");
        w.style.borderColor = COLOR;
        w.style.color = COLOR;
      }
    });
    say("The " + part.label.toLowerCase() + "s are outlined in " +
        colorName() + ". Tap them to check them off.", "hint");
  });

  function finish() {
    finished = true;
    elProgress.textContent = "All " + SENTENCES.length + " solved 🎉";
    say("You did it! You can now spot " + article(part.label).toLowerCase() + " " +
        part.label.toLowerCase() + " in a sentence. Tap Next below to keep going.", "good");
    report("complete", SENTENCES.length, SENTENCES.length);
    // Nudge the shared Next button into view if it exists.
    var next = document.querySelector(".wl-next-cta");
    if (next) next.classList.add("is-ready");
  }

  function say(msg, kind) {
    elFeedback.textContent = msg;
    elFeedback.className = "pl-feedback " + (kind || "");
  }

  renderSentence();

  /* ---- progress reporting ------------------------------------------------ */
  report("visit", 1, 1);   // records a visit so the next lesson unlocks

  function report(kind, score, max) {
    if (!window.FofaAccount) return;
    var m = location.pathname.match(/\/visualizations\/([^\/]+)\//);
    var slug = m ? m[1] : POS + "s";
    try {
      FofaAccount.progress({ subject: "writing", module: slug, activity: "spot", kind: kind, score: score, max: max });
    } catch (e) { /* non-fatal */ }
  }

  /* ---- helpers ----------------------------------------------------------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function cap(n) { return n + (n === 1 ? " more" : " more"); }
  function article(word) { return /^[aeiou]/i.test(word) ? "an" : "a"; }
  function colorName() {
    var names = { "#6fb3ff": "blue", "#ff7a90": "red", "#ffd166": "yellow", "#f0883e": "orange" };
    return names[COLOR] || "its color";
  }

  function injectStyles() {
    if (document.getElementById("pl-styles")) return;
    var css = "" +
      ".pl-title{font-family:var(--font);margin:.2em 0 .1em}" +
      ".pl-tagline{margin-top:0;max-width:64ch;font-size:16px}" +
      ".pl-h2{font-family:var(--font);font-size:21px;margin:0 0 8px}" +
      ".pl-teach{margin-top:18px}" +
      ".pl-blurb{font-size:17px;color:var(--ink-soft);margin:0 0 10px}" +
      ".pl-exwrap{color:var(--ink-mute);font-size:14px}" +
      ".pl-exlabel{color:var(--ink-mute)}" +
      ".pl-chip{display:inline-block;border:1px solid;border-radius:999px;padding:2px 11px;margin:2px 2px;" +
        "font-family:var(--font);font-size:15px;background:rgba(255,255,255,.03)}" +
      ".pl-spot{margin:6px 0 4px;padding-left:22px;display:grid;gap:10px}" +
      ".pl-spot li{color:var(--ink)}" +
      ".pl-spot li b{display:block;font-weight:700}" +
      ".pl-spot-ex{display:block;color:var(--ink-mute);font-size:14px;margin-top:1px}" +
      ".pl-reveal-toggle{margin-top:16px}" +
      ".pl-explain{margin-top:14px;border-top:1px dashed var(--line);padding-top:14px}" +
      ".pl-explain-lead{color:var(--ink-soft);font-size:14px;margin:0 0 12px}" +
      ".pl-explain-sentence{font-family:var(--font);font-size:clamp(20px,3.4vw,28px);line-height:2.4;text-align:center}" +
      ".pl-ex-word{position:relative;padding:0 2px}" +
      ".pl-ex-word.is-target{border-bottom:3px solid;border-radius:3px}" +
      ".pl-ex-tag{position:absolute;left:50%;transform:translateX(-50%);top:-1.15em;" +
        "font-family:var(--ui-font);font-size:9px;font-weight:800;color:#10131f;" +
        "padding:1px 5px;border-radius:5px;white-space:nowrap;letter-spacing:.02em}" +
      ".pl-practice{margin-top:20px}" +
      ".pl-practice-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}" +
      ".pl-progress{color:var(--ink-mute);font-size:13px;font-variant-numeric:tabular-nums}" +
      ".pl-task{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:600;margin:10px 0 14px}" +
      ".pl-dot{width:12px;height:12px;border-radius:50%;display:inline-block}" +
      ".pl-sentence{font-family:var(--font);font-size:clamp(22px,4vw,34px);line-height:2.2;" +
        "text-align:center;padding:18px 8px 8px;user-select:none}" +
      ".pl-word{font:inherit;cursor:pointer;color:var(--ink);background:transparent;" +
        "border:2px solid transparent;border-bottom-color:var(--line);border-radius:8px;" +
        "padding:2px 8px;margin:2px 1px;transition:transform .08s ease,background .12s ease,color .12s ease}" +
      ".pl-word:hover:not(:disabled):not(.found){transform:translateY(-2px);background:rgba(255,255,255,.06)}" +
      ".pl-word:focus-visible{outline:2px solid var(--accent);outline-offset:2px}" +
      ".pl-word:disabled{cursor:default;opacity:.5}" +
      ".pl-word.found{opacity:1;font-weight:600}" +
      ".pl-word.hint{background:rgba(255,255,255,.05)}" +
      ".pl-check{font-size:.55em;vertical-align:super;margin-left:2px}" +
      ".pl-word.miss{animation:pl-shake .32s}" +
      "@keyframes pl-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}" +
        "40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}" +
      ".pl-feedback{min-height:1.5em;margin:6px 2px 0;font-size:15px;text-align:center}" +
      ".pl-feedback.good{color:var(--good,#9ad07a)}" +
      ".pl-feedback.bad{color:#ff9aa8}" +
      ".pl-feedback.hint{color:var(--ink-soft)}" +
      ".pl-controls{display:flex;gap:10px;justify-content:center;margin-top:12px;flex-wrap:wrap}" +
      "@media (prefers-reduced-motion: reduce){.pl-word.miss{animation:none}}";
    var st = document.createElement("style");
    st.id = "pl-styles";
    st.textContent = css;
    document.head.appendChild(st);
  }
})();
