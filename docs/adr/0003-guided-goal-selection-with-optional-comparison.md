# ADR-0003: Guided Goal Selection with Optional Comparison

- Status: Accepted for specification
- Date: 2026-07-30
- Decision owner: Hossein Karimi
- Applies to: onboarding and goal switching

## Context

Mizaneh currently has one implicit goal: weight loss. The extension adds three distinct goals without replacing the familiar product or redesigning the application shell:

- `weight_loss` — کاهش وزن
- `muscle_gain` — افزایش حجم عضله
- `healthy_weight_gain` — افزایش وزن

The disposable prototype compared three approaches:

1. an extended compact selector;
2. comparison cards;
3. guided selection using one or two questions.

A compact selector preserves speed but does not sufficiently explain the difference between muscle gain and healthy weight gain. Comparison cards provide the clearest domain separation but take too much space as the mandatory first step on mobile. Guided selection reduces category errors but must not remove manual choice.

## Decision

Use a synthesized direction:

1. `guided` is the default first-use flow;
2. `cards` is available through “مقایسهٔ کامل هدف‌ها”;
3. a compact direct three-goal selector is available to returning users and in goal-switching flows;
4. any recommendation is labelled “پیشنهاد میزانه”, is explainable, and is manually overridable;
5. safety exclusions are not overridable;
6. cardiometabolic information is a separate optional progressive-disclosure section and never silently changes the selected goal;
7. the current visual system, cards, spacing, colours, navigation, RTL layout, and interaction model remain the visual foundation.

## Guided recommendation rules

The guided flow asks at most two focused questions:

1. “تغییر اصلی مدنظر چیست؟” — decrease weight or increase weight/tissue;
2. when increase is selected: “آیا تمرین مقاومتی منظم دارید یا همراه برنامه شروع می‌کنید؟”

Recommendation mapping:

- decrease weight → `weight_loss`;
- increase + resistance training → `muscle_gain`;
- increase + no resistance training → `healthy_weight_gain`.

The explanation must state that muscle hypertrophy requires resistance training and that neither all gained weight nor all scale change represents muscle or fat.

## Consequences

### Positive

- preserves the familiar onboarding shell;
- reduces confusion between the two gain goals;
- works with progressive disclosure on small screens;
- supports transparent manual override;
- creates a reusable optional comparison surface for SEO and education.

### Costs

- adds one decision step for first-time users;
- requires persisted onboarding state and accessible recommendation announcements;
- requires tests for recommendation logic and manual override.

## Rejected alternatives

- Extended selector alone: insufficient explanation of the goal distinction.
- Comparison cards as the only default: excessive mandatory content and mobile height.
- Automatic goal assignment: removes user agency and overstates the recommendation logic.
- Mixing blood pressure, glucose, or lipids into goal selection: these are safety/context fields, not goals.
