import type { CustomRecipeIngredient, DayPlan, MealSlot, PlannedMeal, PlannerForm } from "@/lib/types";

export type PlanHistory = {
  past: DayPlan[][];
  present: DayPlan[];
  future: DayPlan[][];
};

export type PlanNutritionSummary = {
  dayCount: number;
  weeklyCalories: number;
  averageCalories: number;
  averageProtein: number;
  averageFiber: number;
  averageCarbs?: number;
  averageFat?: number;
  averageSaturatedFat?: number;
  averageSodiumMg?: number;
  averageAddedSugar?: number;
  averagePotassiumMg?: number;
  nutritionCompleteness: "complete" | "estimated" | "partial" | "user_entered";
};


export function ensurePlanIdentity(days: DayPlan[]): DayPlan[] {
  return days.map((day, dayIndex) => ({
    ...day,
    nutritionCompleteness: day.nutritionCompleteness ?? "partial",
    meals: day.meals.map((meal, mealIndex) => ({
      ...meal,
      instanceId: meal.instanceId ?? `meal-${day.id}-${dayIndex}-${mealIndex}`,
      portionMultiplier: meal.portionMultiplier ?? 1,
      nutritionCompleteness: meal.nutritionCompleteness ?? "partial",
    })),
  }));
}

export type CompatibilityIssue = {
  kind: "allergy" | "diet_style" | "goal" | "nutrition_incomplete";
  dayId: string;
  mealInstanceId?: string;
  message: string;
};

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function recalculateDay(day: DayPlan): DayPlan {
  const meals = day.meals;
  const optionalTotal = (key: "targetCarbs" | "targetFat" | "targetSaturatedFat" | "targetSodiumMg" | "targetAddedSugar" | "targetPotassiumMg") =>
    meals.every((meal) => typeof meal[key] === "number")
      ? meals.reduce((sum, meal) => sum + (meal[key] ?? 0), 0)
      : undefined;
  const completeness = meals.some((meal) => meal.userEntered)
    ? "user_entered"
    : meals.every((meal) => meal.nutritionCompleteness === "complete")
      ? "complete"
      : meals.every((meal) => meal.nutritionCompleteness === "complete" || meal.nutritionCompleteness === "estimated")
        ? "estimated"
        : "partial";
  return {
    ...day,
    calories: meals.reduce((sum, meal) => sum + meal.targetCalories, 0),
    protein: meals.reduce((sum, meal) => sum + meal.targetProtein, 0),
    fiber: meals.reduce((sum, meal) => sum + meal.targetFiber, 0),
    carbs: optionalTotal("targetCarbs"),
    fat: optionalTotal("targetFat"),
    saturatedFat: optionalTotal("targetSaturatedFat"),
    sodiumMg: optionalTotal("targetSodiumMg"),
    addedSugar: optionalTotal("targetAddedSugar"),
    potassiumMg: optionalTotal("targetPotassiumMg"),
    nutritionCompleteness: completeness,
  };
}

export function summarizePlan(days: DayPlan[]): PlanNutritionSummary {
  const normalized = days.map(recalculateDay);
  const dayCount = normalized.length;
  const average = (key: "calories" | "protein" | "fiber") => dayCount
    ? normalized.reduce((sum, day) => sum + day[key], 0) / dayCount
    : 0;
  const optionalAverage = (key: "carbs" | "fat" | "saturatedFat" | "sodiumMg" | "addedSugar" | "potassiumMg") =>
    dayCount > 0 && normalized.every((day) => typeof day[key] === "number")
      ? normalized.reduce((sum, day) => sum + (day[key] ?? 0), 0) / dayCount
      : undefined;
  const nutritionCompleteness = normalized.some((day) => day.nutritionCompleteness === "user_entered")
    ? "user_entered"
    : normalized.every((day) => day.nutritionCompleteness === "complete")
      ? "complete"
      : normalized.every((day) => day.nutritionCompleteness === "complete" || day.nutritionCompleteness === "estimated")
        ? "estimated"
        : "partial";
  return {
    dayCount,
    weeklyCalories: normalized.reduce((sum, day) => sum + day.calories, 0),
    averageCalories: average("calories"),
    averageProtein: average("protein"),
    averageFiber: average("fiber"),
    averageCarbs: optionalAverage("carbs"),
    averageFat: optionalAverage("fat"),
    averageSaturatedFat: optionalAverage("saturatedFat"),
    averageSodiumMg: optionalAverage("sodiumMg"),
    averageAddedSugar: optionalAverage("addedSugar"),
    averagePotassiumMg: optionalAverage("potassiumMg"),
    nutritionCompleteness,
  };
}

