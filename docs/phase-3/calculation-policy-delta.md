# Calculation Policy Delta for Specification Review

Prepared: 2026-07-30  
Status: proposed by `product-specification.md`; not implemented.

| Policy ID | Rule | Goal | Evidence basis | Certainty | Product status | Limitations | Review expiry |
|---|---|---|---|---|---|---|---|
| `energy.eer.nasem2023.v1` | NASEM 2023 adult EER equation by sex category and PAL | all new v2 plans | NASEM consensus report 2023 | high for population estimate | proposed for approval | individual error remains material | 2028-07-30 |
| `weight-loss.start.v2` | `min(500, 0.15 × EER)` deficit | weight loss | NICE 2025/2026 requires an individualised energy deficit; supported interventions often use 500–750 kcal/day | moderate for deficit, low for exact 15% product cap | explicit product decision | not a universal clinical rule; requires adequacy and safety checks | 2026-10-30 |
| `muscle-gain.start.v1` | `clamp(0.05 × EER, 100, 300)` surplus | muscle gain | reviews find no universal optimum; controlled studies commonly use 300–500 kcal/day | low-moderate | explicit conservative product decision | training status and individual response dominate | 2026-10-30 |
| `healthy-weight-gain.start.v1` | `clamp(0.10 × EER, 200, 500)` surplus | healthy weight gain | NICE gradual nutrition support principles; limited athlete/general trials | low-moderate | explicit conservative product decision | not for malnutrition/refeeding or clinical nutrition support | 2026-10-30 |
| `trend.theil-sen.21d.v1` | robust slope, ≥5 measurements spanning ≥14 days | all | trend principle plus robust-statistics product design | moderate for trend principle; low for exact window | product analytics decision | sparse/biased measurements and fluid shifts remain | 2026-10-30 |
| `adjustment.step100.14d.v1` | proposal ≤100 kcal/day, at most every 14 days, ±300 before re-estimation | all | conservative adaptive product design | low | product safety decision | thresholds need usability and outcome validation | 2026-10-30 |
| `replacement.similarity.v1` | 10%/20% energy and 20%/35% protein classification thresholds | all | transparent product classification | low | product UX decision | not a medical equivalence standard | 2026-10-30 |

Approval of the specification approves these as transparent, versioned product policies under uncertainty; it does not convert them into clinical facts.
