# Mizaneh Multi-Goal Nutrition Planning Specification

- Version: 1.0-review
- Prepared: 2026-07-30
- Status: **Approved 2026-07-31 — implemented in phase 4**
- Product: Mizaneh (`mizaneh.vercel.app`)
- Population: adults aged 18 years and older for whom ordinary self-directed nutrition planning is appropriate
- Normative language: MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are requirements keywords.

## 1. Product principle

This project extends the current weight-loss product. It does not replace it.

The implementation MUST preserve:

- the public `/` route and existing valid anchors;
- the current weight-loss flow and recognizable weekly-plan experience;
- valid existing saved sessions through migration;
- deterministic plan generation where the underlying data and policy version are unchanged;
- the current RTL-first visual identity, spacing, cards, colours, navigation model, and responsive behavior;
- the current local-only, opt-in persistence model;
- existing exports, shopping list, substitutions, accessibility behavior, SEO, and tests unless a documented correction is required;
- Vazirmatn as the only font;
- the visible attribution `کاری از حسین کریمی` linked to the approved LinkedIn profile.

The implementation MUST NOT perform a major redesign, replace working components merely for architectural neatness, or silently recalculate an existing plan with a different scientific policy.

## 2. Behaviour classification

### 2.1 Preserved behaviour

- existing weight-loss sessions remain readable and usable;
- existing meal catalogue remains available during the staged food-data migration;
- existing arrangement modes remain available;
- current text download, print, shopping list, local save/restore, and full-plan regeneration remain available;
- current route and familiar four-step onboarding structure remain recognizable.

### 2.2 Corrected behaviour

- weight loss becomes an explicit goal rather than an implicit assumption;
- formula IDs, versions, source registry versions, units, and uncertainty flags are persisted;
- static weight timelines are removed as promises and relabelled as rough, non-guaranteed estimates when retained for legacy display;
- safety exclusions become blocking rather than a generic non-blocking disclaimer;
- saved-session parsing uses schema validation, quarantine, and migration instead of shallow casting;
- post-edit allergy, intolerance, dietary-pattern, goal, and safety checks are mandatory;
- Noto Nastaliq Urdu is removed; Vazirmatn remains the only project font;
- creator attribution is restored visibly.

### 2.3 Newly added behaviour

- three explicit goal modes;
- guided goal recommendation with optional comparison and direct selection;
- separate goal-specific onboarding, explanations, progress measures, warnings, and policies;
- blood-pressure, glycaemia, and lipid context as optional safety data;
- immutable plan versions, goal switching without overwrite, and comparison;
- food-level editing, recipes, custom foods, locks, undo/redo, and recalculation;
- progress measurements, robust trends, and auditable adjustment proposals;
- provenance-aware food data and completeness states.

### 2.4 Deprecated behaviour

- `loss.static7700.v1` MUST NOT be used to promise a completion date;
- a single saved session at `mizaneh:session:v1` is deprecated after successful migration but MUST remain readable during the compatibility period;
- calorie-only replacement ranking is deprecated;
- free-text ingredient strings as the sole nutrition representation are deprecated;
- formula constants without a policy ID and evidence metadata are deprecated.

### 2.5 Optional future improvements

- clinician collaboration or account sync;
- validated cardiovascular-risk scoring;
- device integrations;
- laboratory import;
- cost-aware replacement using reliable regional prices;
- cloud storage;
- supplement decision support.

These are out of scope for this implementation.

## 3. Goals and user-facing meaning

### 3.1 `weight_loss` — کاهش وزن

The mode MUST:

- preserve the existing product and migrate existing sessions into this goal;
- use a nutritionally balanced energy deficit;
- avoid very-low-energy or specialist low-energy plans in the ordinary automated scope;
- show energy and weight-change estimates as uncertain;
- support adequate protein and diet quality;
- monitor weight trend, adherence, hunger, energy, sleep, and digestive tolerance;
- avoid adjustment from one measurement;
- avoid guaranteed weight-loss or fat-loss rates;
- explain that scale change includes water, glycogen, gastrointestinal contents, fat, and lean tissue.

### 3.2 `muscle_gain` — افزایش حجم عضله

The mode MUST:

- state that resistance training is necessary for meaningful hypertrophy;
- collect current or intended resistance-training frequency, experience, progression, recovery, and performance;
- use a small conservative starting energy surplus;
- use a source-backed protein policy for screened healthy resistance-training adults;
- monitor weight trend, performance, appetite, sleep, recovery, waist optionally, and digestive tolerance;
- distinguish training days from rest days only if the approved policy changes food distribution without changing the weekly target beyond the approved range;
- avoid promising pure muscle gain, zero fat gain, guaranteed hypertrophy, or identical results.

The mode MUST NOT generate an ordinary muscle-gain plan when the user neither performs nor intends to start resistance training. It SHOULD recommend `healthy_weight_gain` while retaining manual choice after explanation, unless a safety exclusion blocks all planning.

### 3.3 `healthy_weight_gain` — افزایش وزن

The mode MUST:

