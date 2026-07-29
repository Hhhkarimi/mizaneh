// Deterministic weekly meal-plan generation.
//
// buildWeeklyPlan's control flow, filters, and scoring formula are
// extracted verbatim from the original DietPlanner.tsx (deduplicated into
// two small shared helpers, candidateMeals/scoreMeal, but producing
// byte-identical output — see lib/plan/build.test.ts's golden-output
// regression test). substituteMeal (new, per spec user story 10) reuses
// those same helpers rather than re-implementing selection logic.
//
// Determinism: hashValue is a pure string hash (no Math.random anywhere
// in this module), and variationSeed is an explicit parameter threaded in
// by the caller — see CONTEXT.md §8.4 / ADR discussion on determinism.

import type {
  BreakfastTaste,
  DayPlan,
  DietStyle,
  Metrics,
  MealSlot,
  MealTemplate,
  PlanMode,
  PlannerForm,
  PlannedMeal,
} from "@/lib/types";
import { days, mealTemplates } from "@/lib/food/catalogue";

export function getSlotShares(form: PlannerForm) {
  let breakfast = form.meals === "5" ? 0.22 : form.meals === "4" ? 0.24 : 0.28;
  let lunch = form.meals === "5" ? 0.34 : form.meals === "4" ? 0.36 : 0.4;
  let dinner = form.meals === "5" ? 0.26 : form.meals === "4" ? 0.3 : 0.32;
  const snackTotal = Math.max(0, 1 - breakfast - lunch - dinner);

  if (form.hungerPeak === "morning") {
    breakfast += 0.04;
    dinner -= 0.03;
    lunch -= 0.01;
  } else if (form.hungerPeak === "afternoon") {
    lunch += 0.03;
    breakfast -= 0.02;
    dinner -= 0.01;
  } else {
    dinner += 0.04;
    breakfast -= 0.03;
    lunch -= 0.01;
  }

  return { breakfast, lunch, dinner, snackTotal };
}

export function getDaySlots(form: PlannerForm) {
  const shares = getSlotShares(form);
  const slots: Array<{ slot: MealSlot; label: string; share: number }> = [
    { slot: "breakfast", label: "صبحانه", share: shares.breakfast },
  ];

  if (form.meals === "5") {
    slots.push({
      slot: "snack",
      label: "میان‌وعده صبح",
      share: shares.snackTotal / 2,
    });
  }

  slots.push({ slot: "lunch", label: "ناهار", share: shares.lunch });

  if (form.meals !== "3") {
    slots.push({
      slot: "snack",
      label: "میان‌وعده عصر",
      share: form.meals === "5" ? shares.snackTotal / 2 : shares.snackTotal,
    });
  }

  slots.push({ slot: "dinner", label: "شام", share: shares.dinner });
  return slots;
}

export function hashValue(value: string) {
  return Array.from(value).reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) % 1009,
    17,
  );
}

export function dislikeTokens(value: string) {
  return value
    .split(/[،,\s]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1);
}

export function portionCue(scale: number) {
  if (scale < 0.84) return "سهم غله یا سیب‌زمینی را کمی کمتر کن.";
  if (scale > 1.18) return "یک سهم کوچک غله یا پروتئین اضافه کن.";
  return "همان سهم نوشته‌شده مناسب است.";
}

function containsDisliked(meal: MealTemplate, disliked: string[]) {
  return disliked.some((token) =>
    `${meal.title} ${meal.ingredients.join(" ")}`.includes(token),
  );
}

/**
 * Candidate meals for one slot, honoring diet style, allergies, cooking
 * time, breakfast taste, and dislikes — with the same "relax cooking-time
 * and breakfast-taste filters before ever violating an allergy" fallback
 * the original inlined twice. Shared by buildWeeklyPlan and substituteMeal
 * so both use exactly one implementation of this rule.
 */
export function candidateMeals(options: {
  slot: MealSlot;
  dietStyle: DietStyle;
  allergies: PlannerForm["allergies"];
  cookingTimeMinutes: number;
  breakfastTaste: BreakfastTaste;
  disliked: string[];
}): MealTemplate[] {
  const {
    slot,
    dietStyle,
    allergies,
    cookingTimeMinutes,
    breakfastTaste,
    disliked,
  } = options;

  const filtered = mealTemplates
    .filter((meal) => meal.slot === slot)
    .filter((meal) => meal.styles.includes(dietStyle))
    .filter(
      (meal) => !meal.allergens.some((allergen) => allergies.includes(allergen)),
    )
    .filter((meal) => slot === "snack" || meal.prep <= cookingTimeMinutes + 10)
    .filter((meal) => {
      if (
        slot === "breakfast" &&
        breakfastTaste !== "both" &&
        meal.breakfastTaste !== breakfastTaste
      ) {
        return false;
      }
      return !containsDisliked(meal, disliked);
    });

  const allergySafe = mealTemplates
    .filter((meal) => meal.slot === slot)
    .filter(
      (meal) => !meal.allergens.some((allergen) => allergies.includes(allergen)),
    )
    .filter((meal) => !containsDisliked(meal, disliked));

  return filtered.length > 0 ? filtered : allergySafe;
}

