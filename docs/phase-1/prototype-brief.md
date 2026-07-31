# Disposable Prototype Brief — No Direction Selected

Prepared: 2026-07-30  
Status: prototype requirements ready; implementation deferred until the scientific package is reviewed.

All variants must reuse the current Mizaneh shell, spacing, cards, button styles, RTL interaction model, and mobile breakpoints. They must use Vazirmatn only, remain keyboard accessible, preserve visible focus, and communicate status without colour alone.

A temporary non-indexed route should be used, for example:

- `/__prototype/goals?variant=extended`
- `/__prototype/goals?variant=cards`
- `/__prototype/goals?variant=guided`

The route must not replace `/` or alter existing production anchors.

## Variant A — Extended goal selector

Add a compact goal control before the existing body/activity fields:

- کاهش وزن
- افزایش حجم عضله
- افزایش وزن

Each option uses the existing segmented/card control style and one short explanation. Selecting a goal reveals only the additional questions required for that goal.

Trade-offs:

- fastest and most familiar;
- smallest mobile footprint;
- differences between muscle gain and healthy weight gain may be missed;
- requires strong copy and summaries before plan generation.

## Variant B — Goal comparison cards

Reuse the current result/choice card style to show all three goals with:

- purpose;
- what the plan changes;
- what it cannot promise;
- key information the mode will ask for.

Trade-offs:

- clearest domain separation;
- best for informed manual choice;
- taller on mobile;
- risks feeling like a new landing-page section unless kept inside the current onboarding card.

## Variant C — Guided goal selection

Ask one or two focused questions, for example:

1. Is the primary intent to reduce, maintain/increase total weight, or support resistance-training hypertrophy?
2. Is regular resistance training currently being performed?

Then recommend a goal while keeping all three manual choices visible.

Trade-offs:

- helps prevent confusing muscle gain with general weight gain;
- creates a natural safety handoff;
- adds one step and requires careful wording to avoid appearing diagnostic;
- recommendation logic must be transparent and overridable unless a safety exclusion applies.

## Targeted meal-editing prototype

Use progressive disclosure inside the existing meal card/table:

- primary row: meal name, time, total energy, protein and status;
- one “ویرایش” button opens a drawer/dialog;
- common actions first: portion, replace, add/remove food;
- advanced actions under a disclosure: move, duplicate, rename, lock, custom food/recipe;
- persistent undo/redo controls near the plan toolbar;
- post-edit totals announced in an `aria-live` region.

## Replacement prototype

Extend the current substitution picker with reasoned categories:

- جایگزین نزدیک تغذیه‌ای
- جایگزین نسبتاً مشابه
- جایگزین براساس سلیقه
- از نظر تغذیه‌ای معادل نیست

Each option must state the principal reason and any compatibility warning. Calories alone cannot determine ranking.

## Recalculation feedback prototype

Reuse existing stat cards and notice styling. Show:

- meal and day totals;
- weekly average;
- goal range status;
- incomplete-data state;
- allergy/intolerance/diet-pattern conflicts;
- one or more suggestions without silently reverting the edit.

## Goal-switching prototype

Use a confirmation dialog that shows:

- current active goal and plan version;
- which profile fields carry over;
- which new fields are required;
- “preserve current plan and create a new version” as the default;
- no destructive replacement without explicit confirmation.

## Scientific explanation and safety prototype

Keep explanations contextual and collapsible. Safety exclusions are not dismissible disclaimers. A blocked user receives a calm referral panel and no partial targets.

## Selection criteria

The product owner should select a direction based on:

- comprehension of the difference between muscle gain and total weight gain;
- time to first valid input;
- mobile vertical cost;
- keyboard/screen-reader clarity;
- fit with current visual identity;
- ability to add safety screening without alarmist language.

No variant has been selected in this package.
