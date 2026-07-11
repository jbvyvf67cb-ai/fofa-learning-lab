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

  /* build-task matcher: value may be a primitive (strict ===) or a spec
     { min, max, gt, lt, eq } for numeric ranges/comparisons. */
  function matches(got, want) {
    if (want && typeof want === "object") {
      if ("eq" in want && got !== want.eq) return false;
      if ("min" in want && !(got >= want.min)) return false;
      if ("max" in want && !(got <= want.max)) return false;
      if ("gt" in want && !(got > want.gt)) return false;
      if ("lt" in want && !(got < want.lt)) return false;
      return true;
    }
    return got === want;
  }
  function describe(want) {
    if (want && typeof want === "object") {
      if ("min" in want && "max" in want) return `${want.min}–${want.max}`;
      if ("gt" in want) return `> ${want.gt}`;
      if ("lt" in want) return `< ${want.lt}`;
      if ("eq" in want) return `${want.eq}`;
    }
    return want;
  }

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

  /* ---------- Quiz ---------- */
  let answered = {}; // qIndex -> correct?
  function renderQuiz(root) {
    answered = {};
    root.innerHTML = `<div class="quiz-head">
      <span class="quiz-score" id="quizScore">0 / ${(MODULE.quiz || []).length}</span>
      <button class="ghost" id="quizReset">Reset quiz</button></div>`;
    (MODULE.quiz || []).forEach((Q, i) => root.appendChild(quizCard(Q, i)));
    root.querySelector("#quizReset").onclick = () => renderQuiz(root);
  }

  function markScore() {
    const correct = Object.values(answered).filter(Boolean).length;
    document.getElementById("quizScore").textContent = `${correct} / ${(MODULE.quiz || []).length}`;
    if (correct > prog.quizBest) { prog.quizBest = correct; saveProg(prog); updateProgress(); }
  }

  function feedback(card, ok, explain) {
    const old = card.querySelector(".explain"); if (old) old.remove();
    const box = elFrom(`<div class="explain ${ok ? "ok" : "no"}">${ok ? "✓ Correct. " : "✗ Not quite. "}${explain ? esc(explain) : ""}</div>`);
    card.appendChild(box);
    card.classList.add("done");
  }

  function quizCard(Q, i) {
    const card = elFrom(`<div class="qcard" id="q-${i}"><div class="qnum">Question ${i + 1}</div><div class="q">${esc(Q.q)}</div></div>`);
    const record = (ok) => { answered[i] = ok; markScore(); };

    if (Q.type === "mc") {
      const wrap = elFrom(`<div class="choices"></div>`);
      Q.choices.forEach((ch, ci) => {
        const b = elFrom(`<button>${esc(ch)}</button>`);
        b.onclick = () => {
          if (card.classList.contains("done")) return;
          const ok = ci === Q.answer;
          b.classList.add(ok ? "correct" : "wrong");
          if (!ok) wrap.children[Q.answer].classList.add("correct");
          record(ok); feedback(card, ok, Q.explain);
        };
        wrap.appendChild(b);
      });
      card.appendChild(wrap);
    } else if (Q.type === "tf") {
      const wrap = elFrom(`<div class="tf"></div>`);
      [["True", true], ["False", false]].forEach(([label, val]) => {
        const b = elFrom(`<button>${label}</button>`);
        b.onclick = () => { if (card.classList.contains("done")) return;
          const ok = val === Q.answer; b.classList.add(ok ? "correct" : "wrong"); record(ok); feedback(card, ok, Q.explain); };
        wrap.appendChild(b);
      });
      card.appendChild(wrap);
    } else if (Q.type === "numeric") {
      const row = elFrom(`<div class="row"><input class="num" type="number" inputmode="numeric"/><button>Check</button></div>`);
      const input = row.querySelector("input"), btn = row.querySelector("button");
      btn.onclick = () => { if (card.classList.contains("done")) return;
        const v = parseFloat(input.value); const ok = isFinite(v) && Math.abs(v - Q.answer) <= (Q.tolerance || 0);
        record(ok); feedback(card, ok, (ok ? "" : `Answer: ${Q.answer}. `) + (Q.explain || "")); };
      card.appendChild(row);
    } else if (Q.type === "build") {
      const row = elFrom(`<div class="row">
        <button data-act="go" class="ghost">Open Explore</button>
        <button data-act="check">Check my atom</button></div>`);
      row.querySelector('[data-act="go"]').onclick = () => show("explore");
      row.querySelector('[data-act="check"]').onclick = () => {
        if (card.classList.contains("done")) return;
        if (typeof window.moduleState !== "function") { feedback(card, false, "This page can't read the build state."); return; }
        const st = window.moduleState();
        const ok = Object.keys(Q.check).every((k) => matches(st[k], Q.check[k]));
        const fmt = (v) => (typeof v === "number" ? +v.toFixed(2) : v);
        const detail = Object.entries(Q.check).map(([k, v]) => `${k}=${describe(v)}`).join(", ");
        record(ok); feedback(card, ok, (ok ? "" : `Target: ${detail}. You have ${Object.keys(Q.check).map((k) => `${k}=${fmt(st[k])}`).join(", ")}. `) + (Q.explain || ""));
      };
      card.appendChild(row);
      card.appendChild(elFrom(`<div class="build-note">Build it under the Explore tab, then come back and press “Check my atom”.</div>`));
    }
    return card;
  }
})();
