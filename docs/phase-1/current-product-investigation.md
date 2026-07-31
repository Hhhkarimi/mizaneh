# Current Product Investigation

Prepared: 2026-07-30  
Scope: uploaded `mizaneh-main.zip` and the deployed site at `https://mizaneh.vercel.app/`.

## 1. Product summary

Mizaneh is a Persian, RTL-first, client-side weekly nutrition planner for generally healthy adults seeking weight loss. The current public flow is one page and one goal. It estimates daily energy, creates a deterministic seven-day plan from a static meal catalogue, offers meal-level substitutions, produces a grouped shopping list, and optionally stores one session in `localStorage`.

The deployed experience and source code match: the site describes a four-step calculator, a weight-loss target, a weekly plan, scientific explanation cards, FAQ, and a privacy statement that calculations remain in the browser unless the user explicitly saves locally.

## 2. Technology and routes

- Framework: Next.js 16 App Router, React 19, TypeScript.
- Main public route: `/`.
- Generated public resources: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/sw.js`.
- No backend, account system, database, or API route was found.
- Client calculations are concentrated in `lib/nutrition`, `lib/plan`, and `lib/food`.
- State management is local React state; no external state library.
- Production deployment is configured for Vercel.

## 3. Existing onboarding and goal behavior

The four steps are:

1. body and activity: age, height, weight, sex, activity;
2. target and meals: target weight, requested pace, meal count, cooking time;
3. style and preferences: diet style and a five-item allergy list;
4. lifestyle rhythm: meal preparation, day pattern, hunger peak, breakfast taste, sleep, water, dislikes.

There is no explicit `goal` field in `PlannerForm`. Weight loss is embedded in validation and calculation rules:

- target weight must be lower than current weight;
- current and target BMI must not be below 18.5;
- pace is restricted to 0.25, 0.5, or 0.75 kg/week;
- all output language assumes a calorie deficit and projected weight loss.

## 4. Current calculation behavior

The current formula module computes:

- Mifflin–St Jeor resting energy estimate;
- TDEE from four fixed activity multipliers;
- requested deficit from `pace × 7700 / 7`;
- deficit capped at 20% of TDEE;
- a sex-specific 1200/1500 kcal floor;
- protein from target weight plus a calorie-percentage clamp;
- fixed 30% fat, or 34% for the Mediterranean style;
- carbohydrate as remaining energy with an 80 g floor;
- fibre as at least 25 g and otherwise 14 g/1000 kcal;
- fixed total-water references of 2.0 L for women and 2.5 L for men;
- a linear estimated timeline from the static 7700 kcal/kg rule.

These rules are versionless. The source code does not record source ID, review date, applicable population, or formula version in generated plans.

## 5. Meal generation and food data

- `lib/food/catalogue.ts` contains about 50 fixed meal templates.
- A meal records calories, protein, fibre, free-text ingredients, allergens, styles, preparation time, and a serving description.
- Carbohydrate, fat, micronutrients, ingredient quantities, food-data source, raw/cooked state, yield, and confidence are absent.
- The planner allocates calorie shares to meal slots, selects compatible templates deterministically, and changes a human-readable portion cue rather than recalculating structured ingredient quantities.
- Meal selection can relax diet-style, cooking-time, and breakfast-taste constraints when candidates are scarce. It does not relax the five recorded allergen tags.

## 6. Current editing capability

Implemented:

- regenerate the whole arrangement;
- switch among four arrangement biases;
- replace one complete meal with one of three ranked same-slot alternatives;
- save and restore one locally stored session;
- download a text plan;
- print;
- copy the shopping list.

Not implemented:

- food-level or portion editing;
- adding/removing/moving foods;
- reordering/renaming/timing/duplicating meals;
- duplicating/copying days;
- meal/day locking;
- favourites and hidden foods as durable preferences;
- custom foods or recipes;
- undo/redo;
- meal/day/plan reset hierarchy;
- plan versions or comparison;
- nutrient recalculation after arbitrary edits;
- goal compatibility checks after edits.

## 7. Replacement behavior

Replacement ranking is primarily driven by calorie distance, plan-mode preferences, preparation preferences, repetition, and a deterministic seed. It does not compare carbohydrate, fat, micronutrients, serving-size equivalence, cost, availability, verified cultural fit, or structured meal role beyond the slot.

The replacement remains allergy-safe only for the five hardcoded tags. It is not sufficient for a product promise covering serious allergies or cross-contact risk.

## 8. Progress tracking

The current result renders a four-point linear projection and static advice. It does not store measurements, calculate a rolling trend, record adherence/appetite/energy/digestive tolerance, or propose auditable adjustments.

## 9. Persistence and migration risk

`localStorage` key: `mizaneh:session:v1`.

The stored object contains one form, one plan mode, one variation seed, and substitutions. There is no plan ID, goal, calculation version, evidence version, plan history, or migration pipeline. An incompatible version is removed rather than migrated.

The future implementation must preserve and migrate valid v1 sessions into a versioned weight-loss plan. It must not overwrite the v1 key until migration has succeeded and the user has confirmed any goal-changing action.

## 10. Privacy and security

Positive findings:

- no analytics, advertising tracker, account, or health-data backend;
- health inputs are not placed in URLs;
- storage is opt-in;
- security headers include HSTS, frame denial, MIME sniffing protection, referrer policy, permissions policy, and COOP;
- same-origin service-worker fetches only.

Gaps relevant to the requested expansion:

- stored sessions receive only shallow shape checks before being used;
- no schema validation or migration quarantine;
- no size limits for future custom foods/recipes;
- no export sanitisation for future CSV/XLSX fields;
- no plan-version recovery model;
- no threat model for custom user content;
- no Content-Security-Policy header in the current config.

## 11. Accessibility, RTL, responsive behavior

Positive findings:

- `lang="fa-IR"` and `dir="rtl"` are set at the document root;
- semantic headings, labels, buttons, table markup, and reduced-motion CSS exist;
- tests cover keyboard navigation and several accessible names;
- the visual language is established and should be extended incrementally.

Known gaps:

- no complete WCAG AA contrast audit is documented;
- validation is mainly step-level rather than field-associated;
- future editing dialogs require focus-return, live recalculation announcements, and non-colour status labels;
- the weekly table will not scale to advanced mobile editing without progressive disclosure.

## 12. Typography and attribution

- Vazirmatn is present.
- Noto Nastaliq Urdu is also imported and used, conflicting with the requested “Vazirmatn only” constraint.
- The required visible attribution “کاری از حسین کریمی” linked to the supplied LinkedIn profile is not present in the current footer.

## 13. SEO and public content

The app has metadata, Open Graph data, JSON-LD, robots, and sitemap support. Existing structured data describes only the weight-loss flow. Public explanations for the three-goal distinction, editing, replacement calculation, safety exclusions, and full source registry are absent.

## 14. Existing tests

The repository contains tests for formulas, formatting, deterministic plan generation, allergy/style filtering, substitutions, shopping aggregation, storage, service-worker registration, step navigation, accessibility smoke checks, and text/print behavior.

The bundled historical report claims 109 passing tests. That report is useful evidence about a prior environment, but is not a substitute for rerunning the current archive.

## 15. Preservation map

### Preserve

- public `/` route and page anchors;
- existing four-step weight-loss onboarding as a familiar baseline;
- deterministic weekly generation;
- static catalogue until a verified food-data migration is ready;
- existing local-only privacy model;
- existing exports, save/restore flow, RTL layout, and visual components;
- all valid existing weight-loss sessions through migration.

### Correct after approval

- version and source all formulas;
- remove guaranteed-looking linear timeline language;
- add medical-scope exclusions before plan generation;
- replace shallow session casting with schema validation and migration;
- expand allergy and intolerance handling;
- remove the second font while retaining visual identity;
- restore creator attribution.

### Add after approval

- explicit goal domain and separate plan policies;
- muscle-gain and healthy-weight-gain onboarding and monitoring;
- editable plan domain with commands, undo/redo, locks, custom food/recipe support, and versions;
- post-edit validation/recalculation;
- trend-based progress and auditable adjustments.

### Do not do

- rewrite the current product shell;
- replace all current components;
- silently change existing weight-loss targets;
- reuse one surplus/deficit policy under three labels;
- place private plan state in routes or query parameters.
