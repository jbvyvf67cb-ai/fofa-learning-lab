# Advanced · Laser on Diamond — module content

**Explore:** the Laser-on-Diamond simulation (this folder).
**Status:** ✅ written (mirrors `module.js`). **Track:** advanced / Fork B (materials).
**Owns:** bandgap/transparency (light); thermal conduction & the local rise; the boundary
condition & finite-size heat loss; graphitization runaway; the two thresholds.
Build tasks grade against `moduleState()` → `{ regime, cuts, timeHelps, boundary, atmos }`.

Full physics brief: [`../../ideas/laser-on-diamond.md`](../../ideas/laser-on-diamond.md).

## Lessons
1. **Why a laser passes straight through** — bandgap; single sub-gap photons can't be absorbed;
   absorption is nonlinear/defect/graphite (bundled here as an adjustable "absorbed fraction").
2. **The lattice fights back (local rise)** — diamond's record conductivity conducts heat away;
   ΔT_loc = P_abs/(4πk)(1/a − 1/b); ~40 W needed to cut a heat-sunk stone at 1 µm.
3. **The boundary decides everything** — a finite, isolated diamond sheds only ~0.5–1 W at its
   surface, so any absorbed power above that preheats the whole stone until it cuts — time helps.
4. **Graphitization runaway** — sp³→sp² graphite is black, absorbs more, and runs away; the two
   thresholds (~40 W local vs ~1 W bulk).

## Model
- Local rise: ΔT_loc = P_abs/(4πk)(1/a − 1/b), a ≈ w₀.
- Bulk transient (lumped capacitance, RK4): C·dT/dt = P_abs − hA(T−T∞) − εσA(T⁴−T∞⁴),
  C = ρc_p(4/3)πb³, A = 4πb².
- Spot temperature T_spot = T_bulk(t) + ΔT_loc; a "cut" triggers when T_spot ≥ T_g ≈ 1900 K.
- Boundary control sets how heat leaves: Heat-sunk (T_bulk pinned at ambient), Air-cooled
  (convective), Isolated (natural convection / radiation only; vacuum removes convection).
- Constants: ρ 3515, c_p 509, σ 5.67e-8, ε 0.05, T_g 1900, T∞ 300.

## Quiz bank
- 4 multiple-choice + 1 true/false on transparency, conduction, the boundary, and runaway.
- (build) Set it up so infinite time DOES help → `{ timeHelps: true }` (Isolated + modest power).
- (build) Put it in the safe regime that never cuts → `{ cuts: false }`.

## Simplifications (shown in an "assumptions" card)
Constant k (real k ~1/T → underestimates hot-spot T); spherical single-length source; lumped bulk;
hard T_g threshold (really an Arrhenius rate); absorbed fraction stands in for uncertain nonlinear/
defect absorption. Pulsed "cold ablation", wavelength, oxidation feedback, and the moving cut are omitted.
