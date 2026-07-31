import { describe, expect, it } from "vitest";
import { defaultForm } from "@/lib/food/catalogue";
import { applyReviewedEnergyAdjustment, calculateCurrentMetrics, getCalculationScopeIssue } from "@/lib/calculations/policies";
import type { PlannerForm } from "@/lib/types";

function form(overrides: Partial<PlannerForm> = {}): PlannerForm {
  return { ...structuredClone(defaultForm), ...overrides };
}

describe("goal-specific calculation policies", () => {
  it("uses a conservative weight-loss deficit capped at 15% or 500 kcal", () => {
    const metrics = calculateCurrentMetrics(form({ goal: "weight_loss" }));
    expect(metrics.deficit).toBe(Math.min(500, Math.round(metrics.maintenanceCalories * 0.15)));
    expect(metrics.bmr).toBeLessThan(metrics.maintenanceCalories);
    expect(metrics.surplus).toBe(0);
    expect(metrics.policy.calculationPolicyId).toBe("weight-loss.start.v3");
  });

  it("uses a 5% muscle-gain surplus clamped to 100–300 kcal", () => {
    const metrics = calculateCurrentMetrics(form({ goal: "muscle_gain", resistanceTraining: "current", trainingDays: "4" }));
    expect(metrics.surplus).toBeGreaterThanOrEqual(100);
    expect(metrics.surplus).toBeLessThanOrEqual(300);
    expect(metrics.policy.calculationPolicyId).toBe("muscle-gain.start.v2");
  });

  it("uses a distinct 10% healthy-weight-gain surplus clamped to 200–500 kcal", () => {
    const metrics = calculateCurrentMetrics(form({ goal: "healthy_weight_gain" }));
    expect(metrics.surplus).toBeGreaterThanOrEqual(200);
    expect(metrics.surplus).toBeLessThanOrEqual(500);
    expect(metrics.targetCalories).toBeGreaterThan(
      calculateCurrentMetrics(form({ goal: "muscle_gain", resistanceTraining: "current" })).targetCalories,
    );
    expect(metrics.policy.calculationPolicyId).toBe("healthy-weight-gain.start.v2");
  });

  it("persists equation, evidence and review metadata", () => {
    const metrics = calculateCurrentMetrics(form());
    expect(metrics.policy.energyEquationId).toBe("energy.eer.nasem2023.v1+clinical-overrides.v1");
    expect(metrics.policy.evidenceRegistryVersion).toMatch(/^2026-/);
    expect(metrics.policy.reviewExpiresAt).toMatch(/^2026-/);
    expect(metrics.uncertaintyKcal).toBeGreaterThan(0);
  });

  it("blocks ordinary weight-loss generation when the target enters specialist low-energy scope", () => {
    const lowEnergyForm = form({ goal: "weight_loss", sex: "female", age: "80", height: "130", weight: "40" });
    const metrics = calculateCurrentMetrics(lowEnergyForm);
    expect(metrics.targetCalories).toBeLessThanOrEqual(1200);
    expect(getCalculationScopeIssue(lowEnergyForm, metrics)).toContain("برنامهٔ عادی تولید نمی‌کند");
  });
});

it("applies only an explicitly reviewed adjustment capped at 100 kcal", () => {
  const base = calculateCurrentMetrics(defaultForm);
  const increased = applyReviewedEnergyAdjustment(defaultForm, base, 250);
  expect(increased.targetCalories - base.targetCalories).toBe(100);
  expect(increased.carbs).not.toBe(base.carbs);
});

it("does not adjust a weight-loss target into specialist low-energy scope", () => {
  const low = { ...calculateCurrentMetrics(defaultForm), targetCalories: 1250, maintenanceCalories: 1500 };
  const adjusted = applyReviewedEnergyAdjustment(defaultForm, low, -100, 1250);
  expect(adjusted.targetCalories).toBe(1225);
  expect(adjusted.warnings.at(-1)).toContain("-25");
});


describe("condition-specific calculation overrides", () => {
  it("replaces a weight-loss deficit with trimester energy support during pregnancy", () => {
    const pregnant = form({ goal: "weight_loss", pregnant: true });
    pregnant.clinicalCare.pregnancy.trimester = "second";
    const metrics = calculateCurrentMetrics(pregnant);
    expect(metrics.energyAdjustment).toBe(340);
    expect(metrics.deficit).toBe(0);
  });

  it("uses clinician-entered CKD protein targets when provided", () => {
    const kidney = form({ medicalConditions: ["kidney_disease", "medical_nutrition_therapy"] });
    kidney.clinicalCare.customMnt.proteinTargetGKg = "0.7";
    const metrics = calculateCurrentMetrics(kidney);
    expect(metrics.proteinMin).toBe(Math.round(Number(kidney.weight) * 0.7));
    expect(metrics.proteinMax).toBe(metrics.proteinMin);
  });

  it("removes an autonomous deficit when active cancer treatment causes poor intake", () => {
    const cancer = form({ goal: "weight_loss", medicalConditions: ["active_cancer_treatment"] });
    cancer.clinicalCare.cancer.appetiteImpact = "severe";
    expect(calculateCurrentMetrics(cancer).deficit).toBe(0);
  });
});
