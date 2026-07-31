# Calculation Source Registry

Prepared: 2026-07-30  
Status values: `preserved-legacy`, `candidate`, `approved`, `deprecated`, `blocked`.

No new numerical rule is approved by this document alone.

| Rule ID | Current/candidate method | Goal | Population | Source and date | Evidence | Limitations | Status | Review expiry |
|---|---|---|---|---|---|---|---|---|
| `energy.legacy.msj-pal.v1` | `RMR = 10W + 6.25H - 5A + sexConstant`; multiply by 1.2/1.375/1.55/1.725 | weight loss | adults 18–80 passing current gates | Mifflin et al. 1990; activity factors not directly registered | mixed | RMR equation and activity multiplier system are separate; individual error; fixed categories | preserved-legacy | 2027-01-30 |
| `energy.eer.nasem2023.candidate` | 2023 NASEM EER equations by age, sex, size and physical activity | all | healthy adults | NASEM 2023, DOI 10.17226/26818 | high | requires careful PAL mapping and regression comparison | candidate | 2028-07-30 |
| `loss.deficit.cap20.v1` | `min(requestedDeficit, 0.20 × TDEE)` | weight loss | current users | no direct primary-source rule registered | low/product rule | not a universal clinical recommendation | preserved-legacy | 2026-10-30 |
| `loss.floor.sex.v1` | 1200 kcal women / 1500 kcal men | weight loss | current users | no authoritative universal floor identified | low/product guardrail | cannot replace medical/nutrient screening; sex binary; body-size insensitive | preserved-legacy | 2026-10-30 |
| `loss.static7700.v1` | `pace × 7700 / 7`; linear weeks | weight loss | current users | traditional static conversion; limitation shown by Hall/NIDDK models | low for prediction | adaptation and composition changes ignored | deprecated for promises; preserved for migration only | 2026-10-30 |
| `loss.protein.v1` | 1.35 or 1.6 g/kg target weight, clamped to 22–31% energy | weight loss | current users | no exact combined rule registered | low/product rule | target-weight basis and percentage clamp not directly evidenced | preserved-legacy | 2026-10-30 |
| `shared.fat.v1` | 30% energy, or 34% Mediterranean | weight loss | current users | within EFSA 20–35% range; mode values not directly sourced | moderate for range, low for exact values | exact mode values are product choices | preserved-legacy | 2027-01-30 |
| `shared.carb.floor80.v1` | residual carbohydrate with minimum 80 g/day | weight loss | current users | no source registered | low | may conflict with energy/macro arithmetic and training needs | preserved-legacy | 2026-10-30 |
| `shared.fibre.v1` | `max(25 g, 14 g/1000 kcal)` | all | generally healthy adults | WHO 2026; authoritative DRI convention | moderate-high | tolerability and clinical conditions vary | candidate for shared policy | 2028-01-26 |
| `shared.produce.v1` | 400 g/day | all | adults | WHO 2026 | high | does not by itself guarantee micronutrient adequacy | candidate for shared quality check | 2028-01-26 |
| `shared.water.sex.v1` | 2.0 L women / 2.5 L men total water | all | healthy adults | EFSA adequate-intake framework | moderate | includes water from food; climate/exercise/medical needs vary | candidate with stronger wording | 2027-07-30 |
| `muscle.protein.default.candidate` | 1.6 g/kg/day; personalisation range 1.4–2.0 | muscle gain | screened healthy resistance-training adults | Morton 2018; ISSN 2017 | moderate-high | not for kidney disease or clinical populations; body-mass basis requires approval | candidate | 2027-07-30 |
| `muscle.protein.distribution.candidate` | 0.25–0.40 g/kg per feeding, roughly every 3–4 h | muscle gain | healthy exercising adults | ISSN nutrient timing 2017 | moderate | total daily intake is more important; meal frequency preference matters | optional candidate | 2027-07-30 |
| `muscle.surplus.start` | No number approved. Candidate design space: small bounded surplus; common 300–500 kcal/day evidence is limited | muscle gain | screened resistance-training adults | Slater 2019; Larson-Meyer 2022; Sanchez 2024 | low-moderate | no validated universal optimum | blocked pending owner/scientific review | 2026-10-30 |
| `weightgain.surplus.start` | No number approved. Candidate design space: gradual bounded increase with appetite/tolerance monitoring | healthy weight gain | screened adults without malnutrition/refeeding risk | NICE CG32; Larson-Meyer 2022 (athlete context) | low-moderate | evidence is often clinical or athletic, not general self-service | blocked pending owner/scientific review | 2026-10-30 |
| `adjustment.trend.window` | No exact window approved; must not react to one weigh-in | all | users with at least several comparable measurements | trend/self-monitoring literature and product safety principle | moderate for trend concept, low for exact threshold | measurement frequency, menstrual cycle, sodium, glycogen and adherence affect trend | blocked pending specification | 2026-10-30 |
| `refeeding.nice.highrisk` | NICE CG32 high-risk criteria | healthy weight gain | adults with possible malnutrition | NICE CG32 current recommendations | high | some criteria/labs cannot be safely assessed by an app | approved as exclusion logic, not a nutrition formula | 2027-07-30 |

