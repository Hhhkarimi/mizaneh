import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const today = new Date();
today.setUTCHours(0, 0, 0, 0);

function dateFrom(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not find ${label} review date.`);
  const date = new Date(`${match[1]}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${label} review date: ${match[1]}`);
  return date;
}

const activeSource = await readFile(path.join(root, "lib/calculations/policies.ts"), "utf8");
const legacySource = await readFile(path.join(root, "lib/nutrition/formulas.ts"), "utf8");
const activeReview = dateFrom(activeSource, /REVIEW_EXPIRES_AT\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/, "active policy");
const legacyReview = dateFrom(legacySource, /reviewExpiresAt:\s*["'](\d{4}-\d{2}-\d{2})["']/, "legacy policy");

if (activeReview < today) {
  console.error(`Active clinical calculation policy review expired on ${activeReview.toISOString().slice(0, 10)}.`);
  process.exit(1);
}
if (legacyReview < today) {
  console.warn(`Legacy compatibility policy review expired on ${legacyReview.toISOString().slice(0, 10)}; it remains frozen and warning-labelled.`);
}
console.log(`Active policy review valid through ${activeReview.toISOString().slice(0, 10)}.`);
