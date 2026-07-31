> **Superseded:** This is a historical v4 document. Current behaviour and evidence boundaries are documented in `docs/clinical-nutrition-v5.md`.

# Cardiometabolic supportive planning v4

## Product decision

Mizaneh no longer blocks ordinary plan generation solely because a user reports stable hypertension, prediabetes/diabetes, dyslipidaemia, a symptom-free high blood-pressure reading, glucose 54–69 mg/dL, insulin or hypoglycaemia-risk medicine, or triglycerides 500–999 mg/dL.

For these profiles the application:

1. shows a prominent Persian clinician-review warning;
2. records the reason and the exact next step;
3. generates a conservative condition-adapted food pattern;
4. never changes medicine, diagnoses disease, calculates an insulin dose, or creates an individual treatment target;
5. preserves hard stops for urgent or out-of-scope situations.

## Hard-stop boundary

Plan generation remains blocked for urgent warning symptoms, severe hypoglycaemia or crisis symptoms, triglycerides at or above 1000 mg/dL, severe underweight/refeeding risk, pregnancy/breastfeeding, eating-disorder concern, serious allergy/cross-contact risk, swallowing difficulty, severe gastrointestinal conditions, and conditions requiring disease-stage-specific medical nutrition therapy such as kidney or liver disease.

A symptom-free blood-pressure reading above 180/120 is not treated as a diagnosis. The product asks the user to repeat the measurement correctly and contact a clinician promptly; warning symptoms independently trigger the urgent path.

## Condition-adapted food policies

### Hypertension / blood pressure

- prioritise a DASH-like pattern: vegetables, fruit, legumes, whole grains and lean protein;
- rank lower-sodium meals higher;
- display a general supportive sodium target below about 2000 mg/day;
- do not encourage potassium loading when kidney disease or a clinician-directed potassium restriction may apply.

### Prediabetes / diabetes

- use more consistent carbohydrate distribution across meals;
- prioritise high-fibre, minimally processed carbohydrate sources;
- rank meals with lower added sugar and refined carbohydrate higher;
- do not impose one universal macronutrient percentage;
- require explicit medication coordination when insulin, hypoglycaemia-risk medicine or recurrent hypoglycaemia is reported.

### Dyslipidaemia

- prioritise unsaturated fat, legumes, nuts, fish, soluble-fibre sources and lean/plant proteins;
- rank lower-saturated-fat meals higher;
- display a conservative supportive saturated-fat ceiling derived from no more than roughly 10% of energy when lipid support is active;
- never infer an LDL treatment target because the target depends on individual cardiovascular risk and clinician assessment.

## Nutrition-data completeness

The preserved catalogue originally contained calories, protein and fibre but lacked weighed ingredients and many nutrient fields. v4 adds carbohydrate, total fat, saturated fat, sodium, added sugar and potassium to the model, plan totals, editing UI and exports.

Because the existing recipes use household descriptions rather than verified gram weights, catalogue values are marked `estimated` and carry a source note. They are suitable for plan comparison and general food-pattern ranking, not medication dosing or clinical nutrient prescription. User-entered foods remain labelled `user_entered`. Verified data are never overwritten by the estimator.

A future verified catalogue should map weighed raw/cooked ingredients to a versioned national or authoritative composition database and retain food-code, dataset version, preparation state, yield and review date.

## Evidence sources

- American Diabetes Association. *Standards of Care in Diabetes—2026*, sections on facilitating positive health behaviours and hypoglycaemia. Individualised medical nutrition therapy; no single ideal macronutrient distribution; emphasis on vegetables, whole fruit, legumes, whole grains, lean protein, nuts/seeds and minimising sugar-sweetened drinks, sweets, refined grains and ultra-processed foods.
- ACC/AHA. *2025 High Blood Pressure Guideline*. DASH/heart-healthy dietary pattern, sodium reduction and dietary potassium with clinical caveats.
- American Heart Association. *2026 Dietary Guidance to Improve Cardiovascular Health*. Vegetables, fruit, whole grains, healthy protein sources, unsaturated fat replacing saturated fat, lower sodium, added sugar and ultra-processed food.
- ACC/AHA. *2026 Dyslipidemia Guideline*. Risk-based LDL management; severe hypertriglyceridaemia requires special clinical assessment.
- World Health Organization. Sodium intake recommendation for adults: less than 2000 mg sodium/day.
- USDA FoodData Central documentation. Reference architecture for branded/foundation food composition data and provenance.

## Review policy

- Safety thresholds: review annually or when the cited guideline changes.
- Meal-ranking weights: product decision, review every 12 months and validate against dietitian review and usability testing.
- Catalogue estimates: temporary; review expiration 2027-07-31 or earlier when a weighed, versioned food-composition dataset is available.