- be separate from muscle gain;
- explain that gained weight can include lean tissue, fat, glycogen, water, and gastrointestinal contents;
- distinguish intentional gain from unintentional loss;
- screen for malnutrition, refeeding risk, swallowing difficulty, significant gastrointestinal symptoms, and clinical causes;
- use gradual energy increases and appetite/tolerance-aware meal strategies;
- prioritise nutrient-dense and energy-dense foods without defaulting to excess sugar, fried foods, or ultra-processed foods;
- monitor weight trend, appetite, digestive tolerance, energy, adherence, and notes;
- stop ordinary automation when professional nutrition support is indicated.

## 4. Selected goal-selection experience

ADR-0003 is normative.

### 4.1 First use

1. Show the existing trust-and-safety introduction.
2. Ask the guided goal question(s).
3. Display an explainable `پیشنهاد میزانه`.
4. Keep all three goals manually selectable.
5. Provide `مقایسهٔ کامل هدف‌ها`, using the approved comparison-card content.
6. Continue inside the current onboarding shell.

### 4.2 Returning users

Returning users SHOULD see a compact three-goal selector with their last active goal selected, plus a link to guided selection and comparison.

### 4.3 Goal switching

When switching goals, the application MUST:

- explain that targets, questions, monitoring, and warnings will change;
- preserve the previous plan and its goal;
- create a new draft plan with `parentPlanId` set to the previous plan;
- reuse only shared profile fields that remain valid;
- request only missing goal-specific fields;
- show a before/after target summary;
- require confirmation before the new plan becomes active;
- never overwrite or mutate the prior plan;
- allow returning to any saved version.

### 4.4 User stories

#### Goal selection and switching

- As a first-time user, I can answer one or two plain-language questions and receive an explainable, non-binding goal suggestion.
- As a user who already knows my goal, I can select it directly without completing guided selection.
- As a user who is uncertain, I can compare all three goals, their requirements, limitations, and monitoring differences.
- As a returning user, I can see my active goal and switch goals without losing the previous plan.
- As a user switching goals, I can review reused and newly required profile information before confirming a new plan.

#### Safety and cardiometabolic context

- As a user, I can understand whether Mizaneh is appropriate for ordinary self-directed planning before entering extensive information.
- As a user with blood-pressure, glucose, or lipid results, I can optionally record context without the application diagnosing me.
- As a user outside ordinary scope, I receive a calm explanation and an appropriate referral path rather than a generic plan.
- As a user with a severe measurement or symptom combination, I cannot bypass the safety stop with a disclaimer.

#### Plan generation and editing

- As a user, I receive a plan whose goal, policy version, source version, target ranges, and uncertainty are visible.
- As a user, I can follow the generated plan without seeing advanced editing controls until I request them.
- As a user, I can change any food, portion, meal, or day and immediately see nutritional and compatibility consequences.
- As a user, I can compare replacements by nutrition, role, safety, preference, and effort rather than calories alone.
- As a user, I can undo mistakes, reset a chosen scope, and save named versions.

#### Progress and adjustment

- As a user, I can record measurements and subjective outcomes appropriate to my goal.
- As a user, I am not given a calorie change because of one weigh-in.
- As a user, I can see the data, method, uncertainty, and reasoning behind every proposed adjustment and can reject or modify it.

## 5. Domain model

The implementation SHOULD use discriminated unions and deep domain modules rather than goal checks scattered through presentation code.

```ts
export type Goal = "weight_loss" | "muscle_gain" | "healthy_weight_gain";

export type GoalProfile =
  | { goal: "weight_loss"; context: WeightLossContext }
  | { goal: "muscle_gain"; context: MuscleGainContext }
  | { goal: "healthy_weight_gain"; context: HealthyWeightGainContext };

export type PlanDocument = {
  schemaVersion: 2;
  id: string;
  parentPlanId: string | null;
  goal: Goal;
  profileSnapshot: ProfileSnapshot;
  safetyScreen: SafetyScreenResult;
  calculation: CalculationRecord;
  days: PlanDay[];
  versions: PlanVersionMetadata[];
  createdAt: string;
  updatedAt: string;
};
```

### 5.1 Shared profile

At minimum:

- age;
- height and unit;
- weight and unit;
- equation sex category required by the selected energy equation, with respectful explanatory copy;
- physical-activity category and source answers used to map it;
- dietary pattern;
- allergies, intolerances, dislikes, favourites, hidden foods;
- meal count preference and times;
- cooking time, preparation pattern, day pattern;
- sleep, appetite, digestive tolerance, and hydration context;
- optional cardiometabolic context;
- data-consent and local-save status.

### 5.2 Weight-loss context

- desired direction and optional target range;
- weight history and whether loss is intentional;
- previous excessive restriction;
- hunger and adherence barriers;
- resistance-training status for lean-mass preservation;
- user preference for a gentler or standard starting deficit.

### 5.3 Muscle-gain context

- resistance-training status: current, starting with plan, or none;
- days per week;
- training age: beginner, intermediate, advanced;
- recent progression or plateau;
- optional training-day schedule;
- recovery, appetite, sleep, and digestive tolerance;
- explicit acknowledgement that the nutrition plan does not replace training programming.

### 5.4 Healthy-weight-gain context

- whether gain is intentional;
- amount and timing of any recent unintentional loss;
- appetite limitation;
- early satiety;
- nausea, vomiting, diarrhoea, constipation, pain, malabsorption concern;
- swallowing or chewing difficulty;
- days of negligible or markedly reduced intake;
- preferred liquid/solid snack strategies;
- goal reason without requiring a medical diagnosis.

