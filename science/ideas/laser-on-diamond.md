# Idea (captured) — Laser-on-Diamond simulation

**Status:** planned advanced module (own visualization). Not yet built.
**Where it fits:** a standalone module in the advanced / **Fork B (solid-state & materials)**
track — it reuses the Learn/Explore/Quiz module shell. It is *not* part of M1–M6.

**How it relates to the chemistry curriculum (honest scoping):**
- **Covalent bonds** — light touch: the sp³→sp² graphitization is a bond-type flip
  (diamond's covalent network → graphite's sheets). A good hook, not the core lesson.
- **Band gap** — one clickable card: diamond's 5.5 eV gap is why it's transparent to
  sub-gap photons. The deep band-theory content still belongs in Fork B's band-theory module.
- **The real payload** — thermal physics + finite size: heat deposition vs. removal, the two
  thresholds (~40 W local conduction vs ~1 W bulk surface loss), and the boundary-condition
  switch that flips whether "infinite time helps." Needs a transient ODE integrator + a
  temperature-field render.

**Build size:** larger than the chemistry visualizations (≈20 knobs, a regime map, an ODE
sim, ~14 concept cards). Scope as its own effort.

---

The full physics/parameter brief the user provided is preserved verbatim below.

---

## Laser-on-Diamond: Simulation & Visualization Spec

