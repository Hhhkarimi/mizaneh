# Code Review — Mizaneh audit/refactor (vs. BASE_COMMIT)

Reviewed the full diff since `BASE_COMMIT` (`4a2d747d027ce3e85413a12488009d686e6187b1`)
along two axes, per the `code-review` skill.

## Axis 1 — Standards (does the code follow this repo's own conventions?)

- **Module boundaries**: matches `docs/architecture-assessment.md`'s
  planned map exactly — `lib/nutrition`, `lib/food`, `lib/plan`,
  `components/`, with `app/DietPlanner.tsx` reduced to state + rendering.
- **TypeScript**: `tsc --noEmit` is clean; no `any`, no suppressed errors.
- **Lint**: `eslint .` clean. One finding during review — a generated
  `coverage/` directory was briefly picked up by lint after a local
  coverage run; fixed by adding it to `eslint.config.mjs`'s
  `globalIgnores` and to `.gitignore` (repo had no `.gitignore` at all
  before this audit — added one).
- **Naming/style**: consistent with the original file's conventions
  (camelCase functions, PascalCase components/types, Persian UI strings
  kept verbatim).
- **No dead code / no leftover debug statements**: verified via a repo-wide
  grep for `console.`, `debugger`, `TODO`, `FIXME` — none found in source
  (test files excluded from that check, none present there either).
- **Responsive layout finding (fixed during review)**: the new
  "جایگزین کن" (substitute) button, added as a 4th grid column in
  `.meal-detail-list article`, wasn't accounted for in the existing
  680px mobile breakpoint's 2-column collapse, and the 920px breakpoint
  didn't collapse the card's internal grid at all. Fixed: the 2-column
  collapse now happens at 920px (covering more phone/tablet widths), and
  the button is explicitly placed in the content column at both
  breakpoints, verified visually not possible in this environment but
  logically consistent with the existing `dl` placement pattern already
  used for the macros block.

## Axis 2 — Spec (does the result match `.scratch/mizaneh-audit/spec.md`?)

Checked against all 22 user stories:

| # | Story | Status |
|---|---|---|
| 1 | One-time non-medical-advice note | ✅ `SafetyAdvisory`, tested |
| 2 | Clear validation messages | ✅ preserved existing gates, tested |
| 3 | Non-blocking advisory for out-of-range | ⚠️ see note below |
| 4 | Formulas unchanged | ✅ golden-output regression test |
| 5 | Allergy exclusion | ✅ tested |
| 6 | Dislike exclusion | ✅ tested |
| 7 | Diet-style macros/meals | ✅ tested |
| 8 | Regenerate variety | ✅ (pre-existing, preserved + tested) |
| 9 | Same seed ⇒ same plan | ✅ tested |
| 10 | Meal substitution | ✅ `substituteMeal`, tested |
| 11 | Shopping list grouped + labeled as such | ✅ `shoppingListNote`, tested |
| 12 | Keyboard navigation | ✅ smoke-tested |
| 13 | Screen-reader labels | ✅ `aria-label`s added + tested |
| 14 | Mobile RTL usability | ✅ (see responsive fix above) |
| 15 | Reduced motion | ✅ pre-existing, confirmed present |
| 16 | Print/text export | ✅ tested |
| 17 | No network/persistence | ✅ tested |
| 18 | Metadata/SEO preserved | ✅ unchanged, build output verified |
| 19 | Single source of truth for formulas | ✅ `lib/nutrition/formulas.ts` |
| 20 | Food catalogue separated from UI | ✅ `lib/food/catalogue.ts` |
| 21 | Deterministic ranking extracted & tested | ✅ `lib/plan/build.ts` |
| 22 | CI-runnable test suite | ✅ `npm run test`, 81 tests |

**Note on story 3**: ADR-0001 was corrected mid-implementation once
`getValidationMessage` was read in full — the app already hard-blocks
(not merely advises) age outside 18–80 and BMI under 18.5. That existing
gate was preserved unchanged rather than loosened to a soft advisory,
because "preserve existing useful functionality" outranks a prototype
decision made before the full validation logic had been read. The new
`SafetyAdvisory` fills the actual gap that existed (no disclaimer text of
any kind), rather than duplicating a gate that already worked.

## Blocking findings

None. The two issues found during this review (lint ignoring
`coverage/`, and the mobile-breakpoint gap for the substitute button)
were fixed in-place before this report was written, and the full
validation sequence was re-run afterward.

## Non-blocking follow-ups (logged, not blocking this package)

- Ingredient-level substitution / quantity-summed shopping list
  (ADR-0002 follow-up).
- Full WCAG AA contrast audit.
- Per-field `aria-describedby` wiring (currently one shared alert region
  per step, which is accessible but coarser-grained than per-field).
