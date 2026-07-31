import { describe, expect, it } from "vitest";
import { mealTemplates } from "@/lib/food/catalogue";
import { estimateMealNutrition } from "@/lib/food/nutrition-estimates";
import type { MealTemplate } from "@/lib/types";

describe("catalogue nutrition estimates", () => {
  it("provides the supported macro and cardiometabolic nutrient fields for every meal", () => {
    for (const meal of mealTemplates) {
      expect(meal.carbs).toBeGreaterThanOrEqual(0);
      expect(meal.fat).toBeGreaterThanOrEqual(0);
      expect(meal.saturatedFat).toBeGreaterThanOrEqual(0);
      expect(meal.sodiumMg).toBeGreaterThanOrEqual(0);
      expect(meal.addedSugar).toBeGreaterThanOrEqual(0);
      expect(meal.potassiumMg).toBeGreaterThanOrEqual(0);
      expect(meal.calciumMg).toBeGreaterThanOrEqual(0);
      expect(meal.ironMg).toBeGreaterThanOrEqual(0);
      expect(meal.magnesiumMg).toBeGreaterThanOrEqual(0);
      expect(meal.phosphorusMg).toBeGreaterThanOrEqual(0);
      expect(meal.zincMg).toBeGreaterThanOrEqual(0);
      expect(meal.folateMcg).toBeGreaterThanOrEqual(0);
      expect(meal.iodineMcg).toBeGreaterThanOrEqual(0);
      expect(meal.vitaminB12Mcg).toBeGreaterThanOrEqual(0);
      expect(meal.vitaminDMcg).toBeGreaterThanOrEqual(0);
      expect(meal.cholineMg).toBeGreaterThanOrEqual(0);
      expect(meal.nutritionCompleteness).toBe("estimated");
      expect(meal.sourceNote).toContain("برآورد");
    }
  });

  it("preserves verified values instead of overwriting them", () => {
    const verified: MealTemplate = {
      ...mealTemplates[0],
      carbs: 42,
      fat: 12,
      saturatedFat: 2,
      sodiumMg: 240,
      addedSugar: 0,
      potassiumMg: 480,
      nutritionCompleteness: "complete",
      nutritionSource: "verified",
    };
    expect(estimateMealNutrition(verified)).toEqual(verified);
  });
});
