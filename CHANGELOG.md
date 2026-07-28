# Changelog — Mizaneh production-readiness audit

Against `BASE_COMMIT` `4a2d747d027ce3e85413a12488009d686e6187b1`. No
formula constant, meal-catalogue value, or label text was changed —
verified with a golden-output regression test (see `lib/plan/build.test.ts`
and `lib/plan/__fixtures__/golden-plan-output.json`).

## Architecture

- **Split `app/DietPlanner.tsx` (2677 lines) into cohesive modules:**
  - `lib/types.ts` — shared domain types (single source of truth).
  - `lib/nutrition/format.ts` — Persian number formatting, digit parsing,
    rounding.
  - `lib/nutrition/formulas.ts` — BMR/TDEE/deficit/macro calculations and
    step validation (existing hard gates for age 18–80 / BMI ≥ 18.5
    preserved exactly).
  - `lib/food/catalogue.ts` — the ~40-item meal catalogue and form option
    lists (previously inline).
  - `lib/plan/build.ts` — deterministic weekly plan generation
    (`buildWeeklyPlan`, `hashValue`, scoring) plus new `substituteMeal`.
  - `lib/plan/shopping.ts` — shopping-list grouping/aggregation, plus new
    `shoppingListNote` / `buildShoppingList`.
  - `lib/labels.ts` — enum-to-Persian-label lookups.
  - `components/SafetyAdvisory.tsx` — new, additive safety/privacy notice.
  - `app/DietPlanner.tsx` — now UI-only (1345 lines): state, step
    navigation, validation wiring, rendering.
- Added `.gitignore` (none existed before).

## New behavior

- **Safety/privacy disclosure** (ADR-0001): a one-time, dismissible note
  shown before step 1, stating Mizaneh is an estimate and not medical
  advice, and that no data leaves the browser. Existing hard validation
  gates (age 18–80, BMI ≥ 18.5) are unchanged — this closes a real gap
  (no disclaimer text existed anywhere before) rather than altering
  working validation.
- **Meal substitution** (spec user story 10 / ADR-0002): a "جایگزین کن"
  button on each meal card swaps it for another compatible template in
  the same slot (same allergy/dislike/style constraints), preserving the
  slot's target-calorie share and recomputing day totals.
- **Shopping-list disclosure** (ADR-0002): the shopping list now displays
  an explicit note that it groups repeated ingredients rather than
  summing exact purchase quantities.
- **Accessibility**: explicit `aria-label`s added to the age/height/
  weight/target-weight inputs (previously relying only on implicit
  wrapper-`<label>` association).

## Fixes found during review

- A generated `coverage/` directory was briefly linted; excluded via
  `eslint.config.mjs` and `.gitignore`.
- The new substitute button's grid placement wasn't accounted for at the
  680–920px viewport range; the mobile 2-column collapse now starts at
  920px and both the macros block and the button are explicitly placed
  in the content column.

## Testing

- Added the smallest suitable stack: Vitest + Testing Library + jsdom
  (no test tooling existed before).
- 81 tests across 5 files covering: Mifflin–St Jeor/TDEE/deficit
  safeguards/rounding, invalid & extreme inputs, Persian number
  formatting, allergy/dietary-style/dislike filtering, deterministic
  seeded generation (including a golden-output regression test against
  the pre-refactor implementation), substitution, shopping-list
  aggregation, step navigation & validation UX, keyboard navigation,
  the safety advisory, privacy/no-persistence, and print/text export.
- `npm run test` / `npm run test:coverage` scripts added to `package.json`.

## Documentation added

`CONTEXT.md`, `docs/research.md`, `docs/architecture-assessment.md`,
`docs/prototype-evaluation.md`, `docs/adr/0001-*.md`,
`docs/adr/0002-*.md`, `docs/code-review.md`,
`docs/unresolved-audit-advisory.md`, `docs/agents/*.md`,
`.scratch/mizaneh-audit/spec.md`, and this changelog/`APPLY.md`/
`TEST_REPORT.md`.

## Explicitly not changed

- Any nutrition formula, constant, or dataset value (see
  `docs/research.md` for the verification pass and rationale for keeping
  each one as-is).
- Ingredient-level substitution / quantity-summed shopping lists
  (deferred, see ADR-0002).
- The client-only, no-backend architecture and its privacy guarantee.
