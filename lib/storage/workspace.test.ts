import { beforeEach, describe, expect, it } from "vitest";
import { defaultForm } from "@/lib/food/catalogue";
import { calculateMetrics } from "@/lib/nutrition/formulas";
import { buildWeeklyPlan } from "@/lib/plan/build";
import { screenSafety } from "@/lib/safety/screen";
import {
  loadWorkspace,
  migrateLegacySession,
  saveWorkspace,
  type StoredWorkspace,
} from "@/lib/storage/workspace";

function workspace(): StoredWorkspace {
  const form = structuredClone(defaultForm);
  const metrics = calculateMetrics(form);
  const now = new Date().toISOString();
  return {
    version: 2,
    savedAt: now,
    activePlanId: "plan-1",
    plans: [{
      schemaVersion: 2,
      id: "plan-1",
      parentPlanId: null,
      name: "برنامهٔ اصلی",
      goal: "weight_loss",
      form,
      safetyScreen: screenSafety(form),
      calculation: metrics,
      startingTargetCalories: metrics.targetCalories,
      planMode: "variety",
      variationSeed: 1,
      days: buildWeeklyPlan(form, metrics, "variety", 1),
      versions: [],
      measurements: [],
      adjustmentProposals: [],
      createdAt: now,
      updatedAt: now,
      legacy: false,
    }],
  };
}

describe("workspace v2 storage and migration", () => {
  beforeEach(() => window.localStorage.clear());

  it("saves multiple immutable plans under the v2 key", () => {
    expect(saveWorkspace(workspace())).toBe(true);
    expect(window.localStorage.getItem("mizaneh:workspace:v2")).not.toBeNull();
    expect(loadWorkspace()?.plans).toHaveLength(1);
  });

  it("migrates a v1 session as an explicit legacy weight-loss plan", () => {
    const migrated = migrateLegacySession({
      version: 1,
      form: structuredClone(defaultForm),
      planMode: "variety",
      variationSeed: 3,
      substitutions: {},
      savedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(migrated.plans[0].goal).toBe("weight_loss");
    expect(migrated.plans[0].legacy).toBe(true);
    expect(migrated.plans[0].calculation.policy.energyEquationId).toBe("energy.legacy.msj-pal.v1");
  });

  it("rejects oversized or prototype-polluting persisted payloads", () => {
    window.localStorage.setItem("mizaneh:workspace:v2", "x".repeat(2_100_000));
    expect(loadWorkspace()).toBeNull();
    window.localStorage.setItem(
      "mizaneh:workspace:v2",
      '{"version":2,"plans":[],"activePlanId":null,"savedAt":"x","__proto__":{"polluted":true}}',
    );
    expect(loadWorkspace()).toBeNull();
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });
});

it("normalizes an unknown persisted goal instead of trusting it", () => {
  const value = workspace();
  (value.plans[0] as unknown as { goal: string }).goal = "medical_treatment";
  (value.plans[0].form as unknown as { goal: string }).goal = "medical_treatment";
  window.localStorage.setItem("mizaneh:workspace:v2", JSON.stringify(value));
  const restored = loadWorkspace();
  expect(restored?.plans[0].goal).toBe("weight_loss");
  expect(restored?.plans[0].form.goal).toBe("weight_loss");
});

it("rejects a persisted plan with non-finite nutrition totals", () => {
  const value = workspace();
  value.plans[0].days[0].calories = Number.NaN;
  window.localStorage.setItem("mizaneh:workspace:v2", JSON.stringify(value));
  expect(loadWorkspace()).toBeNull();
});
