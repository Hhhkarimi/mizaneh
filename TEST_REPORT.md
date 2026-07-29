# Test Report — cumulative (round 1 + round 2)

Generated from a clean `npm ci` install (node v22.22.2) and re-verified again after applying the cumulative `changes.patch` to a fresh checkout of the true original BASE_COMMIT in an isolated temp directory.

## Validation sequence result

| Step | Result |
|---|---|
| `npm ci` | ✅ success |
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm run test` | ✅ 109/109 passed, 7 test files |
| `npm run build` | ✅ compiled + typechecked + all pages generated |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |
| `npm audit` (incl. dev) | ⚠️ 9 pre-existing high advisories, unchanged from BASE_COMMIT — see `docs/unresolved-audit-advisory.md` in the final package |
| Golden-output regression (metrics/plan-selection, pre- vs. post-refactor) | ✅ byte-identical across 5 sample forms × 4 plan modes |
| Golden-output content check (shopping-list ingredients per category) | ✅ identical set of ingredients, shape intentionally upgraded (round 2 frequency counts) |
| Patch-apply verification | ✅ cumulative `changes.patch` applied cleanly to a fresh original-`BASE_COMMIT` checkout; full validation sequence re-passed there |

## Full test list

```

> mizaneh-nutrition-planner@1.0.0 test
> vitest run --reporter=verbose


 RUN  v4.1.10 /home/claude/mizaneh

 ✓ app/DietPlanner.test.tsx > SafetyAdvisory (ADR-0001) > is shown once, before step 1, with an accessible note role 316ms
 ✓ app/DietPlanner.test.tsx > SafetyAdvisory (ADR-0001) > can be dismissed 297ms
 ✓ app/DietPlanner.test.tsx > step navigation & validation > blocks advancing past step 1 with the existing hard gate for out-of-range age 409ms
 ✓ app/DietPlanner.test.tsx > step navigation & validation > advances to step 2 once the field is corrected 448ms
 ✓ app/DietPlanner.test.tsx > step navigation & validation > walks all 4 steps with valid defaults and generates a plan 747ms
 ✓ app/DietPlanner.test.tsx > step navigation & validation > goes back a step with the بازگشت button without losing later-step field values 184ms
 ✓ app/DietPlanner.test.tsx > substitution picker (round 2, spec user story 24) > opens a picker with ranked alternatives instead of swapping immediately 640ms
 ✓ app/DietPlanner.test.tsx > substitution picker (round 2, spec user story 24) > applies the chosen option and closes the picker 840ms
 ✓ app/DietPlanner.test.tsx > substitution picker (round 2, spec user story 24) > can be cancelled without changing anything 631ms
 ✓ app/DietPlanner.test.tsx > save / restore session (round 2, spec user stories 25-28) > does not show a restore prompt when nothing is saved 63ms
 ✓ app/DietPlanner.test.tsx > save / restore session (round 2, spec user stories 25-28) > saves only on an explicit click, with a confirmation message, and can be cleared 564ms
 ✓ app/DietPlanner.test.tsx > save / restore session (round 2, spec user stories 25-28) > shows an explicit restore-or-discard prompt for a returning session, never a silent restore 117ms
 ✓ app/DietPlanner.test.tsx > save / restore session (round 2, spec user stories 25-28) > restores the saved plan when the user explicitly confirms 271ms
 ✓ app/DietPlanner.test.tsx > save / restore session (round 2, spec user stories 25-28) > discards the saved session when the user chooses نه، پاک کن 153ms
 ✓ app/DietPlanner.test.tsx > shopping list disclosure (ADR-0002, round 2 frequency count) > shows the meal-frequency-count note 455ms
 ✓ app/DietPlanner.test.tsx > keyboard navigation smoke test > reaches the age field and the continue button via Tab 229ms
 ✓ app/DietPlanner.test.tsx > keyboard navigation smoke test > can activate the continue button with the keyboard 104ms
 ✓ app/DietPlanner.test.tsx > privacy — no network calls or persistent storage > never calls fetch or writes to localStorage/sessionStorage during a full submission 275ms
 ✓ app/DietPlanner.test.tsx > print and text export > calls window.print for the چاپ یا ذخیره button 358ms
 ✓ app/DietPlanner.test.tsx > print and text export > downloads a text export containing the plan's calorie target and day labels 385ms
 ✓ app/DietPlanner.test.tsx > mobile / RTL rendering smoke test > renders the main content in RTL via the layout's dir attribute chain (component itself renders without a hardcoded LTR override) 44ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — golden-output regression (pre-refactor parity) > produces byte-identical metrics/plan output to the pre-refactor implementation across 5 sample forms × 4 plan modes 97ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — golden-output regression (pre-refactor parity) > still selects the exact same set of ingredients per shopping category as the pre-refactor fixture (content, not shape) 20ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — determinism > produces an identical plan for identical inputs and the same seed 2ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — determinism > can (though isn't guaranteed to) produce a different plan for a different seed 4ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — allergy filtering > never includes a meal containing a selected allergen 11ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — dietary style > only includes meals compatible with the requested diet style, when any exist 2ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — dislikes > excludes meals whose title or ingredients mention a disliked token, when alternatives exist 1ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — day-pattern snack bias > is a real signal in the scoring function for office-pattern snacks (prep-time penalty) 2ms
 ✓ lib/plan/build.test.ts > buildWeeklyPlan — totals > sums each day's calories/protein/fiber from its own meals 2ms
 ✓ lib/plan/build.test.ts > getSubstituteOptions (round 2 — substitution picker) > returns up to `limit` compatible, distinct alternatives excluding the current meal 2ms
 ✓ lib/plan/build.test.ts > getSubstituteOptions (round 2 — substitution picker) > respects the same allergy constraint as buildWeeklyPlan/substituteMeal 1ms
 ✓ lib/plan/build.test.ts > getSubstituteOptions (round 2 — substitution picker) > preserves the original slot's target-calorie share for every option 1ms
 ✓ lib/plan/build.test.ts > getSubstituteOptions (round 2 — substitution picker) > substituteMeal picks exactly the first option from getSubstituteOptions (round 1 behavior preserved) 1ms
 ✓ lib/plan/build.test.ts > getSubstituteOptions (round 2 — substitution picker) > returns an empty list rather than throwing when no alternative exists 1ms
 ✓ lib/plan/build.test.ts > substituteMeal > replaces the targeted meal with a different, constraint-compatible one 1ms
 ✓ lib/plan/build.test.ts > substituteMeal > preserves the target-calorie share of the substituted slot 1ms
 ✓ lib/plan/build.test.ts > substituteMeal > recomputes the day's totals after substitution 1ms
 ✓ lib/plan/build.test.ts > substituteMeal > returns the original day unchanged if no compatible alternative exists 1ms
 ✓ lib/plan/build.test.ts > meal catalogue sanity > has at least one allergen-free meal per slot (fallback safety net) 0ms
 ✓ components/ServiceWorkerRegistration.test.tsx > public/sw.js > is syntactically valid JavaScript 2ms
 ✓ components/ServiceWorkerRegistration.test.tsx > ServiceWorkerRegistration > registers the service worker in production when supported 19ms
 ✓ components/ServiceWorkerRegistration.test.tsx > ServiceWorkerRegistration > does not register outside production (avoids stale HMR caching in dev) 3ms
 ✓ components/ServiceWorkerRegistration.test.tsx > ServiceWorkerRegistration > does nothing (no throw) when serviceWorker isn't supported 3ms
 ✓ components/ServiceWorkerRegistration.test.tsx > ServiceWorkerRegistration > swallows a registration failure instead of throwing 2ms
 ✓ components/ServiceWorkerRegistration.test.tsx > ServiceWorkerRegistration > renders nothing visible 4ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes مرغ as protein 3ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes ماست as protein 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes برنج as grain 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes عدس as legume 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes گردو as fat 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes زعفران as pantry 0ms
 ✓ lib/plan/shopping.test.ts > categoryForIngredient > categorizes خیار as produce 0ms
 ✓ lib/plan/shopping.test.ts > buildShoppingGroups > de-duplicates repeated ingredients across the week and counts occurrences (round 2) 2ms
 ✓ lib/plan/shopping.test.ts > buildShoppingGroups > omits empty categories entirely 1ms
 ✓ lib/plan/shopping.test.ts > buildShoppingGroups > sorts items within each group 6ms
 ✓ lib/plan/shopping.test.ts > buildShoppingGroups > keeps entries and items in the same order and content 3ms
 ✓ lib/plan/shopping.test.ts > buildShoppingGroups > gives every entry a count of at least 1, matching real meal usage 6ms
 ✓ lib/plan/shopping.test.ts > buildShoppingList > bundles the grouped items with the count-disclosure note (round 2) 5ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > matches the Mifflin–St Jeor formula for a female 3ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > matches the Mifflin–St Jeor formula for a male 1ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > applies the sedentary activity factor of 1.2 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > applies the light activity factor of 1.375 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > applies the moderate activity factor of 1.55 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — Mifflin–St Jeor BMR/TDEE > applies the active activity factor of 1.725 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — calorie-deficit safeguards > caps the deficit at 20% of TDEE even for an aggressive pace 1ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — calorie-deficit safeguards > never drops target calories below the female floor of 1200 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — calorie-deficit safeguards > never drops target calories below the male floor of 1500 1ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — calorie-deficit safeguards > rounds target calories to the nearest 25 0ms
 ✓ lib/nutrition/formulas.test.ts > calculateMetrics — macros > gives the high-protein diet style more protein per kg than balanced 1ms
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
 ✓ lib/storage/session.test.ts > session storage — explicit opt-in only > has nothing saved by default 4ms
 ✓ lib/storage/session.test.ts > session storage — explicit opt-in only > saves and loads back exactly what was saved 3ms
 ✓ lib/storage/session.test.ts > session storage — explicit opt-in only > clears a saved session completely 1ms
 ✓ lib/storage/session.test.ts > session storage — explicit opt-in only > discards and clears data with a mismatched version instead of applying it 1ms
 ✓ lib/storage/session.test.ts > session storage — explicit opt-in only > discards corrupted JSON instead of throwing 2ms
 ✓ lib/storage/session.test.ts > session storage — explicit opt-in only > degrades to no-op (not a throw) if localStorage.setItem throws 2ms
 ✓ lib/storage/session.test.ts > session storage — explicit opt-in only > stores substitutions alongside the rest of the session 1ms
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

 Test Files  7 passed (7)
      Tests  109 passed (109)
   Start at  06:43:26
   Duration  20.53s (transform 981ms, setup 1.55s, import 1.34s, tests 7.80s, environment 8.47s)

```
