# Safety Exclusion and Escalation List

Prepared: 2026-07-30  
Purpose: define the initial automated scope. This is not a diagnostic instrument.

## 1. Hard-stop exclusions

The ordinary automated planner must not generate a plan when the user reports or screening indicates any of the following:

- age below 18;
- pregnancy;
- breastfeeding;
- diagnosed eating disorder, suspected eating disorder, purging, binge/restrict cycles, or fear-driven severe restriction;
- unintentional weight loss;
- current BMI below 18.5 for an ordinary self-service plan;
- BMI below 20 combined with more than 5% unintentional loss in 3–6 months;
- more than 10% unintentional loss in 3–6 months;
- little or no intake for more than 5 days, or expectation that this will continue;
- any NICE high-risk refeeding criterion, including BMI below 16, more than 15% unintentional loss in 3–6 months, negligible intake for more than 10 days, or known low potassium/phosphate/magnesium;
- kidney disease;
- liver disease;
- uncontrolled diabetes or recurrent severe hypo/hyperglycaemia;
- serious cardiovascular disease or unstable symptoms;
- active cancer treatment;
- recent major surgery;
- severe gastrointestinal disease, malabsorption, persistent vomiting/diarrhoea, or high nutrient losses;
- swallowing difficulty, choking, or suspected dysphagia;
- serious food allergy requiring individual clinical management or where cross-contact cannot be safely handled;
- any condition requiring medical nutrition therapy;
- clinician-directed dietary restrictions that the app cannot represent safely.

## 2. Mode-specific escalation

### Weight loss

Stop and refer when:

- target weight would enter an underweight range;
- the user reports fainting, severe fatigue, rapid unexplained change, or highly restrictive intake;
- the requested plan conflicts with an eating-disorder response;
- the plan would require a low-energy-diet service rather than ordinary self-care.

### Muscle gain

Stop and refer when:

- the user seeks steroid/SARM guidance;
- there is no resistance training and the user expects guaranteed hypertrophy (the user may instead choose healthy weight gain after screening);
- symptoms or medical conditions make strenuous training or high protein inappropriate.

### Healthy weight gain

Stop and refer for any unintentional loss, low intake, refeeding risk, swallowing issue, malabsorption, or severe underweight. This mode must not be used to self-treat possible malnutrition.

## 3. Referral response requirements

A blocked result should:

1. state calmly that Mizaneh cannot safely create an ordinary automated plan for the reported situation;
2. name the reported factor without diagnosing;
3. recommend an appropriately qualified physician and/or registered dietitian/nutrition professional;
4. provide emergency advice only when the user reports an emergency symptom and only using locally appropriate verified information;
5. preserve the user’s non-sensitive interface state only if explicitly requested, but not generate partial calorie or meal targets;
6. not provide a disclaimer checkbox or “continue anyway” bypass.

## 4. Data minimisation

- Ask only screening questions needed to determine automated scope.
- Store medical-screen answers only with explicit opt-in and a clear deletion control.
- Do not place answers in URLs, analytics, logs, or structured public metadata.
- Prefer a stored eligibility result and reason code over retaining detailed free-text health history.

## 5. Evidence basis

Primary clinical basis: NICE CG32 nutrition-support screening and refeeding-risk recommendations, plus the adult-only/non-pregnancy boundary used by NIDDK’s Body Weight Planner. Additional disease exclusions are product-safety boundaries because ordinary automated meal planning is not medical nutrition therapy.

## 6. Cardiometabolic additions — approved 2026-07-30

### Blood pressure

- Do not diagnose from one user-entered value.
- Capture measurement setting, validated-cuff status, repeated/average status, date, and symptoms.
- Blood pressure above 180/120 mm Hg blocks ordinary planning.
- With chest pain, severe shortness of breath, neurological symptoms, confusion, fainting, or other concerning symptoms, show an emergency-assessment message.
- Without concerning symptoms, show a timely-clinical-assessment message; do not generate an ordinary plan.
- Do not automatically recommend potassium-enriched salt before kidney-disease and medicine screening.

### Glycaemia

- Diagnosed diabetes requiring medication coordination, insulin use, hypoglycaemia-causing medication, recurrent/severe hypoglycaemia, uncontrolled diabetes, or hyperglycaemic-crisis concern blocks ordinary planning.
- A glucose value below 70 mg/dL is a safety event; below 54 mg/dL or inability to self-treat selects an urgent pathway.
- Prediabetes or an abnormal laboratory value should trigger a calm professional-review recommendation, not a diagnosis.
- CGM or consumer-device values must not be used as diagnostic tests.

### Lipids

- Do not calculate a universal LDL-C target.
- Triglycerides at or above 500 mg/dL block ordinary planning pending professional assessment.
- Triglycerides at or above 1,000 mg/dL select a high-priority assessment pathway because pancreatitis risk is particularly high.
- Known ASCVD, familial hypercholesterolaemia, or a clinician-directed lipid-lowering diet remains outside ordinary automated treatment scope.

### Shared response

- Explain exactly which user-provided datum triggered the decision.
- State that Mizaneh is not making a diagnosis.
- Keep medical details out of URLs, analytics, logs, exports by default, and public metadata.
- Save health data only after explicit opt-in; allow deletion without deleting non-health profile data.
