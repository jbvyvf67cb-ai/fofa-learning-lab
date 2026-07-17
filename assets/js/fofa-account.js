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
  function apiQuiz(sub) {
    return fetch(backendUrl() + "/api/fofa/quiz", { method: "POST", headers: authHeaders(), body: JSON.stringify(sub) })
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
  function starsFor(L, complete, best, max, attempts, sp) {
    // Mirror the star policy in curriculum/index.json (§4b of the contract).
    if (typeof L.stars === "number") return complete ? L.stars : 0;
    var isQuiz = L.gate && (L.gate.type === "quiz" || L.gate.type === "grade");
    if (isQuiz) return (max > 0 && attempts) ? Math.round((best / max) * (sp.quizMax || 20)) : 0;
    return complete ? (sp.lessonComplete || 5) : 0;
  }
  function mockState() {
    return curriculum().then(function (c) {
      var rows = mockResults();
      var sp = c.stars || {};
      var lessons = {}, totalStars = 0;
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
          var stars = starsFor(L, complete, best, max, mine.length, sp);
          totalStars += stars;
          lessons[key] = {
            status: complete ? "complete" : (unlocked ? "unlocked" : "locked"),
            best: best, max: max, attempts: mine.length, stars: stars,
            last: mine.length ? mine[mine.length - 1].ts : null
          };
          prevComplete = complete;
        });
      });
      var st = { ok: true, student: student() || "Fofa", curriculumVersion: c.version || "mock",
                 totalStars: totalStars, lessons: lessons };
      writeJSON(K.state, st);
      return st;
    });
  }

  /* ---- mock quiz grader: mirrors POST /api/fofa/quiz using the quiz manifest --- */
  function matchesCheck(got, want) {
    return Object.keys(want || {}).every(function (k) {
      var g = got ? got[k] : undefined, w = want[k];
      if (w && typeof w === "object") {
        if ("eq" in w && g !== w.eq) return false;
        if ("min" in w && !(g >= w.min)) return false;
        if ("max" in w && !(g <= w.max)) return false;
        if ("gt" in w && !(g > w.gt)) return false;
        if ("lt" in w && !(g < w.lt)) return false;
        return true;
      }
      return g === w;
    });
  }
  function mockQuiz(sub) {
    var url = SITE_ROOT + "quizzes/" + sub.subject + "/" + sub.quizId + ".json";
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (quiz) {
      var byId = {};
      if (quiz && quiz.questions) quiz.questions.forEach(function (q) { byId[q.id] = q; });
      var results = [], score = 0, max = 0;
      (sub.answers || []).forEach(function (a) {
        var q = byId[a.id] || {};
        var of = 1, earned = 0, correct = false, extra = {};
        if (a.type === "mc")        { correct = a.choice === q.answer; }
        else if (a.type === "tf")   { correct = a.choice === q.answer; }
        else if (a.type === "numeric") { correct = (a.value != null) && Math.abs(a.value - q.answer) <= (q.tolerance || 0); extra.expected = q.answer; }
        else if (a.type === "build")   { correct = q.check ? matchesCheck(a.state, q.check) : false; }
        else if (a.type === "free")    { of = q.max || 1; earned = of; extra.feedback = "(demo) Connect Home Assistant for real AI feedback."; }
        if (a.type !== "free") earned = correct ? 1 : 0;
        score += earned; max += of;
        results.push(Object.assign({ id: a.id, earned: earned, of: of }, (a.type === "free" ? {} : { correct: correct }), extra));
      });
      mockRecord({ subject: sub.subject, module: sub.module, activity: "quiz", kind: "quiz", score: score, max: max });
      return curriculum().then(function (c) {
        var quizMax = (c.stars && c.stars.quizMax) || 20;
        var stars = max > 0 ? Math.round((score / max) * quizMax) : 0;
        return mockState().then(function (state) {
          return { ok: true, score: score, max: max, stars: stars, results: results, state: state };
        });
      });
    }).catch(function (e) { return { ok: false, error: String(e.message || e) }; });
  }

  /* ============================ dispatch ================================= */
  var mock = function () { return backendUrl() === ""; };
  function quiz(sub) { return mock() ? mockQuiz(sub) : apiQuiz(sub); }

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
    // Unified quiz grading: submit answers, get back per-question results + gating.
    quiz: quiz,
    // Convenience wrapper for a single free-response prompt (a one-question quiz).
    grade: function (evt) {
      return quiz({
        subject: evt.subject, module: evt.module, quizId: evt.quizId || evt.module,
        answers: [{ id: evt.qId || "q1", type: "free", response: { kind: "text", text: evt.response || "" } }]
      }).then(function (res) {
        if (!res || !res.ok) return res || { ok: false, error: "grade-failed" };
        var r = (res.results || [])[0] || {};
        return { ok: true, score: res.score, max: res.max, feedback: r.feedback || "", state: res.state };
      });
    }
  };
})();
