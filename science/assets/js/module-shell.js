/* ============================================================
   module-shell.js — shared Learn / Explore / Quiz shell
   ------------------------------------------------------------
   Wraps any visualization page in a three-tab module UI.
   • Gated on ?beta=1 — otherwise the page is the plain viz.
   • Reads a global `MODULE = { id, title, intro, lessons[], quiz[] }`
     supplied by each viz's module.js.
   • The page must mark its existing viz container with id="explorePanel".
   • Optional build-task grading uses window.moduleState(); optional
     lesson presets use window.moduleSetState(preset).
   Schemas are documented in MODULES.md.
   ============================================================ */
(function () {
  "use strict";
  if (new URLSearchParams(location.search).get("beta") !== "1") return;  // gated

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof MODULE === "undefined") return;
    const explore = document.getElementById("explorePanel");
    if (!explore) return;
    buildShell(explore);
  });

  const elFrom = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  // Build-task grading now happens server-side (the shell just captures
  // window.moduleState() and submits it) — see FofaAccount.quiz / the contract.

  /* ---------- progress (localStorage) ---------- */
  function pKey() { return "module-progress:" + MODULE.id; }
  function loadProg() { try { return JSON.parse(localStorage.getItem(pKey())) || {}; } catch { return {}; } }
  function saveProg(p) { try { localStorage.setItem(pKey(), JSON.stringify(p)); } catch {} }

  let prog = loadProg();
  if (!prog.read) prog.read = {};
  if (prog.quizBest == null) prog.quizBest = 0;

  /* ---------- build shell ---------- */
  function buildShell(explore) {
    if (document.querySelector(".module-bar")) return;   // idempotent — never build twice
    const bar = elFrom(`
      <div class="module-bar"><div class="wrap">
        <span class="module-title">${esc(MODULE.title || "Module")}</span>
        <div class="module-tabs">
          <button data-tab="explore" class="on">🔬 Explore</button>
          <button data-tab="learn">📖 Learn</button>
          <button data-tab="quiz">✅ Quiz</button>
        </div>
        <span class="module-progress" id="moduleProgress"></span>
      </div></div>`);
    explore.parentNode.insertBefore(bar, explore);

    const learn = elFrom(`<main class="wrap module-panel" id="learnPanel" hidden></main>`);
    const quiz = elFrom(`<main class="wrap module-panel" id="quizPanel" hidden></main>`);
    explore.parentNode.insertBefore(learn, explore.nextSibling);
    learn.parentNode.insertBefore(quiz, learn.nextSibling);

    renderLearn(learn);
    renderQuiz(quiz);

    bar.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => show(b.dataset.tab)));
    show("explore");
    updateProgress();
  }

  function show(tab) {
    const map = { explore: "explorePanel", learn: "learnPanel", quiz: "quizPanel" };
    for (const t in map) document.getElementById(map[t]).hidden = t !== tab;
    document.querySelectorAll(".module-tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
    if (tab === "explore") window.dispatchEvent(new Event("resize")); // re-fit any canvas
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function updateProgress() {
    const total = (MODULE.lessons || []).length;
    const read = Object.keys(prog.read).length;
    const el = document.getElementById("moduleProgress");
    if (el) el.textContent = `📖 ${read}/${total} · ✅ best ${prog.quizBest}/${(MODULE.quiz || []).length}`;
  }

  /* ---------- Learn ---------- */
  function renderLearn(root) {
    root.innerHTML = MODULE.intro ? `<p class="module-intro">${MODULE.intro}</p>` : "";
    (MODULE.lessons || []).forEach((L) => root.appendChild(lessonCard(L)));
  }

  function lessonCard(L) {
    const card = elFrom(`<article class="lesson" id="lesson-${esc(L.id)}"></article>`);
    let html = `<h3>${esc(L.title)}</h3>`;
    if (L.goal) html += `<div class="goal">${esc(L.goal)}</div>`;
    html += `<div class="body">${L.body || ""}</div>`;
    if (L.keywords && L.keywords.length)
      html += `<div class="kw">${L.keywords.map((k) => `<span class="chip">${esc(k)}</span>`).join("")}</div>`;
    if (L.misconception) html += `<div class="miss">⚠️ <b>Watch out:</b> ${L.misconception}</div>`;
    if (L.tryIt) {
      html += `<div class="tryit"><span class="prompt">🔬 <b>Try it:</b> ${L.tryIt.prompt}</span>`;
      if (L.tryIt.preset) html += `<button class="ghost" data-preset='${esc(JSON.stringify(L.tryIt.preset))}'>Set it up in Explore →</button>`;
      html += `</div>`;
    }
    if (L.check && L.check.length) {
      html += `<details class="selfcheck"><summary>Check yourself (${L.check.length})</summary><ol>` +
        L.check.map((c) => `<li>${esc(c.q)} <span class="ans">— ${esc(c.a)}</span></li>`).join("") + `</ol></details>`;
    }
    const isRead = !!prog.read[L.id];
    html += `<div class="readbtn"><button class="${isRead ? "" : "ghost"}">${isRead ? "✓ Got it" : "Mark as got it"}</button></div>`;
    card.innerHTML = html;
    if (isRead) card.classList.add("read");

    const presetBtn = card.querySelector("[data-preset]");
    if (presetBtn) presetBtn.onclick = () => {
      try { if (typeof window.moduleSetState === "function") window.moduleSetState(JSON.parse(presetBtn.dataset.preset)); } catch {}
      show("explore");
    };
    const readBtn = card.querySelector(".readbtn button");
    readBtn.onclick = () => {
      prog.read[L.id] = true; saveProg(prog);
      card.classList.add("read"); readBtn.textContent = "✓ Got it"; readBtn.classList.remove("ghost");
      updateProgress();
    };
    return card;
  }

  /* ---------- Quiz (answer everything, then submit; graded by the backend) ----------
     The shell holds NO grading logic: it collects the student's answers and posts
     them to FofaAccount.quiz(), then renders the per-question results it returns.
     Objective, build, and free-response questions are all just answer types. */
  let selection = {};   // qIndex -> student's answer (choice idx / bool / text / number string)
  let submitted = false;

  function renderQuiz(root) {
    selection = {}; submitted = false;
    const n = (MODULE.quiz || []).length;
    root.innerHTML = `<div class="quiz-head">
      <span class="quiz-score" id="quizScore">${n} question${n === 1 ? "" : "s"}</span></div>`;
    (MODULE.quiz || []).forEach((Q, i) => root.appendChild(quizCard(Q, i)));
    const foot = elFrom(`<div class="quiz-foot">
      <button id="quizSubmit">Submit quiz</button>
      <span class="quiz-msg" id="quizMsg"></span></div>`);
    root.appendChild(foot);
    foot.querySelector("#quizSubmit").onclick = () => submitQuiz(root);
  }

  function pick(wrap, btn, i, value) {
    if (submitted) return;
    selection[i] = value;
    wrap.querySelectorAll("button").forEach((x) => x.classList.remove("chosen"));
    btn.classList.add("chosen");
  }

  function quizCard(Q, i) {
    const card = elFrom(`<div class="qcard" id="q-${i}"><div class="qnum">Question ${i + 1}</div><div class="q">${esc(Q.q)}</div></div>`);
    if (Q.type === "mc") {
      const wrap = elFrom(`<div class="choices"></div>`);
      Q.choices.forEach((ch, ci) => {
        const b = elFrom(`<button type="button">${esc(ch)}</button>`);
        b.onclick = () => pick(wrap, b, i, ci);
        wrap.appendChild(b);
      });
      card.appendChild(wrap);
    } else if (Q.type === "tf") {
      const wrap = elFrom(`<div class="tf"></div>`);
      [["True", true], ["False", false]].forEach(([label, val]) => {
        const b = elFrom(`<button type="button">${label}</button>`);
        b.onclick = () => pick(wrap, b, i, val);
        wrap.appendChild(b);
      });
      card.appendChild(wrap);
    } else if (Q.type === "numeric") {
      const row = elFrom(`<div class="row"><input class="num" type="number" inputmode="decimal"/></div>`);
      const input = row.querySelector("input");
      input.oninput = () => { if (!submitted) selection[i] = input.value; };
      card.appendChild(row);
    } else if (Q.type === "build") {
      // Each build question snapshots the viz state at capture time, so a quiz
      // can ask for several different builds and grade them all on submit.
      const row = elFrom(`<div class="row">
        <button type="button" data-act="go" class="ghost">Open Explore</button>
        <button type="button" data-act="capture">Capture my build</button></div>`);
      const note = elFrom(`<div class="build-note">Build it under the Explore tab, then press “Capture my build”. It's graded when you submit.</div>`);
      row.querySelector('[data-act="go"]').onclick = () => show("explore");
      row.querySelector('[data-act="capture"]').onclick = () => {
        if (submitted) return;
        if (typeof window.moduleState !== "function") { note.textContent = "This page can't read the build state."; return; }
        const st = window.moduleState();
        selection[i] = st;
        note.textContent = "Captured: " + Object.entries(st).map(([k, v]) => `${k}=${typeof v === "number" ? +(+v).toFixed(2) : v}`).join(", ");
        row.querySelector('[data-act="capture"]').classList.add("chosen");
      };
      card.appendChild(row);
      card.appendChild(note);
    } else if (Q.type === "free") {
      const ta = elFrom(`<textarea class="free" rows="4" placeholder="Write your answer…"></textarea>`);
      ta.oninput = () => { if (!submitted) selection[i] = ta.value; };
      card.appendChild(ta);
    }
    return card;
  }

  function collectAnswers() {
    return (MODULE.quiz || []).map((Q, i) => {
      const id = "q" + (i + 1);
      if (Q.type === "mc")      return { id, type: "mc", choice: (i in selection ? selection[i] : null) };
      if (Q.type === "tf")      return { id, type: "tf", choice: (i in selection ? selection[i] : null) };
      if (Q.type === "numeric") { const v = parseFloat(selection[i]); return { id, type: "numeric", value: isFinite(v) ? v : null }; }
      if (Q.type === "build")   return { id, type: "build", state: (i in selection ? selection[i] : (typeof window.moduleState === "function" ? window.moduleState() : {})) };
      if (Q.type === "free")    return { id, type: "free", response: { kind: "text", text: selection[i] || "" } };
      return { id, type: Q.type };
    });
  }

  function submitQuiz(root) {
    if (submitted) return;
    const msg = root.querySelector("#quizMsg"), btn = root.querySelector("#quizSubmit");
    if (!window.FofaAccount || typeof FofaAccount.quiz !== "function") { msg.textContent = "Grading isn't available on this page."; return; }
    msg.textContent = "Grading…"; btn.disabled = true;
    FofaAccount.quiz({ subject: "science", module: MODULE.id, quizId: MODULE.id, answers: collectAnswers() })
      .then((res) => {
        if (!res || !res.ok) { msg.textContent = "Couldn't grade: " + ((res && res.error) || "unknown"); btn.disabled = false; return; }
        submitted = true;
        renderResults(root, res);
      });
  }

  function renderResults(root, res) {
    const byId = {}; (res.results || []).forEach((r) => (byId[r.id] = r));
    (MODULE.quiz || []).forEach((Q, i) => {
      const card = document.getElementById("q-" + i);
      const r = byId["q" + (i + 1)] || {};
      const ok = r.correct === true || (r.of > 0 && r.earned >= r.of);
      // reveal correct answer (from the module content) and lock inputs
      if (Q.type === "mc") {
        card.querySelectorAll(".choices button").forEach((b, ci) => {
          if (ci === Q.answer) b.classList.add("correct");
          if (ci === selection[i] && ci !== Q.answer) b.classList.add("wrong");
          b.disabled = true;
        });
      } else if (Q.type === "tf") {
        card.querySelectorAll(".tf button").forEach((b) => (b.disabled = true));
      } else if (Q.type === "numeric" || Q.type === "free") {
        const f = card.querySelector("input, textarea"); if (f) f.disabled = true;
      }
      const detail = (Q.type === "free" && r.feedback) ? r.feedback : (Q.explain || "");
      const extra = (r.of > 1) ? ` (${r.earned}/${r.of})` : "";
      const box = elFrom(`<div class="explain ${ok ? "ok" : "no"}">${ok ? "✓ Correct" : "✗ Not quite"}${extra}. ${esc(detail)}</div>`);
      card.appendChild(box); card.classList.add("done");
    });
    const head = document.getElementById("quizScore");
    if (head) head.textContent = `${res.score} / ${res.max}`;
    if (res.score > prog.quizBest) { prog.quizBest = res.score; saveProg(prog); }
    updateProgress();
    const foot = root.querySelector(".quiz-foot");
    foot.innerHTML = `<span class="quiz-msg">Scored ${res.score} / ${res.max}.</span> <button id="quizRetake" class="ghost">Retake</button>`;
    foot.querySelector("#quizRetake").onclick = () => renderQuiz(root);
  }
})();
