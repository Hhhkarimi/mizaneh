import { describe, expect, it } from "vitest";
import { estimateAdultEnergy } from "@/lib/calculations/energy/nasem2023";

describe("NASEM 2023 EER equations", () => {
  it("applies the women low-active equation with centimetres and kilograms", () => {
    const result = estimateAdultEnergy({ sex: "female", age: 32, heightCm: 170, weightKg: 78, activity: "light" });
    expect(result.estimate).toBe(Math.round(575.77 - 7.01 * 32 + 6.6 * 170 + 12.14 * 78));
    expect(result.uncertaintyKcal).toBe(200);
  });

  it("uses the 14–18 equation plus growth energy for an 18-year-old", () => {
    const result = estimateAdultEnergy({ sex: "female", age: 18, heightCm: 165, weightKg: 60, activity: "sedentary" });
    expect(result.estimate).toBe(Math.round(55.59 - 22.25 * 18 + 8.43 * 165 + 17.07 * 60 + 20));
    expect(result.uncertaintyKcal).toBe(175);
    expect(result.equationLabel).toContain("14-18");
  });

  it("applies the men active equation", () => {
    const result = estimateAdultEnergy({ sex: "male", age: 45, heightCm: 182, weightKg: 95, activity: "moderate" });
    expect(result.estimate).toBe(Math.round(1004.82 - 10.83 * 45 + 6.52 * 182 + 15.91 * 95));
    expect(result.uncertaintyKcal).toBe(275);
  });
});
