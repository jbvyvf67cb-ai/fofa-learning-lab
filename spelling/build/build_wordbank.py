#!/usr/bin/env python3
"""Build the Fofa spelling word bank from the Kuperman age-of-acquisition megastudy.

Source (committed under build/ for reproducibility, one-time download otherwise):
  source_aoa_kuperman.csv  — Kuperman, Stadthagen-Gonzalez & Brysbaert (2012),
    "Age-of-acquisition ratings for 30,000 English words", Behavior Research Methods,
    merged with SUBTLEX-US frequency + letter/phoneme/syllable counts (51,715 rows).
    Mirror: huggingface.co/datasets/StephanAkkerman/English-Age-of-Acquisition (en.aoa.csv)
  blocklist_ldnoobw_en.txt — LDNOOBW "bad words" list (kid-safety filter).

Output:
  ../data/words.csv        — the annotated bank (one row per word, all features + scores)
  ../data/summary.json     — tier counts + methodology metadata (for the app / docs)

We do NOT invent difficulty out of thin air: every score is derived from measured,
citable features. Two orthogonal axes are annotated because a good spelling program
needs both:
  * grade_band  — WHEN a word is age-appropriate (from age-of-acquisition, in years).
  * difficulty  — HOW HARD the word is to SPELL (1-10), from length, syllables,
                  sound-to-spelling irregularity, and rarity. A word can be easy to
                  know but hard to spell ("necessary") or vice-versa.
Every underlying feature is kept in the output so the weighting can be re-tuned later.
"""
import csv, json, math, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source_aoa_kuperman.csv")
BLOCK = os.path.join(HERE, "blocklist_ldnoobw_en.txt")
OUT_CSV = os.path.join(HERE, "..", "data", "words.csv")
OUT_SUMMARY = os.path.join(HERE, "..", "data", "summary.json")


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


# --- kid-safety blocklist: exact words + any word containing a blocked token ---
block_exact, block_sub = set(), []
EXTRA_BLOCK = {"damn", "damned", "damning", "crap", "hell", "piss", "bloody"}
for line in list(open(BLOCK, encoding="utf-8")) + [w + "\n" for w in EXTRA_BLOCK]:
    w = line.strip().lower()
    if not w or not w.isalpha():
        continue
    block_exact.add(w)
    if len(w) >= 4:            # substring match only for longer stems, avoids false hits
        block_sub.append(w)


def blocked(word):
    if word in block_exact:
        return True
    return any(b in word for b in block_sub)


# --- orthographic "tricky pattern" tags — the teachable traps in English spelling ---
SILENT = [("kn", "silent-k"), ("wr", "silent-w"), ("mb$", "silent-b"), ("gh", "gh"),
          ("mn$", "silent-n"), ("ps", "silent-p"), ("bt$", "silent-b"),
          ("sc", "sc"), ("rh", "rh"), ("gn", "gn")]
SUFFIX = [("tion$", "-tion"), ("sion$", "-sion"), ("ious$", "-ious"),
          ("eous$", "-eous"), ("able$", "-able"), ("ible$", "-ible"),
          ("ance$", "-ance"), ("ence$", "-ence"), ("ough", "-ough")]


# each trap also carries how much it raises misspelling risk (points)
TRAP_POINTS = {
    "double-letter": 1.5, "ie/ei": 1.5, "silent-k": 2, "silent-w": 2, "silent-b": 2,
    "silent-n": 2, "silent-p": 2, "gh": 2, "sc": 1, "rh": 1.5, "gn": 1.5,
    "-tion": 1, "-sion": 1.5, "-ious": 1.5, "-eous": 1.5, "-able": 1.5, "-ible": 1.5,
    "-ance": 1.5, "-ence": 1.5, "-ough": 2.5,
}


def tags(word):
    t = []
    if re.search(r"(.)\1", word):
        t.append("double-letter")
    if re.search(r"(ie|ei)", word):
        t.append("ie/ei")
    for pat, name in SILENT + SUFFIX:
        if re.search(pat, word) and name not in t:
            t.append(name)
    return t


def trap_points(word, letters, phonemes):
    pts = sum(TRAP_POINTS.get(name, 0) for name in tags(word))
    # letters minus phonemes: more letters than sounds (silent letters, digraphs)
    if phonemes:
        pts += max(0, letters - phonemes)
    return pts


# --- load + clean ---
rows = []
for r in csv.DictReader(open(SRC, encoding="utf-8")):
    w = (r["Word"] or "").strip().lower()
    aoa = num(r["AoA_Kup"])
    if not w or not w.isalpha() or len(w) < 2:
        continue                 # single letters, tokens with punctuation
    if aoa is None:              # need an age-of-acquisition to place the word
        continue
    if blocked(w):
        continue
    rows.append({
        "word": w,
        "aoa": aoa,
        "pos": r["Dom_PoS_SUBTLEX"] or "",
        "freq_pm": num(r["Freq_pm"]) or 0.0,
        "letters": int(num(r["Nletters"]) or len(w)),
        "phonemes": int(num(r["Nphon"])) if num(r["Nphon"]) else None,
        "syllables": int(num(r["Nsyll"])) if num(r["Nsyll"]) else None,
        "pct_known": num(r["Perc_known"]),
    })

