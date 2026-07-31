# Cardiometabolic Research Addendum — Blood Pressure, Glycaemia, and Lipids

Prepared: 2026-07-30  
Status: approved scope addition; scientific basis recorded; production implementation remains gated by prototype selection and specification approval.  
Population in scope: adults 18 years and older for whom ordinary self-directed nutrition planning is appropriate.

## 1. Product boundary

Mizaneh may collect optional blood-pressure, glycaemia, and lipid information to:

- determine whether ordinary automated planning remains inside the safe scope;
- explain when professional assessment is appropriate;
- select a general cardiometabolic-supportive food pattern;
- show trends without interpreting one isolated measurement as a diagnosis;
- preserve user-entered laboratory context and uncertainty.

Mizaneh must not:

- diagnose hypertension, prediabetes, diabetes, dyslipidaemia, cardiovascular disease, or any other condition;
- set medication targets, recommend medication changes, or replace medical nutrition therapy;
- infer a universal LDL-C goal;
- calculate cardiovascular risk unless a separately validated, licensed, population-appropriate implementation is approved;
- use one home value or one laboratory result as proof of disease;
- allow a generic disclaimer to bypass a safety exclusion.

## 2. Blood pressure

### Scientific findings

- WHO defines clinical hypertension as systolic blood pressure at least 140 mm Hg and/or diastolic blood pressure at least 90 mm Hg on two different days. A single value is not sufficient for diagnosis.
- The 2025 AHA/ACC guideline uses a lower classification framework: normal below 120/80, elevated systolic 120–129 with diastolic below 80, stage 1 at 130–139 or 80–89, and stage 2 at 140 or 90 and above.
- Because reputable guidelines use different classification frameworks, Mizaneh must not present one classification as a diagnosis. It should state which framework a reference label comes from, or avoid labels entirely in the ordinary planner.
- AHA/ACC defines severe hypertension in nonpregnant adults as blood pressure above 180/120 mm Hg. Symptoms suggesting acute target-organ injury require emergency assessment; an asymptomatic severe value still requires timely clinical evaluation.
- Home monitoring is useful only when performed with a validated upper-arm device and a standardised method. Cuffless smartwatch-style measurements should not be treated as equivalent to validated cuff measurements.
- Heart-healthy/DASH-style patterns, sodium reduction, appropriate physical activity, weight management, and reduction or elimination of alcohol are recommended lifestyle supports.
- WHO recommends less than 2,000 mg sodium per day (less than 5 g salt) for adults. This is a population recommendation, not a personalised prescription.
- Increasing potassium or recommending potassium-enriched salt must not be automated before screening for kidney disease and medicines or conditions that affect potassium handling.

### Implementation implication

Collect, when the user chooses to provide it:

- systolic and diastolic values;
- date and time;
- home or clinic setting;
- validated upper-arm cuff / other device / unknown;
- single reading or average of repeated readings;
- relevant urgent symptoms;
- diagnosed hypertension and current professional follow-up;
- antihypertensive medicine use, without asking for unnecessary free-text details.

Do not calculate a diagnosis. Store a safety result such as `ordinary_scope`, `professional_review`, or `urgent_assessment` with an explainable reason code.

## 3. Glycaemia

### Scientific findings

The ADA Standards of Care in Diabetes—2026 defines prediabetes in nonpregnant people using any of the following laboratory criteria:

- A1C 5.7–6.4%;
- fasting plasma glucose 100–125 mg/dL (5.6–6.9 mmol/L);
- two-hour plasma glucose during a 75-g oral glucose tolerance test 140–199 mg/dL (7.8–11.0 mmol/L).

Diagnostic criteria for diabetes are clinical/laboratory criteria and ordinarily require confirmation unless hyperglycaemia is unequivocal. Consumer CGM readings are not an approved screening or diagnostic substitute.

ADA 2026 defines clinically important hypoglycaemia as glucose below 70 mg/dL (3.9 mmol/L), with level 2 below 54 mg/dL (3.0 mmol/L). People using insulin or medicines that can cause hypoglycaemia require an individualised plan; ordinary automated calorie restriction or meal-timing changes may be unsafe.

ADA states there is no single ideal percentage of carbohydrate, protein, and fat for diabetes prevention or management. Meal plans should be individualised and should emphasise food quality: non-starchy vegetables, whole fruits, legumes, whole grains, nuts, seeds, appropriate protein sources, and low-fat dairy or alternatives, while minimising sugar-sweetened beverages, sweets, refined grains, red/processed meat, and ultra-processed foods. Medical nutrition therapy by a qualified dietitian is recommended for people with prediabetes or diabetes.

### Implementation implication

Collect, when voluntarily provided:

- whether the user has diagnosed prediabetes or diabetes;
- insulin or other glucose-lowering medicine associated with hypoglycaemia;
- recent clinically important or severe hypoglycaemia;
- test type: fasting plasma glucose, random plasma glucose, two-hour OGTT, A1C, or user-entered device value;
- value, unit, date, and laboratory/device source;
- whether the result has been reviewed by a clinician.

Do not infer an individual carbohydrate prescription from a glucose value. Do not generate an ordinary plan for insulin-treated diabetes, recurrent/severe hypoglycaemia, uncontrolled diabetes, or a situation requiring medical nutrition therapy.

## 4. Blood lipids

### Scientific findings

