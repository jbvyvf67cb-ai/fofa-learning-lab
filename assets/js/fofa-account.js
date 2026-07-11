/* ============================================================================
   fofa-account.js — authenticated account + progress + gating client
   ----------------------------------------------------------------------------
   Talks to the Home Assistant `fofa` integration described in
   docs/BACKEND-CONTRACT.md: login, per-student cross-device progress, and
   server-computed sequential lesson gating.

   Until a Home Assistant base URL is configured (Settings), it runs a built-in
   MOCK backend so the whole flow (login, progress, gating) works locally on
   GitHub Pages. The mock computes gating from curriculum/index.json exactly the
   way the real server must, so behavior matches when you switch over.

   Public API (window.FofaAccount) — all async return Promises:
     .backendUrl()                 -> configured HA base URL or "" (mock mode)
     .setBackendUrl(url)
     .isLoggedIn()  .student()  .logout()
     .login(username, password)    -> { ok, student, error? }
     .state()                      -> { ok, student, lessons:{ "subj/mod":{status,best,max,attempts,last} } }
     .progress(evt)                -> updated state   (evt: {subject,module,activity,kind,score,max,detail?})
     .grade(evt)                   -> { ok, score, max, feedback, state }
     .cachedState()                -> last state (sync, for instant render/offline)
     MOCK_CREDS                    -> { username, password } demo login (mock mode only)
   ============================================================================ */
