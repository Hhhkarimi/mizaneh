# ADR-0001: Add a one-time safety/privacy disclosure; preserve existing validation gates as-is

## Status
Accepted (autonomous decision, recorded per workflow instruction to
document assumptions rather than pause for approval). Superseded an
earlier draft of this ADR that assumed no validation gate existed —
corrected after reading `getValidationMessage` in full.

## Context
Mizaneh is a self-service, no-account, client-only calorie/meal-plan
calculator. It has no clinician in the loop and no way to verify any
claimed condition. On inspection, `getValidationMessage` already
hard-blocks step progression for: age outside 18–80, height outside
130–220 cm, weight outside 40–250 kg, and any BMI (current or target)
under 18.5 — a real, working guardrail. What is missing is any
general-purpose statement that Mizaneh is an estimate and not medical
advice or treatment: no disclaimer text of any kind exists anywhere in
the component tree.

## Decision
- **Preserve the existing hard gates exactly as they are.** They are
  working, tested safety behavior and "preserve existing useful
  functionality" is a stated priority; this audit does not loosen, widen,
  or remove them.
- **Add a new, additive safety/privacy disclosure**: a single, visible,
  dismissible notice (the `SafetyAdvisory` component selected in the
  prototype evaluation) shown once before step 1, stating in plain Persian
  that Mizaneh produces an estimate, is not medical advice or treatment,
  and that no form data leaves the browser. It never claims to have
  detected a medical condition and uses no diagnostic language.

## Consequences
- Positive: closes a real, verified gap (the missing disclaimer) without
  touching validated, working gate logic — lower risk than modifying
  `getValidationMessage`.
- Positive: testable as ordinary UI (render + a11y role), independent of
  the validation module, keeping `lib/nutrition/formulas.ts` free of UI
  policy.
- Neutral: users who fall outside the hard-gated range still can't proceed
  past that step, exactly as before this audit — unchanged behavior,
  verified by a regression test rather than assumed.
- Follow-up: final Persian copy for the disclosure needs a native-speaker
  tone pass (informative, not alarming) — tracked as an implementation
  task, not finalized in this ADR.