## 6. Safety scope and decision engine

Safety is a domain service, not component-local conditional rendering.

```ts
export type SafetyDisposition =
  | "ordinary_scope"
  | "general_support_only"
  | "professional_review_required"
  | "urgent_or_high_priority_assessment";
```

A generic disclaimer MUST NOT override a blocking disposition.

### 6.1 Always excluded from ordinary automated planning

- age below 18;
- pregnancy or breastfeeding;
- diagnosed or suspected eating disorder or active disordered-eating concern;
- unintentional weight loss requiring assessment;
- severe underweight or malnutrition concern;
- prolonged negligible intake or possible refeeding risk;
- kidney disease requiring dietary management;
- significant liver disease;
- uncontrolled diabetes or medication coordination risk;
- serious cardiovascular disease;
- active cancer treatment;
- recent major surgery;
- severe gastrointestinal disease or malabsorption concern;
- swallowing difficulty;
- serious food allergy beyond the verified data and cross-contact capability;
- any condition requiring medical nutrition therapy.

The application MUST explain the boundary calmly, MUST NOT diagnose, and MUST direct the user to an appropriately qualified professional.

### 6.2 Refeeding and malnutrition rules

The application MUST block ordinary weight-gain planning when NICE CG32 high-risk criteria are met or cannot be safely ruled out, including the following user-reportable criteria:

- BMI below 16 kg/m²;
- unintentional loss above 15% over 3–6 months;
- little or no intake for more than 10 days;
- two or more of: BMI below 18.5, unintentional loss above 10% over 3–6 months, little/no intake for more than 5 days, or relevant alcohol/medicine history.

Laboratory-dependent criteria MUST NOT be guessed by the application. Uncertainty that materially affects refeeding safety selects professional review.

Primary source: NICE CG32, recommendations 1.3 and 1.4.6–1.4.8.

### 6.3 Cardiometabolic context

Blood pressure, glucose, and lipids are optional structured health context. They MUST remain separate from goal selection and MUST NOT be put in URLs, analytics, or third-party services.

#### Blood pressure fields

- systolic and diastolic values;
- date/time;
- measurement context: repeated home average, clinic, single/unknown;
- device/cuff context when known;
- symptoms;
- diagnosed hypertension and whether it is stable under professional management.

Rules:

- one reading MUST NOT create a diagnosis;
- systolic above 180 or diastolic above 120 blocks ordinary planning;
- concerning symptoms select urgent assessment;
- severe pressure without symptoms selects timely professional review;
- no medication advice is provided.

Primary source: 2025 AHA/ACC High Blood Pressure Guideline.

#### Glycaemia fields

- measurement type: fasting plasma glucose, random/device glucose, 2-hour OGTT, A1C;
- value, unit, date, laboratory/device context;
- diabetes/prediabetes history;
- insulin or medicine with hypoglycaemia risk;
- recurrent/severe hypoglycaemia;
- crisis symptoms/ketone concern.

Rules:

- values may provide educational context but MUST NOT diagnose diabetes;
- glucose below 70 mg/dL is a safety signal;
- glucose below 54 mg/dL, altered function requiring assistance, or crisis symptoms selects urgent assessment;
- insulin or recurrent/severe hypoglycaemia selects professional review and no ordinary plan;
- the application MUST NOT use a universal diabetes macronutrient distribution.

Primary source: ADA Standards of Care in Diabetes—2026, sections 2, 5, and 6.

#### Lipid fields

- LDL-C, HDL-C, triglycerides, date, unit, fasting status when known;
- diagnosed dyslipidaemia;
- whether results were reviewed professionally;
- known ASCVD or clinician-directed lipid diet.

Rules:

- no universal LDL-C target is displayed;
- treatment targets are described as risk- and context-dependent;
- triglycerides at or above 500 mg/dL select professional review and block ordinary planning;
- triglycerides at or above 1000 mg/dL select high-priority assessment;
- no medicine or supplement recommendation is provided.

Primary source: 2026 ACC/AHA Multisociety Dyslipidemia Guideline.

## 7. Calculation policies

Every generated plan MUST persist:

- `calculationPolicyId` and semantic version;
- `energyEquationId` and version;
- `evidenceRegistryVersion`;
- normalized values and units;
- point estimate and uncertainty range;
- target ranges rather than only point values;
- product-decision flags and evidence certainty;
- review-expiry date;
- safety-screen result.

### 7.1 Existing plans

Existing v1 plans MUST retain their exact legacy calculation result and legacy display until the user explicitly regenerates under a new policy.

Legacy IDs:

- `energy.legacy.msj-pal.v1`;
- `loss.deficit.cap20.v1`;
- `loss.floor.sex.v1`;
- `loss.static7700.v1`;
- `loss.protein.v1`;
- `shared.fat.v1`;
- `shared.carb.floor80.v1`.

Legacy status MUST be visible in plan details. It MUST NOT be presented as the currently preferred scientific policy.

### 7.2 New maintenance estimate

Newly generated v2 plans SHOULD use `energy.eer.nasem2023.v1`, with the adult 19+ equations from the 2023 National Academies Dietary Reference Intakes for Energy.

The input height is centimetres and weight is kilograms.

#### Men 19+