function editMeal(day: DayPlan, instanceId: string, editor: (meal: PlannedMeal) => PlannedMeal | null): DayPlan {
  if (day.locked) return day;
  let changed = false;
  const meals = day.meals.flatMap((meal) => {
    if (meal.instanceId !== instanceId || meal.locked) return [meal];
    const next = editor(meal);
    changed = true;
    return next ? [next] : [];
  });
  return changed ? recalculateDay({ ...day, meals }) : day;
}

export function changeMealPortion(day: DayPlan, instanceId: string, multiplier: number) {
  const safe = Math.min(3, Math.max(0.25, multiplier));
  return editMeal(day, instanceId, (meal) => {
    const previous = meal.portionMultiplier ?? 1;
    const relative = safe / previous;
    return {
      ...meal,
      portionMultiplier: safe,
      targetCalories: Math.round(meal.targetCalories * relative),
      targetProtein: Math.round(meal.targetProtein * relative),
      targetFiber: Math.round(meal.targetFiber * relative),
      targetCarbs: typeof meal.targetCarbs === "number" ? Math.round(meal.targetCarbs * relative) : undefined,
      targetFat: typeof meal.targetFat === "number" ? Math.round(meal.targetFat * relative) : undefined,
      targetSaturatedFat: typeof meal.targetSaturatedFat === "number" ? Math.round(meal.targetSaturatedFat * relative * 10) / 10 : undefined,
      targetSodiumMg: typeof meal.targetSodiumMg === "number" ? Math.round(meal.targetSodiumMg * relative) : undefined,
      targetAddedSugar: typeof meal.targetAddedSugar === "number" ? Math.round(meal.targetAddedSugar * relative * 10) / 10 : undefined,
      targetPotassiumMg: typeof meal.targetPotassiumMg === "number" ? Math.round(meal.targetPotassiumMg * relative) : undefined,
      portionCue: `سهم روی ${Math.round(safe * 100)}٪ تنظیم شده است.`,
    };
  });
}

export function renameMeal(day: DayPlan, instanceId: string, title: string) {
  const safe = title.trim().slice(0, 80);
  if (!safe) return day;
  return editMeal(day, instanceId, (meal) => ({ ...meal, title: safe }));
}

export function changeMealTime(day: DayPlan, instanceId: string, mealTime: string) {
  return editMeal(day, instanceId, (meal) => ({ ...meal, mealTime: mealTime.slice(0, 5) }));
}

export function removeMeal(day: DayPlan, instanceId: string) {
  return editMeal(day, instanceId, () => null);
}

export function duplicateMeal(day: DayPlan, instanceId: string) {
  if (day.locked) return day;
  const index = day.meals.findIndex((meal) => meal.instanceId === instanceId && !meal.locked);
  if (index < 0) return day;
  const source = day.meals[index];
  const copy = { ...source, instanceId: uid("meal"), title: `${source.title} (کپی)` };
  const meals = [...day.meals.slice(0, index + 1), copy, ...day.meals.slice(index + 1)];
  return recalculateDay({ ...day, meals });
}

export function moveMeal(day: DayPlan, instanceId: string, destinationIndex: number) {
  if (day.locked) return day;
  const sourceIndex = day.meals.findIndex((meal) => meal.instanceId === instanceId && !meal.locked);
  if (sourceIndex < 0) return day;
  const meals = [...day.meals];
  const [meal] = meals.splice(sourceIndex, 1);
  meals.splice(Math.max(0, Math.min(destinationIndex, meals.length)), 0, meal);
  return recalculateDay({ ...day, meals });
}

export function moveMealToSlot(day: DayPlan, instanceId: string, slot: MealSlot, displaySlot: string) {
  return editMeal(day, instanceId, (meal) => ({ ...meal, slot, displaySlot }));
}

