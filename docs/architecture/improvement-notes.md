# Architecture and release hardening

This change keeps the public behavior and scientific constants unchanged while reducing the central responsibilities of `app/DietPlanner.tsx`.

## New boundaries

- `hooks/usePlannerState.ts`: owns React state and the results ref.
- `lib/planner/safeBuildWeeklyPlan.ts`: converts plan-generation failures into a stable result shape.
- `lib/planner/createPlanDocument.ts`: creates immutable, versioned plan documents.
- `components/BrandMark.tsx`: removes presentational SVG markup from the workflow component.
- `lib/storage/retention.ts`: applies a 180-day retention window to opt-in local health data.

## Release controls

The GitHub Actions quality gate runs the locked install, lint, coverage tests, architecture checks, policy-review-date check, production build and a high-severity production dependency audit.

The current CSP still allows inline scripts/styles because Next.js compatibility must be verified before nonce-based enforcement. Tightening it without a nonce rollout can break hydration, so that migration remains a separate, browser-tested change.