- inactive: `753.07 - 10.83*age + 6.50*height + 14.10*weight`
- low active: `581.47 - 10.83*age + 8.30*height + 14.94*weight`
- active: `1004.82 - 10.83*age + 6.52*height + 15.91*weight`
- very active: `-517.88 - 10.83*age + 15.61*height + 19.11*weight`

#### Women 19+

- inactive: `584.90 - 7.01*age + 5.72*height + 11.71*weight`
- low active: `575.77 - 7.01*age + 6.60*height + 12.14*weight`
- active: `710.25 - 7.01*age + 6.54*height + 12.34*weight`
- very active: `511.83 - 7.01*age + 9.07*height + 12.56*weight`

The UI MUST state that individual error can be material. The report gives adult model mean absolute errors of roughly 266 kcal/day for men and 191 kcal/day for women; the product SHOULD show a rounded uncertainty band and MUST not imply measurement-level precision.

Primary source: NASEM, *Dietary Reference Intakes for Energy* (2023), DOI 10.17226/26818.

### 7.3 Starting energy adjustments — explicit product decisions

The literature does not establish one universally optimal deficit or surplus. The following values are conservative product starting policies, not clinical prescriptions. Their certainty MUST be shown as low-to-moderate, they MUST be configurable, and they MUST be reviewed after controlled testing.

#### Weight loss: `weight-loss.start.v2`

```text
startingDeficit = min(500 kcal/day, 0.15 × estimatedMaintenance)
startingTarget = estimatedMaintenance - startingDeficit
```

Requirements:

- do not generate specialist low-energy or very-low-energy plans;
- if nutrient adequacy cannot be achieved with the catalogue, do not lower energy further;
- never promise the weight change implied by static energy conversion;
- the user may choose a gentler starting target, never a more aggressive target beyond the approved bound;
- the exact 15% cap is a conservative product decision informed by evidence that weight loss requires an energy deficit and that 500–750 kcal/day deficits have been used in supported interventions; it is not a universal guideline value.

#### Muscle gain: `muscle-gain.start.v1`

```text
startingSurplus = clamp(0.05 × estimatedMaintenance, 100, 300) kcal/day
startingTarget = estimatedMaintenance + startingSurplus
```

Requirements:

- resistance training is required or explicitly being started;
- no guarantee is made about the composition of gained weight;
- the value is deliberately below common 300–500 kcal study prescriptions because optimal surplus is not established and unnecessary excess may increase fat gain;
- training and rest-day distribution MAY vary while the approved weekly energy average remains unchanged.

#### Healthy weight gain: `healthy-weight-gain.start.v1`

```text
startingSurplus = clamp(0.10 × estimatedMaintenance, 200, 500) kcal/day
startingTarget = estimatedMaintenance + startingSurplus
```

Requirements:

- refeeding/malnutrition exclusions run first;
- portion and meal-frequency changes are gradual;
- low appetite and digestive tolerance determine strategy selection;
- no claim is made that higher calories are automatically healthier;
- the larger starting range than muscle gain reflects the different goal, but remains a product decision under limited direct evidence.

### 7.4 Protein

#### Weight loss

For new v2 weight-loss plans, the target range SHOULD be `1.2–1.6 g/kg/day` for screened adults, with the selected point based on age, resistance training, appetite, energy target, and dietary pattern. The algorithm MUST avoid implausibly high values in high body mass and MUST document its reference-weight method before implementation. Until that method is approved, migrated plans retain `loss.protein.v1` and new v2 weight-loss calculation remains feature-flagged.

Evidence: systematic reviews indicate higher protein intake during energy restriction can improve lean-mass retention; applicability varies by age, activity, and body size.

#### Muscle gain

Default: `1.6 g/kg/day` of current body weight, with allowed personalization `1.4–2.0 g/kg/day` for screened healthy exercising adults. Intake above 2.0 g/kg/day is not generated by default. Kidney disease and other clinical conditions are excluded.

Evidence: Morton et al. 2018 meta-analysis and ISSN position stand.

#### Healthy weight gain

Default candidate: `1.2 g/kg/day`, configurable within `1.0–1.5 g/kg/day` for screened adults. This is an implementation product choice within the broad NICE nutrition-support range and MUST NOT be applied to clinical malnutrition or kidney disease.

### 7.5 Fat, carbohydrate, fibre, produce, and hydration

- total fat MUST be represented as a range, not an unexplained fixed 30/34%; a default planning range of 25–35% energy is acceptable within authoritative reference ranges;
- carbohydrate is the residual energy after protein and fat, subject to diet quality, preference, training demand, and cardiometabolic context;
- no universal diabetes-specific carbohydrate percentage is allowed;
- fibre target is at least 25 g/day for adults, with tolerance-aware gradual increases and a completeness warning when data is missing;
- fruit and vegetable planning SHOULD support at least 400 g/day when compatible with the individual context;
- hydration is guidance, not a diagnosis or rigid prescription, and MUST explain climate, exercise, food water, and medical variation;
- sodium below 2000 mg/day is a WHO population reference, not an individual therapeutic prescription;
- exact sodium, saturated fat, trans fat, added sugar, and micronutrient calculations MUST remain disabled until provenance-aware food data is complete.

### 7.6 Uncertainty rules

