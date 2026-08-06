import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultForm } from "@/lib/food/catalogue";
import { calculateMetrics } from "@/lib/nutrition/formulas";
import { buildWeeklyPlan } from "@/lib/plan/build";
import { screenSafety } from "@/lib/safety/screen";
import { loadSession } from "@/lib/storage/session";
import { loadWorkspace, type StoredWorkspace } from "@/lib/storage/workspace";
import { isPersistedDataExpired, LOCAL_STORAGE_RETENTION_DAYS } from "@/lib/storage/retention";

const NOW = new Date("2026-08-06T12:00:00.000Z");
const OLD = new Date(NOW.getTime() - (LOCAL_STORAGE_RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000).toISOString();

function expiredWorkspace(): StoredWorkspace {
  const form = structuredClone(defaultForm);
  const metrics = calculateMetrics(form);
  return {
    version: 2,
    savedAt: OLD,
    activePlanId: "expired-plan",
    plans: [{
      schemaVersion: 2,
      id: "expired-plan",
      parentPlanId: null,
      name: "برنامهٔ منقضی",
      goal: form.goal,
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
      createdAt: OLD,
      updatedAt: OLD,
      legacy: false,
    }],
  };
}

describe("local health-data retention", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("treats malformed, future-skewed and older values as expired", () => {
    expect(isPersistedDataExpired("not-a-date")).toBe(true);
    expect(isPersistedDataExpired(OLD)).toBe(true);
    expect(isPersistedDataExpired(NOW.toISOString())).toBe(false);
  });

  it("removes an expired v2 workspace instead of restoring health data", () => {
    window.localStorage.setItem("mizaneh:workspace:v2", JSON.stringify(expiredWorkspace()));
    expect(loadWorkspace()).toBeNull();
    expect(window.localStorage.getItem("mizaneh:workspace:v2")).toBeNull();
  });

  it("removes malformed persisted payloads after a failed parse", () => {
    window.localStorage.setItem("mizaneh:workspace:v2", "{not-json");
    window.localStorage.setItem("mizaneh:session:v1", "{not-json");
    expect(loadWorkspace()).toBeNull();
    expect(loadSession()).toBeNull();
    expect(window.localStorage.getItem("mizaneh:workspace:v2")).toBeNull();
    expect(window.localStorage.getItem("mizaneh:session:v1")).toBeNull();
  });

  it("removes an expired legacy session", () => {
    window.localStorage.setItem("mizaneh:session:v1", JSON.stringify({
      version: 1,
      form: structuredClone(defaultForm),
      planMode: "variety",
      variationSeed: 1,
      substitutions: {},
      savedAt: OLD,
    }));
    expect(loadSession()).toBeNull();
    expect(window.localStorage.getItem("mizaneh:session:v1")).toBeNull();
  });
});
