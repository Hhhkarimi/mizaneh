# Verification Report — 2026-07-31

## Environment

- Node: `v22.16.0`
- Package engine: `>=22.22.0`
- Dependency state: not installed successfully

## Commands and final status

| Command | Status | Result |
|---|---|---|
| `tsc -p /tmp/tsconfig.mizaneh-core.json` | PASS | Core domain/calculation/safety/plan/progress/storage source type-checks with strict temporary aliases. |
| `tsc -p /tmp/tsconfig.mizaneh-app.json` | PASS | Production TS/TSX source parses and type-checks against temporary local framework stubs. |
| `tsc -p /tmp/tsconfig.mizaneh-all.json` | PASS | Production and test TS/TSX files parse and type-check structurally. |
| `node --loader /tmp/mizaneh-loader.mjs /tmp/mizaneh-smoke.mjs` | PASS | Runtime smoke returned `{"status":"ok","loss":2050,"muscle":2550,"gain":2650,"days":7,"safety":"ok","lowEnergyGate":"ok","editor":"ok","trend":"ok"}`. |
| `git diff --check` | PASS | No whitespace errors. |
| dangerous API grep | PASS with reviewed exception | No `eval`, `document.write`, direct `innerHTML`; one static JSON-LD serialization in `app/page.tsx`. |
| URL/query health-data grep | PASS | No `searchParams`, `URLSearchParams`, `location.search` or `location.hash` usage in production source. |
| likely-secret regex scan | PASS | No likely API/private-key patterns found. |
| prototype route scan | PASS | No file remains under `app/**/prototype/**`. |
| font scan | PASS | Only `@fontsource-variable/vazirmatn` remains. |
| creator attribution scan | PASS | Visible approved attribution and LinkedIn URL found. |
| static test declaration comparison | PASS | 153 current declarations vs 94 baseline; 59 added. |
| `npm run test` | BLOCKED | Exit 127: `vitest: not found` because dependencies were not installed. |
| `npm run lint` | BLOCKED | Exit 127: `eslint: not found` because dependencies were not installed. |
| `npm run build` | BLOCKED | Exit 127: `next: not found` because dependencies were not installed. |
| `npm audit --omit=dev` | BLOCKED | Exit 1: the configured internal audit endpoint returned HTTP 404. |

## Commands not completed

### Dependency installation

Attempted:

```bash
npm ci
npm ci --registry=https://registry.npmjs.org --ignore-scripts
```

The default registry returned missing-package responses for transitive Zod packages. The public-registry attempt did not complete reliably in the execution environment. Node `v22.16.0` is also below the declared `>=22.22.0` engine required by the selected dependency set.

Therefore the following release checks were attempted but **did not run to completion** and are not reported as passing:

```bash
npm run lint
npm run test
npm run build
npm audit --omit=dev
```

Also not completed:

- browser end-to-end tests;
- automated accessibility scanner;
- deployed security-header verification;
- Lighthouse/performance profiling;
- production Vercel deployment.

## Required release gate

Run on Node 22.22.0 or newer with normal npm registry access:

```bash
rm -rf node_modules .next
npm ci
npm run lint
npm run test
npm run build
npm audit --omit=dev
```

Then verify keyboard/mobile flows and response headers against the deployed preview before production promotion.
