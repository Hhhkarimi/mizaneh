# Test and Verification Report

The source now contains **171 static `it`/`test` declarations**. v5 adds coverage for non-blocking supported conditions, acute red flags, clinician-entered constraints, direct condition-specific profile generation, deterministic plan construction, expanded micronutrients and scientific source metadata.

Current verification is documented in:

- `docs/verification-v5.md`
- `docs/clinical-nutrition-v5.md`
- `docs/evidence-registry-v5.csv`
- `docs/adr/0005-clinical-supported-planning-with-acute-red-flags.md`

## Passed in the artifact environment

- strict core production TypeScript check;
- structural TypeScript/TSX check for all production and test files using local framework declarations;
- runtime smoke for thirteen supported clinical contexts and five urgent red flags;
- deterministic output check for identical inputs and seed;
- custom-food and custom-recipe macro/micronutrient recalculation;
- source-registry completeness and unknown-source handling at type/test level;
- whitespace, manifest and archive-integrity checks.

## Release gates not completed in this environment

Dependency installation was blocked by the configured package registry. Consequently no success is claimed for:

```bash
npm ci
npm run lint
npm run test
npm run build
npm audit --omit=dev
```

Run these in GitHub Codespaces/CI with Node.js 22.22.2 or newer before merging or deploying. Software verification does not establish clinical effectiveness; qualified clinical review and food-composition dataset validation remain required.
