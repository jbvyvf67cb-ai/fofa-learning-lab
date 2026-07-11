/* ============================================================================
   fofa-lesson-guard.js — per-lesson access control (module pages)
   ----------------------------------------------------------------------------
   Include on every subject module page. It:
     1. requires a logged-in student (else → login);
     2. looks up this lesson in curriculum/index.json by its folder slug;
     3. if the server says the lesson is `locked`, blocks the page with an
        overlay and a way back to the subject — so a locked lesson can't be
        opened by typing its URL. Unlocked/complete lessons are untouched.

   Requires fofa-account.js loaded first. Lessons not listed in the curriculum
   (e.g. later-unit previews) are left open once logged in.
   ============================================================================ */
(function () {
  "use strict";
  if (!window.FofaAccount) { console.warn("fofa-lesson-guard: fofa-account.js must load first"); return; }

  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var SITE_ROOT = scriptSrc.replace(/assets\/js\/fofa-lesson-guard\.js.*$/, "");

  // 1) login required
  if (!FofaAccount.isLoggedIn()) {
    location.replace(SITE_ROOT + "login.html?next=" + encodeURIComponent(location.href));
    return;
  }

  // 2) which lesson is this?  /<subject>/visualizations/<slug>/...
  var m = location.pathname.match(/\/(science|writing|math|reading)\/visualizations\/([^\/]+)\//);
  if (!m) return;                 // not a recognizable module page
  var subject = m[1], slug = m[2];

  Promise.all([fetchJSON(SITE_ROOT + "curriculum/index.json"), FofaAccount.state()])
    .then(function (arr) {
      var cur = arr[0], state = arr[1];
      if (!cur) return;
      if (state && state.ok === false && state.error === "unauthorized") {
        location.replace(SITE_ROOT + "login.html?next=" + encodeURIComponent(location.href));
        return;
      }
      var lessons = (cur.subjects[subject] && cur.subjects[subject].lessons) || [];
      var i = -1;
      for (var k = 0; k < lessons.length; k++) { if (lessons[k].slug === slug) { i = k; break; } }
      if (i === -1) return;       // lesson not gated by the curriculum → leave open

      var key = subject + "/" + lessons[i].module;
      var st = state && state.lessons ? state.lessons[key] : null;
      // Fail OPEN on a missing/errored state (network blip) so a child is never
      // stranded; only an explicit "locked" blocks.
      if (st && st.status === "locked") {
        var prevTitle = i > 0 ? lessons[i - 1].title : "the previous lesson";
        block(prevTitle, cur.subjects[subject].title || subject);
      }
    });

  function block(prevTitle, subjectTitle) {
    document.documentElement.style.overflow = "hidden";
    var ov = document.createElement("div");
    ov.setAttribute("role", "alertdialog");
    ov.style.cssText =
      "position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;" +
      "background:rgba(10,12,22,.86);backdrop-filter:blur(4px);" +
      "font-family:var(--font-ui,system-ui,sans-serif);color:var(--ink,#eef1ff)";
    ov.innerHTML =
      "<div style=\"max-width:440px;text-align:center;background:linear-gradient(180deg,var(--panel,#1d2238),var(--bg-soft,#171b2e));" +
      "border:1px solid var(--line,#333a5c);border-radius:16px;box-shadow:var(--shadow,0 10px 30px rgba(0,0,0,.35));padding:28px 26px\">" +
      "<div style=\"font-size:40px;line-height:1\">🔒</div>" +
      "<h2 style=\"font-family:var(--font-display,Georgia,serif);margin:12px 0 6px;font-size:24px\">This lesson is locked</h2>" +
      "<p style=\"color:var(--ink-soft,#b7bede);margin:0 0 20px\">Finish <b>“" + esc(prevTitle) + "”</b> first to unlock it.</p>" +
      "<a href=\"../../\" style=\"display:inline-block;background:var(--accent,#7c9cff);color:#10131f;font-weight:700;" +
      "text-decoration:none;padding:11px 18px;border-radius:10px\">← Back to " + esc(subjectTitle) + "</a>" +
      "</div>";
    (document.body || document.documentElement).appendChild(ov);
  }

  function esc(s) { return String(s).replace(/[&<>\"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function fetchJSON(url) { return fetch(url).then(function (r) { return r.json(); }).catch(function () { return null; }); }
})();
