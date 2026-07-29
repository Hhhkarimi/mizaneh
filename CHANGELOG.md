# Changelog — Mizaneh production-readiness audit + fundamental upgrade

Cumulative changes against `BASE_COMMIT` `4a2d747d027ce3e85413a12488009d686e6187b1`
(the original, untouched repository), covering both work rounds. No
formula constant, meal-catalogue nutrition value, or existing validation
gate was changed in either round — verified with a golden-output
regression test in both rounds.

## Round 1 — production-readiness audit

### Architecture
- Split `app/DietPlanner.tsx` (2677 lines) into cohesive modules:
  `lib/types.ts`, `lib/nutrition/{format,formulas}.ts`,
  `lib/food/catalogue.ts`, `lib/plan/{build,shopping}.ts`, `lib/labels.ts`,
  `components/SafetyAdvisory.tsx`. `app/DietPlanner.tsx` reduced to
  state/navigation/rendering only.
- Added `.gitignore` (none existed before).

### New behavior
- One-time safety/privacy disclosure before step 1 (existing hard
  validation gates for age 18–80 / BMI ≥ 18.5 preserved unchanged).
- Meal-level substitution (single automatic swap in this round).
- Shopping-list grouping with a "grouped, not quantity-exact" disclosure.
- Accessibility: explicit `aria-label`s on the age/height/weight/
  target-weight inputs.

### Testing
- Added Vitest + Testing Library + jsdom (no test tooling existed
  before). 81 tests: formulas, formatting, plan generation/filtering/
  determinism, shopping aggregation, step navigation/validation,
  keyboard nav, safety advisory, privacy/no-persistence, print/export.

## Round 2 — fundamental upgrade

Four upgrades, chosen and scoped in `CONTEXT.md` §9 (a fifth option —
hand-authoring gram-level ingredient quantities for ~48 meal templates —
was explicitly considered and rejected as fabricated precision with no
nutrition-database backing).

### 1. Shopping list: meal-frequency count
`lib/plan/shopping.ts`'s `ShoppingGroup` gained `entries: {name, count}[]`
(alongside the existing `items: string[]`, unchanged for compatibility).
Each item now shows how many meals that week use it — a real, exactly
derivable number — instead of a bare alphabetical list. The disclosure
note was updated to describe this precisely.

### 2. Substitution picker (not a single automatic swap)
`lib/plan/build.ts` gained `getSubstituteOptions` (top-N ranked
alternatives, reusing the existing `candidateMeals`/`scoreMeal` logic
unchanged) and `applySubstitution` (applies a specific chosen option).
`substituteMeal` (round 1) is now implemented as "apply the first option
from `getSubstituteOptions`" — same behavior, one shared implementation.
New `components/SubstitutePicker.tsx` renders the choices as a dialog.

### 3. Opt-in, explicit local save/resume
New `lib/storage/session.ts` (versioned, defensively-wrapped
`localStorage` access) and three components:
- `SaveSessionControls.tsx` — explicit "ذخیره روی این دستگاه" / "پاک
  کردن داده‌های ذخیره‌شده" controls.
- `RestoreSessionPrompt.tsx` — reads (never applies) any saved session on
  mount, and only restores it if the user explicitly clicks "بله،
  بازیابی کن"; "نه، پاک کن" discards it.
- `components/SafetyAdvisory.tsx`'s copy was updated in the same change,
  from an unconditional "nothing is stored" to an accurate "nothing is
  stored unless you choose to save it, and only on this device" — the
  old wording would have become false once this feature shipped.

### 4. PWA / offline support
New `public/sw.js` (network-first with cache fallback — chosen over
precaching every hashed build asset so a fresh deploy is never masked by
a stale cached bundle while online) and
`components/ServiceWorkerRegistration.tsx` (browser-only, production-only
registration, silently no-ops on any failure).

### Testing (round 2 additions)
28 further tests: `getSubstituteOptions`/`applySubstitution` behavior and
parity with round 1's `substituteMeal`, shopping-list frequency-count
correctness, session save/load/clear/version-mismatch-discard, the
substitution picker and save/restore UI flows (including "never a silent
restore" and "zero storage writes without an explicit save click"), and
service-worker file validity + registration guards. Total: **109 tests**.

### Regression handling
The golden-output fixture from round 1 recorded round-1's
`buildShoppingGroups` shape, which round 2 intentionally changed (added
counts). The regression test was split rather than weakened: metrics and
meal-selection output are still asserted byte-identical against the
original pre-refactor implementation; shopping-list *content* (which
ingredients appear per category — driven by the unchanged meal-selection
logic) is checked separately against the same fixture, while shape
equality against the old, now-superseded fixture was dropped for that
one field only.

## Fixes found during review (either round)
- A generated `coverage/` directory was briefly linted; excluded via
  `eslint.config.mjs` and `.gitignore` (round 1).
- The substitute button's mobile grid placement wasn't accounted for at
  the 680–920px range; fixed by moving the 2-column collapse to 920px
  (round 1).
- `react-hooks/set-state-in-effect` fired on `RestoreSessionPrompt`'s
  one-time `localStorage` read; justified and suppressed with a comment,
  since this is a one-time external-system read that cannot happen during
  server render (round 2).
- `SaveSessionControls` briefly hid the clear button for 3 seconds after
  saving; fixed so both can show at once (round 2).

## Explicitly not changed (either round)
- Any nutrition formula, constant, or dataset value.
- The existing hard validation gates (age 18–80, BMI ≥ 18.5).
- Ingredient-level gram quantities / true quantity-summed shopping lists
  (deferred in round 1's ADR-0002, explicitly re-considered and rejected
  again in round 2 — see `CONTEXT.md` §9.1).
- The client-only, no-backend architecture and its privacy guarantee
  (strengthened in wording, not weakened, by round 2's opt-in storage).