export function lockMeal(day: DayPlan, instanceId: string, locked: boolean) {
  if (day.locked && !locked) return day;
  const meals = day.meals.map((meal) => meal.instanceId === instanceId ? { ...meal, locked } : meal);
  return { ...day, meals };
}

export function lockDay(day: DayPlan, locked: boolean) {
  return { ...day, locked };
}

export function renameDay(day: DayPlan, name: string) {
  if (day.locked) return day;
  const safe = name.trim().slice(0, 60);
  return safe ? { ...day, name: safe, label: safe } : day;
}

export function addCustomMeal(day: DayPlan, input: {
  title: string;
  displaySlot: string;
  slot: MealSlot;
  servingAmount: number;
  servingUnit: string;
  calories: number;
  protein: number;
  fiber: number;
  carbs?: number;
  fat?: number;
  saturatedFat?: number;
  sodiumMg?: number;
  addedSugar?: number;
  ingredients: string[];
  mealTime?: string;
  sourceNote?: string;
}) {
  if (day.locked) return day;
  const servingAmount = Number.isFinite(input.servingAmount)
    ? Math.min(100_000, Math.max(0.01, input.servingAmount))
    : 1;
  const servingUnit = input.servingUnit.trim().slice(0, 30) || "سهم";
  const calories = Math.min(5000, Math.max(0, Number.isFinite(input.calories) ? input.calories : 0));
  const protein = Math.min(500, Math.max(0, Number.isFinite(input.protein) ? input.protein : 0));
  const fiber = Math.min(100, Math.max(0, Number.isFinite(input.fiber) ? input.fiber : 0));
  const carbs = typeof input.carbs === "number" && Number.isFinite(input.carbs)
    ? Math.min(1000, Math.max(0, input.carbs))
    : undefined;
  const fat = typeof input.fat === "number" && Number.isFinite(input.fat)
    ? Math.min(500, Math.max(0, input.fat))
    : undefined;
  const saturatedFat = typeof input.saturatedFat === "number" && Number.isFinite(input.saturatedFat)
    ? Math.min(200, Math.max(0, input.saturatedFat))
    : undefined;
  const sodiumMg = typeof input.sodiumMg === "number" && Number.isFinite(input.sodiumMg)
    ? Math.min(20_000, Math.max(0, input.sodiumMg))
    : undefined;
  const addedSugar = typeof input.addedSugar === "number" && Number.isFinite(input.addedSugar)
    ? Math.min(500, Math.max(0, input.addedSugar))
    : undefined;
  const custom: PlannedMeal = {
    id: uid("custom-food"),
    instanceId: uid("meal"),
    slot: input.slot,
    displaySlot: input.displaySlot.slice(0, 40),
    mealTime: input.mealTime,
    title: input.title.trim().slice(0, 80) || "غذای سفارشی",
    serving: `${servingAmount.toLocaleString("fa-IR")} ${servingUnit}`,
    servingAmount,
    servingUnit,
    ingredients: input.ingredients.map((item) => item.trim().slice(0, 80)).filter(Boolean).slice(0, 30),
    calories,
    protein,
    fiber,
    carbs,
    fat,
    saturatedFat,
    sodiumMg,
    addedSugar,
    nutritionSource: "user_entered",
    prep: 0,
    batchFriendly: false,
    allergens: [],
    styles: [],
    targetCalories: Math.round(calories),
    targetProtein: Math.round(protein),
    targetFiber: Math.round(fiber),
    targetCarbs: carbs,
    targetFat: fat,
    targetSaturatedFat: saturatedFat,
    targetSodiumMg: sodiumMg,
    targetAddedSugar: addedSugar,
    portionCue: "اطلاعات تغذیه‌ای توسط کاربر وارد شده است.",
    portionMultiplier: 1,
    custom: true,
    userEntered: true,
    nutritionCompleteness: "user_entered",
    sourceNote: input.sourceNote?.trim().slice(0, 300) || undefined,
  };
  return recalculateDay({ ...day, meals: [...day.meals, custom] });
}

