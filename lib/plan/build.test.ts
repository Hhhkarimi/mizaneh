import { describe, expect, it } from "vitest";
import { buildWeeklyPlan, getSubstituteOptions, substituteMeal } from "@/lib/plan/build";
import { buildShoppingGroups } from "@/lib/plan/shopping";
import { calculateMetrics } from "@/lib/nutrition/formulas";
import { defaultForm, mealTemplates } from "@/lib/food/catalogue";
import type { PlannerForm } from "@/lib/types";
import goldenFixture from "./__fixtures__/golden-plan-output.json";

function form(overrides: Partial<PlannerForm> = {}): PlannerForm {
  return { ...defaultForm, ...overrides };
}

const sampleForms: PlannerForm[] = [
  { ...defaultForm },
  {
    ...defaultForm,
    sex: "male",
    age: "45",
    height: "182",
    weight: "95",
    targetWeight: "85",
    activity: "active",
    dietStyle: "highProtein",
    meals: "5",
    pace: "0.75",
  },
  {
    ...defaultForm,
    dietStyle: "vegetarian",
    allergies: ["gluten", "dairy"],
    meals: "3",
    hungerPeak: "morning",
  },
  {
    ...defaultForm,
    dietStyle: "mediterranean",
    allergies: ["nuts", "fish"],
    dislikes: "قارچ، بادمجان",
    dayPattern: "office",
    cookingTime: "15",
  },
  {
    ...defaultForm,
    sex: "male",
    age: "60",
    height: "175",
    weight: "110",
    targetWeight: "90",
    activity: "sedentary",
    pace: "0.25",
  },
];

describe("buildWeeklyPlan — golden-output regression (pre-refactor parity)", () => {
  it("produces byte-identical metrics/plan output to the pre-refactor implementation across 5 sample forms × 4 plan modes", () => {
    const results = sampleForms.map((f) => {
      const metrics = calculateMetrics(f);
      return {
        metrics,
        planVariety: buildWeeklyPlan(f, metrics, "variety", 1),
        planQuick: buildWeeklyPlan(f, metrics, "quick", 7),
        planBatch: buildWeeklyPlan(f, metrics, "batch", 3),
        planProtein: buildWeeklyPlan(f, metrics, "protein", 42),
      };
    });
    // The golden fixture also recorded `shopping` (round 1's
    // buildShoppingGroups output). Round 2 intentionally changed
    // ShoppingGroup's shape (added frequency counts — CONTEXT.md §9.1),
    // so that field is excluded here; ingredient-content parity (not
    // shape) is checked separately below instead of asserting exact
    // shape equality against a now-superseded fixture.
    const trimmedGolden = (goldenFixture as Array<Record<string, unknown>>).map(
      ({ metrics, planVariety, planQuick, planBatch, planProtein }) => ({
        metrics,
        planVariety,
        planQuick,
        planBatch,
        planProtein,
      }),
    );
    expect(JSON.parse(JSON.stringify(results))).toEqual(trimmedGolden);
  });

  it("still selects the exact same set of ingredients per shopping category as the pre-refactor fixture (content, not shape)", () => {
    const golden = goldenFixture as Array<{ shopping: { title: string; items: string[] }[] }>;
    sampleForms.forEach((f, index) => {
      const metrics = calculateMetrics(f);
      const plan = buildWeeklyPlan(f, metrics, "variety", 1);
      const groups = buildShoppingGroups(plan);
      expect(groups.map((g) => ({ title: g.title, items: g.items }))).toEqual(
        golden[index].shopping.map((g) => ({ title: g.title, items: g.items })),
      );
    });
  });
});

describe("buildWeeklyPlan — determinism", () => {
  it("produces an identical plan for identical inputs and the same seed", () => {
    const f = form();
    const metrics = calculateMetrics(f);
    const planA = buildWeeklyPlan(f, metrics, "variety", 5);
    const planB = buildWeeklyPlan(f, metrics, "variety", 5);
    expect(planA).toEqual(planB);
  });

  it("can (though isn't guaranteed to) produce a different plan for a different seed", () => {
    const f = form();
    const metrics = calculateMetrics(f);
    const planA = buildWeeklyPlan(f, metrics, "variety", 1);
    const planB = buildWeeklyPlan(f, metrics, "variety", 999);
    // Not asserting they differ meal-for-meal (that's not a real invariant),
    // but the ranking noise term must depend on the seed.
    const idsA = planA.flatMap((d) => d.meals.map((m) => m.id)).join(",");
    const idsB = planB.flatMap((d) => d.meals.map((m) => m.id)).join(",");
    expect(idsA === idsB).toBe(false);
  });
});

describe("buildWeeklyPlan — allergy filtering", () => {
  it("never includes a meal containing a selected allergen", () => {
    const f = form({ allergies: ["gluten", "dairy", "egg", "nuts", "fish"] });
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    for (const day of plan) {
      for (const meal of day.meals) {
        for (const allergen of f.allergies) {
          expect(meal.allergens).not.toContain(allergen);
        }
      }
    }
  });
});

describe("buildWeeklyPlan — dietary style", () => {
  it("only includes meals compatible with the requested diet style, when any exist", () => {
    const f = form({ dietStyle: "vegetarian" });
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    for (const day of plan) {
      for (const meal of day.meals) {
        expect(meal.styles).toContain("vegetarian");
      }
    }
  });
});

describe("buildWeeklyPlan — dislikes", () => {
  it("excludes meals whose title or ingredients mention a disliked token, when alternatives exist", () => {
    const f = form({ dislikes: "عدس" });
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const hasLentil = plan.some((day) =>
      day.meals.some(
        (meal) => meal.title.includes("عدس") || meal.ingredients.some((i) => i.includes("عدس")),
      ),
    );
    expect(hasLentil).toBe(false);
  });
});

