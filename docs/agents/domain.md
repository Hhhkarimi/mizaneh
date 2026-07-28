# Domain Docs

**Layout:** single-context (this is a single Next.js app, not a monorepo).

- `CONTEXT.md` at repo root — canonical domain vocabulary, invariants, and
  scope boundaries for Mizaneh.
- `docs/adr/` — architecture decision records, one file per decision,
  numbered `NNNN-title.md`.

**Consumer rules:** any skill or agent touching domain logic (calculation
rules, meal/food/plan models, terminology) reads `CONTEXT.md` first and
keeps it in sync with the code. ADRs are append-only; a reversed decision
gets a new ADR that supersedes the old one rather than an edit.
