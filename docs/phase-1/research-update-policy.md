# Research Update Policy

Prepared: 2026-07-30

## 1. Source hierarchy

Use sources in this order:

1. current clinical/professional guidelines and governmental consensus reports;
2. consensus and position statements from recognised professional bodies;
3. systematic reviews and meta-analyses;
4. randomized controlled trials;
5. high-quality prospective studies;
6. authoritative dietary-reference and food-composition systems.

Do not use blogs, influencer content, marketing pages, bodybuilding forums, or uncited assumptions as the basis for a numerical rule.

## 2. Registry requirements

Every numerical rule must have:

- stable rule ID and semantic version;
- exact formula and units;
- source citation and publication date;
- target population and exclusions;
- evidence type and certainty;
- known limitations;
- applicable goal(s);
- implementation owner;
- effective date;
- review-expiry date;
- migration notes and regression fixtures.

## 3. Review cadence

- Clinical safety/exclusion rules: review at least annually.
- Energy and macronutrient formulas: review every 18 months.
- Food-composition datasets and licences: review annually and at each dataset release.
- Supplement guidance: review annually or immediately after a major safety/regulatory update.
- SEO/public scientific explanations: refresh when a linked source or formula version changes.

A major new guideline, safety warning, dataset correction, or retraction triggers an out-of-cycle review.

## 4. Change control

A scientific rule change requires:

1. evidence-matrix update;
2. calculation-registry version increment;
3. before/after examples;
4. migration impact assessment;
5. regression tests for legacy and new behavior;
6. user-facing explanation when targets materially change;
7. approval before release.

Do not edit an existing rule in place. Add a new version and retain the old version long enough to explain and migrate stored plans.

## 5. Uncertainty policy

- Do not convert low-certainty evidence into precise user promises.
- Use ranges where evidence supports ranges.
- Distinguish guideline recommendation, external finding, product decision, assumption, and unresolved question.
- Display missing nutrient data rather than silently imputing it.
- Do not claim a plan is medically appropriate solely because it passed an app questionnaire.

## 6. Retractions and source failure

If a source is retracted, materially corrected, inaccessible, or superseded:

- mark dependent rules as `review-required`;
- stop generating new plans with the rule if safety could be affected;
- do not silently rewrite stored plans;
- notify users only when a stored plan may be materially affected;
- document the replacement source and migration path.
