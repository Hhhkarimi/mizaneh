import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (/\.[cm]?[jt]sx?$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

const dietPlannerPath = path.join(root, "app", "DietPlanner.tsx");
const dietPlanner = await readFile(dietPlannerPath, "utf8");
const lineCount = dietPlanner.split(/\r?\n/).length;
if (lineCount > 1800) {
  failures.push(`app/DietPlanner.tsx has ${lineCount} lines; keep it at or below 1800.`);
}
if (/\b(?:useState|useRef)\b/.test(dietPlanner)) {
  failures.push("app/DietPlanner.tsx must keep React state/ref ownership in hooks/usePlannerState.ts.");
}
for (const forbidden of ["function BrandMark", "function safeBuildWeeklyPlan"]) {
  if (dietPlanner.includes(forbidden)) failures.push(`${forbidden} must remain extracted from DietPlanner.`);
}

for (const file of await walk(path.join(root, "lib"))) {
  const source = await readFile(file, "utf8");
  if (/from\s+["']@\/(?:app|components)\//.test(source)) {
    failures.push(`${path.relative(root, file)} imports presentation code; lib must remain presentation-independent.`);
  }
}

if (failures.length > 0) {
  console.error("Architecture checks failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Architecture checks passed. DietPlanner: ${lineCount} lines.`);
