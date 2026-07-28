# Architecture Assessment (codebase-design / improve-codebase-architecture)

## Current state
`app/DietPlanner.tsx` (2677 lines) is one shallow, wide module: it exposes
the entire app (types, ~40 meal templates, formulas, plan-building,
shopping-list grouping, all form state, all step UI) through a single
default export with no internal seams. Nothing in it is unit-testable
without rendering the whole component tree.

## Deepening opportunities
1. **Nutrition math is a natural deep module.** `calculateMetrics` and its
   helpers (`roundTo`, `bmiLabel`, `toNumber`, `formatNumber`) have a tiny,
   stable interface (`PlannerForm → Metrics`) hiding real complexity
   (macro ratio math, deficit safeguards). Extracting this behind
   `lib/nutrition/formulas.ts` costs nothing at the call site and unlocks
   direct unit testing of the exact numbers this product cannot get wrong.
2. **The food catalogue is data, not logic**, and belongs in its own
   module (`lib/food/catalogue.ts`) so it can grow (more meals, more
   allergens) without anyone touching plan-building or UI code.
3. **Plan-building (`buildWeeklyPlan`, `hashValue`, scoring, slot shares) is
   a second deep module** — same shape as #1: a simple interface
   (`form, metrics, mode, seed → DayPlan[]`), real internal complexity
   (candidate filtering, ranking, allergy/dislike/style constraints,
   deterministic hashing) worth hiding behind that interface and testing
   directly rather than through the DOM.
4. **Shopping-list aggregation** is a small, separable pure transform
   (`DayPlan[] → ShoppingGroup[]`) currently interleaved with rendering
   code — pulling it out removes one more reason to touch the component
   file for a change unrelated to UI.
5. **The UI component becomes shallow by design** after 1–4: it owns
   state, step navigation, validation wiring, and rendering, and calls
   into the modules above rather than containing their logic — the
   opposite of "shallow module, wide interface"; here the interfaces of
   the extracted modules are narrow and their internals are where the
   real complexity lives, which is what makes them worth the seam.

## Non-goals for this pass
- No introduction of a state-management library — `useState`/`useMemo` is
  proportionate to this app's size and changing it isn't requested or
  required by any user story.
- No server-side rendering of the calculator itself — it's explicitly
  client-only by design (privacy promise), so this stays a `"use client"`
  component tree.

## Resulting module map (used by `implement`)
```
lib/
  nutrition/
    formulas.ts     BMR/TDEE/deficit/macros/BMI/fiber/water + field validation
    format.ts       Persian number/decimal formatting, digit parsing, roundTo
  food/
    catalogue.ts     MealTemplate[] + shared types (Allergy, DietStyle, ...)
  plan/
    build.ts         buildWeeklyPlan, hashValue, substituteMeal
    shopping.ts      shopping-list grouping
components/
  SafetyAdvisory.tsx trust-and-safety-first notice (ADR-0001)
app/
  DietPlanner.tsx    UI only: state, steps, validation wiring, rendering
```
