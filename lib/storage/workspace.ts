import { defaultForm } from "@/lib/food/catalogue";
import { calculateMetrics } from "@/lib/nutrition/formulas";
import { buildWeeklyPlan } from "@/lib/plan/build";
import { ensurePlanIdentity } from "@/lib/plan/editor";
import { screenSafety } from "@/lib/safety/screen";
import type { DayPlan, Goal, Metrics, PlanDocument, PlannerForm } from "@/lib/types";
import type { StoredSession } from "@/lib/storage/session";
import { isPersistedDataExpired } from "@/lib/storage/retention";

const WORKSPACE_KEY = "mizaneh:workspace:v2";
const MAX_PERSISTED_BYTES = 2_000_000;

export type StoredWorkspace = {
  version: 2;
  savedAt: string;
  activePlanId: string | null;
  plans: PlanDocument[];
};

const VALID_GOALS = new Set<Goal>(["weight_loss", "muscle_gain", "healthy_weight_gain"]);
const VALID_PLAN_MODES = new Set(["variety", "quick", "batch", "protein"]);

function normalizedGoal(value: unknown): Goal {
  return typeof value === "string" && VALID_GOALS.has(value as Goal) ? value as Goal : "weight_loss";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isSafeDayPlan(value: unknown): value is DayPlan {
  if (!value || typeof value !== "object") return false;
  const day = value as Partial<DayPlan>;
  if (typeof day.id !== "string" || day.id.length > 200 || typeof day.label !== "string" || day.label.length > 200 || !Array.isArray(day.meals) || day.meals.length > 50) return false;
  if (![day.calories, day.protein, day.fiber].every(isFiniteNumber)) return false;
  return day.meals.every((raw) => {
    if (!raw || typeof raw !== "object") return false;
    const meal = raw as Record<string, unknown>;
    return typeof meal.id === "string" && meal.id.length <= 200
      && typeof meal.title === "string" && meal.title.length <= 500
      && typeof meal.displaySlot === "string" && meal.displaySlot.length <= 200
      && Array.isArray(meal.ingredients) && meal.ingredients.length <= 100
      && meal.ingredients.every((item) => typeof item === "string" && item.length <= 500)
      && [meal.targetCalories, meal.targetProtein, meal.targetFiber].every(isFiniteNumber);
  });
}

function isSafeMetrics(value: unknown): value is Metrics {
  if (!value || typeof value !== "object") return false;
  const metrics = value as Partial<Metrics>;
  return [metrics.targetCalories, metrics.maintenanceCalories, metrics.proteinMin, metrics.proteinMax, metrics.fiber].every(isFiniteNumber)
    && Boolean(metrics.policy && typeof metrics.policy.calculationPolicyId === "string" && typeof metrics.policy.energyEquationId === "string");
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function containsUnsafeKey(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  for (const key of Object.keys(value)) {
    if (key === "__proto__" || key === "prototype" || key === "constructor") return true;
    if (containsUnsafeKey((value as Record<string, unknown>)[key])) return true;
  }
  return false;
}

function normalizeForm(input: unknown): PlannerForm {
  if (!input || typeof input !== "object") return structuredClone(defaultForm);
  const source = input as Partial<PlannerForm>;
  const goal = normalizedGoal(source.goal);
  return {
    ...structuredClone(defaultForm),
    ...source,
    goal,
    goalSelectionSource: ["guided", "direct", "restored"].includes(String(source.goalSelectionSource)) ? source.goalSelectionSource! : "restored",
    allergies: Array.isArray(source.allergies) ? source.allergies : [],
    favourites: Array.isArray(source.favourites) ? source.favourites : [],
    hiddenFoods: Array.isArray(source.hiddenFoods) ? source.hiddenFoods : [],
    medicalConditions: Array.isArray(source.medicalConditions) ? source.medicalConditions : [],
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

function validateWorkspace(value: unknown): StoredWorkspace | null {
  if (!value || typeof value !== "object" || containsUnsafeKey(value)) return null;
  const candidate = value as Partial<StoredWorkspace>;
  if (candidate.version !== 2 || !Array.isArray(candidate.plans) || candidate.plans.length > 50) return null;
  const plans: PlanDocument[] = [];
  for (const raw of candidate.plans) {
    if (!raw || typeof raw !== "object") return null;
    const plan = raw as Partial<PlanDocument>;
    if (
      plan.schemaVersion !== 2
      || typeof plan.id !== "string"
      || plan.id.length > 200
      || !Array.isArray(plan.days)
      || plan.days.length > 31
      || !plan.days.every(isSafeDayPlan)
      || !isSafeMetrics(plan.calculation)
      || !plan.safetyScreen
      || !VALID_PLAN_MODES.has(String(plan.planMode))
    ) return null;
    const form = normalizeForm(plan.form);
    const goal = normalizedGoal(plan.goal ?? form.goal);
    form.goal = goal;
    plans.push({
      ...(plan as PlanDocument),
      goal,
      form,
      calculation: { ...plan.calculation, goal },
      days: ensurePlanIdentity(plan.days as DayPlan[]),
      versions: Array.isArray(plan.versions) ? plan.versions.slice(0, 100) : [],
      startingTargetCalories: Number.isFinite(plan.startingTargetCalories) ? Number(plan.startingTargetCalories) : plan.calculation.targetCalories,
      measurements: Array.isArray(plan.measurements) ? plan.measurements.slice(0, 1000) : [],
      adjustmentProposals: Array.isArray(plan.adjustmentProposals) ? plan.adjustmentProposals.slice(0, 100) : [],
    });
  }
  return {
    version: 2,
    savedAt: typeof candidate.savedAt === "string" ? candidate.savedAt : new Date().toISOString(),
    activePlanId: typeof candidate.activePlanId === "string" ? candidate.activePlanId : null,
    plans,
  };
}

export function saveWorkspace(workspace: StoredWorkspace): boolean {
  const target = storage();
  if (!target) return false;
  try {
    const safe: StoredWorkspace = {
      ...workspace,
      version: 2,
      savedAt: new Date().toISOString(),
      plans: workspace.plans.slice(-50),
    };
    const serialized = JSON.stringify(safe);
    if (serialized.length > MAX_PERSISTED_BYTES || containsUnsafeKey(safe)) return false;
    target.setItem(WORKSPACE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}

export function loadWorkspace(): StoredWorkspace | null {
  const target = storage();
  if (!target) return null;
  try {
    const raw = target.getItem(WORKSPACE_KEY);
    if (!raw) return null;
    if (raw.length > MAX_PERSISTED_BYTES) {
      target.removeItem(WORKSPACE_KEY);
      return null;
    }
    const workspace = validateWorkspace(JSON.parse(raw));
    if (!workspace || isPersistedDataExpired(workspace.savedAt)) {
      target.removeItem(WORKSPACE_KEY);
      return null;
    }
    return workspace;
  } catch {
    return null;
  }
}

export function clearWorkspace(): boolean {
  const target = storage();
  if (!target) return false;
  try {
    target.removeItem(WORKSPACE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasWorkspace(): boolean {
  return loadWorkspace() !== null;
}

export function migrateLegacySession(session: StoredSession): StoredWorkspace {
  const form = normalizeForm({ ...session.form, goal: "weight_loss", goalSelectionSource: "restored" });
  const calculation = calculateMetrics(form);
  const generated = buildWeeklyPlan(form, calculation, session.planMode, session.variationSeed);
  const days = ensurePlanIdentity(generated.map((day, index) => session.substitutions[index] ?? day));
  const id = `legacy-${Date.parse(session.savedAt) || Date.now()}`;
  const plan: PlanDocument = {
    schemaVersion: 2,
    id,
    parentPlanId: null,
    name: "برنامهٔ کاهش وزن قدیمی",
    goal: "weight_loss",
    form,
    safetyScreen: screenSafety(form),
    calculation,
    startingTargetCalories: calculation.targetCalories,
    planMode: session.planMode,
    variationSeed: session.variationSeed,
    days,
    versions: [],
    measurements: [],
    adjustmentProposals: [],
    createdAt: session.savedAt,
    updatedAt: session.savedAt,
    legacy: true,
  };
  return { version: 2, savedAt: session.savedAt, activePlanId: id, plans: [plan] };
}
