# Clinical-supported nutrition planning v5

**Status:** implemented product policy and technical evidence mapping  
**Review expires:** 2026-10-30  
**Target population:** adults using an ordinary oral meal plan, including users with stable or clinician-managed conditions when the required individual constraints are supplied.

## Product boundary

A diagnosis or health condition does not, by itself, suppress plan generation. Mizaneh creates a deterministic supportive plan and displays a prominent clinician-review warning for pregnancy, breastfeeding, eating-disorder support, serious food allergy, dysphagia, kidney disease, liver disease, diabetes, cardiovascular disease, active cancer treatment, recent major surgery, gastrointestinal disease/malabsorption, and other medical-nutrition-therapy contexts.

The application is not an autonomous medical nutrition therapy service. It does not diagnose disease, change medication, calculate insulin doses, prescribe supplements, select a dysphagia texture, determine dialysis restrictions, or infer a post-operative diet stage. Those parameters must come from the user’s current clinical record or treating team.

Acute red flags still stop ordinary plan generation because continuing could delay urgent assessment. Examples include active anaphylaxis, severe hypoglycaemia or glucose-crisis symptoms, airway signs during swallowing, gastrointestinal bleeding/obstruction/persistent vomiting, severe pregnancy dehydration, new confusion in liver disease, serious fluid-overload symptoms in kidney disease, and high refeeding-risk signals.

## Personalisation model

The plan is generated from explicit inputs rather than random condition labels:

- goal, age, sex, height, current and target weight, activity and resistance training;
- dietary pattern, allergies, disliked foods and available cooking effort;
- pregnancy trimester, multiple pregnancy and clinician-entered energy target;
- breastfeeding mode, months postpartum and clinician-entered energy target;
- eating-disorder care status and regular-eating structure;
- allergen list and cross-contact constraints;
- clinician-assigned IDDSI food and drink levels;
- kidney stage, dialysis status, potassium/phosphorus laboratory status, and clinician-entered sodium/fluid/protein/electrolyte targets;
- liver stage, ascites, encephalopathy warning signs and clinician-entered targets;
- cancer treatment symptoms affecting intake;
- surgery type, days since surgery and prescribed diet stage;
- gastrointestinal subtype, current tolerance and clinician-entered exclusions;
- current blood-pressure, glycaemia and lipid context;
- clinician-entered foods to include or avoid.

For a fixed input and variation seed, meal selection is deterministic. Candidate meals are filtered for hard incompatibilities and then ranked using goal, preference, preparation effort, supported nutrient estimates and condition-specific scoring. The algorithm does not use network calls, advertising profiles or hidden randomisation.

## Do-not-guess rules

1. **Kidney disease:** potassium, phosphorus, protein and fluid restrictions are not inferred from the diagnosis alone. They require stage, dialysis status, laboratory context or an entered clinical target.
2. **Dysphagia:** food texture and drink thickness are not inferred. Only an entered IDDSI level is applied.
3. **Pregnancy and breastfeeding:** supplement doses are not generated. Food intake is supportive and must be coordinated with prenatal/postnatal care.
4. **Diabetes:** no universal carbohydrate percentage is imposed. A per-meal carbohydrate target is used only when entered; otherwise the plan favours a more consistent distribution.
5. **Liver disease:** protein is not automatically restricted. Cirrhosis support favours regular meals and a late snack; ascites-related sodium/fluid limits are applied only when entered or conservatively supported.
6. **Cancer and surgery:** food texture, infection precautions and diet progression follow entered treatment instructions; the program does not invent oncology or surgical restrictions.
7. **Food allergy:** matching known ingredient text cannot guarantee manufacturing or kitchen cross-contact safety.
8. **Eating disorders:** the program removes intentional deficit/surplus logic and supports regular eating, but does not replace psychological or medical treatment.

## Condition-specific implementation mapping

