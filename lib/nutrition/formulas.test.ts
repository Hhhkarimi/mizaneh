import { describe, expect, it } from "vitest";
import {
  bmiLabel,
  calculateMetrics,
  getValidationMessage,
} from "@/lib/nutrition/formulas";
import { defaultForm } from "@/lib/food/catalogue";
import type { PlannerForm } from "@/lib/types";

function form(overrides: Partial<PlannerForm> = {}): PlannerForm {
  return { ...defaultForm, ...overrides };
}

describe("calculateMetrics — Mifflin–St Jeor BMR/TDEE", () => {
  it("matches the Mifflin–St Jeor formula for a female", () => {
    const metrics = calculateMetrics(
      form({ sex: "female", age: "32", height: "170", weight: "78", activity: "light" }),
    );
    // 10*78 + 6.25*170 - 5*32 - 161 = 780 + 1062.5 - 160 - 161 = 1521.5 → 1522
    expect(metrics.bmr).toBe(1522);
    expect(metrics.tdee).toBe(Math.round(1522 * 1.375));
  });

  it("matches the Mifflin–St Jeor formula for a male", () => {
    const metrics = calculateMetrics(
      form({ sex: "male", age: "45", height: "182", weight: "95", activity: "active" }),
    );
    // 10*95 + 6.25*182 - 5*45 + 5 = 950 + 1137.5 - 225 + 5 = 1867.5 → 1868
    expect(metrics.bmr).toBe(1868);
    expect(metrics.tdee).toBe(Math.round(1868 * 1.725));
  });

  it.each([
    ["sedentary", 1.2],
    ["light", 1.375],
    ["moderate", 1.55],
    ["active", 1.725],
  ] as const)("applies the %s activity factor of %s", (activity, factor) => {
    const base = form({ activity: "sedentary" });
    const metrics = calculateMetrics({ ...base, activity });
    expect(metrics.tdee).toBe(Math.round(metrics.bmr * factor));
  });
});

describe("calculateMetrics — calorie-deficit safeguards", () => {
  it("caps the deficit at 20% of TDEE even for an aggressive pace", () => {
    const metrics = calculateMetrics(form({ pace: "0.75" }));
    const maxDeficit = metrics.tdee * 0.2;
    expect(metrics.deficit).toBeLessThanOrEqual(Math.ceil(maxDeficit) + 1);
  });

  it("never drops target calories below the female floor of 1200", () => {
    // A small, low-TDEE female body with an aggressive pace should hit the floor.
    const metrics = calculateMetrics(
      form({ sex: "female", age: "70", height: "150", weight: "45", targetWeight: "42", activity: "sedentary", pace: "0.75" }),
    );
    expect(metrics.targetCalories).toBeGreaterThanOrEqual(1200);
  });

  it("never drops target calories below the male floor of 1500", () => {
    const metrics = calculateMetrics(
      form({ sex: "male", age: "70", height: "165", weight: "55", targetWeight: "52", activity: "sedentary", pace: "0.75" }),
    );
    expect(metrics.targetCalories).toBeGreaterThanOrEqual(1500);
  });

  it("rounds target calories to the nearest 25", () => {
    const metrics = calculateMetrics(form());
    expect(metrics.targetCalories % 25).toBe(0);
  });
});

describe("calculateMetrics — macros", () => {
  it("gives the high-protein diet style more protein per kg than balanced", () => {
    const balanced = calculateMetrics(form({ dietStyle: "balanced" }));
    const highProtein = calculateMetrics(form({ dietStyle: "highProtein" }));
    expect(highProtein.protein).toBeGreaterThanOrEqual(balanced.protein);
  });

  it("gives the mediterranean style a higher fat ratio", () => {
    const balanced = calculateMetrics(form({ dietStyle: "balanced" }));
    const mediterranean = calculateMetrics(form({ dietStyle: "mediterranean" }));
    expect(mediterranean.fat).toBeGreaterThan(balanced.fat);
  });

  it("keeps carbs at or above the 80g floor", () => {
    const metrics = calculateMetrics(
      form({ dietStyle: "highProtein", sex: "female", weight: "50", targetWeight: "48" }),
    );
    expect(metrics.carbs).toBeGreaterThanOrEqual(80);
  });

  it("computes fiber as max(25, 14g per 1000 kcal)", () => {
    const metrics = calculateMetrics(form());
    expect(metrics.fiber).toBe(
      Math.max(25, Math.round((metrics.targetCalories / 1000) * 14)),
    );
  });
});

describe("bmiLabel", () => {
  it.each([
    [17, "کمتر از محدوده مرجع"],
    [22, "محدوده مرجع"],
    [27, "بالاتر از محدوده مرجع"],
    [32, "نیازمند توجه بیشتر"],
  ])("labels a BMI of %s as %s", (bmi, expected) => {
    expect(bmiLabel(bmi)).toBe(expected);
  });
});

describe("getValidationMessage — step 1 (existing hard gates, preserved per ADR-0001)", () => {
  it("rejects age under 18", () => {
    expect(getValidationMessage(form({ age: "16" }), 1)).not.toBe("");
  });

  it("rejects age over 80", () => {
    expect(getValidationMessage(form({ age: "85" }), 1)).not.toBe("");
  });

  it("accepts age at the boundaries (18 and 80)", () => {
    expect(getValidationMessage(form({ age: "18" }), 1)).toBe("");
    expect(getValidationMessage(form({ age: "80" }), 1)).toBe("");
  });

  it("rejects height outside 130–220 cm", () => {
    expect(getValidationMessage(form({ height: "120" }), 1)).not.toBe("");
    expect(getValidationMessage(form({ height: "230" }), 1)).not.toBe("");
  });

  it("rejects weight outside 40–250 kg", () => {
    expect(getValidationMessage(form({ weight: "30" }), 1)).not.toBe("");
    expect(getValidationMessage(form({ weight: "260" }), 1)).not.toBe("");
  });

  it("rejects a BMI under 18.5", () => {
    expect(getValidationMessage(form({ height: "180", weight: "55" }), 1)).not.toBe("");
  });

  it("rejects non-numeric input", () => {
    expect(getValidationMessage(form({ age: "abc" }), 1)).not.toBe("");
  });
});

describe("getValidationMessage — step 2", () => {
  it("rejects a target weight at or above current weight", () => {
    expect(
      getValidationMessage(form({ weight: "80", targetWeight: "80" }), 2),
    ).not.toBe("");
  });

  it("rejects a target weight under 40kg", () => {
    expect(getValidationMessage(form({ targetWeight: "35" }), 2)).not.toBe("");
  });

  it("rejects a target BMI under 18.5", () => {
    expect(
      getValidationMessage(form({ height: "180", weight: "90", targetWeight: "58" }), 2),
    ).not.toBe("");
  });

  it("accepts a sane target weight", () => {
    expect(
      getValidationMessage(form({ weight: "80", targetWeight: "72" }), 2),
    ).toBe("");
  });
});

describe("getValidationMessage — step 4", () => {
  it("rejects an overly long dislikes list", () => {
    expect(
      getValidationMessage(form({ dislikes: "غذا ".repeat(30) }), 4),
    ).not.toBe("");
  });

  it("accepts a short dislikes list", () => {
    expect(getValidationMessage(form({ dislikes: "قارچ، بادمجان" }), 4)).toBe("");
  });
});
