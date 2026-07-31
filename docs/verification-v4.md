# Verification report — cardiometabolic supportive planning v4

Date: 2026-07-31

## Completed checks

- `git diff --check`: passed.
- Strict production TypeScript compile using local declaration stubs: passed.
- Strict production + test TypeScript compile using local declaration stubs: passed.
- Core library emit and runtime smoke test: passed.
- Deep safety/plan smoke test: passed.
- `MANIFEST.sha256` verification: passed.
- Static WCAG token contrast calculations: passed for revised normal/small text tokens.

## Runtime smoke cases

| Case | Expected result | Result |
|---|---|---|
| BP 185/100, no warning symptoms | plan allowed with strong review warning | passed |
| BP warning symptoms at 135/85 | hard stop / urgent route | passed |
| A1C 7.3%, diabetes history | plan allowed with adapted pattern | passed |
| glucose 50 mg/dL | hard stop / urgent route | passed |
| triglycerides 650 mg/dL | plan allowed with professional-review warning | passed |
| triglycerides 1000 mg/dL | hard stop / high-priority route | passed |

The clinical-profile smoke test generated a seven-day plan and recalculated calories, protein, carbohydrate, fat, fibre, saturated fat, sodium, added sugar and potassium. All 48 preserved catalogue meals expose these supported nutrient fields with `estimated` provenance.

## Not completed in this environment

`npm ci` failed because the internal package registry returned HTTP 404 for `zod-validation-error@4.0.2`; the available Node version was also 22.16.0 while the repository requires at least 22.22.0 and jsdom requires 22.22.2 or newer. Therefore the following are not claimed as passed here:

- Vitest runner;
- ESLint runner;
- Next production build;
- browser accessibility automation;
- visual regression;
- dependency audit.

Run these in GitHub Codespaces/CI with Node 22.22.2 or newer:

```bash
npm ci
npm run lint
npm run test
npm run build
npm audit --omit=dev
```