- energy, nutrient, and trend outputs MUST distinguish estimates from measured values;
- the UI MUST avoid false precision and SHOULD round energy targets to practical increments;
- missing nutrient data MUST propagate an `incomplete` state rather than being treated as zero;
- a target range MUST NOT be displayed as a guaranteed outcome range;
- calculation changes require a new policy version and a before/after migration note;
- evidence expiry blocks release of a newly generated policy until review or documented extension;
- when a safety-relevant input is unknown and the uncertainty cannot be bounded safely, the disposition escalates rather than assuming normality;
- the application MUST distinguish external evidence, product decisions, assumptions, and unresolved questions in user-facing source details and developer documentation.

### 7.7 Meal-generation rules

The generator remains deterministic for the same normalized input, policy version, catalogue version, plan mode, and seed. A change to any of those values MUST be visible in plan metadata.

Shared rules:

- allergy and intolerance constraints are hard filters and are rechecked after generation and every edit;
- diet style, dislikes, preparation time, cultural fit, meal role, repetition, and user preferences influence ranking;
- nutrient targets are ranges and the generator optimizes weekly adequacy rather than forcing every meal to hit an exact point;
- missing data cannot satisfy a nutrient constraint; it produces a completeness warning;
- locked meals/days are preserved during regeneration;
- fallback relaxation order is explicit, testable, and never relaxes safety/allergy constraints;
- when no valid candidate exists, the generator shows an actionable empty state instead of inserting an incompatible food;
- raw/cooked state and serving units are preserved through generation and export;
- no supplement is required to make an otherwise inadequate plan appear complete.

Weight-loss rules:

- prioritise energy deficit, protein range, fibre, produce, nutrient adequacy, and practical satiety;
- prefer minimally processed, lower-energy-density choices when compatible with preference and culture;
- do not use volume or fibre strategies that conflict with tolerance or gastrointestinal exclusions;
- never describe the plan as guaranteeing fat-only loss.

Muscle-gain rules:

- meet the weekly energy surplus and protein policy before optional nutrient-timing preferences;
- carbohydrate availability around training MAY influence meal placement, but total daily/weekly adequacy remains primary;
- optional protein distribution uses ordinary foods first and does not require a fixed meal frequency;
- training-day and rest-day plans may differ in meal placement or carbohydrate distribution, but their weekly energy average must remain within policy;
- do not label a plan as muscle-building when resistance-training context is absent.

Healthy-weight-gain rules:

- use gradual portion increases, snacks, food fortification, and optional liquid-food strategies according to appetite and tolerance;
- prioritise nutrient-dense energy sources and variety;
- avoid making sugar-sweetened drinks, fried foods, or ultra-processed foods the default surplus mechanism;
- provide smaller, more frequent options only as a preference/tolerance strategy, not a mandatory scientific meal frequency;
- stop generation when unintentional loss, refeeding risk, swallowing difficulty, or significant gastrointestinal concern is present.

## 8. Adaptive review and progress tracking

### 8.1 Measurements

Depending on goal, support:

- body weight;
- optional waist measurement;
- adherence;
- hunger/appetite;
- energy level;
- digestive tolerance;
- sleep quality;
- training performance and recovery for muscle gain;
- notes.

### 8.2 Trend algorithm

- no recommendation may use one isolated measurement;
- a trend requires at least 5 comparable weight measurements spanning at least 14 days;
- the default trend estimator SHOULD be a robust Theil–Sen slope over the latest 21 days;
- measurements taken on the same day are reduced to their median;
- the UI MUST show the date range, count, slope, and uncertainty/confounders;
- menstruation, sodium, glycogen, hydration, travel, illness, and adherence may affect interpretation and MUST be mentioned without diagnosing.

The exact window and estimator are product analytics rules, not medical facts, and are versioned as `trend.theil-sen.21d.v1`.

### 8.3 Adjustment proposals

- adjustment is a proposal, never a silent mutation;
- maximum proposal size is 100 kcal/day per review;
- proposals occur no more frequently than once every 14 days;
- total automated drift from the starting policy is limited to ±300 kcal/day before full re-estimation;
- every proposal shows triggering data, calculation, direction, magnitude, reason, uncertainty, and reject/modify controls;
- low adherence or insufficient data produces a data-quality suggestion rather than a calorie change.

Goal-specific logic:

- weight loss: consider a small decrease only when the robust trend is flat/up, adherence is reported as generally good, and no tolerance/safety concern exists; consider increasing/holding when hunger, fatigue, recovery, or trend suggests excessive restriction;
- muscle gain: consider a small increase when trend is flat/down and training/recovery/adherence support it; consider hold/decrease when weight rises without useful performance progress or tolerance is poor;
- healthy weight gain: consider a small increase when trend is flat/down and appetite/tolerance permit; hold or reduce when digestive tolerance worsens or the user reports the plan is unmanageable.

## 9. Food-data model

The existing `MealTemplate` is insufficient for the approved editing and cardiometabolic claims.

```ts
export type NutrientValue = {
  value: number | null;
  unit: string;
  status: "verified" | "estimated" | "user_entered" | "missing";
  sourceId: string | null;
};

export type FoodItem = {
  id: string;
  nameFa: string;
  servingAmount: number;
  servingUnit: string;
  state: "raw" | "cooked" | "prepared" | "not_applicable";
  nutrients: NutrientProfile;
  allergens: AllergenTag[];
  intolerances: IntoleranceTag[];
  dietaryPatterns: DietaryPatternTag[];
  provenance: FoodProvenance;
};
```