**Purpose.** Interactive, adjustable STEM visualization ("what happens when a laser hits a
diamond, at the molecular/thermal level"). Defines the premise, governing equations, tunable
knobs with realistic ranges, the regime map to reveal, and the clickable properties learners
can explore. The pedagogical payload: **whether "infinite time helps" depends entirely on
whether the diamond is finite and how its boundary sheds heat.**

### 1. The Premise
A focused laser illuminates a diamond. Diamond is transparent to most laser wavelengths
(bandgap ≈ 5.5 eV ≈ 225 nm), so ordinary visible/IR photons pass through. Absorption happens via:
1. **Nonlinear (multiphoton) absorption** at the focus — scales with *intensity*, not raw power.
2. **Linear absorption at defects/inclusions** (nitrogen, vacancies, graphitic specks) — weak in clean type IIa.
3. **Graphitization feedback**: above ~1,800–1,900 K, sp³→sp² graphite forms, which is black and
   absorbs strongly — positive feedback → ablation (a cut).
Absorbed power heats a micron focal volume; heat leaves by conduction (diamond ~5× copper) and
finally convection/radiation at the outer surface.

### 2. The Central Insight: Finite Size Changes the Answer
**Threshold A — local conduction (the "infinite diamond" answer):**
ΔT_loc = P_abs/(4πk) · (1/a − 1/b). Reaching graphitization needs P_abs ≳ 4πk·a·(T_g − T∞) ≈
**40 W absorbed** for a 1 µm spot. Weak beam → steady sub-graphitization temp instantly;
**infinite time does not help.**
**Threshold B — bulk boundary balance (the "finite diamond" answer):**
P_abs = hA(T_bulk − T∞) + εσA(T_bulk⁴ − T∞⁴). A clear 1 mm diamond sheds only ~0.5–0.7 W even
glowing at T_g, so any absorbed power above ~1 W drives the whole stone's baseline up over
time until graphitization is inevitable. **Infinite time absolutely helps.**

| | Infinite / heat-sunk | Finite, isolated |
|---|---|---|
| Governing threshold | Local conduction (~40 W @ 1 µm) | Bulk surface loss (~0.5–1 W) |
| Effective spot temp | T∞ + ΔT_loc | T_bulk(t) + ΔT_loc |
| Does infinite time help? | No — steady state in ms | Yes — bulk baseline rises over s–min |
| Limiting resource | Lattice conductivity k | Boundary heat loss h, ε, b |

### 3. Governing Equations
- Intensity: I = P_L/(π w₀²) (CW); I_peak = E_p/(π w₀² τ_p) (pulsed).
- Absorbed power: linear ≈ P_L·α_abs·L; two-photon ∝ β₂·P_L²/w₀; above T_g swap graphite's
  strong absorption (α jumps, ε 0.03→0.8) → runaway; in air above ~900 K add exothermic oxidation.
- Local rise: ΔT_loc = P_abs/(4πk)·(1/a − 1/b), a ≈ w₀.
- Bulk transient (lumped): C·dT_bulk/dt = P_abs − hA(T_bulk−T∞) − εσA(T_bulk⁴−T∞⁴),
  C = ρ c_p (4/3)π b³, A = 4π b².
- Spot temp & trigger: T_spot(t) = T_bulk(t) + ΔT_loc → cut when T_spot ≥ T_g.
- Thermal confinement (pulsed): Π = α τ_p / w₀² ≪ 1 → heat confined during pulse.

### 4. Knobs
P_L (1e-3–100 W, def 5); λ (200–10600 nm, 1064); w₀ (0.5–50 µm, 1); CW/Pulsed; τ_p (1e-15–1e-9 s,
1e-12); f_rep (1e3–1e8 Hz, 1e6); E_p (1e-9–1e-3 J, 1e-6); b (0.1–10 mm, 1) — finite size/heat
capacity/area; k (500–3300 W/m·K, 2000); α_abs (1e-3–1e3 1/cm, 0.1); β₂ (0.01–10 cm/GW, ~1);
T_g (1700–2100 K, 1900); T_ox (800–1000 K, 900); ρ 3515; c_p 509; boundary condition {isothermal
sink, convective, isolated} (def isolated) — which threshold governs; h (5–500 W/m²·K, 20); ε
(0.02–0.9, 0.03→0.8 graphitized); T∞ (200–400 K, 300); atmosphere {vacuum/inert, air+O₂}; t
(1e-6–∞) — the "infinite time" axis.
Derived/displayed: I, I_peak, P_abs, ΔT_loc, T_bulk(t), T_spot(t), α = k/(ρc_p), Π,
time-to-graphitization, active regime.

### 5. Regime Map
- **Transparent/sub-threshold** — P_abs tiny → stays cold/clear → time doesn't help.
- **Local conduction-limited** — good heat sink → needs P_abs ≳ 4πk a ΔT_g (~40 W @ 1 µm) → time doesn't help.
- **Bulk boundary-limited** — finite + isolated → whole stone preheats; cuts if P_abs > surface loss (~1 W) → **time helps**.
- **Runaway/graphitization** — any spot T > T_g → sp³→sp² → ablation → cut (fast once tripped).
- **Cold ablation (pulsed)** — Π ≪ 1, high I_peak → direct bond-breaking, minimal bulk heat.
A live regime badge + a 2-D phase diagram (P_L vs b, or P_L vs boundary condition) with a moving dot.

### 6. Clickable learning cards
Bandgap (5.5 eV); two-/multiphoton absorption (∝ intensity²); thermal conductivity (light atoms,
stiff bonds, fast phonons; isotope effect pure ¹²C → ~3300; drops ~1/T hot); thermal diffusivity &
confinement (α = k/ρc_p); graphitization (sp³→sp² ~1,900 K, rate-dependent); positive feedback
(graphite black → hotter → more graphite); oxidation/combustion (C+O₂ from ~900 K, exothermic);
focal spot & diffraction limit; steady-state conduction (P/4πk a, 1/a−1/b); boundary conditions &
heat sinking; heat capacity & thermal mass; convection & radiation (∝ T⁴); CW vs pulsed; the two
thresholds (~40 W vs ~1 W).

### 7. What to display
Diamond cross-section with a color-mapped temperature field (bulk baseline + focal hot spot);
sliders for the §4 knobs; toggles for CW/pulsed, air/vacuum, boundary condition; live readout
(P_abs, ΔT_loc, T_bulk, T_spot, α, Π, time-to-graphitization, regime badge); time-evolution plot
of T_bulk(t) and T_spot(t) vs t with the T_g line marked; an "infinite time" toggle that jumps to
steady state. Lumped-capacitance ODE is a safe cheap bulk model; internal τ ~ b²/α (~1 ms for 1 mm),
bulk warm-up to T_g ~ s–min at a few watts.

### 8. Simplifications / where it breaks down
Constant k (real k(T) ~1/T, so we underestimate hot-spot T); spherical single-length source
(real focal volumes ellipsoidal); lumped-capacitance bulk (fast internal equilibration); T_g as a
temperature (really an Arrhenius rate — soft threshold); absorption inputs (β₂, defect α_abs)
uncertain; neglected extremes (plasma, optical breakdown, shock, melting, latent heat, self-focusing);
static spot (a real cut translates the focus — this models the local thermal state, not the scan).

### 9. Nominal constants
k 2000 W/m·K (up to ~3300 isotopically pure); ρ 3515 kg/m³; c_p 509 J/kg·K; α ~1.1e-3 m²/s;
bandgap 5.5 eV (~225 nm); T_g ~1,800–1,900 K; oxidation onset ~900 K; ε ~0.02–0.3 clear / ~0.8
graphitized; σ 5.67e-8 W/m²·K⁴; T∞ 300 K.

**One-line summary:** model spot temperature as *bulk baseline (finite-size surface heat loss over
time) + local rise (lattice conduction)*, expose all §4 knobs, and make the headline interaction the
boundary-condition switch that flips whether infinite time can ever cut the stone.
