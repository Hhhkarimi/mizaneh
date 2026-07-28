# Prototype Evaluation — Opening Screen / Step 1

Prototype: `app/lab/PROTOTYPE-ux-variants/page.tsx` (throwaway, removed
before final packaging — see `to-spec` for the resulting user stories).

Three variants of the calculator's opening structure were built and
compared on a single route, switchable via `?variant=`.

| Criterion | calculator-first | guidance-first | trust-and-safety-first |
|---|---|---|---|
| Usability (time to first input) | Best | Worst (extra paragraph before field 1) | Good (one compact box, then form) |
| Accessibility (contrast/labelling of the "not medical advice" message) | Worst — disclaimer is small, low-contrast, easy to miss | Medium — folded into body prose, not visually distinct | Best — a distinct `role="note"` region, testable and screen-reader-reachable |
| Mobile RTL | Good — least vertical space used | Weakest — extra paragraph pushes the first field below the fold on small screens | Good — compact box, ~2 extra lines |
| Clarity on scope/limits ("estimate, not diagnosis/treatment") | Weak | Present but diluted among explanatory prose | Strong and unambiguous |
| Implementation cost | Lowest | Low | Low (one additional, reusable notice component) |

## Decision

**Primary direction: trust-and-safety-first**, for step 1 only. Rationale:
it is the only variant that satisfies the priority "do not represent this
as medical diagnosis or treatment" as a *visible, accessible* statement
rather than small print, while adding negligible cost or friction.

**Synthesized with calculator-first for steps 2–4**: the safety/privacy
note is shown once, prominently, before the form begins — not repeated on
every step. Once that context is set, the remaining three steps keep
calculator-first's dense, low-friction field layout, since re-explaining
the science (guidance-first's approach) on every step would slow down the
one thing users are here to do quickly. Contextual help (guidance-first's
best idea) is kept, but demoted to per-field help text / tooltips rather
than lead paragraphs, so it doesn't cost scroll space unless a user wants it.

This decision is carried into `to-spec` as user stories, and the
prototype route itself is deleted before the final packages are built
(kept during implementation only as a visual reference).