Required nutrient fields before exact cardiometabolic support:

- energy;
- protein;
- total carbohydrate;
- total fat;
- fibre;
- saturated fat;
- trans fat where available;
- sodium;
- added sugars where available;
- supported micronutrients with explicit completeness;
- serving amount/unit;
- raw/cooked/prepared state;
- source, dataset version, review date, licence, confidence, and derivation method.

Iranian foods SHOULD preferentially use a licensed Iranian or regional food-composition source. Values MUST NOT be copied until licence and provenance are verified. FAO/INFOODS conventions SHOULD guide identifiers, state, yields, and documentation.

## 10. Editable meal plans

The existing weekly plan remains readable by default. Editing uses progressive disclosure.

Users MUST be able to:

- change a food or portion;
- replace, add, or remove a food;
- move foods between meals;
- reorder, rename, and retime meals;
- duplicate meals and days;
- copy one day to another;
- lock meals and days;
- mark favourites and hide unwanted foods;
- create custom foods and recipes;
- undo and redo;
- reset a meal, day, or full plan;
- save and compare plan versions.

### 10.1 Editing architecture

Edits SHOULD be commands applied to an immutable plan state:

```ts
type PlanCommand =
  | AddFoodCommand
  | RemoveFoodCommand
  | ChangePortionCommand
  | ReplaceFoodCommand
  | MoveFoodCommand
  | ReorderMealCommand
  | RenameMealCommand
  | ChangeMealTimeCommand
  | DuplicateMealCommand
  | DuplicateDayCommand
  | CopyDayCommand
  | SetLockCommand
  | ResetScopeCommand;
```

- every command validates and recalculates before commit;
- undo/redo operates on command history in memory;
- explicit save creates a durable plan version;
- locked scopes reject generator or bulk-replacement changes but remain manually unlockable;
- no edit is silently “fixed”; consequences and suggestions are shown.

### 10.2 Automatic recalculation

After every committed edit, recalculate:

- meal, day, and weekly-average energy;
- protein, carbohydrate, fat, fibre;
- supported micronutrients;
- difference from goal ranges;
- allergy and intolerance compatibility;
- dietary-pattern compatibility;
- goal compatibility;
- cardiometabolic qualitative constraints when supported;
- completeness and provenance.

Persian statuses MUST include:

- `کمتر از محدودهٔ هدف`
- `در محدودهٔ هدف`
- `بیشتر از محدودهٔ هدف`
- `اطلاعات تغذیه‌ای ناقص است`
- `با حساسیت ثبت‌شده سازگار نیست`
- `با الگوی غذایی انتخابی سازگار نیست`
- `برای این وعده جایگزین نزدیکی نیست`

Live updates MUST be announced accessibly without excessive screen-reader noise.

## 11. Food replacement

Replacement has hard constraints followed by ranked similarity.

### 11.1 Hard filters

- verified allergen and intolerance compatibility;
- dietary-pattern compatibility;
- user-hidden foods;
- locked scope;
- serious safety contradictions;
- available nutrition completeness required for the claim being made.

### 11.2 Ranking dimensions

- energy;
- protein;
- carbohydrate;
- fat;
- fibre;
- supported micronutrients;
- serving size;
- meal role;
- preference and cultural fit;
- availability and preparation effort;
- cost only when reliable data exists.

Calories MUST NOT be the sole ranking criterion.

### 11.3 User-facing classes

- `جایگزین نزدیک تغذیه‌ای`: same meal role, energy within 10%, protein within 20%, and no major supported nutrient conflict;
- `جایگزین نسبتاً مشابه`: energy within 20% and protein within 35%, with differences disclosed;
- `جایگزین براساس سلیقه`: safe and preferred but outside nutritional similarity thresholds;
- `از نظر تغذیه‌ای معادل نیست`: available only with a clear consequence preview.

The thresholds are transparent product rules and MUST be versioned. Every suggestion shows the reason and expected changes.

## 12. Custom foods and recipes

### 12.1 Custom food

Required:

- name;
- serving amount and unit;
- user-entered nutrition values;
- user-entered label;
- optional source note;
- completeness state.

Custom entries MUST never be silently merged into verified catalogue data.

### 12.2 Custom recipe

Required:

- ingredients and structured quantities;
- raw/cooked state per ingredient;
- total yield and unit;
- number of servings;
- nutrition per recipe and per serving;
- recalculation after ingredient or yield edits;
- user-entered/estimated provenance.

Limits:

- name ≤120 Unicode characters;
- ≤100 ingredients per recipe;
- notes/source ≤1000 characters;
- numeric values must be finite and non-negative;
- import and storage have documented total-size limits;
- unsafe object keys such as `__proto__`, `constructor`, and `prototype` are rejected.

## 13. Persistence, migration, and versioning

### 13.1 Storage principles

- no account or cloud storage;
- no automatic save without explicit user action;
- no health data in URLs;
- local storage is treated as sensitive and untrusted input;
- a storage adapter isolates IndexedDB/localStorage details.

### 13.2 v1 migration

Source key: `mizaneh:session:v1`.