## Required calculation metadata in future generated plans

Every generated plan must persist:

- `goal`
- `calculationPolicyId`
- `calculationPolicyVersion`
- `evidenceRegistryVersion`
- `createdAt`
- input units and normalised values
- uncertainty flags
- safety-screen result
- target ranges rather than only point targets
- plan version and parent-plan ID

## Cardiometabolic safety and interpretation registry — added 2026-07-30

| Policy ID | Rule | Domain | Population | Source | Evidence strength | Limitations | Product status | Review expiry |
|---|---|---|---|---|---|---|---|---|
| `bp.measurement.context.v1` | Never diagnose from one reading; store setting, device, repetition, date, and symptoms | blood pressure | nonpregnant adults | WHO hypertension 2025; AHA/ACC 2025 | high | WHO and AHA/ACC classification thresholds differ | approved safety/data rule | 2027-07-30 |
| `bp.severe.v1` | `systolic > 180 OR diastolic > 120` blocks ordinary planning; symptoms select emergency pathway | blood pressure | nonpregnant adults | AHA/ACC 2025 | high | measurement error and symptom context matter | approved safety rule | 2027-07-30 |
| `sodium.who.v1` | population guidance `<2000 mg sodium/day` (`<5 g salt/day`) | blood pressure/shared | adults | WHO sodium reduction 2026 | high | not an individual therapeutic target; current food data lacks sodium | approved reference; blocked for exact calculation | 2028-05-11 |
| `glucose.prediabetes.reference.v1` | A1C 5.7–6.4%; FPG 100–125 mg/dL; 2-h OGTT 140–199 mg/dL | glycaemia | nonpregnant adults | ADA Standards 2026 | high | reference only; laboratory methods and confirmation matter | approved educational reference; no diagnosis | 2026-12-31 |
| `glucose.hypoglycaemia.v1` | `<70 mg/dL` clinically important; `<54 mg/dL` level 2 | glycaemia | adults | ADA Standards 2026 | high | medication, symptoms, and device accuracy matter | approved safety rule | 2026-12-31 |
| `glycaemia.macro.individualise.v1` | no universal carbohydrate/protein/fat percentage | glycaemia | adults at risk for or living with diabetes | ADA Standards 2026 | high | medical nutrition therapy is individualised | approved product constraint | 2026-12-31 |
| `lipid.targets.riskbased.v1` | do not assign a universal LDL-C target; targets depend on ASCVD risk and clinical context | lipids | adults | ACC/AHA multisociety dyslipidaemia guideline 2026 | high | risk calculators need validated implementation and additional data | approved product constraint | 2027-07-30 |
| `triglyceride.review.v1` | `TG >=500 mg/dL` requires professional review and blocks ordinary planning | lipids | adults | ACC/AHA multisociety dyslipidaemia guideline 2026 | high | fasting status and secondary causes require clinical assessment | approved safety rule | 2027-07-30 |
| `triglyceride.priority.v1` | `TG >=1000 mg/dL` selects high-priority clinical assessment due to pancreatitis risk | lipids | adults | ACC/AHA multisociety dyslipidaemia guideline 2026 | high | not a diagnosis or medication recommendation | approved safety rule | 2027-07-30 |
| `cardiometabolic.pattern.v1` | vegetables/fruits, whole grains, legumes, appropriate proteins, unsaturated over saturated fats, low sodium/added sugar/UPF | shared cardiometabolic support | general adults | AHA dietary guidance 2026; ADA 2026; WHO 2026 | high | must remain culturally adaptable; not disease-specific MNT | approved qualitative policy | 2028-03-31 |
