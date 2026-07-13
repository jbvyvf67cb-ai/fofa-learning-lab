/* ============================================================================
   quizzes/_generate.js — export the canonical quiz banks to JSON.
   ----------------------------------------------------------------------------
   The science quizzes live in each science/visualizations/<mod>/module.js as
   `const MODULE = { id, title, quiz:[...] }` (consumed in-browser by the shared
   module-shell.js). This tool reads those files and writes a normalized JSON
   copy per module plus an index.json catalog, so the Home-Assistant side can
   fetch and serve/grade the same questions without parsing JS.

   Run from the repo root:  node quizzes/_generate.js
   Re-run whenever a science module.js quiz changes. JSON here is GENERATED —
   edit the module.js, not the JSON.
   ============================================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCI_DIR = path.join(ROOT, "science", "visualizations");
const OUT_SCI = path.join(__dirname, "science");

function loadModule(jsPath) {
  const src = fs.readFileSync(jsPath, "utf8");
  // module.js declares `const MODULE = {...}`; evaluate it in an isolated scope
  // with a stub `window` (some files reference window for the grading hooks).
  const fn = new Function("window", src + "\n;return typeof MODULE!=='undefined'?MODULE:null;");
  return fn({});
}

function normalizeQuiz(quiz) {
  return (quiz || []).map((q, i) => {
    const out = { id: "q" + (i + 1), type: q.type, prompt: q.q };
    if (q.type === "mc")      { out.choices = q.choices; out.answer = q.answer; }
    else if (q.type === "tf") { out.answer = q.answer; }
    else if (q.type === "numeric") { out.answer = q.answer; out.tolerance = q.tolerance || 0; }
    else if (q.type === "build")   { out.check = q.check; out.interactiveOnly = true; }
    if (q.explain) out.explain = q.explain;
    return out;
  });
}

function main() {
  fs.mkdirSync(OUT_SCI, { recursive: true });
  const catalog = { generated: true, subjects: {} };

  // ---- Science ----
  const sci = { title: "Science", basePath: "science/visualizations", modules: [] };
  const dirs = fs.readdirSync(SCI_DIR).filter((d) =>
    fs.existsSync(path.join(SCI_DIR, d, "module.js")));
  dirs.sort();
  for (const dir of dirs) {
    const mod = loadModule(path.join(SCI_DIR, dir, "module.js"));
    if (!mod) { console.warn("  ! no MODULE in", dir); continue; }
    const questions = normalizeQuiz(mod.quiz);
    const doc = {
      generated: true,
      subject: "science",
      slug: dir,
      id: mod.id,
      title: mod.title,
      source: `science/visualizations/${dir}/module.js`,
      page: `science/visualizations/${dir}/?beta=1`,
      gradeable: questions.filter((q) => !q.interactiveOnly).length,
      questions
    };
    fs.writeFileSync(path.join(OUT_SCI, mod.id + ".json"), JSON.stringify(doc, null, 2) + "\n");
    sci.modules.push({
      id: mod.id, slug: dir, title: mod.title,
      quiz: `quizzes/science/${mod.id}.json`,
      count: questions.length, gradeable: doc.gradeable,
      types: [...new Set(questions.map((q) => q.type))]
    });
    console.log("  science:", mod.id, "->", questions.length, "questions");
  }
  catalog.subjects.science = sci;

  // ---- Writing ----
  // Writing modules are interactive games/exploration, not multiple-choice quiz
  // banks, so their measurable is the activity outcome (see docs/BACKEND-CONTRACT.md).
  // Open-ended writing is graded by Claude via Home Assistant using a rubric.
  catalog.subjects.writing = {
    title: "Writing",
    basePath: "writing/visualizations",
    note: "Interactive activities report an outcome via Fofa.report(); open-ended prompts are graded via Fofa.grade() + the HA grading webhook.",
    rubrics: "quizzes/writing/rubrics.json",
    modules: []
  };

  catalog.subjects.math = { title: "Math", status: "coming-soon", modules: [] };
  catalog.subjects.reading = { title: "Reading", status: "coming-soon", modules: [] };

  fs.writeFileSync(path.join(__dirname, "index.json"), JSON.stringify(catalog, null, 2) + "\n");
  console.log("Wrote quizzes/index.json");
}

main();
