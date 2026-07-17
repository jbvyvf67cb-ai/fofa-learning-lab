# Spelling — the word bank

The foundation of the Spelling lab: **30,681 kid-safe English words, each annotated with
relative difficulty** — an expansive, data-driven "spelling bee list" rather than a fixed few
hundred words. Everything downstream (lessons, quizzes, adaptive practice) selects from this bank.

**Canonical data:** [`data/words.csv`](./data/words.csv) · summary in
[`data/summary.json`](./data/summary.json).

## Why this source

Real difficulty isn't guessed — it comes from a psycholinguistic megastudy:

> Kuperman, V., Stadthagen-González, H., & Brysbaert, M. (2012). **Age-of-acquisition ratings
> for 30,000 English words.** *Behavior Research Methods*, 44, 978–990.

merged with **SUBTLEX-US** word-frequency counts and per-word letter / phoneme / syllable
counts (the published "51,715 words" table). We filter that to clean, lowercase, kid-safe words
that have an age-of-acquisition rating, then compute the annotations below. Freely available for
educational/research use; the raw table is kept under [`build/`](./build) for reproducibility.

## Three ways a word is "hard" (the schema)

`data/words.csv`, one row per word:

| column | meaning |
|---|---|
| `word` | the headword (lowercase) |
| `difficulty` | **1–10 — the word's *level*.** How advanced/long/rare it is (a spelling-bee ramp). From age-of-acquisition + length + syllables + rarity. `cat`=1, `pharmaceutical`=10. |
| `trickiness` | **1–10 — *misspelling risk*** even when you know the word. From orthographic traps (double/silent letters, `-tion`/`-ible`/`-ence` suffixes, `ie`/`ei`) + sound-to-spelling gap. This is why `rhythm` (diff 2) and `embarrass` (diff 2) still score `trickiness` 7 and 9. |
| `band` / `band_label` | 1–7 grade band from age-of-acquisition: Kindergarten → Grades 1-2 → 3-4 → 5-6 → 7-8 → High School → Advanced. |
| `aoa` | mean age (years) at which the word is learned — the raw signal behind `band`. |
| `syllables`, `letters`, `phonemes` | structural counts (letters − phonemes ≈ silent letters / digraphs). |
| `freq_pm` | frequency per million words (SUBTLEX-US); rarity feeds `difficulty`. |
| `pct_known` | fraction of adult raters who knew the word (obscurity check). |
| `pos` | dominant part of speech. |
| `patterns` | `|`-separated trap tags: `double-letter`, `silent-k`, `ie/ei`, `-tion`, `-ough`, … — teach spelling by pattern. |

**`difficulty` and `trickiness` are orthogonal on purpose.** That's the useful part: you can ask
for *"Grade 3–4 words that are easy to know but tricky to spell"* — `necessary`, `believe`,
`because`, `tomorrow` — which is exactly the sweet spot for practice.

Distribution: `difficulty` is percentile-binned (~3,068 words per level, an even ramp); grade
bands range from 950 (Kindergarten) to 7,612 (Grades 7-8).

## Rebuild

```bash
cd build && python3 build_wordbank.py     # reads build/source_*.csv → writes data/words.csv + summary.json
```

The weights and grade-band cutoffs are all at the top of
[`build/build_wordbank.py`](./build/build_wordbank.py) and easy to re-tune. To refresh the raw
source: `en.aoa.csv` from
`huggingface.co/datasets/StephanAkkerman/English-Age-of-Acquisition`; kid-safety blocklist from
the LDNOOBW list (+ a small extra set in the script).

## Status

Data foundation only — no lessons or UI yet. Next: a Spelling subject page + practice modules
that draw from this bank (grade-banded lists, pattern drills, adaptive "words you missed"),
wired to the same `Fofa.report()` / gating engine the other subjects use.
