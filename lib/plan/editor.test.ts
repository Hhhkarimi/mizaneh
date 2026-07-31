import { describe, expect, it } from "vitest";
import { defaultForm } from "@/lib/food/catalogue";
import { calculateMetrics } from "@/lib/nutrition/formulas";
import { buildWeeklyPlan } from "@/lib/plan/build";
import {
  addCustomMeal,
  addCustomRecipe,
  changeMealPortion,
  createHistory,
  duplicateDay,
  duplicateMeal,
  ensurePlanIdentity,
  evaluatePlanCompatibility,
  lockDay,
  lockMeal,
  moveMeal,
  redoHistory,
  removeMeal,
  renameDay,
  renameMeal,
  summarizePlan,
  undoHistory,
} from "@/lib/plan/editor";

function day() {
  return ensurePlanIdentity(buildWeeklyPlan(defaultForm, calculateMetrics(defaultForm), "variety", 1))[0];
}

describe("meal plan editing commands", () => {
  it("recalculates totals after portion changes", () => {
    const original = day();
    const meal = original.meals[0];
    const next = changeMealPortion(original, meal.instanceId!, 1.5);
    expect(next.calories).toBeGreaterThan(original.calories);
    expect(next.meals[0].targetCalories).toBe(Math.round(meal.targetCalories * 1.5));
  });

  it("can rename, remove, duplicate and move a meal", () => {
    const original = day();
    const id = original.meals[0].instanceId!;
    expect(renameMeal(original, id, "صبحانهٔ من").meals[0].title).toBe("صبحانهٔ من");
    expect(removeMeal(original, id).meals).toHaveLength(original.meals.length - 1);
    const duplicated = duplicateMeal(original, id);
    expect(duplicated.meals).toHaveLength(original.meals.length + 1);
    expect(moveMeal(original, id, original.meals.length - 1).meals.at(-1)?.instanceId).toBe(id);
  });

  it("respects meal and day locks", () => {
    const original = day();
    const id = original.meals[0].instanceId!;
    const mealLocked = lockMeal(original, id, true);
    expect(removeMeal(mealLocked, id)).toEqual(mealLocked);
    const dayLocked = lockDay(original, true);
    expect(renameDay(dayLocked, "روز تازه")).toEqual(dayLocked);
  });

  it("supports custom user-entered foods with incomplete-data labelling", () => {
    const original = day();
    const next = addCustomMeal(original, {
      title: "غذای سفارشی",
      displaySlot: "میان‌وعده",
      slot: "snack",
      servingAmount: 150,
      servingUnit: "گرم",
      calories: 250,
      protein: 12,
      fiber: 4,
      potassiumMg: 500,
      calciumMg: 120,
      ironMg: 3.2,
      phosphorusMg: 260,
      folateMcg: 90,
      iodineMcg: 45,
      vitaminB12Mcg: 1.4,
      vitaminDMcg: 2.5,
      cholineMg: 110,
      ingredients: ["مادهٔ سفارشی"],
    });
    expect(next.meals.at(-1)?.userEntered).toBe(true);
    expect(next.meals.at(-1)?.servingAmount).toBe(150);
    expect(next.meals.at(-1)?.servingUnit).toBe("گرم");
    expect(next.meals.at(-1)?.targetPotassiumMg).toBe(500);
    expect(next.meals.at(-1)?.targetIronMg).toBe(3.2);
    expect(next.meals.at(-1)?.targetFolateMcg).toBe(90);
    expect(next.nutritionCompleteness).toBe("user_entered");
  });

  it("bounds custom-food nutrition and keeps serving amount/unit structured", () => {
    const next = addCustomMeal(day(), {
      title: "ورودی نامعتبر",
      displaySlot: "میان‌وعده",
      slot: "snack",
      servingAmount: Number.NaN,
      servingUnit: "گرم",
      calories: 9000,
      protein: 900,
      carbs: -5,
      fat: 900,
      fiber: 300,
      ingredients: [],
    });
    const meal = next.meals.at(-1)!;
    expect(meal.servingAmount).toBe(1);
    expect(meal.targetCalories).toBe(5000);
    expect(meal.targetProtein).toBe(500);
    expect(meal.targetCarbs).toBe(0);
    expect(meal.targetFat).toBe(500);
    expect(meal.targetFiber).toBe(100);
  });

  it("does not silently mark a custom food allergy-safe when allergies are registered", () => {
    const original = day();
    const edited = addCustomMeal(original, {
      title: "غذای سفارشی",
      displaySlot: "میان‌وعده",
      slot: "snack",
      servingAmount: 1,
      servingUnit: "سهم",
      calories: 200,
      protein: 8,
      fiber: 3,
      ingredients: ["مادهٔ بدون برچسب"],
    });
    const issues = evaluatePlanCompatibility([edited], { ...defaultForm, allergies: ["nuts"] });
    expect(issues.some((item) => item.kind === "allergy" && item.message.includes("تأیید نشده"))).toBe(true);
    expect(issues.some((item) => item.kind === "diet_style" && item.message.includes("تأیید نشده"))).toBe(true);
  });

  it("duplicates a day without sharing mutable meal identities", () => {
    const original = day();
    const copy = duplicateDay(original, "copy-id", "کپی شنبه");
    expect(copy.id).toBe("copy-id");
    expect(copy.meals[0].instanceId).not.toBe(original.meals[0].instanceId);
  });

  it("supports undo and redo snapshots", () => {
    const original = [day()];
    let history = createHistory(original);
    const changed = [{ ...original[0], name: "نسخهٔ ویرایش‌شده" }];
    history = { past: [history.present], present: changed, future: [] };
    history = undoHistory(history);
    expect(history.present[0].name).not.toBe("نسخهٔ ویرایش‌شده");
    history = redoHistory(history);
    expect(history.present[0].name).toBe("نسخهٔ ویرایش‌شده");
  });

  it("checks allergy and dietary-pattern compatibility after edits", () => {
    const original = day();
    const result = evaluatePlanCompatibility([original], {
      ...defaultForm,
      allergies: ["gluten"],
      dietStyle: "vegetarian",
    });
    expect(result.some((item) => item.kind === "allergy")).toBe(true);
    expect(result.some((item) => item.kind === "diet_style")).toBe(true);
  });
});

