/* ============================================================
   lesson-kit.js — shared helpers for the guided math lessons
   ------------------------------------------------------------
   Small, dependency-free toolkit each lesson uses:
     • Lesson.die / Lesson.miniDie  — draw a die face (pips or a number)
     • Lesson.check                 — an inline check question (in the flow)
     • Lesson.setup                 — track the checks, report to Fofa when the
                                      student has answered them all, and show a
                                      "lesson complete → next" banner.
   No tabs: the teaching text and the interactive live together on the page;
   the checks are just more blocks in the same column.
   ============================================================ */
"use strict";

const Lesson = {
  _checks: [],
  _cfg: null,
  _reported: false,

  // pip layout: which of the 9 grid slots are lit for each face
  PIPS: { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] },

  // a full die tile (pips for 1..6 on a 6-sided die, otherwise a number)
  die(value, opts) {
    opts = opts || {};
    const size = opts.size || 54, sides = opts.sides || 6;
    const el = document.createElement("div");
    el.className = "ldie";
    el.style.width = el.style.height = size + "px";
    if (sides === 6 && value >= 1 && value <= 6) {
      el.classList.add("pip");
      el.style.fontSize = size + "px"; // pip diameter is set in em, off this
      for (let i = 0; i < 9; i++) {
        const p = document.createElement("span");
        p.className = "p" + (Lesson.PIPS[value].indexOf(i) >= 0 ? " on" : "");
        el.appendChild(p);
      }
    } else {
      el.classList.add("num");
      el.textContent = value;
      el.style.fontSize = (value >= 100 ? size * 0.3 : size * 0.42) + "px";
    }
    el.dataset.v = value;
    return el;
  },

  // a coin token showing H or T
  coin(face, size) {
    const c = document.createElement("div");
    c.className = "coin" + (face === "T" ? " t" : "");
    c.style.width = c.style.height = size + "px";
    c.style.fontSize = (size * 0.42) + "px";
    c.textContent = face;
    return c;
  },

  // a tiny die (for grid cells)
  miniDie(value) {
    const d = document.createElement("div");
    d.className = "md";
    for (let i = 0; i < 9; i++) {
      const p = document.createElement("span");
      p.className = "p" + (Lesson.PIPS[value].indexOf(i) >= 0 ? " on" : "");
      d.appendChild(p);
    }
    return d;
  },

  /* Build a 6×6 dice-pair grid (rows = die A, cols = die B) into `mount`.
     opts: { showPair:true, headerSize:28 }. Returns { cells, table } where
     cells["a,b"] is the <div.cell> and .forEach(fn(cell,a,b)) iterates. */
  grid(mount, opts) {
    opts = opts || {};
    const headerSize = opts.headerSize || 28;
    const showPair = opts.showPair !== false;
    const host = typeof mount === "string" ? document.getElementById(mount) : mount;
    const table = document.createElement("table");
    table.className = "dgrid";
    const cells = {};

    const head = document.createElement("tr");
    const corner = document.createElement("th");
    corner.innerHTML = '<span style="color:var(--ink-dim);font-size:.68rem">A↓ B→</span>';
    head.appendChild(corner);
    for (let b = 1; b <= 6; b++) {
      const th = document.createElement("th");
      const hd = document.createElement("span"); hd.className = "hd";
      hd.appendChild(Lesson.die(b, { size: headerSize }));
      th.appendChild(hd); head.appendChild(th);
    }
    table.appendChild(head);

    for (let a = 1; a <= 6; a++) {
      const tr = document.createElement("tr");
      const rh = document.createElement("th");
      const hd = document.createElement("span"); hd.className = "hd";
      hd.appendChild(Lesson.die(a, { size: headerSize }));
      rh.appendChild(hd); tr.appendChild(rh);
      for (let b = 1; b <= 6; b++) {
        const td = document.createElement("td");
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.a = a; cell.dataset.b = b; cell.dataset.sum = a + b;
        if (opts.mini !== false) {
          const md = document.createElement("div"); md.className = "minidice";
          md.appendChild(Lesson.miniDie(a)); md.appendChild(Lesson.miniDie(b));
          cell.appendChild(md);
        }
        if (showPair) {
          const pr = document.createElement("div"); pr.className = "pair";
          pr.textContent = a + "," + b;
          cell.appendChild(pr);
        }
        td.appendChild(cell);
        cells[a + "," + b] = cell;
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    host.innerHTML = "";
    host.appendChild(table);
    return {
      cells, table,
      forEach(fn) { for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) fn(cells[a + "," + b], a, b); },
    };
  },

  // an inline check question. spec: { q, choices:[html], answer:idx, explain }
  check(mount, spec) {
    const host = typeof mount === "string" ? document.getElementById(mount) : mount;
    if (!host) return;
    const rec = { answered: false, correct: false };
    Lesson._checks.push(rec);

    const card = document.createElement("div");
    card.className = "lcheck";
    const q = document.createElement("div");
    q.className = "lq";
    q.innerHTML = spec.q;
    card.appendChild(q);
    const choices = document.createElement("div");
    choices.className = "lchoices";
    spec.choices.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "lchoice";
      b.innerHTML = c;
      b.onclick = () => {
        if (rec.answered) return;
        rec.answered = true;
        rec.correct = i === spec.answer;
        b.classList.add(rec.correct ? "right" : "wrong");
        if (!rec.correct) choices.children[spec.answer].classList.add("right");
        const fb = document.createElement("div");
        fb.className = "lfb " + (rec.correct ? "ok" : "no");
        fb.innerHTML = (rec.correct ? "✓ " : "✗ ") + (spec.explain || "");
        card.appendChild(fb);
        Lesson._tick();
      };
      choices.appendChild(b);
    });
    card.appendChild(choices);
    host.appendChild(card);
  },

  setup(cfg) {
    Lesson._cfg = cfg || {};
    Lesson._tick();
  },

  _tick() {
    const total = Lesson._checks.length;
    const done = Lesson._checks.filter((c) => c.answered).length;
    const correct = Lesson._checks.filter((c) => c.correct).length;
    const prog = document.getElementById("ltProg");
    if (prog) prog.textContent = total ? "✅ " + done + "/" + total : "";
    if (total > 0 && done === total && !Lesson._reported) {
      Lesson._reported = true;
      if (window.Fofa && Lesson._cfg && Lesson._cfg.module) {
        try {
          Fofa.report({ subject: "math", module: Lesson._cfg.module, activity: "lesson", kind: "quiz", score: correct, max: total });
        } catch (e) {}
      }
      Lesson._banner(correct, total);
    }
  },

  _banner(correct, total) {
    const foot = document.getElementById("lesson-foot") || document.querySelector(".lesson");
    if (!foot) return;
    const b = document.createElement("div");
    b.className = "lesson-done";
    const next = Lesson._cfg && Lesson._cfg.next;
    b.innerHTML =
      "<h2>🎉 Lesson complete!</h2>" +
      '<div class="score">' + correct + " / " + total + " checks</div>" +
      (next
        ? '<a class="next" href="' + next.url + '">Next: ' + next.title + " →</a>"
        : '<a class="next" href="../../">← Back to Math</a>');
    foot.appendChild(b);
    b.scrollIntoView({ behavior: "smooth", block: "center" });
  },
};
