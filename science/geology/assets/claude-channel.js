/* ============================================================
   claude-channel.js — "Send to Claude" for the geology unit
   ------------------------------------------------------------
   Levi writes an answer; the page posts it as a comment on a
   private GitHub pull request (the "Science Lab work" PR in
   claude-fofa). A Claude thread subscribed to that PR wakes on the
   comment, checks the answer and replies with a comment of its own.
   This page polls the PR and shows the reply right here.

   No API key is involved and none is in this file. The page reuses
   the GitHub access code Claude Fofa already keeps in this browser
   (same web address, so the same localStorage key `guardian_token`).

   Wire format (first line of each comment is a marker):
     page   -> PR  <!-- lab {"t":"submit","subject":"science","unit":"geology",
                            "lesson":L,"task":T,"id":ID,"turn":N} -->  + answer text
     Claude -> PR  <!-- lab {"t":"feedback","id":ID,"verdict":"got-it|almost|not-yet"} -->
                   + a short reply in simple Markdown (**bold**, *italic*, - bullets)
   "got-it" finishes the task; anything else invites another try (turn N+1).
   ============================================================ */
(function () {
  "use strict";

  // "Science Lab work (do not merge)" PR — protocol in claude-fofa lab-work/README.md
  var CHANNEL = { repo: "jbvyvf67cb-ai/claude-fofa", pr: 9 };
  var TOKEN_KEY = "guardian_token";
  var API = "https://api.github.com/repos/" + CHANNEL.repo + "/issues/" + CHANNEL.pr + "/comments";
  var MAX_LEN = 3000;

  function readJSON(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f; } catch (e) { return f; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function rid() { return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); }

  // tiny, safe Markdown: escape first, then **bold**, *italic*, bullets, paragraphs
  function md(text) {
    var blocks = esc(text.trim()).split(/\n\s*\n/);
    return blocks.map(function (b) {
      var lines = b.split("\n");
      var inline = function (s) { return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|\W)\*(?!\s)(.+?)\*(?=\W|$)/g, "$1<i>$2</i>"); };
      if (lines.every(function (l) { return /^\s*[-•]\s+/.test(l); })) {
        return "<ul>" + lines.map(function (l) { return "<li>" + inline(l.replace(/^\s*[-•]\s+/, "")) + "</li>"; }).join("") + "</ul>";
      }
      return "<p>" + lines.map(inline).join("<br>") + "</p>";
    }).join("");
  }

  function parseMarker(body) {
    var m = /^<!-- lab (\{.*?\}) -->/.exec(body || "");
    if (!m) return null;
    try { return { meta: JSON.parse(m[1]), text: body.slice(m[0].length).trim() }; } catch (e) { return null; }
  }

  function gh(method, url, body) {
    return fetch(url, {
      method: method,
      headers: { "Authorization": "Bearer " + token(), "Accept": "application/vnd.github+json", "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store"
    }).then(function (r) {
      if (!r.ok) { var e = new Error("GitHub " + r.status); e.status = r.status; throw e; }
      return r.json();
    });
  }

  /* ---------- one task on the page ---------- */
  // opts: { unit, lesson, lessonTitle, task, prompt, rubric, context(): object, onDone() }
  function mount(host, opts) {
    var key = "geo:task:" + opts.lesson + ":" + opts.task;
    var st = readJSON(key, { thread: [], pending: null, done: false });
    var timer = null;

    host.classList.add("claude-task");
    host.innerHTML = "";
    host.appendChild(el("div", "ct-prompt", opts.prompt));
    var thread = host.appendChild(el("div", "ct-thread"));
    var setup = host.appendChild(el("div"));
    var ta = host.appendChild(el("textarea"));
    ta.placeholder = "Write your answer in your own words…";
    ta.maxLength = MAX_LEN;
    var row = host.appendChild(el("div", "ct-row"));
    var send = row.appendChild(el("button", "primary", "Send to Claude"));
    var status = row.appendChild(el("span", "ct-status"));
    var again = row.appendChild(el("button", "", "Check for an answer"));
    again.hidden = true;

    function save() { writeJSON(key, st); }

    function paint() {
      thread.innerHTML = "";
      st.thread.forEach(function (m) {
        if (m.who === "me") { thread.appendChild(el("div", "ct-msg me", m.text)); return; }
        var c = el("div", "ct-msg claude" + (m.verdict === "got-it" ? " got-it" : ""));
        c.appendChild(el("div", "who", m.verdict === "got-it" ? "Claude · you got it ✓" : "Claude"));
        var b = el("div"); b.innerHTML = md(m.text); c.appendChild(b);
        thread.appendChild(c);
      });
      var waiting = !!st.pending;
      ta.hidden = st.done || waiting;
      send.hidden = st.done || waiting;
      send.textContent = st.thread.length ? "Send my reply" : "Send to Claude";
      ta.placeholder = st.thread.length ? "Answer Claude, or try again…" : "Write your answer in your own words…";
      if (st.done) status.textContent = "";
      else if (waiting) { status.innerHTML = "Claude is reading your answer<span class=dots></span>"; }
      else status.textContent = "";
      setup.innerHTML = "";
      if (!token() && !st.done) {
        setup.className = "ct-setup";
        setup.innerHTML = "<b>This device isn't connected to Claude yet.</b> Open " +
          "<a href='/claude-fofa/' target='_blank' rel='noopener'>Claude Fofa</a> on this device once, then come back and reload. " +
          "Or ask a parent to paste the access code here:";
        var inp = setup.appendChild(el("input")); inp.type = "password"; inp.placeholder = "access code";
        var ok = setup.appendChild(el("button", "", "Save"));
        ok.onclick = function () { if (inp.value.trim()) { try { localStorage.setItem(TOKEN_KEY, inp.value.trim()); } catch (e) {} paint(); } };
        send.disabled = true;
      } else { setup.className = ""; send.disabled = false; }
    }

    function finish() {
      st.done = true; st.pending = null; save(); paint();
      if (opts.onDone) opts.onDone();
    }

    function poll(deadline) {
      clearTimeout(timer);
      if (!st.pending) return;
      var since = new Date(st.pending.at - 5000).toISOString();
      gh("GET", API + "?per_page=100&since=" + encodeURIComponent(since)).then(function (list) {
        var hit = null;
        list.forEach(function (c) {
          var p = parseMarker(c.body);
          if (p && p.meta.t === "feedback" && p.meta.id === st.pending.id) hit = p;
        });
        if (hit) {
          st.thread.push({ who: "claude", text: hit.text, verdict: hit.meta.verdict || "almost", at: Date.now() });
          st.pending = null; save();
          if (hit.meta.verdict === "got-it") finish(); else paint();
          again.hidden = true;
          return;
        }
        next(deadline);
      }).catch(function () { next(deadline); });
    }
    function next(deadline) {
      var left = deadline - Date.now();
      if (left <= 0) {
        status.textContent = "Claude hasn't answered yet. You can keep going and check back later.";
        again.hidden = false;
        return;
      }
      var waited = Date.now() - st.pending.at;
      timer = setTimeout(function () { poll(deadline); }, waited < 120000 ? 3000 : 15000);
    }
    again.onclick = function () { again.hidden = true; paint(); poll(Date.now() + 10 * 60000); };

    send.onclick = function () {
      var text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      if (text.length < 15) { status.textContent = "Tell Claude a bit more — a full sentence or two."; return; }
      var id = "geo-" + opts.lesson + "-" + opts.task + "-" + rid();
      var turn = st.thread.filter(function (m) { return m.who === "me"; }).length + 1;
      var meta = { t: "submit", subject: "science", unit: opts.unit || "geology", lesson: opts.lesson, task: opts.task, id: id, turn: turn };
      var ctx = { rubric: opts.rubric, page: location.href.split("?")[0], when: new Date().toISOString() };
      try { var extra = opts.context ? opts.context() : {}; for (var k in extra) ctx[k] = extra[k]; } catch (e) {}
      var body = "<!-- lab " + JSON.stringify(meta) + " -->\n" +
        "🪨 **Geology · " + (opts.lessonTitle || opts.lesson) + "** — task `" + opts.task + "`" + (turn > 1 ? " (reply " + turn + ")" : "") + "\n\n" +
        "**Question:** " + opts.prompt + "\n\n" +
        "**Levi wrote:**\n\n" + text.split("\n").map(function (l) { return "> " + l; }).join("\n") + "\n\n" +
        "<details><summary>Context for Claude</summary>\n\n```json\n" + JSON.stringify(ctx, null, 2) + "\n```\n</details>";
      send.disabled = true; status.textContent = "Sending…";
      gh("POST", API, { body: body }).then(function () {
        st.thread.push({ who: "me", text: text, at: Date.now() });
        st.pending = { id: id, at: Date.now() };
        ta.value = ""; save(); paint();
        poll(Date.now() + 10 * 60000);
      }).catch(function (e) {
        send.disabled = false;
        status.textContent = e.status === 401 || e.status === 403
          ? "The access code on this device didn't work. Ask a parent to check it."
          : "Couldn't send (no internet?). Try again in a moment.";
      });
    };

    paint();
    if (st.pending) poll(Date.now() + 10 * 60000);
    return { isDone: function () { return st.done; } };
  }

  window.ClaudeChannel = { mount: mount, md: md, channel: CHANNEL };
})();