describe("plan nutrition summaries and recipes", () => {
  it("recalculates weekly averages after edits", () => {
    const days = ensurePlanIdentity(buildWeeklyPlan(defaultForm, calculateMetrics(defaultForm), "variety", 1));
    const first = days[0];
    const edited = changeMealPortion(first, first.meals[0].instanceId!, 2);
    const summary = summarizePlan([edited, ...days.slice(1)]);
    expect(summary.dayCount).toBe(days.length);
    expect(summary.weeklyCalories).toBeGreaterThan(0);
    expect(summary.averageCalories).toBeCloseTo(summary.weeklyCalories / days.length);
  });

  it("calculates a custom recipe per serving and preserves raw/cooked state", () => {
    const days = ensurePlanIdentity(buildWeeklyPlan(defaultForm, calculateMetrics(defaultForm), "variety", 1));
    const edited = addCustomRecipe(days[0], {
      title: "خوراک آزمایشی",
      displaySlot: "ناهار",
      slot: "lunch",
      serving: "یک کاسه",
      totalYield: 800,
      yieldUnit: "گرم",
      servings: 4,
      ingredients: [
        { id: "i1", name: "عدس", quantity: 200, unit: "گرم", state: "raw", calories: 600, protein: 40, carbs: 100, fat: 4, fiber: 30, potassiumMg: 900, ironMg: 8, folateMcg: 450, phosphorusMg: 500 },
        { id: "i2", name: "برنج", quantity: 300, unit: "گرم", state: "cooked", calories: 390, protein: 8, carbs: 84, fat: 1, fiber: 2, potassiumMg: 150, ironMg: 1.2, folateMcg: 20, phosphorusMg: 120 },
      ],
    });
    const recipe = edited.meals.at(-1)!;
    expect(recipe.targetCalories).toBe(Math.round(990 / 4));
    expect(recipe.recipe?.servings).toBe(4);
    expect(recipe.recipe?.ingredients[0].state).toBe("raw");
    expect(recipe.targetPotassiumMg).toBe(Math.round(1050 / 4));
    expect(recipe.targetIronMg).toBe(2.3);
    expect(recipe.targetFolateMcg).toBe(Math.round(470 / 4));
    expect(recipe.userEntered).toBe(true);
  });

  it("normalizes invalid custom-recipe numeric fields instead of persisting NaN", () => {
    const edited = addCustomRecipe(day(), {
      title: "دستور نامعتبر",
      displaySlot: "ناهار",
      slot: "lunch",
      serving: "یک سهم",
      totalYield: Number.NaN,
      yieldUnit: "گرم",
      servings: Number.NaN,
      ingredients: [
        { id: "i1", name: "ماده", quantity: 1, unit: "گرم", state: "raw", calories: Number.NaN, protein: Number.NaN, carbs: Number.NaN, fat: Number.NaN, fiber: Number.NaN },
      ],
    });
    const recipe = edited.meals.at(-1)!;
    expect(recipe.recipe?.servings).toBe(1);
    expect(recipe.recipe?.totalYield).toBe(0);
    expect(recipe.targetCalories).toBe(0);
    expect(Number.isFinite(recipe.targetProtein)).toBe(true);
  });
});
