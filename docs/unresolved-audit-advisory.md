# Unresolved audit advisory

`npm audit --omit=dev` reports **0 vulnerabilities** — the production
dependency tree is clean, both before and after this audit's changes.

`npm audit` (including devDependencies) reports **9 high-severity**
findings, all a single transitive advisory:

- **`brace-expansion` (≤5.0.7)** — denial-of-service via unbounded
  expansion length, pulled in transitively through `minimatch` →
  `@eslint/config-array` / `@eslint/eslintrc` / `eslint-plugin-import` /
  `eslint-plugin-jsx-a11y` / `eslint-plugin-react` → `eslint` →
  `eslint-config-next`.

**Status: pre-existing, not introduced by this audit.** It was present
at `BASE_COMMIT` before any change in this pass and remains after the
refactor, at the same count (9).

**Why it isn't force-fixed here**: `npm audit fix --force` would install
`eslint@10.8.0`, a breaking major-version change to a dev-only lint tool,
which is out of scope for a production-readiness pass that is supposed
to avoid unrelated breaking changes. It also carries no runtime risk —
`eslint`/`eslint-config-next` never ship in the production bundle (`npm
run build` output and `npm audit --omit=dev` both confirm this), so the
DoS vector only exists in a developer's local lint run, not for any
Mizaneh user.

**Recommendation**: track upgrading to ESLint 10 as its own, separately
reviewed change (verifying the new flat-config rule set doesn't silently
disable any currently-enforced rule) rather than bundling it into this
audit.
