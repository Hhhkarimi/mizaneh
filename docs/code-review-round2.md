# Code Review — Round 2 (fundamental upgrade)

Reviewed against `.scratch/mizaneh-audit/spec-round2.md` and the round 1
review's Standards axis (still applies unchanged).

## Standards

- `tsc --noEmit`, `eslint .`, `npm run test` (109/109), and `npm run
  build` all clean from a full pass.
- One real lint finding, fixed in place: `react-hooks/set-state-in-effect`
  fired on `RestoreSessionPrompt`'s one-time `localStorage` read in a
  `useEffect`. This is a justified exception (reading an external,
  non-subscribable system after mount, which cannot happen during
  Next.js's server render) — suppressed with a comment explaining why,
  not silently.
- One real UX bug found and fixed during review: `SaveSessionControls`
  hid the "پاک کردن داده‌های ذخیره‌شده" button for the 3 seconds after
  saving (while the "ذخیره شد" confirmation was showing), making undo
  briefly impossible. Fixed so both can show at once.

## Spec conformance (round 2, stories 23–29)

| # | Story | Status |
|---|---|---|
| 23 | Shopping list shows meal-frequency count | ✅ `entries: {name, count}[]`, tested |
| 24 | Substitution picker (ranked alternatives) | ✅ `getSubstituteOptions` + `SubstitutePicker`, tested |
| 25 | Opt-in save on this device | ✅ explicit click only, tested (asserts zero writes without it) |
| 26 | Explicit restore-or-discard prompt | ✅ never auto-restores, tested |
| 27 | Privacy statement stays accurate | ✅ `SafetyAdvisory` copy updated |
| 28 | Full clear control | ✅ tested |
| 29 | Installable / offline | ✅ `public/sw.js` + guarded registration; SW file-validity + registration-guard tests. Full real-browser offline behavior is out of scope for this test environment (documented in the spec) |

## Regression safety

- `substituteMeal` (round 1) is now implemented in terms of
  `getSubstituteOptions` + first-option application; a dedicated test
  (`substituteMeal picks exactly the first option from
  getSubstituteOptions`) locks this equivalence down.
- The golden-output regression test was split rather than weakened: the
  metrics/plan-selection portion still asserts byte-identical output
  against the pre-refactor fixture; the shopping-list portion was
  intentionally separated because its shape changed on purpose (round 2
  frequency counts) — content (which ingredients appear per category) is
  still checked against the same fixture, so meal-selection logic
  driving the shopping list is still regression-protected.
- `SafetyAdvisory`'s privacy claim was updated in the same commit as the
  feature that would have made the old claim false (opt-in local save),
  per CONTEXT.md §9.3 — checked by re-reading the component's rendered
  text in `DietPlanner.test.tsx`.

## Blocking findings

None.

## Non-blocking follow-ups

- Real browser/service-worker offline testing (this environment can't
  drive an actual offline `fetch` failure against a live SW).
- PNG/maskable icon variants for a more complete install prompt (the
  manifest currently only has one SVG icon — pre-existing, not
  introduced or worsened this round).
- The round 1 follow-ups (ingredient-level gram quantities, WCAG AA
  contrast audit, per-field `aria-describedby`) are still open, unchanged
  by this round.