(function () {
  "use strict";

  // Resolve the site root from this script's own URL so curriculum/* fetches
  // work at any page depth on a project-subpath (GitHub Pages).
  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var SITE_ROOT = scriptSrc.replace(/assets\/js\/fofa-account\.js.*$/, "");

  var K = {
    backend: "fofa:backend",     // { baseUrl }
    session: "fofa:session",     // { token, student, expires }
    state:   "fofa:state",       // last state cache
    mockAcc: "fofa:mock:accounts",
    mockRes: "fofa:mock:results"
  };
  var MOCK_CREDS = { username: "fofa", password: "learn" };

  function readJSON(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f; } catch (e) { return f; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function backendUrl() {
    var b = readJSON(K.backend, {});
    return (b && b.baseUrl) ? String(b.baseUrl).replace(/\/+$/, "") : "";
  }
  function setBackendUrl(url) { writeJSON(K.backend, { baseUrl: String(url || "").trim() }); }

  function session() { return readJSON(K.session, null); }
  function isLoggedIn() {
    var s = session();
    if (!s || !s.token) return false;
    if (s.expires && new Date(s.expires).getTime() < Date.now()) { del(K.session); return false; }
    return true;
  }
  function student() { var s = session(); return s ? s.student : null; }
  function logout() { del(K.session); del(K.state); }
  function cachedState() { return readJSON(K.state, null); }

  /* ---------------- curriculum (shared gating source of truth) ------------- */
  var _curriculum = null;
  function curriculum() {
    if (_curriculum) return Promise.resolve(_curriculum);
    return fetch(SITE_ROOT + "curriculum/index.json")
      .then(function (r) { return r.json(); })
      .then(function (c) { _curriculum = c; return c; });
  }

  /* ============================ real backend ============================== */
  function authHeaders() {
    var s = session();
    return { "Content-Type": "application/json", "Authorization": "Bearer " + (s ? s.token : "") };
  }
  function apiLogin(username, password) {
    return fetch(backendUrl() + "/api/fofa/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    }).then(function (r) { return r.json().catch(function () { return { ok: false, error: "bad-response" }; }); })
      .then(function (d) {
        if (d && d.ok && d.token) writeJSON(K.session, { token: d.token, student: d.student || username, expires: d.expires || null });
        return d && d.ok ? { ok: true, student: d.student || username } : { ok: false, error: (d && d.error) || "login-failed" };
      }).catch(function (e) { return { ok: false, error: String(e.message || e) }; });
  }
  function apiState() {
    return fetch(backendUrl() + "/api/fofa/state", { headers: authHeaders() })
      .then(function (r) { if (r.status === 401) { logout(); return { ok: false, error: "unauthorized" }; } return r.json(); })
      .then(function (d) { if (d && d.ok) writeJSON(K.state, d); return d; })
      .catch(function (e) { return { ok: false, error: String(e.message || e) }; });
  }
  function apiProgress(evt) {
    return fetch(backendUrl() + "/api/fofa/progress", { method: "POST", headers: authHeaders(), body: JSON.stringify(evt) })
      .then(function (r) { if (r.status === 401) { logout(); return { ok: false, error: "unauthorized" }; } return r.json(); })
      .then(function (d) { if (d && d.ok) writeJSON(K.state, d); return d; })
      .catch(function (e) { return { ok: false, error: String(e.message || e) }; });
  }
  function apiGrade(evt) {
    return fetch(backendUrl() + "/api/fofa/grade", { method: "POST", headers: authHeaders(), body: JSON.stringify(evt) })
      .then(function (r) { if (r.status === 401) { logout(); return { ok: false, error: "unauthorized" }; } return r.json(); })
      .then(function (d) { if (d && d.ok && d.state) writeJSON(K.state, d.state); return d; })
      .catch(function (e) { return { ok: false, error: String(e.message || e) }; });
  }

  /* ============================ mock backend ============================== */
  // Mirrors the server contract so the demo behaves like the real thing.
  function mockLogin(username, password) {
    if (username === MOCK_CREDS.username && password === MOCK_CREDS.password) {
      var exp = new Date(Date.now() + 7 * 864e5).toISOString();
      writeJSON(K.session, { token: "mock-" + Math.abs(hash(username + exp)), student: "Fofa", expires: exp });
      return Promise.resolve({ ok: true, student: "Fofa" });
    }
    return Promise.resolve({ ok: false, error: "bad-credentials" });
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h; }

  function mockResults() { return readJSON(K.mockRes, []); }
  function mockRecord(evt) {
    var all = mockResults();
    all.push({
      subject: evt.subject, module: evt.module, activity: evt.activity || null,
      kind: evt.kind || null, score: (typeof evt.score === "number" ? evt.score : null),
      max: (typeof evt.max === "number" ? evt.max : null), ts: new Date().toISOString()
    });
    writeJSON(K.mockRes, all);
  }
  function gateSatisfied(gate, rows) {
    if (!rows.length) return false;
    var best = rows.reduce(function (m, r) { return (r.score != null && r.score > m) ? r.score : m; }, 0);
    var max = rows.reduce(function (m, r) { return (r.max != null && r.max > m) ? r.max : m; }, 0);
    switch (gate && gate.type) {
      case "quiz":     return max > 0 && (best / max) >= (gate.min != null ? gate.min : 0.8);
      case "grade":    return max > 0 && (best / max) >= (gate.min != null ? gate.min : 0.75);
      case "complete": return rows.some(function (r) { return r.max != null && r.max > 0 && r.score === r.max; });
      case "visit":    return true; // any recorded result counts
      default:         return false;
    }
  }
  function mockState() {
    return curriculum().then(function (c) {
      var rows = mockResults();
      var lessons = {};
      Object.keys(c.subjects).forEach(function (subj) {
        var list = (c.subjects[subj].lessons) || [];
        var prevComplete = true; // first lesson always unlocked
        list.forEach(function (L, i) {
          var key = subj + "/" + L.module;
          var mine = rows.filter(function (r) { return r.subject === subj && r.module === L.module; });
          var best = mine.reduce(function (m, r) { return (r.score != null && r.score > m) ? r.score : m; }, 0);
          var max = mine.reduce(function (m, r) { return (r.max != null && r.max > m) ? r.max : m; }, 0);
          var complete = gateSatisfied(L.gate, mine);
          var unlocked = (i === 0) || prevComplete;
          lessons[key] = {
            status: complete ? "complete" : (unlocked ? "unlocked" : "locked"),
            best: best, max: max, attempts: mine.length,
            last: mine.length ? mine[mine.length - 1].ts : null
          };
          prevComplete = complete;
        });
      });
      var st = { ok: true, student: student() || "Fofa", curriculumVersion: c.version || "mock", lessons: lessons };
      writeJSON(K.state, st);
      return st;
    });
  }

  /* ============================ dispatch ================================= */
  var mock = function () { return backendUrl() === ""; };

  window.FofaAccount = {
    backendUrl: backendUrl,
    setBackendUrl: setBackendUrl,
    isLoggedIn: isLoggedIn,
    student: student,
    logout: logout,
    cachedState: cachedState,
    MOCK_CREDS: MOCK_CREDS,
    isMock: mock,
    login: function (u, p) { return mock() ? mockLogin(u, p) : apiLogin(u, p); },
    state: function () { return mock() ? mockState() : apiState(); },
    progress: function (evt) {
      if (!mock()) return apiProgress(evt);
      mockRecord(evt); return mockState();
    },
    grade: function (evt) {
      if (!mock()) return apiGrade(evt);
      // mock grade: no Claude — record a placeholder pass so gating can be demoed
      var m = evt.max || 4, s = evt.max || 3;
      mockRecord({ subject: evt.subject, module: evt.module, activity: "freeform", kind: "freeform", score: s, max: m });
      return mockState().then(function (st) {
        return { ok: true, score: s, max: m, feedback: "(demo) Looks good — connect Home Assistant for real AI feedback.", state: st };
      });
    }
  };
})();