export function addCustomRecipe(day: DayPlan, input: {
  title: string;
  displaySlot: string;
  slot: MealSlot;
  serving: string;
  totalYield: number;
  yieldUnit: string;
  servings: number;
  ingredients: CustomRecipeIngredient[];
  mealTime?: string;
  sourceNote?: string;
}) {
  if (day.locked) return day;
  const servings = Number.isFinite(input.servings)
    ? Math.max(1, Math.min(100, Math.round(input.servings)))
    : 1;
  const bounded = (value: number, max: number) => Number.isFinite(value)
    ? Math.min(max, Math.max(0, value))
    : 0;
  const ingredients = input.ingredients
    .filter((item) => item.name.trim() && Number.isFinite(item.quantity) && item.quantity >= 0)
    .slice(0, 50)
    .map((item) => ({
      ...item,
      name: item.name.trim().slice(0, 80),
      unit: item.unit.trim().slice(0, 30),
      quantity: Math.min(100_000, Math.max(0, item.quantity)),
      calories: bounded(item.calories, 20_000),
      protein: bounded(item.protein, 2_000),
      carbs: typeof item.carbs === "number" ? bounded(item.carbs, 5_000) : undefined,
      fat: typeof item.fat === "number" ? bounded(item.fat, 2_000) : undefined,
      fiber: bounded(item.fiber, 1_000),
      saturatedFat: typeof item.saturatedFat === "number" ? bounded(item.saturatedFat, 1_000) : undefined,
      sodiumMg: typeof item.sodiumMg === "number" ? bounded(item.sodiumMg, 100_000) : undefined,
      addedSugar: typeof item.addedSugar === "number" ? bounded(item.addedSugar, 5_000) : undefined,
    }));
  if (!ingredients.length) return day;
  const total = {
    calories: ingredients.reduce((sum, item) => sum + item.calories, 0),
    protein: ingredients.reduce((sum, item) => sum + item.protein, 0),
    fiber: ingredients.reduce((sum, item) => sum + item.fiber, 0),
    carbs: ingredients.every((item) => typeof item.carbs === "number")
      ? ingredients.reduce((sum, item) => sum + (item.carbs ?? 0), 0)
      : undefined,
    fat: ingredients.every((item) => typeof item.fat === "number")
      ? ingredients.reduce((sum, item) => sum + (item.fat ?? 0), 0)
      : undefined,
    saturatedFat: ingredients.every((item) => typeof item.saturatedFat === "number")
      ? ingredients.reduce((sum, item) => sum + (item.saturatedFat ?? 0), 0)
      : undefined,
    sodiumMg: ingredients.every((item) => typeof item.sodiumMg === "number")
      ? ingredients.reduce((sum, item) => sum + (item.sodiumMg ?? 0), 0)
      : undefined,
    addedSugar: ingredients.every((item) => typeof item.addedSugar === "number")
      ? ingredients.reduce((sum, item) => sum + (item.addedSugar ?? 0), 0)
      : undefined,
  };
  const perServing = {
    calories: Math.round(total.calories / servings),
    protein: Math.round(total.protein / servings),
    fiber: Math.round(total.fiber / servings),
    carbs: typeof total.carbs === "number" ? Math.round(total.carbs / servings) : undefined,
    fat: typeof total.fat === "number" ? Math.round(total.fat / servings) : undefined,
    saturatedFat: typeof total.saturatedFat === "number" ? Math.round(total.saturatedFat / servings * 10) / 10 : undefined,
    sodiumMg: typeof total.sodiumMg === "number" ? Math.round(total.sodiumMg / servings) : undefined,
    addedSugar: typeof total.addedSugar === "number" ? Math.round(total.addedSugar / servings * 10) / 10 : undefined,
  };
  const custom: PlannedMeal = {
    id: uid("custom-recipe"),
    instanceId: uid("meal"),
    slot: input.slot,
    displaySlot: input.displaySlot.trim().slice(0, 40) || "وعده",
    mealTime: input.mealTime,
    title: input.title.trim().slice(0, 80) || "دستور غذای سفارشی",
    serving: input.serving.trim().slice(0, 120) || `یک سهم از ${servings} سهم`,
    ingredients: ingredients.map((item) => `${item.name} — ${item.quantity} ${item.unit} (${item.state === "raw" ? "خام" : item.state === "cooked" ? "پخته" : "نامرتبط"})`),
    calories: total.calories,
    protein: total.protein,
    fiber: total.fiber,
    carbs: total.carbs,
    fat: total.fat,
    saturatedFat: total.saturatedFat,
    sodiumMg: total.sodiumMg,
    addedSugar: total.addedSugar,
    nutritionSource: "user_entered",
    prep: 0,
    batchFriendly: true,
    allergens: [],
    styles: [],
    targetCalories: perServing.calories,
    targetProtein: perServing.protein,
    targetFiber: perServing.fiber,
    targetCarbs: perServing.carbs,
    targetFat: perServing.fat,
    targetSaturatedFat: perServing.saturatedFat,
    targetSodiumMg: perServing.sodiumMg,
    targetAddedSugar: perServing.addedSugar,
    portionCue: `اطلاعات هر سهم از ${servings} سهم دستور محاسبه شده است.`,
    portionMultiplier: 1,
    custom: true,
    userEntered: true,
    nutritionCompleteness: "user_entered",
    sourceNote: input.sourceNote?.trim().slice(0, 300) || undefined,
    recipe: {
      ingredients,
      totalYield: bounded(input.totalYield, 100_000),
      yieldUnit: input.yieldUnit.trim().slice(0, 30) || "گرم",
      servings,
      nutritionPerRecipe: total,
    },
  };
  return recalculateDay({ ...day, meals: [...day.meals, custom] });
}

