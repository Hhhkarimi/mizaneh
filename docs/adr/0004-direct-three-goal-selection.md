# ADR 0004: Direct three-goal selection replaces guided recommendation

- Status: Accepted
- Date: 2026-07-31
- Supersedes: ADR 0003 for the production onboarding flow

## Context

Usability review found that the two-question recommendation flow made the first interaction feel indirect and could imply that the product, rather than the user, had decided the goal. The three goal modes are already scientifically and functionally distinct and can be explained in compact cards.

## Decision

The production onboarding presents all three goals immediately:

1. weight loss;
2. muscle gain;
3. healthy weight gain.

The user selects a goal directly using an accessible radio-card group. Each card includes who the mode is for, its main scientific distinction and an explicit limitation. No goal is recommended automatically.

The stored `guided` source value and the legacy `recommendGoal` helper may remain temporarily for backward-compatible restoration of old sessions, but they are not used by the production onboarding.

## Consequences

- fewer onboarding steps;
- user agency is explicit;
- muscle gain remains clearly tied to resistance training;
- healthy weight gain is not presented as muscle gain;
- regression tests must assert that all three radio options are visible on first render;
- existing saved sessions remain readable.
