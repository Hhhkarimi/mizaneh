# Phase 1 Review Package — Mizaneh Goal Expansion

Status: **SCIENTIFIC REVIEW APPROVED — DISPOSABLE PROTOTYPE AUTHORIZED — NO PRODUCTION IMPLEMENTATION AUTHORIZED**  
Prepared: 2026-07-30

This package records the repository/product investigation and the first evidence review for extending Mizaneh from one weight-loss workflow to three explicit goals:

1. weight loss (`weight_loss`)
2. muscle gain (`muscle_gain`)
3. healthy weight gain (`weight_gain`)

The package intentionally does not modify production behavior. The request requires scientific review, prototype selection, and specification approval before implementation.

## Documents

- `current-product-investigation.md` — verified as-is product behavior and dependency map.
- `scientific-research-report.md` — evidence review and product implications.
- `evidence-matrix.csv` — recommendation-to-source mapping with certainty and limitations.
- `calculation-source-registry.md` — numerical-rule registry, including current unsupported rules.
- `scientific-uncertainty-register.md` — uncertainties that must remain visible in product decisions.
- `safety-exclusion-list.md` — automated-scope exclusions and escalation behavior.
- `research-update-policy.md` — source hierarchy, expiry, and update process.
- `prototype-brief.md` — three disposable UI variants and targeted editing prototypes; no variant is selected.
- `verification-report.md` — checks completed and checks blocked by the environment.
- `cardiometabolic-research-addendum.md` — approved scientific scope for blood pressure, glycaemia, and blood lipids.

## Review gates

Implementation must not begin until all of the following are explicitly approved:

1. scientific recommendations and automated-scope exclusions — **approved 2026-07-30**, including the cardiometabolic addendum;
2. one goal-selection prototype direction — **pending selection**;
3. a subsequent complete product specification — **pending**.

## Important repository conflict

The current project imports both Vazirmatn and Noto Nastaliq Urdu. The requested product constraint says Vazirmatn must be the only project font. This should be treated as a targeted compliance correction, not a redesign.
