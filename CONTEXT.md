# CONTEXT.md — Mizaneh (میزانه)

Status: DRAFT v0.1 — produced during initial audit, before grilling/domain-modeling
interviews are complete. Everything below is derived from reading the shipped
code (`app/DietPlanner.tsx`, `app/page.tsx`, `app/layout.tsx`) and the live
production site, not from an interview with the product owner. Treat numeric
rules here as "what the code currently does," not yet "what has been
verified against primary sources" — that verification is a separate, later
step (`research`).

## 1. What Mizaneh is

A single-page, Persian (RTL) client-side nutrition/meal-planning calculator.
No backend, no accounts, no database — `"use client"` component, all state
in React `useState`, nothing persisted or transmitted. The user fills a
multi-step form (body stats → goals/schedule → diet style/allergies →
lifestyle) and gets back: daily calorie/macro targets, a multi-day meal
plan built from a fixed in-file food/meal template list, and a shopping
list aggregated from that plan.

## 2. Target users & medical boundary (draft — needs grilling confirmation)

- Assumed audience: general adult public users self-directing a weight-
  management or maintenance plan, not clinicians or patients under active
  medical treatment.
- The tool computes calorie floors (1500 kcal male / 1200 kcal female) and
  caps the deficit at 20% of TDEE — these read as safety guardrails against
  crash-diet numbers, not as personalized medical advice.
- **Correction after reading `getValidationMessage` in full**: the app
  already hard-blocks step progression for age outside 18–80, weight/height
  outside a plausible range, and any BMI (current or target) under 18.5 —
  this is a real, working guardrail, not merely a claim. What is genuinely
  missing is any general-purpose "this is an estimate, not medical advice"
  statement — no disclaimer text of any kind was found anywhere in the
  component tree (`grep` for پزشک/مشاوره/تشخیص returned nothing). The gap
  to close is the missing disclosure, not a missing gate.
- Working boundary (assumption, to confirm): Mizaneh is a **self-service
  estimation tool**, not diagnosis or treatment. It must never claim to
  detect a medical condition or replace professional dietary guidance.

## 3. Core terminology

| Term | Meaning in Mizaneh |
|---|---|
| BMR | Basal Metabolic Rate, Mifflin–St Jeor formula |
| TDEE | BMR × activity factor |
| Activity factor | sedentary 1.2 / light 1.375 / moderate 1.55 / active 1.725 |
| Target calories | TDEE − safe deficit, floored at 1500 (male) / 1200 (female), rounded to nearest 25 kcal |
| Safe deficit | min(desired deficit from pace, 20% of TDEE) |
| Pace | user-selected weekly weight-loss rate: 0.25 / 0.5 / 0.75 kg/week |
| Diet style | balanced / vegetarian / mediterranean / highProtein — changes protein-per-kg target and fat ratio |
| Plan mode | variety / quick / batch / protein — biases which meal templates are selected |
| Allergy | gluten / dairy / egg / nuts / fish — hard-excludes matching meal templates |
| Meal slot | breakfast / snack / lunch / dinner |
| Slot share | fraction of daily calories assigned per slot, adjusted by meal count and hunger-peak |
| Day pattern | office / shift / home / regular — currently used for framing, not yet verified to change plan output materially |
| Portion cue | human-readable serving guidance shown per meal |
| Shopping list | ingredients aggregated (deduped/summed) across a plan's meals, grouped by category |

## 4. Calculation rules as currently implemented

```
bmr  = 10*weight + 6.25*height - 5*age + (male ? 5 : -161)
tdee = round(bmr * activityFactor)
desiredDeficit = pace * 7700 / 7          // 7700 kcal ≈ 1 kg body fat
safeDeficit    = min(desiredDeficit, tdee * 0.20)
calorieFloor   = male ? 1500 : 1200
targetCalories = max(calorieFloor, roundTo(tdee - safeDeficit, 25))
actualDeficit  = max(0, tdee - targetCalories)
weeklyPace     = actualDeficit * 7 / 7700

proteinPerKg   = highProtein style ? 1.6 : 1.35   (g per kg of *target* weight)
protein        = round(clamp(targetWeight*proteinPerKg .. targetCalories*0.31/4,
                              floor = targetCalories*0.22/4))
fatRatio       = mediterranean ? 0.34 : 0.30
fat            = round(targetCalories * fatRatio / 9)
carbs          = max(80, round((targetCalories - protein*4 - fat*9) / 4))
fiber          = max(25, round(targetCalories/1000 * 14))
bmi            = weight / (height/100)^2
waterLiters    = male ? 2.5 : 2.0
```