export function duplicateDay(day: DayPlan, id: string, label: string): DayPlan {
  return recalculateDay({
    ...structuredClone(day),
    id,
    label,
    name: label,
    locked: false,
    meals: day.meals.map((meal) => ({ ...structuredClone(meal), instanceId: uid("meal"), locked: false })),
  });
}

export function copyDayTo(day: DayPlan, target: DayPlan): DayPlan {
  if (target.locked) return target;
  return recalculateDay({
    ...target,
    meals: day.meals.map((meal) => ({ ...structuredClone(meal), instanceId: uid("meal"), locked: false })),
  });
}

export function createHistory(initial: DayPlan[]): PlanHistory {
  return { past: [], present: structuredClone(initial), future: [] };
}

export function commitHistory(history: PlanHistory, next: DayPlan[]): PlanHistory {
  return {
    past: [...history.past.slice(-49), structuredClone(history.present)],
    present: structuredClone(next),
    future: [],
  };
}

export function undoHistory(history: PlanHistory): PlanHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: structuredClone(previous),
    future: [structuredClone(history.present), ...history.future],
  };
}

export function redoHistory(history: PlanHistory): PlanHistory {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, structuredClone(history.present)],
    present: structuredClone(next),
    future: history.future.slice(1),
  };
}

export function evaluatePlanCompatibility(days: DayPlan[], form: PlannerForm): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  for (const day of days) {
    for (const meal of day.meals) {
      const allergens = meal.allergens.filter((allergen) => form.allergies.includes(allergen));
      if (allergens.length) {
        issues.push({ kind: "allergy", dayId: day.id, mealInstanceId: meal.instanceId, message: `${meal.title} با حساسیت ثبت‌شده سازگار نیست.` });
      } else if (meal.userEntered && form.allergies.length > 0) {
        issues.push({ kind: "allergy", dayId: day.id, mealInstanceId: meal.instanceId, message: `سازگاری حساسیتی ${meal.title} تأیید نشده است؛ مواد و برچسب محصول را بررسی کنید.` });
      }
      if (meal.userEntered) {
        issues.push({ kind: "diet_style", dayId: day.id, mealInstanceId: meal.instanceId, message: `سازگاری ${meal.title} با الگوی غذایی انتخابی تأیید نشده است.` });
      } else if (meal.styles.length > 0 && !meal.styles.includes(form.dietStyle)) {
        issues.push({ kind: "diet_style", dayId: day.id, mealInstanceId: meal.instanceId, message: `${meal.title} با الگوی غذایی انتخابی سازگار نیست.` });
      }
      if (meal.nutritionCompleteness === "partial") {
        issues.push({ kind: "nutrition_incomplete", dayId: day.id, mealInstanceId: meal.instanceId, message: `بخشی از اطلاعات تغذیه‌ای ${meal.title} در دسترس نیست.` });
      }
      if (form.goal === "muscle_gain" && meal.targetProtein < 10) {
        issues.push({ kind: "goal", dayId: day.id, mealInstanceId: meal.instanceId, message: `${meal.title} برای توزیع پروتئین این هدف نزدیک نیست.` });
      }
    }
  }
  return issues;
}
