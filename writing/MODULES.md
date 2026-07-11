# Module authoring guide

Every experience under `visualizations/` is a self-contained folder with its own
`index.html`. Modules share exactly two things from the top-level `assets/`:

- **`assets/css/base.css`** — the design system and the canonical part-of-speech
  color variables (`--pos-noun`, `--pos-verb`, …).
- **`assets/data/grammar.js`** — the authoritative dataset: `WL_GRAMMAR.PARTS`,
  `WL_GRAMMAR.SENTENCES`, `WL_GRAMMAR.WORD_BANK`, and `WL_GRAMMAR.POS_ORDER`.

Keeping those two files central is what makes "a noun is blue" true across the
entire curriculum.

## Anatomy of a module

```
visualizations/<slug>/
  index.html      Structure + a small page-local <style> and <script>
```

A module's `index.html` should:

1. Link the shared stylesheet and (if it needs data) the shared dataset:
   ```html
   <link rel="stylesheet" href="/assets/css/base.css">
   <script src="/assets/data/grammar.js"></script>
   ```
2. Reuse `.site-head`, `.panel`, `.btn`, `.chip` and other shared components so
   every page feels like one product.
3. Render part-of-speech colors from the data, never hard-coded, e.g.
   `WL_GRAMMAR.PARTS.verb.color`.
4. Put page-specific CSS/JS inline. Only promote something to `assets/` once a
   second module needs it.

## Conventions

- **Vanilla only.** No frameworks, no bundlers, no npm. If you reach for a
  dependency, reconsider.
- **Root-absolute asset paths** (`/assets/...`) so a module works whether it's
  opened directly or served from a subpath. Links between modules are
  relative (`../word-sort/`).
- **Accessible by default.** Interactive elements are real `<button>`s, colors
  pair with text/shape cues (color is never the only signal), and keyboard
  users can reach everything.
- **Learn by changing things.** Every module needs a knob, a drag, or a click
  whose effect teaches the concept. No passive walls of text.

## Registering a module

Add a card to the top-level `index.html` grid:

```html
<a class="card" href="visualizations/<slug>/">
  <div class="thumb" style="background: …">✎</div>
  <div class="body">
    <h3>Module Name</h3>
    <p>One sentence on what the learner does.</p>
    <span class="tag">Unit 1 · Parts of speech</span>
  </div>
</a>
```

Update the module table in `README.md` and tick the item in `ROADMAP.md`.