# de-dup on word, keep the most-frequent sense
best = {}
for r in rows:
    if r["word"] not in best or r["freq_pm"] > best[r["word"]]["freq_pm"]:
        best[r["word"]] = r
rows = list(best.values())


# --- spelling-difficulty composite (relative, 1-10 by percentile) ---
def zscorer(vals):
    xs = [v for v in vals if v is not None]
    mu = sum(xs) / len(xs)
    sd = (sum((x - mu) ** 2 for x in xs) / len(xs)) ** 0.5 or 1.0
    return lambda v: 0.0 if v is None else (v - mu) / sd

# rarity: rarer word -> higher. log-frequency, floored so 0-freq isn't -inf.
for r in rows:
    r["_rarity"] = -math.log10(r["freq_pm"] + 0.01)
    r["_loglen"] = math.log(r["letters"])
    r["_traps"] = trap_points(r["word"], r["letters"], r["phonemes"] or 0)

zA = zscorer([r["aoa"] for r in rows])
zL = zscorer([r["_loglen"] for r in rows])
zS = zscorer([r["syllables"] for r in rows])
zR = zscorer([r["_rarity"] for r in rows])
zT = zscorer([r["_traps"] for r in rows])


def percentile_1_10(key):
    order = sorted(rows, key=key)
    n = len(order)
    for i, r in enumerate(order):
        r["_p"] = min(10, 1 + int(10 * i / n))
    return {id(r): r["_p"] for r in rows}

# difficulty = overall spelling challenge / "level": how advanced, long, and rare the
# word is (bee-style ramp). Independent of the trap axis below.
for r in rows:
    r["_diff_raw"] = (0.42 * zA(r["aoa"]) + 0.28 * zL(r["_loglen"]) +
                      0.12 * zS(r["syllables"]) + 0.18 * zR(r["_rarity"]))
diff_p = percentile_1_10(lambda r: r["_diff_raw"])
for r in rows:
    r["difficulty"] = diff_p[id(r)]

# trickiness = misspelling risk even when you KNOW the word: driven by orthographic
# traps (double/silent letters, ambiguous suffixes, ie/ei) + sound-spelling gap.
# This is what makes "rhythm", "necessary", "believe" rank high despite being short.
for r in rows:
    r["_trick_raw"] = 0.70 * zT(r["_traps"]) + 0.15 * zL(r["_loglen"]) + 0.15 * zS(r["syllables"])
trick_p = percentile_1_10(lambda r: r["_trick_raw"])
for r in rows:
    r["trickiness"] = trick_p[id(r)]


# --- grade band from age-of-acquisition (years) ---
def grade_band(aoa):
    if aoa < 5:   return (1, "Kindergarten")
    if aoa < 7:   return (2, "Grades 1-2")
    if aoa < 9:   return (3, "Grades 3-4")
    if aoa < 11:  return (4, "Grades 5-6")
    if aoa < 13:  return (5, "Grades 7-8")
    if aoa < 15:  return (6, "High School")
    return (7, "Advanced")


for r in rows:
    r["band"], r["band_label"] = grade_band(r["aoa"])

rows.sort(key=lambda r: (r["band"], r["difficulty"], -r["freq_pm"]))

# --- write bank ---
os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
cols = ["word", "difficulty", "trickiness", "band", "band_label", "aoa", "syllables",
        "letters", "phonemes", "freq_pm", "pct_known", "pos", "patterns"]
with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(cols)
    for r in rows:
        w.writerow([r["word"], r["difficulty"], r["trickiness"], r["band"],
                    r["band_label"], round(r["aoa"], 2), r["syllables"], r["letters"],
                    r["phonemes"], round(r["freq_pm"], 2),
                    round(r["pct_known"], 2) if r["pct_known"] is not None else "",
                    r["pos"], "|".join(tags(r["word"]))])

# --- summary metadata ---
from collections import Counter
band_ct = Counter((r["band"], r["band_label"]) for r in rows)
diff_ct = Counter(r["difficulty"] for r in rows)
summary = {
    "total_words": len(rows),
    "source": "Kuperman, Stadthagen-Gonzalez & Brysbaert (2012), AoA of 30k English "
              "words (BRM), merged w/ SUBTLEX-US frequency; kid-safety filtered.",
    "axes": {
        "grade_band": "1=Kindergarten .. 7=Advanced, from age-of-acquisition (years)",
        "difficulty": "1 (easy) .. 10 (hard): overall 'level' of the word — how advanced, "
                      "long, and rare it is (bee-style ramp). Composite of AoA, length, "
                      "syllables, rarity.",
        "trickiness": "1 (regular) .. 10 (trap): misspelling risk even when you know the "
                      "word — double/silent letters, ambiguous suffixes, ie/ei, sound-spell "
                      "gap. Short-but-tricky words (rhythm, necessary) score high here.",
    },
    "by_band": {lab: band_ct[(b, lab)] for (b, lab) in sorted(band_ct)},
    "by_difficulty": {str(k): diff_ct[k] for k in sorted(diff_ct)},
}
json.dump(summary, open(OUT_SUMMARY, "w"), indent=2)
print(f"wrote {len(rows)} words -> {os.path.relpath(OUT_CSV, HERE)}")
print("by grade band:", summary["by_band"])