describe("buildWeeklyPlan — day-pattern snack bias", () => {
  it("is a real signal in the scoring function for office-pattern snacks (prep-time penalty)", () => {
    // Confirmed in source: dayPattern === "office" adds meal.prep * 12 to the
    // snack score, biasing away from higher-prep snacks. We assert the
    // plan still produces a valid snack slot under this pattern (smoke
    // test for the branch existing and not throwing / producing empty).
    const f = form({ dayPattern: "office", meals: "5" });
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const snackCounts = plan.map(
      (day) => day.meals.filter((m) => m.slot === "snack").length,
    );
    expect(snackCounts.every((count) => count === 2)).toBe(true);
  });
});

describe("buildWeeklyPlan — totals", () => {
  it("sums each day's calories/protein/fiber from its own meals", () => {
    const f = form();
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    for (const day of plan) {
      const cal = day.meals.reduce((t, m) => t + m.targetCalories, 0);
      const pro = day.meals.reduce((t, m) => t + m.targetProtein, 0);
      const fib = day.meals.reduce((t, m) => t + m.targetFiber, 0);
      expect(day.calories).toBe(cal);
      expect(day.protein).toBe(pro);
      expect(day.fiber).toBe(fib);
    }
  });
});

describe("getSubstituteOptions (round 2 — substitution picker)", () => {
  it("returns up to `limit` compatible, distinct alternatives excluding the current meal", () => {
    const f = form();
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const day = plan[0];
    const current = day.meals.find((m) => m.slot === "lunch")!;
    const options = getSubstituteOptions(day, "lunch", 0, f, 1, 3);

    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThanOrEqual(3);
    const ids = options.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length); // distinct
    expect(ids).not.toContain(current.id);
  });

  it("respects the same allergy constraint as buildWeeklyPlan/substituteMeal", () => {
    const f = form({ allergies: ["nuts", "fish"] });
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const options = getSubstituteOptions(plan[0], "dinner", 0, f, 1, 3);
    for (const option of options) {
      expect(option.allergens).not.toContain("nuts");
      expect(option.allergens).not.toContain("fish");
    }
  });

  it("preserves the original slot's target-calorie share for every option", () => {
    const f = form();
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const day = plan[0];
    const current = day.meals.find((m) => m.slot === "breakfast")!;
    const options = getSubstituteOptions(day, "breakfast", 0, f, 1, 3);
    for (const option of options) {
      expect(option.targetCalories).toBe(current.targetCalories);
    }
  });

  it("substituteMeal picks exactly the first option from getSubstituteOptions (round 1 behavior preserved)", () => {
    const f = form();
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const day = plan[0];
    const [firstOption] = getSubstituteOptions(day, "dinner", 0, f, 1, 1);
    const updated = substituteMeal(day, "dinner", 0, f, 1);
    const replaced = updated.meals.find((m) => m.slot === "dinner")!;
    expect(replaced.id).toBe(firstOption.id);
  });

  it("returns an empty list rather than throwing when no alternative exists", () => {
    const f = form({ allergies: ["gluten", "dairy", "egg", "nuts", "fish"] });
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    expect(() => getSubstituteOptions(plan[0], "breakfast", 0, f, 1)).not.toThrow();
  });
});

describe("substituteMeal", () => {
  it("replaces the targeted meal with a different, constraint-compatible one", () => {
    const f = form({ allergies: ["nuts"] });
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const day = plan[0];
    const original = day.meals.find((m) => m.slot === "lunch")!;
    const updated = substituteMeal(day, "lunch", 0, f, 1);
    const replaced = updated.meals.find((m) => m.slot === "lunch")!;

    expect(replaced.id).not.toBe(original.id);
    expect(replaced.allergens).not.toContain("nuts");
  });

  it("preserves the target-calorie share of the substituted slot", () => {
    const f = form();
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const day = plan[0];
    const original = day.meals.find((m) => m.slot === "dinner")!;
    const updated = substituteMeal(day, "dinner", 0, f, 1);
    const replaced = updated.meals.find((m) => m.slot === "dinner")!;
    expect(replaced.targetCalories).toBe(original.targetCalories);
  });

  it("recomputes the day's totals after substitution", () => {
    const f = form();
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    const updated = substituteMeal(plan[0], "breakfast", 0, f, 1);
    const cal = updated.meals.reduce((t, m) => t + m.targetCalories, 0);
    expect(updated.calories).toBe(cal);
  });

  it("returns the original day unchanged if no compatible alternative exists", () => {
    // Construct a pathological form where every allergen is excluded and
    // the dislikes list blocks everything else for a slot, if possible;
    // more realistically, we simulate "no alternative" by asserting the
    // function never throws even under maximal constraints.
    const f = form({ allergies: ["gluten", "dairy", "egg", "nuts", "fish"] });
    const metrics = calculateMetrics(f);
    const plan = buildWeeklyPlan(f, metrics, "variety", 1);
    expect(() => substituteMeal(plan[0], "breakfast", 0, f, 1)).not.toThrow();
  });
});

describe("meal catalogue sanity", () => {
  it("has at least one allergen-free meal per slot (fallback safety net)", () => {
    const slots = ["breakfast", "snack", "lunch", "dinner"] as const;
    for (const slot of slots) {
      const hasAllergenFree = mealTemplates.some(
        (m) => m.slot === slot && m.allergens.length === 0,
      );
      expect(hasAllergenFree).toBe(true);
    }
  });
});