- The 2026 ACC/AHA multisociety dyslipidaemia guideline replaces the 2018 cholesterol guideline and treats LDL-C, non-HDL-C, triglyceride-rich particles, ApoB, and Lp(a) as parts of risk assessment.
- LDL-C and non-HDL-C treatment goals depend on absolute cardiovascular risk and clinical context. There is no scientifically defensible universal LDL-C target for all Mizaneh users.
- Lp(a) should generally be measured at least once in a lifetime to identify a risk-enhancing factor; interpretation and treatment implications belong in clinical care.
- ApoB can improve risk assessment in selected people, particularly with triglycerides above 200 mg/dL, diabetes, or low achieved LDL-C.
- Acute pancreatitis risk increases with triglycerides at or above 500 mg/dL and is particularly high at or above 1,000 mg/dL. These values require professional assessment; Mizaneh must not attempt dietary self-treatment as an ordinary plan.
- A heart-healthy pattern should favour vegetables, fruits, whole grains, legumes, nuts/seeds, appropriate protein sources, and unsaturated fats in place of saturated fats, while reducing sodium, added sugars, and ultra-processed foods.

### Implementation implication

Collect, when voluntarily provided:

- total cholesterol, LDL-C, HDL-C, triglycerides, and optional non-HDL-C;
- optional ApoB and Lp(a), clearly labelled as advanced values;
- units, laboratory date, fasting status, and clinician-review status;
- diagnosed dyslipidaemia, lipid-lowering medicine use, familial hypercholesterolaemia, and known cardiovascular disease only as concise structured fields.

Do not show a universal “normal LDL” target. Show “هدف درمانی به ریسک فردی و نظر پزشک وابسته است.” Triglycerides at or above 500 mg/dL trigger professional review; at or above 1,000 mg/dL trigger high-priority assessment and no ordinary automated plan.

## 5. Food-data requirements before production implementation

The existing `MealTemplate` model has calories, protein, and fibre but lacks the fields required for honest cardiometabolic recalculation. Production support requires provenance-aware data for at least:

- total carbohydrate;
- total fat;
- saturated fat;
- trans fat where available;
- sodium;
- added sugars where available;
- potassium only when reliable and accompanied by clinical cautions;
- serving amount and unit;
- raw/cooked state;
- source, version, confidence/completeness, and last review date.

Until this migration is complete, the product may show general pattern guidance but must not claim exact sodium, saturated-fat, added-sugar, or glycaemic compatibility calculations.

## 6. Safety policy summary

### Ordinary scope may continue

A general plan may continue when no exclusion is present and the user either reports no relevant diagnosis or has a stable clinician-managed condition that does not require the app to change medication, set a disease-specific target, or provide medical nutrition therapy. The plan must be labelled as general supportive nutrition rather than treatment.

### Professional review required; no ordinary plan

- diagnosed diabetes requiring medication coordination;
- insulin or hypoglycaemia-causing medicine;
- recurrent or severe hypoglycaemia;
- uncontrolled diabetes or unexplained marked hyperglycaemia;
- severe or uncontrolled hypertension;
- triglycerides at or above 500 mg/dL;
- known cardiovascular disease, advanced kidney disease, or a clinician-directed therapeutic diet;
- uncertain or contradictory measurements that materially affect safety.

### Urgent/high-priority assessment

- blood pressure above 180/120 mm Hg with concerning symptoms: emergency evaluation;
- blood pressure above 180/120 mm Hg without symptoms: timely clinical evaluation and no automated plan;
- glucose below 54 mg/dL, altered consciousness, inability to self-treat, or severe/recurrent hypoglycaemia: urgent care pathway;
- triglycerides at or above 1,000 mg/dL: high-priority clinical assessment due to pancreatitis risk;
- chest pain, severe shortness of breath, neurologic symptoms, fainting, or other emergency symptoms: local emergency pathway.

Mizaneh should not provide location-specific emergency numbers until a verified localisation mechanism exists.

## 7. Primary sources

1. Jones DW et al. 2025 AHA/ACC multisociety guideline for prevention, detection, evaluation, and management of high blood pressure in adults. *Circulation*. 2025. DOI: 10.1161/CIR.0000000000001356. https://professional.heart.org/en/science-news/2025-high-blood-pressure-guideline
2. World Health Organization. Hypertension fact sheet. 2025-09-25. https://www.who.int/news-room/fact-sheets/detail/hypertension
3. World Health Organization. Sodium reduction. 2026-05-11. https://www.who.int/news-room/fact-sheets/detail/sodium-reduction
4. American Diabetes Association Professional Practice Committee. Diagnosis and Classification of Diabetes: Standards of Care in Diabetes—2026. *Diabetes Care*. 2026;49(Suppl 1). DOI: 10.2337/dc26-s002.
5. American Diabetes Association Professional Practice Committee. Facilitating Positive Health Behaviors and Well-being: Standards of Care in Diabetes—2026. *Diabetes Care*. 2026;49(Suppl 1). https://diabetesjournals.org/care/article/49/Supplement_1/S89/163932/
6. American Diabetes Association Professional Practice Committee. Glycemic Goals, Hypoglycemia, and Hyperglycemic Crises: Standards of Care in Diabetes—2026. *Diabetes Care*. 2026;49(Suppl 1). https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/
7. Blumenthal RS et al. 2026 ACC/AHA multisociety guideline on the management of dyslipidemia. *Circulation*. 2026;153:e1154–e1276. DOI: 10.1161/CIR.0000000000001423.
8. Lichtenstein AH et al. 2026 Dietary Guidance to Improve Cardiovascular Health: A Scientific Statement From the American Heart Association. *Circulation*. 2026. DOI: 10.1161/CIR.0000000000001435.

## 8. Review dates

- Blood-pressure rules: review by 2027-07-30 or earlier if AHA/ACC, ESC, or WHO guidance changes.
- Diabetes/glycaemia rules: review by 2026-12-31 when the next ADA Standards of Care is expected.
- Lipid rules: review by 2027-07-30 or earlier if the 2026 guideline is corrected or materially updated.
- Cardiometabolic dietary pattern: review by 2028-03-31.