/**
 * Deterministic score for ranking a candidate meal into a specific
 * day/slot/seed combination — identical formula to the original inline
 * `score` closure inside buildWeeklyPlan.
 */
export function scoreMeal(
  meal: MealTemplate,
  context: {
    targetCalories: number;
    mode: PlanMode;
    mealPrep: PlannerForm["mealPrep"];
    dayPattern: PlannerForm["dayPattern"];
    slot: MealSlot;
    dayIndex: number;
    slotIndex: number;
    variationSeed: number;
    alreadyUsed: boolean;
  },
) {
  const {
    targetCalories,
    mode,
    mealPrep,
    dayPattern,
    slot,
    dayIndex,
    slotIndex,
    variationSeed,
    alreadyUsed,
  } = context;

  let result = Math.abs(meal.calories - targetCalories);
  if (alreadyUsed) result += 2500;
  if (mode === "quick") result += meal.prep * 22;
  if (mode === "batch" && !meal.batchFriendly) result += 900;
  if (mode === "protein") {
    result -= (meal.protein / meal.calories) * 3600;
  }
  if (mealPrep === "batch" && !meal.batchFriendly) result += 500;
  if (dayPattern === "office" && slot === "snack") {
    result += meal.prep * 12;
  }
  result +=
    (hashValue(`${meal.id}-${dayIndex}-${slotIndex}-${variationSeed}`) % 140) -
    70;
  return result;
}

function toPlannedMeal(
  selected: MealTemplate,
  slotLabel: string,
  targetCalories: number,
): PlannedMeal {
  const scale = Math.min(1.35, Math.max(0.7, targetCalories / selected.calories));
  return {
    ...selected,
    displaySlot: slotLabel,
    targetCalories,
    targetProtein: Math.round(selected.protein * scale),
    targetFiber: Math.round(selected.fiber * scale),
    portionCue: portionCue(scale),
  };
}

export function buildWeeklyPlan(
  form: PlannerForm,
  metrics: Metrics,
  mode: PlanMode,
  variationSeed: number,
): DayPlan[] {
  const used = new Map<MealSlot, Set<string>>([
    ["breakfast", new Set()],
    ["snack", new Set()],
    ["lunch", new Set()],
    ["dinner", new Set()],
  ]);
  const disliked = dislikeTokens(form.dislikes);
  const slots = getDaySlots(form);

  return days.map((day, dayIndex) => {
    const plannedMeals = slots.map((slot, slotIndex) => {
      const targetCalories = Math.round(metrics.targetCalories * slot.share);
      const candidates = candidateMeals({
        slot: slot.slot,
        dietStyle: form.dietStyle,
        allergies: form.allergies,
        cookingTimeMinutes: Number(form.cookingTime),
        breakfastTaste: form.breakfastTaste,
        disliked,
      });

      const ranked = [...candidates].sort(
        (a, b) =>
          scoreMeal(a, {
            targetCalories,
            mode,
            mealPrep: form.mealPrep,
            dayPattern: form.dayPattern,
            slot: slot.slot,
            dayIndex,
            slotIndex,
            variationSeed,
            alreadyUsed: used.get(slot.slot)?.has(a.id) ?? false,
          }) -
          scoreMeal(b, {
            targetCalories,
            mode,
            mealPrep: form.mealPrep,
            dayPattern: form.dayPattern,
            slot: slot.slot,
            dayIndex,
            slotIndex,
            variationSeed,
            alreadyUsed: used.get(slot.slot)?.has(b.id) ?? false,
          }),
      );

      const selected =
        ranked[0] ??
        mealTemplates.find(
          (meal) => meal.slot === slot.slot && meal.allergens.length === 0,
        ) ??
        mealTemplates[0];
      used.get(slot.slot)?.add(selected.id);

      return toPlannedMeal(selected, slot.label, targetCalories);
    });

    return {
      ...day,
      meals: plannedMeals,
      calories: plannedMeals.reduce((total, meal) => total + meal.targetCalories, 0),
      protein: plannedMeals.reduce((total, meal) => total + meal.targetProtein, 0),
      fiber: plannedMeals.reduce((total, meal) => total + meal.targetFiber, 0),
    };
  });
}