These are the Mifflin–St Jeor equation and standard Harris-style activity
multipliers, which is the right family of formula for a general-audience
calculator (no indirect calorimetry or body-composition input). The specific
constants (7700 kcal/kg, 20% deficit cap, 1200/1500 floors, protein-per-kg
ranges, fiber-per-1000-kcal) need a `research` pass against current primary
sources (e.g. current national dietary guideline bodies, sports-nutrition
consensus statements) before being called verified — some of these are
reasonable approximations but not all are contemporary consensus numbers
(7700 kcal/kg is the traditional Wishnofsky figure and is now considered a
static, first-order approximation rather than an exact conversion).

## 5. Data model boundaries (as-is)

- `MealTemplate` — static, hardcoded catalogue in the same file as the UI.
  Has: slot, title, serving text, ingredient list (free-text strings, not
  structured), calories/protein/fiber, prep minutes, batch-friendliness,
  optional breakfast taste, allergen tags, compatible diet styles.
- `PlannedMeal` — a `MealTemplate` placed into a specific day with a target
  calorie/protein/fiber share and a portion cue string.
- `DayPlan` — id/label + ordered meals + summed calories/protein/fiber.
- `ShoppingGroup` — title/tone/items — items are aggregated from
  `MealTemplate.ingredients`, which are unstructured strings, so
  "aggregation" is closer to string-level grouping/dedup than true
  quantity math (no units on ingredients yet). This is a concrete
  improvement target: ingredients need `{ name, qty, unit }` if the
  shopping list is to sum quantities rather than just list items.
- Substitutions: implemented as meal-level swaps (see §8 decision 2 /
  ADR-0002) — `substituteMeal` in `lib/plan/build.ts` swaps one whole
  `PlannedMeal` for another compatible template in the same slot.

## 6. Privacy expectation (as-is)

No network calls, no storage APIs, no analytics observed in the reviewed
file set — the "your data isn't stored or sent anywhere" promise holds
for the current code, both before and after this audit's refactor.
**Verified by an automated test**: `app/DietPlanner.test.tsx` spies on
`fetch` and `Storage.prototype.setItem` across a full form submission and
asserts neither is ever called.

## 7. RTL / accessibility notes

- Persian digits are used for all numeric display (`Intl.NumberFormat("fa-IR")`).
- Fonts: Vazirmatn + Noto Nastaliq Urdu variable fonts.
- Done in this pass: explicit `aria-label`s on the age/height/weight/
  target-weight inputs (previously relying only on implicit
  wrapper-`<label>` association, which included the unit text in the
  accessible name); the safety advisory uses `role="note"` with a
  labelled accessible name; a keyboard-navigation smoke test and a
  reduced-motion rule (`prefers-reduced-motion`) were confirmed to
  already exist and were preserved.
- Still open (not done in this pass, logged for a future iteration): a
  full contrast audit against WCAG AA across both light states, and
  per-field (rather than per-step) `aria-describedby` wiring from the
  validation message to the specific offending input.

## 8. Decisions (resolved during grill-with-docs / domain-modeling)

No human was available to grill interactively in this autonomous run, so
each question below was answered with the most defensible default given
the stated priorities, and recorded as an assumption rather than left
open. See `docs/adr/` for the two decisions substantial enough to warrant
a standalone ADR.

1. **Existing hard gates (age 18–80, BMI ≥ 18.5) are preserved unchanged**
   — they are working guardrails and preserving existing useful
   functionality is a priority. **New: a one-time, non-blocking safety
   disclosure** is added independent of those gates — shown once before
   step 1, stating plainly that Mizaneh is an estimate and not medical
   advice, and that no data leaves the browser. This is additive (fills a
   real gap: no disclaimer text existed anywhere) rather than a change to
   the existing validation behavior. See ADR-0001.
2. **Substitution = meal-level, not ingredient-level, for this pass.**
   Decision: a "substitution" swaps one whole planned meal for another
   compatible template in the same slot (same allergy/style/calorie-target
   constraints the planner already uses). Ingredient-level substitution
   would require restructuring `ingredients: string[]` into structured
   `{ name, qty, unit }` data, which is a larger, separately-scoped change
   — logged as a backlog item in
   `docs/adr/0002-meal-level-substitution-scope.md` rather than done
   silently now. **Implemented**: `lib/plan/build.ts`'s `substituteMeal`,
   wired to a "جایگزین کن" button per meal card in the UI.
3. **`dayPattern` is real, narrow, and stays as-is.** Confirmed in code
   (not just assumed): `dayPattern === "office"` already biases snack
   selection away from higher-prep-time meals. It is a small, legitimate
   signal, not dead cosmetic UI — kept and covered by a test rather than
   expanded or removed.
4. **Determinism already exists and needs no new mechanism.** Confirmed in
   code: `buildWeeklyPlan` takes an explicit `variationSeed` and ranks
   candidate meals using `hashValue(...)`, a pure string hash — there is no
   `Math.random` anywhere in the file. The refactor's job is to preserve
   this (extract `hashValue` and the ranking function into a tested pure
   module) and add a regression test proving "same inputs + same seed ⇒
   byte-identical plan," not to invent seeding from scratch.
