# ADR-0002: Substitution is meal-level; ingredient structuring is deferred

## Status
Accepted (autonomous decision).

## Context
The spec calls for "substitutions" and for a shopping list built by
"aggregation." The current data model stores `ingredients: string[]` as
free-text lines with no quantity or unit, so true ingredient-level
substitution or quantity-summing aggregation is not achievable without a
data model change (`{ name, qty, unit }[]`) across every meal template —
a genuinely large, separately-reviewable content migration.

## Decision
This pass implements:
- **Substitution** at the meal level: the user can swap a planned meal for
  another `MealTemplate` compatible with the same slot, the active
  allergy/dislike filters, and diet style, re-scaled to the same target
  calories using the existing `scale` logic.
- **Shopping-list aggregation** at the string level: matching/near-duplicate
  ingredient lines across the week's meals are grouped and de-duplicated,
  but not quantity-summed, and the shopping list explicitly does not claim
  to give exact purchase quantities.

## Consequences
- Positive: ships real, testable substitution and list-grouping behavior
  without a multi-day content migration blocking the rest of this audit.
- Negative: shopping-list items remain qualitative ("chicken breast, x2
  meals this week") rather than quantitative ("420 g chicken breast").
- Follow-up (not in this pass): restructure `ingredients` to
  `{ name, qty, unit }[]` in the food catalogue, then upgrade the shopping
  list to real quantity summation and enable ingredient-level substitution.
  This is a natural next ADR once someone owns re-authoring the ~40 meal
  templates' ingredient data.