/**
 * Round 2: applies a specific, already-chosen replacement (e.g. one the
 * user picked from `getSubstituteOptions`) into a slot/occurrence,
 * recomputing the day's totals. No ranking happens here — this is the
 * "apply the choice" half of what `substituteMeal` used to do in one
 * step; `substituteMeal` itself still exists unchanged for round 1
 * callers that want the single-automatic-swap behavior.
 */
export function applySubstitution(
  day: DayPlan,
  slot: MealSlot,
  occurrence: number,
  replacement: PlannedMeal,
): DayPlan {
  const current = getMeal(day, slot, occurrence);
  if (!current) return day;
  const slotIndex = day.meals.findIndex((meal) => meal === current);
  const meals = day.meals.map((meal, index) =>
    index === slotIndex ? replacement : meal,
  );
  return {
    ...day,
    meals,
    calories: meals.reduce((total, meal) => total + meal.targetCalories, 0),
    protein: meals.reduce((total, meal) => total + meal.targetProtein, 0),
    fiber: meals.reduce((total, meal) => total + meal.targetFiber, 0),
  };
}

export function getMeal(day: DayPlan, slot: MealSlot, occurrence = 0) {
  return day.meals.filter((meal) => meal.slot === slot)[occurrence];
}

/**
 * Round 2 (spec user story 24): the ranked list of compatible
 * alternatives for a given slot occurrence, so the UI can offer a picker
 * instead of a single automatic swap. Reuses the exact same
 * `candidateMeals`/`scoreMeal` logic `buildWeeklyPlan`/`substituteMeal`
 * already use — no new ranking rule was invented for this.
 */
export function getSubstituteOptions(
  day: DayPlan,
  slot: MealSlot,
  occurrence: number,
  form: PlannerForm,
  variationSeed: number,
  limit = 3,
) {
  const current = getMeal(day, slot, occurrence);
  if (!current) return [];

  const disliked = dislikeTokens(form.dislikes);
  const candidates = candidateMeals({
    slot,
    dietStyle: form.dietStyle,
    allergies: form.allergies,
    cookingTimeMinutes: Number(form.cookingTime),
    breakfastTaste: form.breakfastTaste,
    disliked,
  }).filter((meal) => meal.id !== current.id);

  if (candidates.length === 0) return [];

  const dayIndex = days.findIndex((d) => d.id === day.id);
  const slotIndex = day.meals.findIndex((meal) => meal === current);

  const ranked = [...candidates].sort(
    (a, b) =>
      scoreMeal(a, {
        targetCalories: current.targetCalories,
        mode: "variety",
        mealPrep: form.mealPrep,
        dayPattern: form.dayPattern,
        slot,
        dayIndex,
        slotIndex,
        variationSeed: variationSeed + 1,
        alreadyUsed: false,
      }) -
      scoreMeal(b, {
        targetCalories: current.targetCalories,
        mode: "variety",
        mealPrep: form.mealPrep,
        dayPattern: form.dayPattern,
        slot,
        dayIndex,
        slotIndex,
        variationSeed: variationSeed + 1,
        alreadyUsed: false,
      }),
  );

  return ranked.slice(0, limit).map((meal) =>
    toPlannedMeal(meal, current.displaySlot, current.targetCalories),
  );
}

/**
 * Substitute one planned meal for another compatible template in the
 * same slot, honoring the same allergy/dislike/style constraints
 * buildWeeklyPlan already enforces, re-scaled to the same target-calorie
 * share. Round 2 implements this as "apply the top-ranked option from
 * getSubstituteOptions" — identical behavior/output to round 1, now
 * sharing one implementation with the new picker instead of two.
 */
export function substituteMeal(
  day: DayPlan,
  slot: MealSlot,
  occurrence: number,
  form: PlannerForm,
  variationSeed: number,
): DayPlan {
  const current = getMeal(day, slot, occurrence);
  if (!current) return day;

  const [replacement] = getSubstituteOptions(day, slot, occurrence, form, variationSeed, 1);
  if (!replacement) return day;

  const slotIndex = day.meals.findIndex((meal) => meal === current);
  const meals = day.meals.map((meal, index) =>
    index === slotIndex ? replacement : meal,
  );

  return {
    ...day,
    meals,
    calories: meals.reduce((total, meal) => total + meal.targetCalories, 0),
    protein: meals.reduce((total, meal) => total + meal.targetProtein, 0),
    fiber: meals.reduce((total, meal) => total + meal.targetFiber, 0),
  };
}
