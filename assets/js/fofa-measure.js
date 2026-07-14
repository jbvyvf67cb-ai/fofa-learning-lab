/* ============================================================================
   fofa-measure.js — thin activity-reporting shim (global `Fofa`)
   ----------------------------------------------------------------------------
   Historically this POSTed results to an anonymous Home Assistant webhook. That
   path is RETIRED — progress, gating, and grading now go through the
   authenticated FofaAccount client (see docs/BACKEND-CONTRACT.md).

   This shim remains only as a convenience façade for the activity/game modules
   that call `Fofa.report(...)` (writing games, math lesson checks): it records
   the outcome to the authenticated backend via FofaAccount.progress() and keeps
   a small localStorage echo so a page can show progress offline.

     Fofa.report(evt)   -> forwards to FofaAccount.progress(); evt =
                           { subject, module, activity, kind, score, max, detail? }
     Fofa.progress()    -> the local echo { "subject/module": {best,max,attempts,last,kind} }
     Fofa.clearProgress()
   ============================================================================ */
(function () {
  "use strict";
  var PROGRESS_KEY = "fofa:progress";

  function readJSON(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f; } catch (e) { return f; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function recordLocal(evt) {
    var all = readJSON(PROGRESS_KEY, {});
    var key = evt.subject + "/" + evt.module;
    var row = all[key] || { best: 0, max: evt.max || 0, attempts: 0, last: null, kind: evt.kind || "quiz" };
    row.attempts += 1;
    row.max = evt.max != null ? evt.max : row.max;
    row.kind = evt.kind || row.kind;
    if (typeof evt.score === "number" && evt.score > row.best) row.best = evt.score;
    row.last = new Date().toISOString();
    all[key] = row;
    writeJSON(PROGRESS_KEY, all);
  }

  function report(evt) {
    evt = evt || {};
    recordLocal(evt);   // offline echo
    // Forward to the authenticated backend (the source of truth for progress + gating).
    if (window.FofaAccount && typeof FofaAccount.progress === "function") {
      try {
        return FofaAccount.progress({
          subject: evt.subject, module: evt.module, activity: evt.activity,
          kind: evt.kind, score: evt.score, max: evt.max, detail: evt.detail
        });
      } catch (e) {}
    }
    return Promise.resolve({ recorded: true });
  }

  window.Fofa = {
    report: report,
    progress: function () { return readJSON(PROGRESS_KEY, {}); },
    clearProgress: function () { try { localStorage.removeItem(PROGRESS_KEY); } catch (e) {} }
  };
})();
