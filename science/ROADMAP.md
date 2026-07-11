# STEM Visualizations — Roadmap & Curriculum Design

A collection of **interactive, feature-rich** visualizations for teaching science &
technology. The pedagogical goal is not memorization of facts but **building
intuition by changing parameters** — every visualization should let the student
poke, optimize, break, and rebuild the system.

## Design principles

1. **Manipulate, don't just watch.** Every viz exposes sliders / inputs / drag
   targets. The student changes something and sees consequences immediately.
2. **Show the "why".** Live numeric readouts and annotations connect the visual to
   the underlying quantity (charge, mass, energy, mole count…).
3. **Challenge modes.** Each viz has goals ("build a Carbon-14 ion", "balance this
   equation", "make a semiconductor") so learning is active.
4. **Optimize.** Where there's a quantity to minimize/maximize (lattice energy,
   bond stability, gas work), let the student hunt for the optimum.
5. **View-source friendly.** No build step, no framework lock-in. Plain HTML / CSS
   / JS + Canvas/SVG so a curious student can read the source.

## Tech stack

- Static site, **no build step**. Plain HTML5 + CSS + vanilla JS, Canvas/SVG for
  graphics. Deployable to GitHub Pages or any static host.
- Shared styles in `assets/css/main.css`; each visualization lives in its own
  folder under `visualizations/` and is self-contained.

## Curriculum dependency tree

```
                     ┌─────────────────────────────┐
                     │  1. Atomic Structure         │  ← FIRST BUILD
                     │  (charge, mass, isotopes,    │
                     │   ions, electron shells)     │
                     └──────────────┬──────────────┘
                                    │
                     ┌──────────────▼──────────────┐
                     │  2. Electron Configuration   │
                     │  (shells, subshells,         │
                     │   valence electrons)         │
                     └──────────────┬──────────────┘
                                    │
                     ┌──────────────▼──────────────┐
                     │  3. Periodic Table Explorer  │
                     │  (annotated trends across    │
                     │   rows/periods/groups →      │
                     │   the "common property")     │
                     └───────┬──────────────┬───────┘
              atomic mass    │              │  valence / shells
              available  ────┘              └────┐
                                                 │
                     ┌───────────────────────────▼─┐
                     │  4. Chemical Bonding         │
                     │   4a Ionic                   │
                     │   4b Covalent  ★EXTRA FOCUS  │
                     │      (sharing, single/double/│
                     │       triple, polarity,      │
                     │       Lewis, shapes, shells) │
                     │   4c Metallic                │
                     │   4d Intermolecular (H-bond, │
                     │       van der Waals)         │
                     └───────┬──────────────┬───────┘
                             │              │
          ┌──────────────────▼──┐      ┌────▼─────────────────────┐
          │  FORK A — STOICH     │      │  FORK B — SOLID STATE    │
          │  (quantitative)      │      │  (qualitative physics)   │
          │                      │      │                          │
          │  5. Mole & Avogadro  │      │  9.  Crystal lattices &  │
          │  6. Molar mass &     │      │      packing             │
          │     conversions      │      │  10. Band theory (qual): │
          │  7. Balancing eqns + │      │      conductor /         │
          │     stoichiometry    │      │      insulator /         │
          │  8. Gas laws: PV=nRT │      │      semiconductor       │
          │     (ideal-gas sim)  │      │  11. Material properties │
          └──────────────────────┘      └──────────────────────────┘
```

## Assessment: is the foundation enough to branch into parallel paths?

**Question:** After atomic structure + bonding + electron shells, can we branch in
parallel into (A) stoichiometry and (B) qualitative solid-state physics?

**Answer: yes — the two forks share a common trunk and then genuinely diverge.**

- **The shared trunk is: Atomic Structure → Electron Configuration → Periodic
  Table → Bonding.** Both forks depend on it.
- **Fork A (Stoichiometry)** technically only needs the trunk *through the
  periodic table* — specifically **atomic/molar mass** and chemical formulas. The
  mole, Avogadro, molar-mass conversions, equation balancing, and PV=nRT follow
  from "count atoms → weigh them → ratio them → put gas in a box." Bonding is
  *helpful* (to justify formulas) but not strictly required, so this fork can even
  start right after the periodic table.
- **Fork B (Solid-State, qualitative)** forks specifically **off of Bonding** —
  it's the natural continuation of metallic/ionic/covalent-network bonds into
  crystal lattices, then band theory (which leans on electron shells/energy
  levels) to explain conductors, insulators, and semiconductors.

**Conclusion:** Build the trunk through **Bonding** (with the extra covalent/shell
focus you asked for). At that point both forks are fully unlocked and can be
developed in parallel by different contributors without blocking each other. The
only ordering constraint is: don't start Fork B before Bonding is done, and don't
start Fork A's molar-mass work before the periodic table exposes atomic masses.

## Build order (proposed)

| # | Visualization | Status |
|---|---------------|--------|
| 1 | Element Explorer (was Atomic Structure Builder) — public landing page; existence filter (nature/lab/theoretical/impossible) + electron-level/valence derivation | **done** ✅ |
| 1b | Isotopes & Average Atomic Mass | **done** ✅ (trunk depth; stoichiometry bridge) |
| 2 | Electron Configuration & Shells | **done** ✅ |
| 3 | Periodic Table Explorer (annotated trends) | **done** ✅ |
| 4 | Chemical Bonding (covalent focus) | **done** ✅ |
| 4b | VSEPR Molecular Geometry | **done** ✅ (trunk depth; covalent shapes & polarity) |
| 5 | Mole & Avogadro | planned (Fork A) |
| 6 | Molar Mass & Conversions | planned (Fork A) |
| 7 | Balancing & Stoichiometry | planned (Fork A) |
| 8 | Gas Laws PV=nRT | planned (Fork A) |
| 9 | Crystal Lattices | planned (Fork B) |
| 10 | Band Theory (qualitative) | planned (Fork B) |

**The trunk is complete.** Both forks (A: stoichiometry, B: solid-state) are now
unlocked and can be built in parallel. All four trunk visualizations share one
authoritative dataset, `assets/data/elements.js` (118 elements, generated by
`assets/data/_generate.js`), which the molar-mass tools in Fork A will reuse.

### Data & dev tooling
- `assets/data/elements.js` — generated, do not hand-edit.
- `assets/data/_generate.js` — regenerate with `node assets/data/_generate.js`.
- `assets/data/_smoke.js` — headless page smoke test (`npm i --no-save jsdom` then
  `node assets/data/_smoke.js`).
</invoke>
