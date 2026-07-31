# ADR-0005: Clinically supported plan generation with acute-red-flag stops

- Status: Accepted
- Date: 2026-07-31
- Review date: 2026-10-30

## Context

The earlier product treated several diagnoses as blanket exclusions. The approved direction is to generate a useful, strongly warned, condition-aware meal plan for stable or clinician-managed states while avoiding the unsafe claim that a client-only application can deliver autonomous medical nutrition therapy.

## Decision

1. A diagnosis alone is non-blocking.
2. Acute or medically unstable red flags remain blocking for ordinary plan generation.
3. Each supported condition exposes progressive-disclosure inputs needed for safe personalisation.
4. Condition-specific restrictions are applied only when supported by a guideline-level general rule or an entered current clinical constraint.
5. The program must not infer potassium, phosphorus, fluid, insulin, IDDSI texture, surgical diet stage, supplement dose or other treatment parameters from a diagnosis alone.
6. Every generated condition-aware plan displays applied adaptations, foods prioritised, foods requiring caution, missing inputs, supportive targets, source metadata and a clinician-review warning.
7. Meal generation remains deterministic for identical inputs and seed.
8. Existing display preferences, typography and navigation model are preserved.

## Consequences

- More users receive a supportive plan rather than an unexplained rejection.
- The interface requires additional structured health inputs.
- Some outputs remain deliberately incomplete until clinician data are supplied.
- Acute red flags still prevent an ordinary plan to avoid delaying urgent assessment.
- Therapeutic effectiveness is not claimed without clinical validation.

## Rejected alternatives

### Blanket exclusion for every diagnosis

Rejected because it provides little practical support and treats stable, managed and acute states as equivalent.

### Fully autonomous disease-treatment diet

Rejected because stage, laboratory values, medication, swallowing assessment, surgical progression and treatment context cannot be reliably inferred by the application.

### Guessing missing restrictions conservatively

Rejected because an apparently conservative restriction can itself cause harm, such as unnecessary potassium/protein restriction, inadequate energy in pregnancy or inappropriate thickened liquids.
