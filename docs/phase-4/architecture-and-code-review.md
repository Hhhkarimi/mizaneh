# Architecture and Final Code Review

## 1. Existing-product preservation

**Result: pass in source review; runtime regression suite not fully executable in this environment.**

- The `/` route, current shell and main onboarding/result page remain.
- Existing plan modes, catalogue, shopping list, substitutions, print/text export and service worker remain.
- Legacy sessions are readable and migrated explicitly.
- Weight loss remains available and separate from both gain modes.
- No unrelated navigation model or visual-system replacement was introduced.
- Deleted production files are limited to the explicitly disposable `app/__prototype` route.

## 2. Scientific validity

**Result: pass with documented limited-certainty product decisions.**

- New formula outputs carry policy/equation IDs, versions, evidence registry version, review date and uncertainty.
- EER equations are separated from goal policy adjustments.
- Muscle gain explicitly depends on resistance training and does not promise pure muscle gain.
- Healthy weight gain is not an alias for muscle gain and prioritizes appetite/tolerance.
- Weight loss does not react to one weight measurement.
- Safety rules block ordinary planning for excluded populations.
- Cardiometabolic inputs do not diagnose, assign treatment targets or change medication.
- Chest, severe breathing, neurological, confusion or fainting warning symptoms escalate independently of the reported pressure number.
- New weight-loss plans are blocked when the calculated target enters NICE specialist low-energy scope.
- Incomplete food nutrient data remains visibly incomplete.

Review note: `Metrics.bmr` initially received the maintenance estimate during implementation. This was corrected to a resting-energy estimate; maintenance/target values continue to use the versioned NASEM EER path.

## 3. Specification compliance

**Result: substantial pass.**

Implemented:

- all three goals and goal-specific policies;
- approved C+B UX and direct returning-user selection;
- non-overwriting goal switch and plan version preservation;
- safety exclusions and cardiometabolic context;
- plan editing, custom foods/recipes, recalculation, undo/redo and locks;
- classified replacements and reasons;
- robust trends and optional adjustment decisions;
- migration, privacy, security, RTL, typography and attribution requirements.

Partially limited by current data:

- supported micronutrients, sodium and saturated-fat recalculation only operate when verified fields exist;
- cost ranking is not shown because reliable regional cost data is absent;
- allergy cross-contact cannot be proven for user-entered foods, so it is marked unverified.

## 4. Engineering quality

**Result: pass in static review with verification caveat.**

### Architecture

Goal-independent logic is extracted into calculation, safety, plan-editing, trend and storage services. Presentation consumes domain results rather than duplicating formulas. Legacy calculation behavior remains isolated.

### State integrity

- edits are immutable and recalculate derived day/plan totals;
- goal switch creates a new plan;
- applying an adjustment snapshots the prior active plan;
- workspace restore validates and normalizes data;
- IDs are stabilized for editing/version comparison.

### Security review

- no `eval`, `document.write` or user-controlled `dangerouslySetInnerHTML` exists;
- JSON-LD is the only `dangerouslySetInnerHTML` use and serializes static application metadata;
- no health data is read from or written to query parameters;
- secret-pattern scan found no likely key material;
- local data has byte, count and field bounds;
- security headers are configured for all routes.

### Accessibility review

- keyboard-operable native controls;
- semantic grouping/labels;
- live status messaging;
- focus styles preserved;
- no colour-only safety messages;
- mobile editor remains progressively disclosed.

### Blocking findings

No unresolved source-level blocking finding was identified in the final review. The release gate remains open because dependency-backed lint/test/build/accessibility/security automation could not be completed in the current environment.
