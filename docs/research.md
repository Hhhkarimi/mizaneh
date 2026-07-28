# Research — Nutrition Formula Verification

Scope: verify the constants Mizaneh already uses against current sources,
flag anything that needs disclosure language rather than a formula change
(per the instruction not to silently alter formulas or scientific claims).

## 1. BMR formula — Mifflin–St Jeor

**Verdict: keep, correctly chosen for this product.** A 2005 systematic
review in the Journal of the American Dietetic Association found
Mifflin–St Jeor predicted resting metabolic rate within 10% of measured
values more often than Harris–Benedict, Owen, or WHO/FAO/UNU, in healthy
non-obese and obese adults, making it the most broadly reliable equation
for a general-audience tool. More recent work (2024–2025, hospitalized
patients with BMI > 35–40) confirms all standard predictive equations,
Mifflin–St Jeor included, lose accuracy at high BMI and can miss by
250–315 kcal/day in that subgroup — relevant as a disclosure ("estimates,
least accurate for very high BMI"), not as a reason to switch formulas for
a general-population calculator.

## 2. Activity multipliers

The four multipliers already in code (1.2 / 1.375 / 1.55 / 1.725) match
the standard Mifflin–St Jeor activity-factor scale used across clinical
and consumer calculators. No change recommended.

## 3. The 7700 kcal ≈ 1 kg rule (used for pace → deficit conversion)

**Verdict: keep the static approximation, but disclose its limitation.**
This is the metric equivalent of the "3500 kcal per pound" rule. A well-known
2013 critique (Hall & Chow, *International Journal of Obesity*) and its
follow-up literature show static kcal-to-mass conversions systematically
overestimate weight loss, because they ignore the drop in energy
expenditure that comes with a smaller body and adapting metabolism over
time — real predictive accuracy requires a dynamic model (e.g. the NIH
Body Weight Planner), which is out of scope for a lightweight, no-backend
calculator like Mizaneh. National guidance bodies (NHS, NHLBI, American
Dietetic Association) still publish the same static rule of thumb (≈500
kcal/day deficit ≈ 0.5 kg/week) for public-facing tools, so keeping it is
consistent with common practice — but the UI should say plainly that the
projected timeline is a rough estimate that tends to slow down in
practice, not a guarantee.

## 4. Calorie floors (1200 female / 1500 male)

**Verdict: keep as a hard floor, and the current use (as a floor, not a
target) is exactly correct.** Multiple consumer-health and clinical sources
converge on 1,200–1,500 kcal/day (women) and 1,500–1,800 kcal/day (men) as
the low end of a safe self-directed range, explicitly warning that these
numbers are a floor to avoid dropping below, not a target to aim for, and
that sustained intake near the floor without medical supervision raises
the risk of nutrient shortfall and muscle loss. The current code already
treats them as a `Math.max()` floor rather than a default target, which is
the correct pattern — this needs to stay legible in the UI (e.g. explicit
copy: "این عدد کف امنیتی است، نه هدف").

## 5. Protein-per-kg targets (1.35 general / 1.6 high-protein)

These fall inside commonly cited ranges for weight-management diets
(moderate: ~1.2–1.6 g/kg; higher-protein plans: up to ~2.0–2.2 g/kg body
weight in some sports-nutrition guidance). 1.35/1.6 are on the
conservative side of those ranges, which is appropriate for a general,
non-athlete audience with no medical screening step. No change recommended.

## 6. Fiber target (14 g / 1000 kcal)

This is the long-standing USDA/Institute of Medicine-style guideline
figure (~14 g fiber per 1000 kcal) used broadly in dietary-guidelines
literature. No change recommended.

## 7. Consequence for `implement`

No formula constants change. Two concrete, non-scientific improvements are
justified by this research:
1. Add a one-line disclosure near the calorie/timeline output: projections
   are rough estimates, tend to overstate real-world pace, and calorie
   floors are safety limits, not goals.
2. Add an explicit non-blocking advisory (not a hard gate) for inputs that
   sit outside the evidence base described above (e.g. age < 18, BMI < 16,
   or a requested pace at the outer edge of the 0.25–0.75 kg/week range
   combined with a low target weight) suggesting professional guidance —
   consistent with "do not represent as medical diagnosis or treatment"
   and with keeping the tool usable without forcing a stop.

## Sources consulted

- Frankenfield D, Roth-Yousey L, Compher C. Comparison of predictive
  equations for RMR in healthy nonobese and obese adults: a systematic
  review. *J Am Diet Assoc.* 2005.
- Hall KD, Chow CC. Why is the 3500 kcal per pound weight loss rule wrong?
  *Int J Obes.* 2013.
- Multiple 2024–2025 clinical comparisons of REE predictive equations in
  obese cohorts (Nutrients 2025; Medicine 2024; PMC 11820646).
- Public health / clinical consumer sources on minimum safe calorie
  intake (MedlinePlus-sourced summaries, WebMD, MedicalNewsToday).
