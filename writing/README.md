# Writing Lab

**Interactive, feature-rich experiences for learning to write — by changing things.**

Writing Lab is the language-arts companion to
[stem-viz](https://github.com/jbvyvf67cb-ai/stem-viz). Where stem-viz lets you
learn science by building atoms and bending molecules, Writing Lab lets you
learn language by taking sentences apart, snapping them back together, and
watching how meaning shifts when you move a single word.

We start at the smallest unit — the sentence — and work outward: parts of
speech, how they lock together into subjects and predicates, then sentence
style, and eventually branching paths into descriptive, persuasive, and
creative writing. Every step is something you *do*, not something you read.

## Live experiences

The full grammar trunk — from parts of speech to the style branch point — is
built and playable. Twenty-three interactive modules, no dependencies.

**Unit 1 · Parts of speech**
- **Sentence Anatomy** — click any word to reveal its part of speech and job; toggle the subject / predicate split.
- **Nouns / Pronouns / Verbs / Adjectives / Adverbs** — five short lessons that teach each part of speech and how to spot it, then have you tap every one in a sentence, with a hint whenever you miss and an optional color-coded worked example.
- **Word Sort** — drop words into the right part-of-speech bucket; get ten right in a row.
- **Part-of-Speech Detective** — one spelling, many disguises: see how a word's job changes with use.
- **Word-Shape Lab** — morph one root across parts of speech (beauty → beautify → beautiful → beautifully).
- **Parts of Speech · Checkpoint** — a graded end-of-unit quiz (multiple-choice + true/false). Answers are graded server-side (the same `FofaAccount.quiz()` path science and math use); score 80% to complete Unit 1 and hard-gate the next unit.

**Unit 2 · Subject & predicate**
- **Subject & Predicate** — the concept lesson: find the who/what, then the action, and watch the two-color split appear, with a hint on every wrong tap.
- **Subject & Predicate Splitter** — place the dividing line between the two halves of any sentence.
- **Sentence Builder** — compose from a word bank; the tool refuses fragments and explains why.
- **Complete or Fragment?** — a fast judgment game with the tell revealed each round.

**Unit 3 · Phrases & clauses**
- **Object Tracker** — find direct and indirect objects, then reveal the full color-coded structure.
- **Phrase Painter** — paint prepositional, noun, and verb phrases as nested blocks.
- **Clause Combiner** — join two clauses with different connectors; watch compound vs. complex form.

**Unit 4 · Sentence types & punctuation**
- **Sentence-Type Sorter** — simple, compound, complex, or compound-complex?
- **Punctuation Playground** — move one comma, change the meaning.
- **Run-on Repair** — diagnose a run-on and fix it three valid ways.

**Style & structure (the branch point)**
- **Rhythm & Length** — sentence lengths as bars; flat reads dull, varied reads alive.
- **Active ↔ Passive** — flip voice and watch the doer and receiver trade places.
- **Combining & Reducing** — merge choppy sentences; trim bloated ones.
- **Parallelism Tuner** — align a mismatched list until every item shares one shape.

Next up are the writing-mode branches (descriptive, persuasive, narrative,
expository). See [`ROADMAP.md`](./ROADMAP.md) for the full curriculum arc and
[`MODULES.md`](./MODULES.md) for how each module is put together.

## Design principles

1. **Learn by changing things.** Every concept has a knob, a drag target, or a
   click. Understanding comes from cause and effect, not definitions.
2. **One consistent visual language.** Each part of speech has a fixed color
   (nouns are blue, verbs are red, …) defined once in
   [`assets/css/base.css`](./assets/css/base.css) and reused everywhere, so the
   color you learn in lesson one still means the same thing in lesson twenty.
3. **No build step.** Plain HTML, CSS, and JavaScript. Clone and open.
4. **Progressive forks.** Grammar is the trunk; descriptive, persuasive, and
   creative writing are branches that reuse the same primitives.

## Run it locally

No dependencies, no bundler:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Repository layout

```
index.html                 Landing page linking every experience
README.md · ROADMAP.md · MODULES.md
assets/
  css/base.css             Shared design system + part-of-speech colors
  data/grammar.js          Authoritative dataset (parts of speech, sentences)
  js/pos-lesson.js         Shared engine for the noun/verb/adjective/adverb lessons
  js/wl-nav.js             Shared "what's next" sequential lesson navigation
  js/quiz-shell.js         Checkpoint-quiz shell (submits answers to the server-graded FofaAccount.quiz)
visualizations/
  <slug>/index.html        One self-contained folder per experience (23 of them)
.github/workflows/pages.yml  Automatic GitHub Pages deploy (no build step)
```

## Contributing a module

Copy an existing folder under `visualizations/`, keep it self-contained, link
`assets/css/base.css` and `assets/data/grammar.js`, and add a card to
`index.html`. Match the conventions in `MODULES.md`.
