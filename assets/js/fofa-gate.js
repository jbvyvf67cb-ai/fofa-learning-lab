/* ============================================================================
   fofa-gate.js — login guard + sequential lesson gating (client side)
   ----------------------------------------------------------------------------
   Include on the Fofa landing and the subject landing pages. It:
     1. redirects to the login page if nobody is logged in;
     2. shows a "who's logged in / log out" chip;
     3. on a subject landing, fetches server state and locks/marks each module
        card so a lesson is clickable only once the previous one is complete.

   Gating status comes from FofaAccount.state() (server-authoritative in the real
   backend; computed from curriculum/index.json in mock mode). Requires
   fofa-account.js to be loaded first.
   ============================================================================ */
(function () {
  "use strict";
  if (!window.FofaAccount) { console.warn("fofa-gate: fofa-account.js must load first"); return; }

  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var SITE_ROOT = scriptSrc.replace(/assets\/js\/fofa-gate\.js.*$/, "");

  // 1) Login guard
  if (!FofaAccount.isLoggedIn()) {
    location.replace(SITE_ROOT + "login.html?next=" + encodeURIComponent(location.href));
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectStyles();
    injectUserChip();
    var subject = detectSubject();
    if (subject) applyGating(subject);
  });

  function detectSubject() {
    var p = location.pathname;
    if (/\/science\//.test(p)) return "science";
    if (/\/writing\//.test(p)) return "writing";
    if (/\/math\//.test(p)) return "math";
    if (/\/reading\//.test(p)) return "reading";
    return null; // Fofa root — no card gating, just the guard + chip
  }

  function injectStyles() {
    var s = document.createElement("style");
    s.textContent =
      ".fofa-userchip{position:fixed;top:10px;right:12px;z-index:60;display:flex;align-items:center;gap:8px;" +
      "font:600 13px/1 var(--font-ui,sans-serif);background:rgba(29,34,56,.9);border:1px solid var(--line);" +
      "border-radius:999px;padding:6px 10px;color:var(--ink);backdrop-filter:blur(6px)}" +
      ".fofa-userchip a{color:var(--accent);cursor:pointer}" +
      ".fofa-lock{position:relative}" +
      ".fofa-lock.is-locked{opacity:.55;filter:grayscale(.4)}" +
      ".fofa-badge{position:absolute;top:8px;right:8px;z-index:2;font-size:12px;font-weight:700;" +
      "border-radius:999px;padding:3px 9px;border:1px solid var(--line);background:rgba(15,18,32,.85)}" +
      ".fofa-badge.done{color:var(--good,#56d3a0);border-color:var(--good,#56d3a0)}" +
      ".fofa-badge.locked{color:var(--warn,#ffc857)}" +
      ".fofa-badge.next{color:var(--accent,#7c9cff);border-color:var(--accent,#7c9cff)}" +
      ".fofa-locknote{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:70;" +
      "background:var(--panel-2,#262c47);border:1px solid var(--line);border-radius:10px;padding:10px 14px;" +
      "color:var(--ink);font:14px var(--font-ui,sans-serif);box-shadow:var(--shadow);opacity:0;transition:opacity .2s}" +
      ".fofa-locknote.show{opacity:1}";
    document.head.appendChild(s);
  }

  function injectUserChip() {
    var chip = document.createElement("div");
    chip.className = "fofa-userchip";
    chip.innerHTML = "👤 " + (FofaAccount.student() || "Student") + " · <a id='fofaLogout'>Log out</a>";
    document.body.appendChild(chip);
    chip.querySelector("#fofaLogout").addEventListener("click", function () {
      FofaAccount.logout();
      location.replace(SITE_ROOT + "login.html");
    });
  }

  function note(text) {
    var n = document.querySelector(".fofa-locknote");
    if (!n) { n = document.createElement("div"); n.className = "fofa-locknote"; document.body.appendChild(n); }
    n.textContent = text; n.classList.add("show");
    clearTimeout(n._t); n._t = setTimeout(function () { n.classList.remove("show"); }, 2600);
  }

  function applyGating(subject) {
    Promise.all([FofaAccount.state(), fetchCurriculum()]).then(function (arr) {
      var state = arr[0], cur = arr[1];
      if (!state || !state.ok) return;
      var lessons = (cur.subjects[subject] && cur.subjects[subject].lessons) || [];
      var anchors = Array.prototype.slice.call(document.querySelectorAll("a[href]"));

      lessons.forEach(function (L, i) {
        var key = subject + "/" + L.module;
        var st = (state.lessons && state.lessons[key]) || { status: i === 0 ? "unlocked" : "locked" };
        // find the card <a> whose href points at this lesson's folder
        var card = anchors.filter(function (a) {
          var href = a.getAttribute("href") || "";
          return new RegExp("(^|/)" + escapeRe(L.slug) + "/").test(href);
        })[0];
        if (!card) return;
        card.classList.add("fofa-lock");

        if (st.status === "complete") {
          badge(card, "done", "✓ Done");
        } else if (st.status === "locked") {
          card.classList.add("is-locked");
          var prevTitle = i > 0 ? lessons[i - 1].title : "the previous lesson";
          badge(card, "locked", "🔒 Locked");
          card.addEventListener("click", function (e) {
            e.preventDefault();
            note("Finish “" + prevTitle + "” first to unlock this.");
          });
        } else {
          // unlocked but not complete → mark the current step
          var anyDone = lessons.some(function (LL) {
            var s2 = state.lessons[subject + "/" + LL.module];
            return s2 && s2.status === "complete";
          });
          badge(card, "next", anyDone ? "▶ Next" : "▶ Start");
        }
      });
    });
  }

  function badge(card, kind, text) {
    // ensure the card can host an absolutely-positioned badge
    var pos = getComputedStyle(card).position;
    if (pos === "static") card.style.position = "relative";
    var b = document.createElement("span");
    b.className = "fofa-badge " + kind;
    b.textContent = text;
    card.appendChild(b);
  }

  var _cur = null;
  function fetchCurriculum() {
    if (_cur) return Promise.resolve(_cur);
    return fetch(SITE_ROOT + "curriculum/index.json").then(function (r) { return r.json(); }).then(function (c) { _cur = c; return c; });
  }
  function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
})();
