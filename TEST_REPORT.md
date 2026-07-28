# Test Report

Generated from a clean `npm ci` install (node v22.22.2) and re-verified again after applying `changes.patch` to a fresh checkout of BASE_COMMIT in an isolated temp directory.

## Validation sequence result

| Step | Result |
|---|---|
| `npm ci` | ✅ success, 463 packages |
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm run test` | ✅ 81/81 passed, 5 test files |
| `npm run build` | ✅ compiled + typechecked + all pages generated |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| `npm audit` (incl. dev) | ⚠️ 9 pre-existing high advisories, unchanged from BASE_COMMIT — see `docs/unresolved-audit-advisory.md` in the final package |
| Golden-output regression (pre- vs. post-refactor `buildWeeklyPlan`/`calculateMetrics`/`buildShoppingGroups`) | ✅ byte-identical across 5 sample forms × 4 plan modes |
| Patch-apply verification | ✅ `changes.patch` applied cleanly to a fresh `BASE_COMMIT` checkout; full validation sequence re-passed there |

## Full test list

```

> mizaneh-nutrition-planner@1.0.0 test
> vitest run --reporter=verbose


 RUN  v4.1.10 /home/claude/mizaneh

 ✓ app/DietPlanner.test.tsx > SafetyAdvisory (ADR-0001) > is shown once, before step 1, with an accessible note role 277ms
 ✓ app/DietPlanner.test.tsx > SafetyAdvisory (ADR-0001) > can be dismissed 224ms
 ✓ app/DietPlanner.test.tsx > step navigation & validation > blocks advancing past step 1 with the existing hard gate for out-of-range age 313ms
 ✓ app/DietPlanner.test.tsx > step navigation & validation > advances to step 2 once the field is corrected 519ms
 ✓ app/DietPlanner.test.tsx > step navigation & validation > walks all 4 steps with valid defaults and generates a plan 694ms
 ✓ app/DietPlanner.test.tsx > step navigation & validation > goes back a step with the بازگشت button without losing later-step field values 161ms
 ✓ app/DietPlanner.test.tsx > substitution (user story 10) > lets the user substitute a meal and shows a different one in that slot 735ms
 ✓ app/DietPlanner.test.tsx > shopping list disclosure (ADR-0002) > shows the grouped-not-quantity-exact note 418ms
 ✓ app/DietPlanner.test.tsx > keyboard navigation smoke test > reaches the age field and the continue button via Tab 259ms
 ✓ app/DietPlanner.test.tsx > keyboard navigation smoke test > can activate the continue button with the keyboard 111ms
 ✓ app/DietPlanner.test.tsx > privacy — no network calls or persistent storage > never calls fetch or writes to localStorage/sessionStorage during a full submission 344ms
 ✓ app/DietPlanner.test.tsx > print and text export > calls window.print for the چاپ یا ذخیره button 397ms
 ✓ app/DietPlanner.test.tsx > print and text export > downloads a text export containing the plan's calorie target and day labels 416ms
 ✓ app/DietPlanner.test.tsx > mobile / RTL rendering smoke test > renders the main content in RTL via the layout's dir attribute chain (component itself renders without a hardcoded LTR override) 52ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — golden-output regression (pre-refactor parity) > produces byte-identical output to the pre-refactor implementation across 5 sample forms × 4 plan modes 110ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — determinism > produces an identical plan for identical inputs and the same seed 2ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — determinism > can (though isn't guaranteed to) produce a different plan for a different seed 6ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — allergy filtering > never includes a meal containing a selected allergen 11ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — dietary style > only includes meals compatible with the requested diet style, when any exist 2ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — dislikes > excludes meals whose title or ingredients mention a disliked token, when alternatives exist 3ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — day-pattern snack bias > is a real signal in the scoring function for office-pattern snacks (prep-time penalty) 1ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — totals > sums each day's calories/protein/fiber from its own meals 2ms
 ✓ lib/plan/build.test.ts > substituteMeal > replaces the targeted meal with a different, constraint-compatible one 2ms
 ✓ lib/plan/build.test.ts > substituteMeal > preserves the target-calorie share of the substituted slot 1ms
 ✓ lib/plan/build.test.ts > substituteMeal > recomputes the day's totals after substitution 1ms
 ✓ lib/plan/build.test.ts > substituteMeal > returns the original day unchanged if no compatible alternative exists 1ms
 ✓ lib/plan/build.test.ts > meal catalogue sanity > has at least one allergen-free meal per slot (fallback safety net) 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes مرغ as protein 2ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes ماست as protein 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes برنج as grain 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes عدس as legume 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes گردو as fat 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes زعفران as pantry 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes خیار as produce 0ms
 ✓ lib/plan/shopping.test.ts > buildShoppingGroups > de-duplicates repeated ingredients across the week 1ms
 ✓ lib/plan/shopping.test.ts > buildShoppingGroups > omits empty categories entirely 1ms
 ✓ lib/plan/shopping.test.ts > buildShoppingGroups > sorts items within each group 5ms
 ✓ lib/plan/shopping.test.ts > buildShoppingList > bundles the grouped items with the aggregation-limits disclosure note 4ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > matches the Mifflin–St Jeor formula for a female 2ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > matches the Mifflin–St Jeor formula for a male 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > applies the sedentary activity factor of 1.2 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > applies the light activity factor of 1.375 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > applies the moderate activity factor of 1.55 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > applies the active activity factor of 1.725 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — calorie-deficit safeguards > caps the deficit at 20% of TDEE even for an aggressive pace 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — calorie-deficit safeguards > never drops target calories below the female floor of 1200 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — calorie-deficit safeguards > never drops target calories below the male floor of 1500 1ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — calorie-deficit safeguards > rounds target calories to the nearest 25 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — macros > gives the high-protein diet style more protein per kg than balanced 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — macros > gives the mediterranean style a higher fat ratio 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — macros > keeps carbs at or above the 80g floor 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — macros > computes fiber as max(25, 14g per 1000 kcal) 0ms
 ✓ lib/nutrition/formulas.test.ts > bmiLabel > labels a BMI of 17 as کمتر از محدوده مرجع 0ms
 ✓ lib/nutrition/formulas.test.ts > bmiLabel > labels a BMI of 22 as محدوده مرجع 0ms
 ✓ lib/nutrition/formulas.test.ts > bmiLabel > labels a BMI of 27 as بالاتر از محدوده مرجع 0ms
 ✓ lib/nutrition/formulas.test.ts > bmiLabel > labels a BMI of 32 as نیازمند توجه بیشتر 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 1 (existing hard gates, preserved per ADR-0001) > rejects age under 18 1ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 1 (existing hard gates, preserved per ADR-0001) > rejects age over 80 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 1 (existing hard gates, preserved per ADR-0001) > accepts age at the boundaries (18 and 80) 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 1 (existing hard gates, preserved per ADR-0001) > rejects height outside 130–220 cm 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 1 (existing hard gates, preserved per ADR-0001) > rejects weight outside 40–250 kg 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 1 (existing hard gates, preserved per ADR-0001) > rejects a BMI under 18.5 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 1 (existing hard gates, preserved per ADR-0001) > rejects non-numeric input 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 2 > rejects a target weight at or above current weight 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 2 > rejects a target weight under 40kg 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 2 > rejects a target BMI under 18.5 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 2 > accepts a sane target weight 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 4 > rejects an overly long dislikes list 0ms
 ✓ lib/nutrition/formulas.test.ts > getValidationMessage — step 4 > accepts a short dislikes list 0ms
 ✓ lib/nutrition/format.test.ts > toNumber > parses plain ASCII digit strings 2ms
 ✓ lib/nutrition/format.test.ts > toNumber > parses Persian digit strings 0ms
 ✓ lib/nutrition/format.test.ts > toNumber > parses mixed Persian/ASCII digits 0ms
 ✓ lib/nutrition/format.test.ts > toNumber > returns NaN for non-numeric input 0ms
 ✓ lib/nutrition/format.test.ts > toNumber > parses decimal values 0ms
 ✓ lib/nutrition/format.test.ts > formatNumber > formats an integer using Persian digits 0ms
 ✓ lib/nutrition/format.test.ts > formatNumber > rounds non-integers before formatting 0ms
 ✓ lib/nutrition/format.test.ts > formatNumber > formats zero 0ms
 ✓ lib/nutrition/format.test.ts > formatDecimal > formats with at most one fraction digit using Persian digits 1ms
 ✓ lib/nutrition/format.test.ts > formatDecimal > formats whole numbers without a trailing separator 0ms
 ✓ lib/nutrition/format.test.ts > roundTo > rounds to the nearest increment 0ms
 ✓ lib/nutrition/format.test.ts > roundTo > handles an increment of 1 as a no-op rounding 0ms

 Test Files  5 passed (5)
      Tests  81 passed (81)
   Start at  07:29:35
   Duration  13.90s (transform 806ms, setup 997ms, import 1.07s, tests 5.11s, environment 5.77s)

```
