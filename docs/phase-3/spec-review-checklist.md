# Specification Review Checklist

Status: approved by the product owner on 2026-07-31; implementation started under phase 4.

## Product preservation

- [x] Existing weight loss remains the preserved product foundation.
- [x] No public route is removed.
- [x] Existing valid saved sessions are migrated without silent recalculation.
- [x] No major redesign is permitted.
- [x] Vazirmatn-only and creator attribution requirements are accepted.

## UX decision

- [x] Guided selection is the default first-use flow.
- [x] Comparison cards are optional.
- [x] Returning users have direct three-goal selection.
- [x] Manual override is allowed; safety exclusions are not.
- [x] Cardiometabolic context remains separate from goal selection.

## Scientific policies

- [x] NASEM 2023 EER is approved for new v2 plans.
- [x] Existing v1 calculations remain frozen for legacy plans.
- [x] Weight-loss starting rule is approved as a conservative product decision: `min(500, 15% EER)` deficit.
- [x] Muscle-gain starting rule is approved as a conservative product decision: `5% EER`, bounded 100–300 kcal/day.
- [x] Healthy-weight-gain starting rule is approved as a conservative product decision: `10% EER`, bounded 200–500 kcal/day.
- [x] No universal optimal deficit/surplus or guaranteed rate is claimed.
- [x] Protein policies and their clinical exclusions are accepted.
- [x] Exact sodium/saturated-fat/added-sugar claims wait for sourced data.

## Safety

- [x] Medical-scope exclusions are accepted.
- [x] NICE refeeding criteria are blocking.
- [x] BP >180/120 rules are accepted.
- [x] Glucose <70/<54 and medication coordination rules are accepted.
- [x] TG ≥500/≥1000 rules are accepted.
- [x] No universal LDL target or diagnosis is allowed.

## Editing and progress

- [x] Full editing command set is in scope.
- [x] Every edit recalculates and revalidates.
- [x] Plan versions and goal-switch preservation are required.
- [x] Trend needs at least 5 measurements over 14 days.
- [x] Adjustments are proposals, ≤100 kcal/day, no more often than every 14 days.

## Engineering and release

- [x] Architecture seams are accepted without speculative rewrite.
- [x] Local-only, opt-in persistence remains the privacy model.
- [x] Required test, build, accessibility, security, audit, and performance gates are accepted.
- [x] Implementation may start only after explicit approval.
