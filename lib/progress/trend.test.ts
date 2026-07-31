import { describe, expect, it } from "vitest";
import { buildAdjustmentProposal, calculateWeightTrend } from "@/lib/progress/trend";
import type { WeightMeasurement } from "@/lib/types";

const measurement = (id: string, date: string, weightKg: number): WeightMeasurement => ({ id, date, weightKg });
const enough = [
  measurement("1", "2026-01-01", 80),
  measurement("2", "2026-01-05", 79.9),
  measurement("3", "2026-01-09", 79.8),
  measurement("4", "2026-01-13", 79.7),
  measurement("5", "2026-01-17", 79.6),
];

describe("progress trends and adjustment proposals", () => {
  it("does not calculate a trend from fewer than five weigh-ins", () => {
    expect(calculateWeightTrend(enough.slice(0, 4))).toBeNull();
  });

  it("requires at least fourteen days of observations", () => {
    expect(calculateWeightTrend(enough.map((item, index) => ({ ...item, date: `2026-01-0${index + 1}` })))).toBeNull();
  });

  it("uses a robust Theil-Sen trend across sufficient measurements", () => {
    const trend = calculateWeightTrend(enough);
    expect(trend?.weeklyChangeKg).toBeCloseTo(-0.175, 2);
    expect(trend?.method).toBe("theil-sen");
  });

  it("reduces same-day measurements to their median", () => {
    const withDuplicates = [
      ...enough,
      measurement("duplicate-low", "2026-01-17", 70),
      measurement("duplicate-high", "2026-01-17", 90),
    ];
    const trend = calculateWeightTrend(withDuplicates);
    expect(trend?.sampleCount).toBe(5);
    expect(Math.abs(trend?.weeklyChangeKg ?? 99)).toBeLessThan(1);
  });

  it("uses only the latest 21-day window", () => {
    const recent = enough.map((item, index) => ({ ...item, date: `2026-02-${String(1 + index * 4).padStart(2, "0")}` }));
    const oldOutlier = measurement("old", "2025-01-01", 150);
    expect(calculateWeightTrend([oldOutlier, ...recent])?.weeklyChangeKg).toBeCloseTo(-0.175, 2);
  });

  it("never proposes more than 100 kcal from one review", () => {
    const proposal = buildAdjustmentProposal("weight_loss", enough.map((item, index) => ({ ...item, weightKg: 80 + index * 0.1, adherence: 4 })));
    expect(Math.abs(proposal?.proposedCaloriesDelta ?? 0)).toBeLessThanOrEqual(100);
  });

  it("does not reduce energy when adherence is not reported", () => {
    const proposal = buildAdjustmentProposal("weight_loss", enough.map((item, index) => ({ ...item, weightKg: 80 + index * 0.1 })));
    expect(proposal?.proposedCaloriesDelta).toBe(0);
  });

  it("does not propose another adjustment within fourteen days", () => {
    expect(buildAdjustmentProposal("weight_loss", enough, new Date().toISOString())).toBeNull();
  });
});
