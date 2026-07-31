// Legacy v1 opt-in session persistence. Kept readable for backward
// compatibility while v2 workspaces provide multi-goal/version storage.

import { defaultForm } from "@/lib/food/catalogue";
import type { DayPlan, PlanMode, PlannerForm } from "@/lib/types";

const STORAGE_KEY = "mizaneh:session:v1";
const SESSION_VERSION = 1 as const;
const MAX_BYTES = 1_000_000;

export type StoredSession = {
  version: typeof SESSION_VERSION;
  form: PlannerForm;
  planMode: PlanMode;
  variationSeed: number;
  substitutions: Record<number, DayPlan>;
  savedAt: string;
};

const VALID_ALLERGIES = new Set(["gluten", "dairy", "egg", "nuts", "fish"]);
const VALID_MEDICAL_CONDITIONS = new Set([
  "kidney_disease",
  "liver_disease",
  "uncontrolled_diabetes",
  "serious_cardiovascular_disease",
  "active_cancer_treatment",
  "recent_major_surgery",
  "severe_gastrointestinal_condition",
  "medical_nutrition_therapy",
]);

function stringList(value: unknown, maxItems = 100): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, maxItems).map((item) => item.slice(0, 300))
    : [];
}

function isSafeLegacyDay(value: unknown): value is DayPlan {
  if (!isPlainObject(value) || typeof value.id !== "string" || typeof value.label !== "string" || !Array.isArray(value.meals) || value.meals.length > 50) return false;
  if (![value.calories, value.protein, value.fiber].every((item) => typeof item === "number" && Number.isFinite(item))) return false;
  return value.meals.every((meal) => isPlainObject(meal)
    && typeof meal.id === "string"
    && typeof meal.title === "string"
    && typeof meal.displaySlot === "string"
    && Array.isArray(meal.ingredients)
    && meal.ingredients.length <= 100
    && [meal.targetCalories, meal.targetProtein, meal.targetFiber].every((item) => typeof item === "number" && Number.isFinite(item)));
}

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeForm(input: unknown): PlannerForm | null {
  if (!input || typeof input !== "object") return null;
  const source = input as Partial<PlannerForm>;
  return {
    ...structuredClone(defaultForm),
    ...source,
    goal: ["weight_loss", "muscle_gain", "healthy_weight_gain"].includes(String(source.goal)) ? source.goal! : "weight_loss",
    goalSelectionSource: ["guided", "direct", "restored"].includes(String(source.goalSelectionSource)) ? source.goalSelectionSource! : "restored",
    allergies: stringList(source.allergies, 5).filter((item) => VALID_ALLERGIES.has(item)) as PlannerForm["allergies"],
    favourites: stringList(source.favourites),
    hiddenFoods: stringList(source.hiddenFoods),
    medicalConditions: stringList(source.medicalConditions, 8).filter((item) => VALID_MEDICAL_CONDITIONS.has(item)) as PlannerForm["medicalConditions"],
    cardiometabolic: {
      bloodPressure: { ...defaultForm.cardiometabolic.bloodPressure, ...source.cardiometabolic?.bloodPressure },
      glycaemia: { ...defaultForm.cardiometabolic.glycaemia, ...source.cardiometabolic?.glycaemia },
      lipids: { ...defaultForm.cardiometabolic.lipids, ...source.cardiometabolic?.lipids },
    },
    clinicalCare: {
      pregnancy: { ...defaultForm.clinicalCare.pregnancy, ...source.clinicalCare?.pregnancy },
      breastfeeding: { ...defaultForm.clinicalCare.breastfeeding, ...source.clinicalCare?.breastfeeding },
      eatingDisorder: { ...defaultForm.clinicalCare.eatingDisorder, ...source.clinicalCare?.eatingDisorder },
      allergy: { ...defaultForm.clinicalCare.allergy, ...source.clinicalCare?.allergy },
      dysphagia: { ...defaultForm.clinicalCare.dysphagia, ...source.clinicalCare?.dysphagia },
      kidney: { ...defaultForm.clinicalCare.kidney, ...source.clinicalCare?.kidney },
      liver: { ...defaultForm.clinicalCare.liver, ...source.clinicalCare?.liver },
      cancer: { ...defaultForm.clinicalCare.cancer, ...source.clinicalCare?.cancer },
      surgery: { ...defaultForm.clinicalCare.surgery, ...source.clinicalCare?.surgery },
      gastrointestinal: { ...defaultForm.clinicalCare.gastrointestinal, ...source.clinicalCare?.gastrointestinal },
      customMnt: { ...defaultForm.clinicalCare.customMnt, ...source.clinicalCare?.customMnt },
    },
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function hasUnsafeKey(value: unknown): boolean {
  if (!isPlainObject(value) && !Array.isArray(value)) return false;
  for (const key of Object.keys(value)) {
    if (key === "__proto__" || key === "prototype" || key === "constructor") return true;
    if (hasUnsafeKey((value as Record<string, unknown>)[key])) return true;
  }
  return false;
}

export function saveSession(session: Omit<StoredSession, "version" | "savedAt">): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const payload: StoredSession = {
      version: SESSION_VERSION,
      savedAt: new Date().toISOString(),
      ...session,
    };
    const serialized = JSON.stringify(payload);
    if (serialized.length > MAX_BYTES || hasUnsafeKey(payload)) return false;
    storage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}

export function loadSession(): StoredSession | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    if (raw.length > MAX_BYTES) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed) || hasUnsafeKey(parsed) || parsed.version !== SESSION_VERSION) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }
    const form = normalizeForm(parsed.form);
    if (
      !form ||
      typeof parsed.variationSeed !== "number" ||
      !["variety", "quick", "batch", "protein"].includes(String(parsed.planMode)) ||
      !isPlainObject(parsed.substitutions ?? {})
    ) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }
    const substitutions = Object.fromEntries(
      Object.entries(parsed.substitutions ?? {})
        .filter(([key, value]) => /^\d+$/.test(key) && Number(key) >= 0 && Number(key) <= 30 && isSafeLegacyDay(value))
        .slice(0, 31),
    ) as Record<number, DayPlan>;
    return {
      version: 1,
      form,
      planMode: parsed.planMode as PlanMode,
      variationSeed: parsed.variationSeed,
      substitutions,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearSession(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasSavedSession(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    return storage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
