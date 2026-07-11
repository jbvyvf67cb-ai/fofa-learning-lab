/* ============================================================================
   fofa-measure.js — the lab's measurables engine (global `Fofa`)
   ----------------------------------------------------------------------------
   The lab is a static site, so it never holds an API key. Instead it reports
   results to a Home Assistant webhook whose URL is the only secret and lives in
   this browser's localStorage (set on settings.html). Home Assistant records the
   measurables and, for open-ended work, grades with its own Claude key and
   returns feedback.

   Everything also mirrors to localStorage, so the lab works fully offline / with
   no HA connected.

   Public API (window.Fofa):
     Fofa.config                      -> { child, webhookUrl, gradeUrl }
     Fofa.setConfig(partial)          -> persist + return updated config
     Fofa.progress()                  -> { "subject/module": {best,max,attempts,last,kind} , ... }
     Fofa.clearProgress()
     Fofa.report(evt)  -> Promise<{ sent:boolean, error? }>
         evt = { subject, module, activity, kind:'quiz'|'game'|'build', score, max, detail? }
     Fofa.grade(evt)   -> Promise<{ ok:boolean, score?, max?, feedback?, error? }>
         evt = { subject, module, prompt, rubric, response, activity? }

   The webhook payload + grading contract are documented in MEASURABLES.md — that
   file is the interface for the Home-Assistant-side session.
   ============================================================================ */
(function () {
  "use strict";

  var CONFIG_KEY = "fofa:config";
  var PROGRESS_KEY = "fofa:progress";

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  var config = (function () {
    var c = readJSON(CONFIG_KEY, {});
    return {
      child:      c.child || "",
      webhookUrl: c.webhookUrl || "",
      gradeUrl:   c.gradeUrl || ""
    };
  })();

  function setConfig(partial) {
    partial = partial || {};
    if ("child" in partial)      config.child = String(partial.child || "").trim();
    if ("webhookUrl" in partial) config.webhookUrl = String(partial.webhookUrl || "").trim();
    if ("gradeUrl" in partial)   config.gradeUrl = String(partial.gradeUrl || "").trim();
    writeJSON(CONFIG_KEY, config);
    return config;
  }

  /* ---------- local progress mirror ---------- */
  function progress() { return readJSON(PROGRESS_KEY, {}); }
  function clearProgress() { try { localStorage.removeItem(PROGRESS_KEY); } catch (e) {} }

  function recordLocal(evt) {
    var all = progress();
    var key = evt.subject + "/" + evt.module;
    var row = all[key] || { best: 0, max: evt.max || 0, attempts: 0, last: null, kind: evt.kind || "quiz" };
    row.attempts += 1;
    row.max = evt.max != null ? evt.max : row.max;
    row.kind = evt.kind || row.kind;
    if (typeof evt.score === "number" && evt.score > row.best) row.best = evt.score;
    row.last = new Date().toISOString();
    all[key] = row;
    writeJSON(PROGRESS_KEY, all);
    return row;
  }

  /* ---------- envelope ---------- */
  function envelope(type, evt) {
    var e = {
      source: "fofa",
      type: type,
      student: config.child || null,
      ts: new Date().toISOString(),
      subject: evt.subject || null,
      module: evt.module || null,
      activity: evt.activity || null,
      kind: evt.kind || null
    };
    if ("score" in evt)  e.score = evt.score;
    if ("max" in evt)    e.max = evt.max;
    if ("detail" in evt) e.detail = evt.detail;
    return e;
  }

  /* ---------- report a measurable (fire-and-forget to HA) ---------- */
  function report(evt) {
    evt = evt || {};
    recordLocal(evt);                       // always mirror locally first

    // If the authenticated account client is present, record there too so
    // server-side progress + lesson gating update (this is the primary path
    // now; the webhook below is the legacy fire-and-forget option).
    if (window.FofaAccount && typeof FofaAccount.progress === "function") {
      try {
        FofaAccount.progress({
          subject: evt.subject, module: evt.module, activity: evt.activity,
          kind: evt.kind, score: evt.score, max: evt.max, detail: evt.detail
        });
      } catch (e) {}
    }

    if (!config.webhookUrl) {
      return Promise.resolve({ sent: false, error: "no-webhook" });
    }
    if (typeof fetch !== "function") {
      return Promise.resolve({ sent: false, error: "no-fetch" });
    }
    return fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope("measurable", evt)),
      keepalive: true                       // survive a page navigation
    }).then(function (res) {
      return { sent: !!(res && (res.ok || res.status === 0)) , status: res && res.status };
    }).catch(function (err) {
      // Network/CORS error: the POST may still have reached HA, but we can't confirm.
      return { sent: false, error: String(err && err.message || err) };
    });
  }

  /* ---------- request an AI grade for open-ended work ---------- */
  function grade(evt) {
    evt = evt || {};
    if (!config.gradeUrl) {
      return Promise.resolve({ ok: false, error: "no-grade-webhook" });
    }
    if (typeof fetch !== "function") {
      return Promise.resolve({ ok: false, error: "no-fetch" });
    }
    var payload = envelope("grade-request", {
      subject: evt.subject, module: evt.module, activity: evt.activity || "freeform",
      kind: "freeform",
      detail: { prompt: evt.prompt || "", rubric: evt.rubric || "", response: evt.response || "" }
    });
    return fetch(config.gradeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) return { ok: false, error: "HTTP " + res.status };
      return res.json();
    }).then(function (data) {
      if (data && data.ok === false) return data;
      if (!data || typeof data.score === "undefined") {
        return { ok: false, error: "bad-response" };
      }
      // A successful grade is also a measurable — mirror + report it.
      var m = { subject: evt.subject, module: evt.module, activity: evt.activity || "freeform",
                kind: "freeform", score: data.score, max: data.max,
                detail: { feedback: data.feedback, response: evt.response } };
      recordLocal(m);
      if (config.webhookUrl && config.webhookUrl !== config.gradeUrl) {
        // let the tracking webhook see the graded result too (best-effort)
        try { report(m); } catch (e) {}
      }
      return { ok: true, score: data.score, max: data.max, feedback: data.feedback || "" };
    }).catch(function (err) {
      return { ok: false, error: String(err && err.message || err) };
    });
  }

  window.Fofa = {
    get config() { return config; },
    setConfig: setConfig,
    progress: progress,
    clearProgress: clearProgress,
    report: report,
    grade: grade
  };
})();
