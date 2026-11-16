/* The Fofa Learning Lab moved into Claude Fofa on 2026-11-16.
   Every lab page loads this file, so it sends each page to the same place in the new lab. */
(function () {
  var p = location.pathname.replace(/^\/fofa-learning-lab\/?/, "");
  if (/^(login|settings)\.html$/.test(p)) p = "";
  location.replace("https://jbvyvf67cb-ai.github.io/claude-fofa/lab/" + p + location.search + location.hash);
})();
