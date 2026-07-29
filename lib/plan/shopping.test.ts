import { describe, expect, it } from "vitest";
import {
  buildShoppingGroups,
  buildShoppingList,
  categoryForIngredient,
  shoppingListNote,
} from "@/lib/plan/shopping";
import { buildWeeklyPlan } from "@/lib/plan/build";
import { calculateMetrics } from "@/lib/nutrition/formulas";
import { defaultForm } from "@/lib/food/catalogue";
import type { DayPlan } from "@/lib/types";

describe("categoryForIngredient", () => {
  it.each([
    ["مرغ", "protein"],
    ["ماست", "protein"],
    ["برنج", "grain"],
    ["عدس", "legume"],
    ["گردو", "fat"],
    ["زعفران", "pantry"],
    ["خیار", "produce"],
  ])("categorizes %s as %s", (ingredient, category) => {
    expect(categoryForIngredient(ingredient)).toBe(category);
  });
});

describe("buildShoppingGroups", () => {
  it("de-duplicates repeated ingredients across the week and counts occurrences (round 2)", () => {
    const day: DayPlan = {
      id: "d1",
      label: "روز ۱",
      shortLabel: "۱",
      calories: 0,
      protein: 0,
      fiber: 0,
      meals: [
        {
          id: "m1",
          slot: "lunch",
          title: "test",
          serving: "",
          ingredients: ["مرغ", "برنج"],
          calories: 400,
          protein: 30,
          fiber: 5,
          prep: 20,
          batchFriendly: true,
          allergens: [],
          styles: ["balanced"],
          displaySlot: "ناهار",
          targetCalories: 400,
          targetProtein: 30,
          targetFiber: 5,
          portionCue: "",
        },
      ],
    };
    const groups = buildShoppingGroups([day, day]);
    const proteinGroup = groups.find((g) => g.title === "منابع پروتئین");
    expect(proteinGroup?.items).toEqual(["مرغ"]);
    expect(proteinGroup?.entries).toEqual([{ name: "مرغ", count: 2 }]);
  });

  it("omits empty categories entirely", () => {
    const groups = buildShoppingGroups([]);
    expect(groups).toEqual([]);
  });

  it("sorts items within each group", () => {
    const f = { ...defaultForm };
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const groups = buildShoppingGroups(plan);
    for (const group of groups) {
      expect(group.items).toEqual([...group.items].sort());
    }
  });

  it("keeps entries and items in the same order and content", () => {
    const f = { ...defaultForm };
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const groups = buildShoppingGroups(plan);
    for (const group of groups) {
      expect(group.entries.map((e) => e.name)).toEqual(group.items);
    }
  });

  it("gives every entry a count of at least 1, matching real meal usage", () => {
    const f = { ...defaultForm };
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const groups = buildShoppingGroups(plan);
    const allIngredients = plan.flatMap((d) => d.meals).flatMap((m) => m.ingredients);
    for (const group of groups) {
      for (const entry of group.entries) {
        expect(entry.count).toBe(
          allIngredients.filter((ingredient) => ingredient === entry.name).length,
        );
      }
    }
  });
});

describe("buildShoppingList", () => {
  it("bundles the grouped items with the count-disclosure note (round 2)", () => {
    const f = { ...defaultForm };
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const list = buildShoppingList(plan);
    expect(list.groups).toEqual(buildShoppingGroups(plan));
    expect(list.note).toBe(shoppingListNote);
    expect(list.note).toMatch(/چند وعده/);
  });
});
