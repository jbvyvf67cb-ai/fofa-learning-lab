# STEM Visualizations

Interactive, feature-rich visualizations for learning science & technology by
**changing things** — not by memorizing facts. The aim is for students to learn how
each system works well enough to tweak and optimize it.

**▶ Open `index.html`** for the landing page that links to every visualization.

## Live now — the foundations trunk is complete

1. **[Element Explorer](visualizations/element-explorer/index.html)** —
   build any atom from protons, neutrons, electrons; element identity, charge, mass
   number, isotope, ion, and electron shells update live. An existence filter
   (nature / lab / anything) auto-sets a valid isotope and the element's common
   natural ion (e.g. Na⁺, O²⁻, Fe²⁺/Fe³⁺ — clickable/cyclable), and the panel shows whether
   the nuclide occurs in nature, only in the lab, in theory, or is impossible — plus
   the electron-levels and valence derivation. An expandable explainer gives
   category-specific context (crust abundance + facts, first-synthesis history, or the
   band-of-stability physics) with a chart-of-nuclides (N vs Z) plot and the element's
   isotope-abundance breakdown. Protons range up to **Z = 1000** — elements beyond 118
   are generated with their systematic IUPAC placeholder names (e.g. 120 = unbinilium, Ubn)
   and shown as theoretical. This is the **only** visualization on the public
   landing page; the rest are gated behind `?beta=1`.
2. **[Electron Configuration & Shells](visualizations/electron-configuration/index.html)** —
   fill orbitals one electron at a time (s/p/d/f, spin, Hund's rule), with the aufbau
   energy ladder and the documented exceptions flagged.
3. **[Periodic Table Explorer](visualizations/periodic-table/index.html)** — all 118
   elements; colour by trend, highlight a group/period/block, read the shared property.
4. **[Chemical Bonding](visualizations/bonding/index.html)** — two-atom bond predictor
   (ionic/covalent/metallic), electron transfer & sharing, octets, polarity, bond order,
   and a covalent molecule gallery.

Trunk depth (interactive add-ons):
- **[Isotopes & Average Atomic Mass](visualizations/isotopes/index.html)** — mix isotopes,
  watch the weighted-average mass; the bridge to molar mass / the mole.
- **[VSEPR Molecular Geometry](visualizations/vsepr/index.html)** — bonds + lone pairs →
  rotatable 3D shape → polarity from the bond-dipole vector sum.

All share one authoritative dataset, `assets/data/elements.js`.

## Where this is going

See **[ROADMAP.md](ROADMAP.md)** for the full curriculum tree (atomic structure →
electron configuration → periodic table → bonding, then forking into stoichiometry
and qualitative solid-state physics) and the rationale for the parallel paths.

## Running locally

It's a static site with no build step. Open `index.html` directly, or serve the
folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Project layout

```
index.html                         landing page
ROADMAP.md                         curriculum design & build order
assets/css/main.css                shared styles
visualizations/<topic>/            one self-contained visualization per folder
```
