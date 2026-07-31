# Mizaneh Multi-Goal Implementation Report

## 1. Scope delivered

The approved specification is implemented as an incremental extension of the existing Persian RTL nutrition planner.

### Preserved

- public `/` route, single-page planning flow, existing card/layout language and responsive structure;
- legacy weight-loss calculation path for restored `v1` sessions;
- existing meal catalogue, weekly plan generation, plan modes, substitution, shopping list, text export, print and offline service worker;
- opt-in local-only persistence with no account, backend, analytics or automatic save;
- existing saved session key `mizaneh:session:v1`, now readable through migration;
- existing accessibility patterns, visible focus, semantic form labels and status announcements.

### Corrected

- weight loss is now an explicit goal instead of an implicit global assumption;
- new plans use versioned NASEM 2023 EER policies with uncertainty metadata;
- restored legacy plans retain their legacy calculation behavior and are marked `legacy`;
- safety exclusions block ordinary plan generation instead of relying on a disclaimer;
- goal changes create a separate plan and require confirmation rather than overwriting the active plan;
- food replacement is classified and explained using energy, protein, fibre, meal role, compatibility, preparation and preference—not calories alone;
- custom foods are never silently considered allergy-safe or diet-pattern compatible;
- creator attribution and Vazirmatn-only typography are restored;
- the deprecated temporary prototype route is removed from production source.

### Added

- three goals: `weight_loss`, `muscle_gain`, `healthy_weight_gain`;
- guided selection (approved route C), optional comparison cards (route B), and direct returning-user selection;
- goal-specific explanations, onboarding fields, calculation policies, warnings and progress signals;
- optional blood-pressure, glycaemia and lipid context used only for safety disposition;
- blocking exclusions and referral dispositions for populations outside ordinary self-service scope;
- editable plans: portion, rename, time, remove, move, reorder, duplicate, meal/day lock, duplicate/copy day, reset meal/day/plan, favourites, hidden foods, undo and redo;
- custom foods with separate serving amount/unit, nutrition, user-entered label and optional source note;
- custom recipes with ingredient quantities, units, raw/cooked state, total yield, servings, nutrition per recipe and nutrition per serving;
- automatic day and plan recalculation after every edit, including completeness and compatibility findings;
- multi-plan workspace, plan snapshots, named versions and active-versus-version comparison;
- robust weight trends using same-day medians and Theil–Sen slope over a 21-day window;
- explicit, auditable energy-adjustment proposals capped at 100 kcal and never applied automatically;
- security headers and stricter persisted-data validation.

## 2. Goal-specific policy behavior

New plans persist policy identifiers, versions, evidence registry version, review-expiration date, evidence certainty and uncertainty range.

- Weight loss: conservative starting deficit equal to the smaller of 500 kcal or 15% of estimated maintenance; the user may choose a gentler 65% starting adjustment.
- Muscle gain: conservative starting surplus of 5%, clamped to 100–300 kcal; resistance training is required in the product explanation and onboarding.
- Healthy weight gain: distinct starting surplus of 10%, clamped to 200–500 kcal; appetite, early satiety and digestive tolerance are prioritized.

These surplus/deficit values are versioned product decisions under limited certainty, not guaranteed outcome rates. All goals show equation uncertainty and can only be adjusted from observed multi-measurement trends after explicit user acceptance.

If a new weight-loss target would be 1200 kcal/day or lower, ordinary automated generation is stopped because that enters the specialist low-energy range. Accepted trend adjustments cannot lower a v2 weight-loss target below 1225 kcal/day.

## 3. Cardiometabolic safety

Blood pressure, glucose/A1C and lipids are optional context, not diagnostic features.

- A single pressure reading is not diagnosed by the product.
- Pressure above 180 systolic or 120 diastolic stops ordinary planning; concerning symptoms escalate the disposition.
- Glucose below 70 mg/dL is treated as a safety event and below 54 mg/dL as higher priority; A1C values are not incorrectly processed as glucose concentrations.
- Insulin or medicines associated with hypoglycaemia, recurrent/severe hypoglycaemia and crisis symptoms block ordinary automated planning.
- Triglycerides at or above 500 mg/dL require professional review and at or above 1000 mg/dL receive higher-priority escalation.
- Diagnosed hypertension, diabetes/prediabetes or dyslipidaemia can receive general healthy-pattern support only when no stronger exclusion applies.
- No medication change, disease diagnosis, LDL treatment target or therapeutic diet is generated.

## 4. Data migration

### Legacy session

`mizaneh:session:v1` remains readable. On explicit restore it is normalized as the historical weight-loss goal, regenerated with the preserved legacy formula path, converted to a schema-v2 `PlanDocument`, marked `legacy: true`, and placed in a v2 workspace without silently deleting the old key. Gain goals never overwrite this weight-loss-only compatibility key.