Migration MUST:

1. read without mutating the source;
2. validate size and schema;
3. quarantine malformed data without applying it;
4. map goal to `weight_loss`;
5. persist legacy calculation IDs;
6. preserve seed and substitutions;
7. rebuild only with legacy code when exact serialized meals are absent;
8. show a migration summary;
9. require explicit confirmation before storing v2;
10. verify the v2 write and read-back;
11. retain v1 until the user explicitly removes it or a documented compatibility period ends.

No migration may silently regenerate the plan with NASEM or another new policy.

### 13.3 Plan versions

- every durable plan has an ID, goal, parent ID, and calculation record;
- manual “save version” creates an immutable snapshot;
- ordinary edits are draft state until explicitly saved;
- version comparison shows energy, macros, key nutrients, compatibility, changed meals, calculation policy, and goal;
- deletion requires confirmation and offers recovery when technically feasible.

## 14. UI and visual constraints

- no major redesign;
- reuse existing cards, controls, tabs, tables, buttons, notices, typography scale, spacing, and colours;
- Vazirmatn only;
- Persian RTL-first;
- mobile and desktop;
- advanced editing stays hidden until requested;
- goal recommendation and safety result must not rely on colour alone;
- ordinary weekly-plan reading remains the primary view;
- desktop may use inline panels; mobile SHOULD use accessible sheets/dialogs with focus trapping and focus return;
- prototypes remain disposable and noindexed, and MUST be removed or development-gated before production release.

## 15. Accessibility

Target: WCAG 2.2 AA for supported flows.

Requirements:

- semantic headings and fieldsets;
- visible labels and associated errors;
- keyboard completion of all editing actions;
- visible focus indicators;
- logical RTL tab order;
- dialogs with accessible names, focus trap, Escape behavior where safe, and focus return;
- live announcements for recalculation and save state;
- no colour-only status;
- reduced-motion support;
- touch targets appropriate for mobile;
- screen-reader text for icons and nutrient completeness;
- table alternatives or stacked cards for mobile editing;
- safety messages use calm, non-stigmatizing, eating-disorder-sensitive language.

## 16. Privacy and security

Treat weight, conditions, allergies, medicines, measurements, and progress as sensitive data.

MUST NOT add:

- analytics or advertising trackers;
- session replay;
- third-party profiling;
- sensitive query parameters;
- cloud sync without separate approval.

Threat controls:

- schema validation and size limits for all persisted/imported data;
- safe JSON parsing into null-prototype or validated objects;
- HTML/text rendering without unsafe injection;
- spreadsheet formula-injection neutralization for future tabular exports (`=`, `+`, `-`, `@` prefixes);
- limits on custom food/recipe counts and sizes;
- Content Security Policy compatible with Next.js deployment;
- service-worker cache versioning that does not retain private plan payloads;
- export warnings and explicit inclusion choices for health data;
- secure deletion semantics within browser limits;
- dependency audit and secret scan before release.

## 17. SEO and GEO

Preserve existing metadata and valid structured data. Add accurate public explanations for:

- differences among the three goals;
- how each mode works;
- editing and replacements;
- energy and macro estimation;
- safety exclusions;
- scientific sources;
- the role and limits of blood-pressure, glucose, and lipid information.

Public content MUST NOT include fake ratings, testimonials, guaranteed outcomes, medical-treatment claims, hidden keyword content, or invented credentials.

Private plans, progress, and health information MUST NOT be indexable. New explanatory pages may be linked from existing contextual help and footer without replacing the main navigation model.

## 18. Architecture

Use deep modules with narrow interfaces.

Suggested target:

```text
lib/
  domain/
    goals.ts
    profile.ts
    plan.ts
    food.ts
    progress.ts
  safety/
    screen.ts
    cardiometabolic.ts
    exclusions.ts
  calculations/
    energy/nasem2023.ts
    legacy/weightLossV1.ts
    policies/weightLossV2.ts
    policies/muscleGainV1.ts
    policies/healthyWeightGainV1.ts
    registry.ts
  food-data/
    catalogue.ts
    provenance.ts
    recipes.ts
  plan/
    generate.ts
    recalculate.ts
    commands.ts
    replacement.ts
    versions.ts
  progress/
    trend.ts
    adjustments.ts
  storage/
    adapter.ts
    schema.ts
    migrateV1.ts
components/
  goal-selection/
  safety-screen/
  meal-editor/
  progress/
```

Goal policy MUST NOT be embedded throughout UI components. Nutrition totals, unit conversion, replacement, compatibility, and safety checks each have one authoritative implementation.

Safe preparatory refactors are allowed only when required to introduce these seams without changing existing behavior.

## 19. Test strategy

Use vertical red-green-refactor slices.

### 19.1 Existing-product regression

- current onboarding;
- legacy plan generation and golden fixture;
- v1 restore/save/clear;
- current substitutions, shopping list, exports, routes, RTL, responsive behavior, and accessibility;
- no unrelated visual or navigation changes.

### 19.2 Goals

- all three selectable;
- guided recommendation mapping;
- manual override;
- comparison cards;
- goal persistence;
- no overwrite on switch;
- missing-field collection;
- separate explanations, warnings, and policies;
- muscle and healthy weight gain produce meaningfully different outputs.

### 19.3 Calculations

