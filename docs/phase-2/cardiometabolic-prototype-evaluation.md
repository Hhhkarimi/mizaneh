# Cardiometabolic + Goal Selection Disposable Prototype

Prepared: 2026-07-30  
Route: `/__prototype/goals?variant=extended|cards|guided`  
Status: disposable, non-indexed, not connected to plan generation or persistence.

## What this prototype adds

- three goal-selection variants using the existing Mizaneh visual language;
- an optional cardiometabolic safety panel for blood pressure, glycaemia, and blood lipids;
- explicit measurement context and data-minimisation language;
- non-diagnostic safety outcomes: ordinary scope, professional review, or urgent/high-priority assessment;
- an honest data-coverage warning explaining that exact sodium, saturated-fat, added-sugar, and glycaemic recalculation cannot ship until the meal catalogue is enriched with sourced nutrient data.

## Variant trade-offs

### A — Extended selector

Best continuity and lowest mobile cost. It needs strong summary copy because muscle gain and healthy weight gain can appear too similar in a compact selector.

### B — Comparison cards

Best domain separation and clearest promises/limitations. It uses more vertical space and must remain inside the current onboarding card to avoid resembling a redesign.

### C — Guided selection

Best at preventing “muscle gain” selection without resistance training. It adds one decision step and the recommendation logic must remain transparent and manually overridable except for safety exclusions.

## Cardiometabolic panel decision

The health panel remains separate from the goal selector. Blood pressure, glucose, and lipids are not goals and must not silently change a user’s goal. They affect eligibility, warnings, and qualitative food-pattern constraints.

## Not implemented in the prototype

- diagnostic labels;
- cardiovascular-risk scoring;
- a universal LDL target;
- medication advice;
- exact sodium/saturated-fat/added-sugar totals;
- production persistence;
- production plan generation;
- medical emergency numbers.

## Selection gate

One goal-selector direction must be selected before the complete specification is finalised. The cardiometabolic panel is common to all three and does not require a separate visual-direction choice.

## Selected direction — 2026-07-30

The owner approved the synthesized direction:

- guided selection (`C`) as the default first-use flow;
- comparison cards (`B`) as optional expanded guidance;
- compact direct selection for returning users and goal switching;
- the cardiometabolic panel remains separate and progressively disclosed.

The normative decision is recorded in `docs/adr/0003-guided-goal-selection-with-optional-comparison.md` and carried into `docs/phase-3/product-specification.md`.
