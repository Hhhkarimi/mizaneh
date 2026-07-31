# Safety-screen UX review and corrective design

Date: 2026-07-31

## User-reported problems

1. Native checkboxes became unusually large on laptop browsers.
2. Enabling blood pressure, glucose or lipid data caused oversized and visually unbalanced cards.
3. The product displayed a technical screening sentence but did not clearly answer:
   - Why was the plan stopped?
   - Which answer caused the stop?
   - What should the user do next?
4. The primary button continued to say “build plan” even when the safety policy would block generation.
5. The health section mixed optional disclosure, data entry and urgent guidance without a clear hierarchy.

## Root causes

- `.health-context-card input` applied `min-height: 46px` to every input type, including checkboxes.
- A checkbox inside a `legend` was being used both as a disclosure control and as a data value.
- `screenSafety` returned an array of prose strings. The UI rendered those strings without a headline, category, severity or action.
- Blocked submission copied only the first reason into the generic form-error line.
- Three-column field grids remained dense at common laptop widths.

## Corrective interaction model

### 1. Decision first

The screen now presents one explicit outcome:

- قابل برنامه‌ریزی
- پشتیبانی عمومی
- فعلاً متوقف
- اولویت بالا

The result includes a headline and a short description before any detailed issue.

### 2. Reason → explanation → next step

Every safety issue has:

- category
- severity
- plain-language title
- explanation of why the answer matters
- concrete next action

The UI does not rely on color alone. Text labels and symbols remain visible.

### 3. Health cards use disclosure buttons

Blood pressure, glycaemia and lipids are optional sections. Their headers are buttons with `aria-expanded` and `aria-pressed`; they are no longer oversized native checkboxes.

### 4. Compact native checkboxes

Actual boolean questions remain native checkboxes, fixed to 18×18px with visible focus and a large clickable label area.

### 5. Honest blocked action

When screening blocks ordinary planning, the final button says “دیدن دلیل توقف برنامه”. Submitting scrolls to and focuses the decision panel rather than pretending generation will proceed.

## Scientific communication principles

- One blood-pressure reading is not described as a diagnosis.
- A reading above 180/120 is explained as requiring repeat measurement and timely professional contact when no warning symptoms are reported.
- Warning symptoms are presented as needing urgent medical assessment.
- Low glucose and severe hypoglycaemia are explained as safety events, not as a new diagnosis.
- Refeeding-risk explanations identify the specific criterion entered by the user.
- LDL targets are not generalized to every user.

## Primary sources used for the communication rules

- American Heart Association, severe hypertension and hypertensive emergency guidance, reviewed 2025:
  https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/when-to-call-911-for-high-blood-pressure
- NICE CG32, malnutrition and refeeding-risk criteria:
  https://www.nice.org.uk/guidance/CG32/chapter/recommendations
- ADA Standards of Care, hypoglycaemia classifications (source already recorded in the project evidence registry).

## Files changed

- `components/safety-screen/SafetyScreenFields.tsx`
- `lib/safety/screen.ts`
- `lib/types.ts`
- `app/DietPlanner.tsx`
- `app/globals.css`
- `components/safety-screen/SafetyScreenFields.test.tsx`
- `lib/safety/screen.test.ts`

## Verification status

- TypeScript syntax transpilation: passed.
- Strict typecheck for the safety domain and component with local React type stubs: passed.
- Runtime smoke test for ordinary, pregnancy, severe blood pressure and severe low glucose paths: passed.
- `npm ci`: not completed in the execution environment because the internal registry did not provide `zod-validation-error@4.0.2`; full Vitest, ESLint and Next build remain release gates in Codespaces/CI.
