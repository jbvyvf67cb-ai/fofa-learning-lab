/* Headless smoke test: load each visualization page in jsdom with a
   stubbed canvas 2D context, fire DOMContentLoaded, drive a few
   interactions, and report any runtime errors. Not shipped. */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

/* a no-op 2D context so canvas-driven code runs without a real canvas */
function stubCtx() {
  return new Proxy({}, { get: (_, p) => {
    if (p === "canvas") return { width: 0, height: 0 };
    if (p === "measureText") return () => ({ width: 10 });
    if (p === "createRadialGradient" || p === "createLinearGradient")
      return () => ({ addColorStop() {} });
    return () => {};
  }});
}

const PAGES = [
  "visualizations/element-explorer/index.html",
  "visualizations/periodic-table/index.html",
  "visualizations/electron-configuration/index.html",
  "visualizations/bonding/index.html",
  "visualizations/isotopes/index.html",
  "visualizations/vsepr/index.html",
  "visualizations/laser-diamond/index.html",
];

let failures = 0;

async function run(page) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => {
    const msg = String(e.detail || e.message || "");
    // jsdom can't parse modern CSS (gradients/grid) and lacks scrollIntoView —
    // both work fine in real browsers, so ignore those artifacts.
    if (msg.includes("Could not parse CSS stylesheet")) return;
    if (msg.includes("scrollIntoView is not a function")) return;
    errors.push("jsdomError: " + msg);
  });

  const dom = await JSDOM.fromFile(path.join(__dirname, "..", "..", page), {
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole: vc,
    pretendToBeVisual: true,
  });
  const { window } = dom;
  // stub canvas + rAF
  window.HTMLCanvasElement.prototype.getContext = () => stubCtx();
  window.requestAnimationFrame = (cb) => { return 0; }; // don't loop
  window.devicePixelRatio = 1;

  // wait for resources/scripts
  await new Promise((res) => {
    if (window.document.readyState === "complete") return res();
    window.addEventListener("load", res);
    setTimeout(res, 600);
  });
  // fire DOMContentLoaded handlers if not already
  window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));

  // drive interactions: change every select, click every button, move ranges
  const doc = window.document;
  try {
    for (const sel of doc.querySelectorAll("select")) {
      const opts = sel.querySelectorAll("option");
      if (opts.length > 1) { sel.value = opts[opts.length - 1].value; sel.dispatchEvent(new window.Event("change", {bubbles:true})); }
    }
    for (const r of doc.querySelectorAll('input[type=range]')) {
      r.value = r.max || "50"; r.dispatchEvent(new window.Event("input", {bubbles:true}));
    }
    for (const btn of doc.querySelectorAll("button")) {
      btn.dispatchEvent(new window.MouseEvent("click", {bubbles:true}));
    }
    // hover first periodic cell / gallery item if present
    for (const c of [...doc.querySelectorAll(".cell"), ...doc.querySelectorAll(".mol")].slice(0, 30)) {
      c.dispatchEvent(new window.MouseEvent("mouseenter", {bubbles:true}));
      c.dispatchEvent(new window.MouseEvent("click", {bubbles:true}));
    }
  } catch (e) {
    errors.push("interaction error: " + e.stack);
  }

  // capture any uncaught errors thrown synchronously
  window.addEventListener("error", (e) => errors.push("window error: " + e.message));

  dom.window.close();
  const ok = errors.length === 0;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${page}`);
  errors.slice(0, 6).forEach((e) => console.log("     " + e.split("\n")[0]));
}

(async () => {
  for (const p of PAGES) await run(p);
  console.log(failures ? `\n${failures} page(s) had errors.` : "\nAll pages loaded and interacted cleanly.");
  process.exit(failures ? 1 : 0);
})();
