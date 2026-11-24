# UI verification — 2026-11-24

Base: https://github.com/Hhhkarimi/mizaneh at `6ecfcbe6deb37c8bff3346e982f81013cd331e16`.

## Preserved

`lib/`, `hooks/`, all original `components/` and `app/globals.css` are unchanged. No form defaults, handlers, validation, clinical policy, food catalogue, calculations, generation or storage logic changed. DietPlanner changes are presentation-only: labeled/current step, result anchors, a day selector reusing `setActiveDay` and headline whitespace. The offline entry mounts the same original component.

## Passed

- Standalone production React bundle built with esbuild 0.25.12, fonts embedded; assembled with the delivered build script.
- Application TypeScript excluding test files (`work/tsconfig-app-ui.json`); ESLint on changed TSX/offline script; `git diff --check`.
- Real browser onboarding for all three goals with synthetic data: seven days and four detailed meals per selected day. Weight-loss age validation rejected 10 and progressed after correction. Tested age 35, height 172, weight 84, target 78.
- Muscle-gain form accepted current training, three sessions/week and acknowledgement; generated muscle-gain plan. Weight-gain appetite/digestion fields displayed, low appetite selected; generated weight-gain plan. Switching goals retained the prior muscle-gain version.
- Detailed meals retain title, serving amount, portion cue, preparation time, energy, protein, carbohydrate, fat, fiber, saturated fat, sodium, added sugar, potassium, calcium, iron, magnesium, phosphorus, zinc, folate, iodine, B12, D and choline.
- Day selection updated details. Portion 125% changed 2,100 to 2,210 kcal; Undo restored 2,100. Substitution picker displayed three alternatives and accepted a choice.
- Explicit local save and reload/restore succeeded. The restore prompt is now below the fixed header.
- Text export downloaded; all seven days, serving amounts and nutrients verified. Exported goal: healthy weight gain.
- Desktop 1366, tablet 768, phone 390/410 reviewed. Document width stayed within viewport; weekly table has intentional internal scrolling.
- Scoped read-only contrast scan of 248 rendered leaf controls/labels/values found zero below 4.5:1. This is not a full accessibility certification. Captured browser console had no errors/warnings.

## Limits

- Full upstream TypeScript has six existing TS2540 errors in `components/ServiceWorkerRegistration.test.tsx`, assigning readonly `process.env.NODE_ENV`. Same errors before UI edits; test files unchanged.
- Existing architecture check fails because base DietPlanner already has 1,861 lines against 1,800. No unrelated refactor performed.
- Vitest startup and `next build --webpack` failed with process-spawn EPERM. No full Next production-build or suite pass is claimed. The delivered standalone build was exercised in the browser.
- Not exhaustive: every conditional clinical branch, custom recipe field, print/browser combination, long-term progress scenario or migration combination. Original source remains intact.

The internal browser blocks file:// navigation by policy; direct file-opening was not tested there. Functional browser checks used the already-running localhost application with the same bundled client code.