### New workspace

`mizaneh:workspace:v2` stores at most 50 plans and validates:

- schema version, IDs, goal and plan mode;
- normalized form enums and cardiometabolic sub-objects;
- calculation numeric fields;
- day/meal size limits and safe plan identity;
- version, measurement and proposal caps;
- serialized size limit and prototype-pollution keys.

Storage remains opt-in. Loading never automatically applies a saved plan; the user explicitly restores or discards it.

## 5. Main modules changed or added

- `app/DietPlanner.tsx` — goal onboarding, safety gate, plan/version lifecycle, editing, progress and comparisons.
- `components/goal-selection/GoalSelection.tsx` — guided/default, comparison and direct goal selection.
- `components/safety-screen/SafetyScreenFields.tsx` — exclusions and optional cardiometabolic context.
- `components/meal-editor/MealEditor.tsx` — progressive plan editing and custom food/recipe forms.
- `components/progress/ProgressTracker.tsx` — measurements and explicit proposal decisions.
- `lib/calculations/energy/nasem2023.ts` — versioned EER equations and uncertainty.
- `lib/calculations/policies.ts` — separate goal policies and reviewed adjustment application.
- `lib/safety/screen.ts` — safety disposition and non-bypassable exclusions.
- `lib/plan/editor.ts` — immutable editing, recalculation, history and compatibility.
- `lib/plan/build.ts` — goal-aware generation and classified replacement reasons.
- `lib/progress/trend.ts` — robust trend and proposal rules.
- `lib/storage/workspace.ts` — v2 multi-plan persistence and validation.
- `lib/storage/session.ts` — hardened legacy restore path.
- `lib/types.ts` — explicit goal, safety, calculation, recipe, plan, progress and version domain types.
- `app/page.tsx`, `app/layout.tsx`, `app/globals.css` — incremental copy/SEO/UI extension, Vazirmatn-only typography and visible attribution.
- `next.config.ts` — CSP, HSTS and additional browser security headers.

## 6. Tests added

The source tree now contains 153 static `it(...)`/`test(...)` declarations versus 94 at the approved baseline (59 added declarations). New coverage targets:

- three-goal separation and guided recommendation;
- NASEM equation boundaries and formula metadata;
- separate starting policies and adjustment caps;
- all safety exclusions, cardiometabolic thresholds and A1C handling;
- plan editing, locks, history, custom foods/recipes and recalculation;
- allergy/diet uncertainty after user-entered edits;
- trend minimum sample/span rules and no single-weigh-in adjustment;
- v2 workspace validation, size limits and legacy migration;
- UI flows for goal selection, safety blocking, progressive editing and explicit save.

The declarations were type-checked, but the full Vitest runner could not be executed because dependency installation was blocked by the available registry/environment. No passing full-suite claim is made.

## 7. Accessibility, privacy, security and performance impact

### Accessibility

- controls remain native buttons, inputs, selects and fieldsets;
- dynamic outcomes use status/note semantics;
- advanced editors are progressively disclosed;
- goal recommendations are suggestions and direct selection remains available;
- state is not communicated by colour alone;
- visible focus and reduced-motion behavior are preserved in the existing stylesheet.

### Privacy

- no health data is placed in URLs;
- no analytics, advertising trackers, session replay, account sync or cloud storage were added;
- cardiometabolic and progress data are stored only after explicit local save;
- restore remains explicit and clear removes persisted workspace/session data.

### Security

- persisted objects have schema, size and unsafe-key validation;
- custom text fields and recipe arrays have length/numeric caps;
- no HTML rendering is used for user-entered food data;
- exports remain text-based and do not interpret custom content as formulas;
- CSP, frame denial, HSTS, MIME sniffing prevention, referrer and permissions policies are configured.

### Performance

- no server dependency or network call was added to plan generation;
- scientific calculation, plan editing, trend analysis and safety screening remain local and deterministic;
- history, plans, measurements and recipes are capped to avoid unbounded persisted data;
- the temporary prototype code was removed from production.

## 8. Remaining limitations

- The existing food catalogue does not yet provide verified carbohydrate, fat, saturated fat, sodium and micronutrient values for every item. Missing values are shown as incomplete and are not fabricated.
- Iranian household measures and raw/cooked provenance still require a reviewed, versioned food-composition dataset.
- The starting surplus/deficit policies have limited certainty and require scheduled review by 2026-10-30.
- No validated cardiovascular-risk calculator, medication dosing, disease treatment, supplement prescription, clinician portal, cloud sync or laboratory import is included.
- Full lint, Vitest, Next production build, browser accessibility automation, dependency audit and deployed-header verification remain uncompleted in this environment.
