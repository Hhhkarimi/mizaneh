import { screenSafety } from "@/lib/safety/screen";
import type {
  AdjustmentProposal,
  DayPlan,
  Metrics,
  PlanDocument,
  PlanMode,
  PlannerForm,
  WeightMeasurement,
} from "@/lib/types";

export type CreatePlanDocumentInput = {
  metrics: Metrics | null;
  submittedForm: PlannerForm | null;
  displayedPlan: DayPlan[];
  name: string;
  id: string;
  parentPlanId: string | null;
  activePlanId: string;
  activePlanCreatedAt: string;
  archivedPlans: PlanDocument[];
  startingTargetCalories: number | null;
  planMode: PlanMode;
  variationSeed: number;
  measurements: WeightMeasurement[];
  adjustmentProposal: AdjustmentProposal | null;
  lastAdjustmentAt?: string;
  now?: string;
};

export function createPlanDocument(input: CreatePlanDocumentInput): PlanDocument | null {
  const {
    metrics,
    submittedForm,
    displayedPlan,
    name,
    id,
    parentPlanId,
    activePlanId,
    activePlanCreatedAt,
    archivedPlans,
    startingTargetCalories,
    planMode,
    variationSeed,
    measurements,
    adjustmentProposal,
    lastAdjustmentAt,
    now = new Date().toISOString(),
  } = input;

  if (!metrics || !submittedForm || displayedPlan.length === 0) return null;

  return {
    schemaVersion: 2,
    id,
    parentPlanId,
    name,
    goal: submittedForm.goal,
    form: structuredClone(submittedForm),
    safetyScreen: screenSafety(submittedForm),
    calculation: structuredClone(metrics),
    startingTargetCalories: startingTargetCalories ?? metrics.targetCalories,
    planMode,
    variationSeed,
    days: structuredClone(displayedPlan),
    versions: archivedPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      goal: plan.goal,
      createdAt: plan.createdAt,
      parentPlanId: plan.parentPlanId,
    })),
    measurements: structuredClone(measurements),
    adjustmentProposals: adjustmentProposal ? [structuredClone(adjustmentProposal)] : [],
    lastAdjustmentAt,
    createdAt: id === activePlanId ? activePlanCreatedAt : now,
    updatedAt: now,
    legacy: metrics.policy.evidenceCertainty === "legacy",
  };
}
