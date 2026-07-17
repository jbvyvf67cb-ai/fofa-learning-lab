/* ============================================================================
   wl-nav.js — shared "what's next" navigation for Writing Lab lessons.
   ----------------------------------------------------------------------------
   Include on any lesson page. It knows the canonical order of Unit 1, finds
   where the current page sits, and drops a prominent Next button (plus a quiet
   Previous link and a way back up to the Writing Lab) just above the footer.

   This replaces the old tiny top-right "Next →" links, which had drifted out
   of order. Order lives here, in ONE place, so it can't disagree with itself.
   The order mirrors curriculum/index.json.
   ============================================================================ */
(function () {
  "use strict";

  // Canonical path. Unit 1 (intro → learn each part of speech → practice games)
  // is public; Unit 2 is marked beta and only chains forward when the page is
  // opened with ?beta=1, so the public path still ends cleanly at Unit 1.
  var SEQUENCE = [
    { slug: "sentence-anatomy",           title: "Sentence Anatomy" },
    { slug: "nouns",                      title: "Nouns" },
    { slug: "pronouns",                   title: "Pronouns" },
    { slug: "verbs",                      title: "Verbs" },
    { slug: "adjectives",                 title: "Adjectives" },
    { slug: "adverbs",                    title: "Adverbs" },
    { slug: "word-sort",                  title: "Word Sort" },
    { slug: "parts-of-speech-detective",  title: "Part-of-Speech Detective" },
    { slug: "word-shape-lab",             title: "Word-Shape Lab" },
    { slug: "parts-of-speech-quiz",       title: "Parts of Speech · Checkpoint" },
    { slug: "subject-predicate",          title: "Subject & Predicate",          beta: true },
    { slug: "subject-predicate-splitter", title: "Subject & Predicate Splitter", beta: true },
    { slug: "sentence-builder",           title: "Sentence Builder",             beta: true },
    { slug: "complete-or-fragment",       title: "Complete or Fragment?",        beta: true },
  ];

  var m = location.pathname.match(/\/visualizations\/([^\/]+)\//);
  if (!m) return;
  var slug = m[1];
  var i = SEQUENCE.findIndex(function (s) { return s.slug === slug; });
  if (i === -1) return;              // page not in the track

  var betaOn = new URLSearchParams(location.search).get("beta") === "1";
  var q = betaOn ? "?beta=1" : "";
  var prev = i > 0 ? SEQUENCE[i - 1] : null;
  var rawNext = i < SEQUENCE.length - 1 ? SEQUENCE[i + 1] : null;
  // A beta next only counts as a "real" next when we're browsing in beta.
  var next = (rawNext && (betaOn || !rawNext.beta)) ? rawNext : null;
  // Reaching a beta boundary on the public path = end of Unit 1.
  var atUnit1End = !next && rawNext && rawNext.beta && !betaOn;

  injectStyles();

  var nav = document.createElement("nav");
  nav.className = "wl-next-cta";
  nav.setAttribute("aria-label", "Lesson navigation");

  var inner = document.createElement("div");
  inner.className = "wl-next-inner wrap";

  // Up to the Writing Lab home.
  inner.appendChild(el('<a class="wl-home" href="../../">⌂ Writing&nbsp;Lab</a>'));

  var right = document.createElement("div");
  right.className = "wl-next-right";

  if (prev) {
    right.appendChild(el('<a class="wl-prevlink" href="../' + prev.slug + '/' + q + '">‹ ' + esc(prev.title) + '</a>'));
  }

  if (next) {
    right.appendChild(el(
      '<a class="wl-next-btn" href="../' + next.slug + '/' + q + '">' +
        '<span class="wl-next-kicker">Next lesson</span>' +
        '<span class="wl-next-label">' + esc(next.title) + ' &nbsp;›</span>' +
      '</a>'));
  } else {
    // End of the visible path — send them back to the lab, with a nod that
    // reflects where they are (end of Unit 1, or end of the beta preview).
    var kicker = atUnit1End ? "You finished Unit&nbsp;1 🎉"
               : SEQUENCE[i].beta ? "End of the preview 🎉"
               : "You finished Unit&nbsp;1 🎉";
    right.appendChild(el(
      '<a class="wl-next-btn" href="../../">' +
        '<span class="wl-next-kicker">' + kicker + '</span>' +
        '<span class="wl-next-label">Back to Writing&nbsp;Lab &nbsp;›</span>' +
      '</a>'));
  }

  inner.appendChild(right);
  nav.appendChild(inner);

  var foot = document.querySelector("footer.site-foot") || document.querySelector("footer");
  if (foot && foot.parentNode) foot.parentNode.insertBefore(nav, foot);
  else document.body.appendChild(nav);

  /* ---- helpers ----------------------------------------------------------- */
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  function injectStyles() {
    if (document.getElementById("wl-nav-styles")) return;
    var css = "" +
      ".wl-next-cta{margin-top:52px;border-top:1px solid var(--line);" +
        "background:linear-gradient(180deg,transparent,rgba(124,156,255,.05))}" +
      ".wl-next-inner{display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding-top:22px;padding-bottom:22px}" +
      ".wl-home{color:var(--ink-soft);font-size:14px;font-weight:600;white-space:nowrap}" +
      ".wl-next-right{margin-left:auto;display:flex;align-items:center;gap:16px;flex-wrap:wrap}" +
      ".wl-prevlink{color:var(--ink-mute);font-size:14px;white-space:nowrap}" +
      ".wl-next-btn{display:inline-flex;flex-direction:column;gap:2px;text-decoration:none;" +
        "background:var(--accent);color:#10131f;border-radius:14px;padding:12px 22px;" +
        "box-shadow:0 6px 18px rgba(124,156,255,.28);transition:transform .1s ease,box-shadow .1s ease}" +
      ".wl-next-btn:hover{transform:translateY(-2px);text-decoration:none;box-shadow:0 10px 26px rgba(124,156,255,.4)}" +
      ".wl-next-btn:focus-visible{outline:2px solid var(--ink);outline-offset:3px}" +
      ".wl-next-kicker{font-family:var(--ui-font);font-size:11px;font-weight:800;text-transform:uppercase;" +
        "letter-spacing:.1em;opacity:.75}" +
      ".wl-next-label{font-family:var(--font);font-size:19px;font-weight:700;line-height:1.1}" +
      /* When a lesson signals completion, pulse the Next button once. */
      ".wl-next-cta.is-ready .wl-next-btn{animation:wl-pop .5s ease}" +
      "@keyframes wl-pop{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}" +
      "@media (max-width:560px){.wl-next-right{width:100%;margin-left:0;justify-content:space-between}}" +
      "@media (prefers-reduced-motion: reduce){.wl-next-cta.is-ready .wl-next-btn{animation:none}}";
    var st = document.createElement("style");
    st.id = "wl-nav-styles";
    st.textContent = css;
    document.head.appendChild(st);
  }
})();