- NASEM equations with official examples;
- units and boundary cases;
- legacy policy preservation;
- policy IDs and review dates;
- starting adjustments and clamps;
- protein policies;
- daily/weekly totals;
- uncertainty display;
- no static promised timeline;
- trend and 100-kcal adjustment bounds;
- no adjustment from one measurement.

### 19.4 Editing

Test every required edit command, locks, undo/redo, reset hierarchy, version comparison, recalculation, completeness, allergy/intolerance and goal checks.

### 19.5 Safety

- every exclusion;
- no disclaimer bypass;
- no partial plan after block;
- refeeding criteria;
- unintentional-loss behavior;
- BP >180/120 with and without symptoms;
- glucose <70 and <54;
- insulin/recurrent hypoglycaemia;
- TG ≥500 and ≥1000;
- no universal LDL target;
- no diagnostic language.

### 19.6 Security and privacy

- corrupt/oversized storage;
- prototype-pollution keys;
- malicious custom names/notes;
- spreadsheet injection;
- health data absent from URLs and service-worker caches;
- explicit-save-only persistence;
- migration rollback.

### 19.7 Required verification

```bash
npm ci
npm run lint
npm run test
npm run test:coverage
npm run build
npm audit --omit=dev
```

Add and run:

- browser end-to-end tests for onboarding, editing, migration, and goal switching;
- automated accessibility checks plus keyboard/manual review;
- production security-header verification;
- secret scan;
- performance checks on mobile and desktop;
- bundle-size comparison;
- offline/service-worker regression.

## 20. Acceptance criteria

Implementation is acceptable only when all are true:

1. Existing weight loss remains available and recognizable.
2. Existing valid sessions migrate without silent recalculation or loss.
3. The selected UX direction from ADR-0003 is implemented incrementally.
4. The three goals have distinct domain policies, content, warnings, metrics, and tests.
5. Muscle gain requires resistance-training context and makes no body-composition guarantee.
6. Healthy weight gain screens unintentional loss and refeeding risk and is not muscle gain under a new label.
7. Blood pressure, glucose, and lipid data affect safety/context only and do not diagnose or set treatment targets.
8. Every new plan records formula and evidence versions.
9. Every edit recalculates all supported totals and compatibility states.
10. Replacement is multi-nutrient and explains its reason.
11. Custom data is visibly user-entered and safely validated.
12. Goal switching preserves old plans and requires confirmation before activation.
13. Progress adjustments are trend-based, auditable, small, and rejectable.
14. No major redesign, route removal, analytics addition, health-data URL, or font replacement occurs.
15. Required tests, build, accessibility, security, privacy, and performance checks pass or any exception is explicitly approved and documented.

## 21. Explicit out of scope

- diagnosis or treatment of hypertension, diabetes, dyslipidaemia, obesity, malnutrition, or eating disorders;
- medication or supplement dosing;
- insulin/carbohydrate matching;
- universal LDL or glucose targets;
- emergency-service localisation;
- paediatric, pregnancy, or breastfeeding planning;
- renal, hepatic, oncology, bariatric, perioperative, dysphagia, or other medical nutrition therapy;
- supplement requirements, anabolic agents, SARMs, or performance-enhancing substances;
- accounts, cloud sync, clinician portal, payments, trackers, or advertising;
- guaranteed outcomes or body-composition predictions;
- exact cardiometabolic nutrient claims before food-data migration.

## 22. Source map

Primary and authoritative sources used by this specification:

1. National Academies of Sciences, Engineering, and Medicine. *Dietary Reference Intakes for Energy*. 2023. DOI 10.17226/26818.
2. NICE NG246. *Overweight and obesity management*. Published 2025; updated 2026.
3. NICE CG32. *Nutrition support for adults*, recommendations on malnutrition and refeeding risk.
4. Morton RW et al. Protein supplementation and resistance-training adaptations. *Br J Sports Med*. 2018. PMID 28698222.
5. Jäger R et al. ISSN position stand: protein and exercise. 2017. PMID 28642676.
6. Slater G et al. Energy surplus and muscle hypertrophy review. 2019. PMID 31482093.
7. Sanchez AD et al. Randomized trial of healthy weight gain in athletic adults. 2024. PMID 38537251.
8. WHO. *Healthy diet*. 26 January 2026.
9. WHO. *Sodium reduction*. 11 May 2026.
10. AHA/ACC. *2025 High Blood Pressure Guideline*.
11. ADA. *Standards of Care in Diabetes—2026*.
12. ACC/AHA. *2026 Guideline on the Management of Dyslipidemia*.
13. AHA. *2026 Dietary Guidance to Improve Cardiovascular Health*.
14. FAO/INFOODS food-composition standards and databases.

Each calculation policy MUST link to the detailed evidence matrix and calculation-source registry and carry a review-expiry date.

## 23. Approval gate

Specification approval explicitly approves:

- ADR-0003 UX direction;
- the domain and migration architecture;
- the safety decision boundaries;
- the NASEM 2023 energy equation for new v2 plans;
- the transparent starting-adjustment product policies in section 7.3;
- staged food-data enrichment before exact cardiometabolic claims;
- the complete editing, progress, privacy, testing, and acceptance requirements.

Implementation remains blocked until this document is explicitly approved as a whole or approved with listed amendments.