| Context | Product adaptation | Foods generally prioritised | Foods/behaviours highlighted for caution | Evidence basis | Important limitation |
|---|---|---|---|---|---|
| Hypertension/CVD | Lower-sodium, DASH-like ranking; fibre-rich minimally processed foods | vegetables, fruit, legumes, whole grains, fish, lower-fat dairy when compatible | salty processed foods, cured meat, excess added salt | ACC/AHA 2025; AHA 2026; WHO sodium | potassium-rich foods may be inappropriate in some kidney contexts |
| Diabetes/prediabetes | More even carbohydrate distribution, higher fibre, lower added sugar | non-starchy vegetables, legumes, whole fruit, whole grains, lean protein | sweetened drinks, juice, large refined-grain portions | ADA Standards of Care 2026 | medication and insulin timing must be coordinated professionally |
| Dyslipidaemia | Lower saturated-fat ranking; more unsaturated fat and soluble fibre | nuts, seeds, fish, legumes, oats, vegetables | butter, cream, solid fat, fatty meat, trans fat | ACC/AHA 2026; AHA 2026 | LDL treatment targets depend on individual risk |
| Pregnancy | No intentional energy deficit; micronutrient and food-safety priorities | iron/folate foods, pasteurised dairy or alternatives, eggs, legumes, low-mercury fish | alcohol, unpasteurised/raw high-risk foods, high-mercury fish, unsupervised supplements | NASEM 2023; NIH ODS; WHO ANC; NICE 2025 | supplement needs require prenatal assessment and local guidance |
| Breastfeeding | Mode-dependent energy/protein support; iodine/choline/calcium/B12 emphasis | eggs, dairy/fortified alternatives, legumes, low-mercury fish, nuts | alcohol, excessive caffeine, high-mercury fish | CDC 2026; NIH ODS | energy needs vary by feeding mode, postpartum time and maternal stores |
| Eating-disorder support | Regular meals/snacks; intentional deficit/surplus removed | complete, varied and predictable meals | fasting, compensatory restriction, rigid food-group elimination | NICE NG69 | automated plans are not treatment and medical instability remains urgent |
| Serious allergy | Exact entered allergens excluded from candidate text and edits rechecked | verified compatible foods | allergen, uncertain custom-food composition and cross-contact | AAAAI 2026 | ingredient databases cannot guarantee cross-contact |
| Dysphagia | IDDSI-entered texture and drink level included in preparation notes | foods adaptable to prescribed texture | dry, crumbly, sticky, stringy or mixed-consistency foods unless allowed | IDDSI; ASHA | clinical swallowing assessment is required |
| CKD | Sodium support; stage-/lab-specific protein, potassium, phosphorus and fluid targets | minimally processed foods compatible with entered laboratory targets | phosphate additives, excess sodium; potassium only when indicated | KDOQI 2020; KDIGO 2024 | a single “renal diet” is scientifically inappropriate |
| Liver disease | Avoid long fasting; small frequent meals and late snack in cirrhosis | adequate protein and regular meals as tolerated | alcohol; sodium according to ascites plan | ESPEN liver guideline | stage, ascites and encephalopathy materially change care |
| Cancer treatment | Energy/protein density and symptom-adapted meal size/texture | tolerated protein- and energy-dense foods | unreviewed supplements; unsafe foods under entered infection precautions | ESPEN cancer guideline | treatment type, inflammation and infection risk vary widely |
| Recent surgery | Stage-specific texture and protein/energy support | foods allowed by entered surgical stage | foods outside prescribed stage, persistent vomiting | ESPEN surgery guideline 2025 | surgical procedure and complications determine progression |
| IBD/malabsorption/GI | Subtype-specific meal size, fibre, fat, lactose and texture adjustments | tolerated nutrient-dense foods | unsupported long-term exclusions; active red flags | ESPEN IBD 2023; malabsorption 2025 | severe malabsorption may require enteral/parenteral nutrition |
| Custom MNT | Applies clinician-entered numeric limits and food inclusions/exclusions | exactly entered compatible foods | foods or nutrients exceeding entered limits | current clinician instruction | authenticity and recency of user-entered instructions are not verified |

## Nutrient information

Plans, meals, custom foods and recipes can carry energy, protein, carbohydrate, total fat, fibre, saturated fat, sodium, added sugar, potassium, calcium, iron, magnesium, phosphorus, zinc, folate, iodine, vitamin B12, vitamin D and choline.

Catalogue values are labelled **estimated**. They are planning estimates based on generic food composition and meal descriptions, not laboratory analyses, brand-specific labels or weighed raw/cooked recipes. Unknown nutrients remain unknown rather than being silently replaced with zero. The estimates must not be used for insulin dosing, exact dialysis electrolyte control, parenteral/enteral prescriptions or pregnancy supplement prescribing.

## Evidence strength and limitations

Most condition policies are based on current clinical guidelines or professional consensus. However, translating a guideline into a meal-ranking score is a product implementation decision rather than a directly tested clinical intervention. The scoring weights are conservative heuristics, versioned in code and covered by deterministic regression tests. They require review by a qualified dietitian before claiming therapeutic effectiveness.

## Review policy

- Review all sources by 2026-10-30 or earlier if a guideline is replaced.
- Update a formula or threshold only through a versioned policy change, migration note, before/after behaviour and regression test.
- Preserve old plans with their original policy identifier.
- Mark unresolved or clinician-entered constraints separately from external scientific findings.
