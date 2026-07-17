# Writing Lab — Roadmap

The curriculum is a **trunk** (grammar and sentence mechanics) that everyone
walks, followed by **branches** (writing modes) that reuse the same primitives.
Each unit is an interactive experience, not a reading. Items marked ✅ exist
today; the rest are the build sequence.

> Status: the entire grammar trunk — Units 1–4 plus the Style &amp; Structure
> branch point (23 interactive modules) — is built and live. The writing-mode
> branches below are next.

---

## Trunk — Grammar & the Sentence

### Unit 1 · Words and their jobs (parts of speech)
The atoms of language. Every later module inherits the fixed color code
established here.

- ✅ **Sentence Anatomy** — click words to reveal part of speech + sentence role.
- ✅ **Nouns · Pronouns · Verbs · Adjectives · Adverbs** — one focused lesson
  per part of speech: what it is, how to spot it, an optional color-coded worked
  example, then tap-every-one practice with a hint on each wrong tap. (Pronoun
  sits next to noun because it *is* a noun stand-in — and the subject of a
  sentence is always a noun or pronoun.)
- ✅ **Word Sort** — drop words into part-of-speech buckets.
- ✅ **Part-of-Speech Detective** — one word, many disguises ("*book* a room" vs
  "read a *book*"); learn that a word's job depends on its use.
- ✅ **Word-Shape Lab** — turn a noun into a verb into an adjective
  (*beauty → beautify → beautiful*) and watch the sentence adapt.

- ✅ **Parts of Speech · Checkpoint** — a graded end-of-unit quiz. Pass at 80%
  to complete Unit 1; hard-gates entry to Unit 2, like the science quizzes.

### Unit 2 · The core of a sentence (subject + predicate)
- ✅ **Subject & Predicate** — concept lesson: find the who/what, then the
  action word, and watch the two-color split appear. Reuses Unit 1's colors
  (subject core = a noun/pronoun, predicate core = the verb).
- ✅ **Subject & Predicate Splitter** — drag the dividing line; every sentence
  has a *who/what* and a *what-about-it*.
- ✅ **Sentence Builder** — compose a grammatical sentence from a word bank;
  the tool refuses fragments and explains why.
- ✅ **Complete or Fragment?** — a fast judgment game.

### Unit 3 · Building out the sentence (phrases, clauses, objects)
- ✅ **Object Tracker** — direct vs. indirect objects, highlighted live.
- ✅ **Phrase Painter** — see prepositional, noun, and verb phrases as blocks.
- ✅ **Clause Combiner** — snap independent and dependent clauses together.

### Unit 4 · Sentence types & punctuation
- ✅ **Sentence-Type Sorter** — simple, compound, complex, compound-complex.
- ✅ **Punctuation Playground** — move a comma, change the meaning
  ("Let's eat, Grandma").
- ✅ **Run-on Repair** — fix run-ons and comma splices three different ways.

---

## Branch point — Sentence style & structure
Once the mechanics are automatic, we shift from *correct* to *effective*.

- ✅ **Rhythm & Length** — vary sentence length; hear and see the pacing.
- ✅ **Active ↔ Passive** — flip voice and feel the change in emphasis.
- ✅ **Combining & Reducing** — merge choppy sentences; trim bloated ones.
- ✅ **Parallelism Tuner** — align list items until they sing.

---

## Branches — Writing modes
Each branch is a self-contained track that assumes the trunk. They can be built
and taken in any order.

### 🌿 Descriptive writing
- Sensory-detail palette; show-don't-tell rewriter; imagery and figurative
  language (simile, metaphor, personification) sandboxes.

### 🌿 Persuasive writing
- Claim / evidence / reasoning builder; ethos-pathos-logos analyzer;
  counter-argument and rebuttal mapper; rhetorical-device spotter.

### 🌿 Narrative & creative writing
- Story-arc plotter; point-of-view switcher; dialogue punctuation trainer;
  "show the scene" sensory expander.

### 🌿 Expository & informational writing
- Paragraph anatomy (topic sentence → support → conclusion); transition
  chooser; outline-to-draft scaffolder.

---

## Graded checkpoints
The grammar trunk (Units 1–4) has right answers, so each unit ends with one
**objective, auto-graded checkpoint quiz** that hard-gates the next unit at 80%
— shared engine in `assets/js/wl-quiz.js`, questions in `quizzes/writing/`.
The style & writing-mode branches are craft (no single right answer), so those
are graded by **AI-scored rubric prompts** (`quizzes/writing/rubrics.json`,
`grade` gate) instead. Unit 1's checkpoint ships; Units 2–4 get theirs as they
leave the preview.

## Cross-cutting systems (build as needed)
- **Progress map** — a visual trunk-and-branches tree the learner walks.
- **Shared word/sentence bank** — grows in `assets/data/grammar.js`.
- **Achievement + streak layer** — light game scoring already seeded in Word Sort.

---

## Guiding sequence
1. Ship one polished interactive per unit before widening.
2. Never introduce a concept without a way to *manipulate* it.
3. Reuse the color code and shared data everywhere — consistency is the lesson.
