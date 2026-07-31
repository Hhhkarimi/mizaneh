# Verification report — clinically supported planning v5

Date: 2026-07-31

## Scope verified

- direct three-goal selection remains unchanged;
- a stable diagnosis alone does not block plan generation;
- thirteen supported clinical contexts generate deterministic seven-day plans;
- acute red flags still block ordinary plan generation;
- clinician-entered sodium, potassium, phosphorus, fluid, protein, carbohydrate and food constraints flow into plan ranking and compatibility checks;
- pregnancy, breastfeeding, IDDSI texture, kidney/liver stage, cancer symptoms, surgery stage and GI subtype inputs are represented in the domain and UI;
- meal, day, week, custom-food and custom-recipe nutrition can carry supported macro- and micronutrients;
- unknown nutrient values remain unknown and are not silently converted to zero;
- source IDs resolve to visible metadata, dates, links and limitations;
- unchanged inputs and seed produce identical meal IDs and totals.

## Commands completed successfully

```bash
tsc -p /tmp/tsconfig-mizv5-core.json
tsc -p /tmp/tsconfig-mizv5-app.json
tsc -p /tmp/tsconfig-mizv5-all.json
tsc -p /tmp/tsconfig-mizv5-emit.json
node --loader /tmp/mizv5-loader.mjs /tmp/mizv5-smoke.mjs
sha256sum -c MANIFEST.sha256
unzip -t mizaneh-v5-clinical-source.zip
unzip -t mizaneh-v5-codespaces-kit.zip
```

## Runtime smoke matrix

Stable/supportive cases expected to generate a plan:

- pregnancy;
- breastfeeding;
- eating-disorder support without instability;
- serious allergy without active reaction;
- dysphagia with entered IDDSI levels and no airway signs;
- kidney disease without acute fluid-overload signs;
- liver disease without new confusion;
- diabetes without severe hypoglycaemia/crisis;
- cardiovascular disease;
- active cancer treatment without acute instability;
- recent major surgery with entered diet stage;
- malabsorption/GI condition without bleeding/obstruction/persistent vomiting;
- custom medical-nutrition-therapy constraints.

Blocking red flags expected to stop an ordinary plan:

- active anaphylaxis symptoms;
- glucose below the severe-hypoglycaemia threshold or crisis symptoms;
- coughing/choking/wet voice suggesting an unsafe swallow;
- active GI bleeding/obstruction/persistent vomiting;
- serious refeeding-risk or other acute instability signals.


## Observed smoke output

```json
{
  "status": "ok",
  "stableCases": [
    {
      "name": "pregnancy",
      "disposition": "professional_review_required",
      "calories": 2750,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "breastfeeding",
      "disposition": "professional_review_required",
      "calories": 2825,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "eating-disorder-support",
      "disposition": "professional_review_required",
      "calories": 2425,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "serious-allergy",
      "disposition": "professional_review_required",
      "calories": 2050,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "dysphagia",
      "disposition": "professional_review_required",
      "calories": 2050,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "kidney",
      "disposition": "professional_review_required",
      "calories": 2050,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "liver",
      "disposition": "professional_review_required",
      "calories": 2050,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "diabetes",
      "disposition": "professional_review_required",
      "calories": 2050,
      "focuses": 2,
      "days": 7
    },
    {
      "name": "cardiovascular",
      "disposition": "professional_review_required",
      "calories": 2050,
      "focuses": 2,
      "days": 7
    },
    {
      "name": "cancer",
      "disposition": "professional_review_required",
      "calories": 2350,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "surgery",
      "disposition": "professional_review_required",
      "calories": 2050,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "malabsorption",
      "disposition": "professional_review_required",
      "calories": 2425,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "custom-mnt",
      "disposition": "professional_review_required",
      "calories": 2050,
      "focuses": 1,
      "days": 7
    },
    {
      "name": "editor-base",
      "disposition": "ordinary_scope",
      "calories": 2050,
      "focuses": 0,
      "days": 7
    }
  ],
  "urgentBlocked": 5,
  "customMicronutrients": "ok"
}
```

## Observed dependency-install failure

```text
Node in artifact environment: 22.16.0
Project requirement: >=22.22.0
jsdom requirement: ^22.22.2 or newer supported range
npm ci: exit 1
Registry response: HTTP 404 for zod-validation-error@4.0.2
```

## Dependency-runner limitation

A real `npm ci` attempt in the execution environment was blocked by the configured package registry failing to provide a transitive package. Therefore the following are release gates for GitHub Codespaces/CI and are **not claimed as passed here**:

```bash
npm ci
npm run lint
npm run test
npm run build
npm audit --omit=dev
```

Use Node.js 22.22.2 or newer.

## Clinical limitation

Passing software tests does not validate therapeutic effectiveness. Before presenting the product as medical nutrition therapy, conduct review by qualified dietitians and clinicians, dataset validation against a versioned food-composition source, and prospective usability/safety testing with representative users.
