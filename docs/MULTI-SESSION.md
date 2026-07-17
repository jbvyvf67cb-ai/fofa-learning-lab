# MULTI-SESSION.md — how the Claude Code sessions divide the work

Fofa Learning Lab is built by **several Claude Code sessions working in parallel**. This file is the
charter: who owns what, which files are the seams between sessions, and the rules that keep concurrent
work from colliding. **Read this + [`../HANDOFF.md`](../HANDOFF.md) at the start of any session on this
project.**

---

## 1. The sessions and what they own

| Session | Owns | Works in | Reads (does not edit) |
|---|---|---|---|
| **Lab** (overall + front-end) | The Fofa shell (landing, `settings.html`, `login.html`), the design system (`assets/css/fofa.css`), the **client side of the backend contract** (`assets/js/fofa-*.js`: account, gate, lesson-guard, measure), the gating/stars UI, the `curriculum/index.json` **schema**, and repo-level docs. | `fofa-learning-lab` (this repo), branch `claude/fofa-learning-lab-setup-zmkbd5`. | the subjects' content; the HA backend. |
| **Home Assistant** (backend) | The private `fofa` integration that **implements** [`BACKEND-CONTRACT.md`](./BACKEND-CONTRACT.md) (accounts, grading, stars, storage), the Claude API key, and the parent dashboard ("Mr Banagrams"). | its **own private repo** — **does NOT push to this repo**. | this repo's `docs/BACKEND-CONTRACT.md` + `curriculum/index.json` (fetched at runtime). |
| **Subject sessions** (Science / Writing / Math / Reading) | Content: the lessons/modules under their own `<subject>/` folder, their `curriculum/index.json` **entries**, and (science) the `module.js` quiz banks. | `fofa-learning-lab`, same shared branch. | the shared client/design/contract. |

If you are a **new** session, figure out which row you are before editing anything.

---

## 2. The seams — shared source-of-truth files

These files are where sessions hand off to each other. Touching them affects everyone, so they have
owners and rules.

- **[`docs/BACKEND-CONTRACT.md`](./BACKEND-CONTRACT.md)** — the client ↔ server API
  (`/api/fofa/login|state|progress|quiz`, gating, stars §4b). **Owned jointly by Lab + HA.** Changing
  it is a negotiation between those two sessions; **subject sessions consume it, never edit it.**
- **[`curriculum/index.json`](../curriculum/index.json)** — ordered lessons, `gate` per lesson, and
  the `stars` policy. **Both the app and HA read it.** Subject sessions **add their own lessons**;
  the Lab session owns the schema (gate types, stars block) and the gating client. Keep it valid JSON.
- **`quizzes/`** — the generated quiz manifest (answer keys HA grades against). **Generated** by
  `node quizzes/_generate.js` from science `module.js`; edit the `module.js`, then regenerate — never
  hand-edit the JSON.
- **`assets/css/fofa.css`** — the one design system. Subject pages consume its tokens; **don't fork or
  override the palette/type.** Lab owns it.
- **`assets/js/fofa-account.js` · `fofa-gate.js` · `fofa-lesson-guard.js` · `fofa-measure.js`** — the
  client. Subject pages **include** these (login guard, gating, progress reporting); **don't
  reimplement** them. Lab owns them.

---

## 3. Rules of engagement (this repo)

- **One shared branch:** everyone in this repo commits to `claude/fofa-learning-lab-setup-zmkbd5`.
  Concurrent pushes are normal, so **`git fetch` + `git rebase` before pushing**, and retry on a
  rejected push. Small, focused commits. **Never force-push.** No PRs unless the human asks.
- **Stay in your folder.** A subject session edits only its `<subject>/` (plus its `curriculum` entries
  and, for science, `module.js`). Don't edit another subject's content or the shared client/design
  without coordinating.
- **Adding a lesson** (subject session): create `<subject>/visualizations/<slug>/index.html` (include
  `../../../assets/js/fofa-account.js`, `fofa-measure.js`, and `fofa-lesson-guard.js`), then add a
  `curriculum/index.json` entry (`module`, `slug`, `title`, `url`, `gate`). Gating **and stars apply
  automatically** — no client changes needed. For a graded science quiz, author it in `module.js` and
  run `node quizzes/_generate.js`.
- **Reporting outcomes from content:** call `Fofa.report({subject, module, activity, kind, score,
  max})` at a completion point (it forwards to the authenticated backend), or for a graded quiz use the
  shared quiz shell which posts to `/api/fofa/quiz`. Don't invent a new reporting path.
- **Contract changes are Lab + HA only.** If content needs a new capability from the backend, raise it
  with the Lab session; don't add ad-hoc endpoints.
- **Verify before committing:** load changed pages with zero console errors; `node quizzes/_generate.js`
  parses; science smoke test (`cd science && node assets/data/_smoke.js`) stays green.

---

## 4. Who reads what (cold start)

1. **Any session:** [`../HANDOFF.md`](../HANDOFF.md) (architecture) → this file (lanes + rules).
2. **Home Assistant session:** [`BACKEND-CONTRACT.md`](./BACKEND-CONTRACT.md) is the whole job;
   `curriculum/index.json` for gating + the `stars` policy.
3. **Subject session:** this repo's `HANDOFF.md`, the subject's own `HANDOFF/MODULES/ROADMAP` (science
   & writing have theirs), and §2–§3 above.

---

## 5. Current status snapshot (keep roughly current)

- **Lab / front-end:** complete against the contract; runs in a **mock backend** until the HA base URL
  is set in Settings, then switches to live with no code change. Login + sequential gating + stars are
  wired.
- **Home Assistant:** implementing `BACKEND-CONTRACT.md` privately; will build the Mr Banagrams tab.
- **Content:** Science (7 modules, Learn/Explore/Quiz), Writing (Unit 1 + more), Math (Probability arc,
  several lessons), Reading (arc drafted, not built).

Update this snapshot when a lane's status materially changes.
