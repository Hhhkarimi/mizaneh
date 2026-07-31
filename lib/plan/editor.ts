import type { CustomRecipeIngredient, DayPlan, MealSlot, PlannedMeal, PlannerForm } from "@/lib/types";
import { getClinicalNutritionProfile } from "@/lib/clinical/diet-profile";

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
  averageCalciumMg?: number;
  averageIronMg?: number;
  averageMagnesiumMg?: number;
  averagePhosphorusMg?: number;
  averageZincMg?: number;
  averageFolateMcg?: number;
  averageIodineMcg?: number;
  averageVitaminB12Mcg?: number;
  averageVitaminDMcg?: number;
  averageCholineMg?: number;
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
  kind: "allergy" | "diet_style" | "goal" | "nutrition_incomplete" | "clinical";
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
  const optionalTotal = (key: "targetCarbs" | "targetFat" | "targetSaturatedFat" | "targetSodiumMg" | "targetAddedSugar" | "targetPotassiumMg" | "targetCalciumMg" | "targetIronMg" | "targetMagnesiumMg" | "targetPhosphorusMg" | "targetZincMg" | "targetFolateMcg" | "targetIodineMcg" | "targetVitaminB12Mcg" | "targetVitaminDMcg" | "targetCholineMg") =>
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
    calciumMg: optionalTotal("targetCalciumMg"),
    ironMg: optionalTotal("targetIronMg"),
    magnesiumMg: optionalTotal("targetMagnesiumMg"),
    phosphorusMg: optionalTotal("targetPhosphorusMg"),
    zincMg: optionalTotal("targetZincMg"),
    folateMcg: optionalTotal("targetFolateMcg"),
    iodineMcg: optionalTotal("targetIodineMcg"),
    vitaminB12Mcg: optionalTotal("targetVitaminB12Mcg"),
    vitaminDMcg: optionalTotal("targetVitaminDMcg"),
    cholineMg: optionalTotal("targetCholineMg"),
    nutritionCompleteness: completeness,
  };
}

export function summarizePlan(days: DayPlan[]): PlanNutritionSummary {
  const normalized = days.map(recalculateDay);
  const dayCount = normalized.length;
  const average = (key: "calories" | "protein" | "fiber") => dayCount
    ? normalized.reduce((sum, day) => sum + day[key], 0) / dayCount
    : 0;
  const optionalAverage = (key: "carbs" | "fat" | "saturatedFat" | "sodiumMg" | "addedSugar" | "potassiumMg" | "calciumMg" | "ironMg" | "magnesiumMg" | "phosphorusMg" | "zincMg" | "folateMcg" | "iodineMcg" | "vitaminB12Mcg" | "vitaminDMcg" | "cholineMg") =>
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
    averageCalciumMg: optionalAverage("calciumMg"),
    averageIronMg: optionalAverage("ironMg"),
    averageMagnesiumMg: optionalAverage("magnesiumMg"),
    averagePhosphorusMg: optionalAverage("phosphorusMg"),
    averageZincMg: optionalAverage("zincMg"),
    averageFolateMcg: optionalAverage("folateMcg"),
    averageIodineMcg: optionalAverage("iodineMcg"),
    averageVitaminB12Mcg: optionalAverage("vitaminB12Mcg"),
    averageVitaminDMcg: optionalAverage("vitaminDMcg"),
    averageCholineMg: optionalAverage("cholineMg"),
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
      targetCalciumMg: typeof meal.targetCalciumMg === "number" ? Math.round(meal.targetCalciumMg * relative) : undefined,
      targetIronMg: typeof meal.targetIronMg === "number" ? Math.round(meal.targetIronMg * relative * 10) / 10 : undefined,
      targetMagnesiumMg: typeof meal.targetMagnesiumMg === "number" ? Math.round(meal.targetMagnesiumMg * relative) : undefined,
      targetPhosphorusMg: typeof meal.targetPhosphorusMg === "number" ? Math.round(meal.targetPhosphorusMg * relative) : undefined,
      targetZincMg: typeof meal.targetZincMg === "number" ? Math.round(meal.targetZincMg * relative * 10) / 10 : undefined,
      targetFolateMcg: typeof meal.targetFolateMcg === "number" ? Math.round(meal.targetFolateMcg * relative) : undefined,
      targetIodineMcg: typeof meal.targetIodineMcg === "number" ? Math.round(meal.targetIodineMcg * relative) : undefined,
      targetVitaminB12Mcg: typeof meal.targetVitaminB12Mcg === "number" ? Math.round(meal.targetVitaminB12Mcg * relative * 10) / 10 : undefined,
      targetVitaminDMcg: typeof meal.targetVitaminDMcg === "number" ? Math.round(meal.targetVitaminDMcg * relative * 10) / 10 : undefined,
      targetCholineMg: typeof meal.targetCholineMg === "number" ? Math.round(meal.targetCholineMg * relative) : undefined,
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
  potassiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  magnesiumMg?: number;
  phosphorusMg?: number;
  zincMg?: number;
  folateMcg?: number;
  iodineMcg?: number;
  vitaminB12Mcg?: number;
  vitaminDMcg?: number;
  cholineMg?: number;
  ingredients: string[];
  mealTime?: string;
  sourceNote?: string;
}) {
  if (day.locked) return day;
  const boundedOptional = (value: number | undefined, max: number) => typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(0, value))
    : undefined;
  const servingAmount = Number.isFinite(input.servingAmount)
    ? Math.min(100_000, Math.max(0.01, input.servingAmount))
    : 1;
  const servingUnit = input.servingUnit.trim().slice(0, 30) || "سهم";
  const calories = Math.min(5000, Math.max(0, Number.isFinite(input.calories) ? input.calories : 0));
  const protein = Math.min(500, Math.max(0, Number.isFinite(input.protein) ? input.protein : 0));
  const fiber = Math.min(100, Math.max(0, Number.isFinite(input.fiber) ? input.fiber : 0));
  const carbs = boundedOptional(input.carbs, 1000);
  const fat = boundedOptional(input.fat, 500);
  const saturatedFat = boundedOptional(input.saturatedFat, 200);
  const sodiumMg = boundedOptional(input.sodiumMg, 20_000);
  const addedSugar = boundedOptional(input.addedSugar, 500);
  const potassiumMg = boundedOptional(input.potassiumMg, 20_000);
  const calciumMg = boundedOptional(input.calciumMg, 10_000);
  const ironMg = boundedOptional(input.ironMg, 500);
  const magnesiumMg = boundedOptional(input.magnesiumMg, 5_000);
  const phosphorusMg = boundedOptional(input.phosphorusMg, 10_000);
  const zincMg = boundedOptional(input.zincMg, 500);
  const folateMcg = boundedOptional(input.folateMcg, 10_000);
  const iodineMcg = boundedOptional(input.iodineMcg, 10_000);
  const vitaminB12Mcg = boundedOptional(input.vitaminB12Mcg, 10_000);
  const vitaminDMcg = boundedOptional(input.vitaminDMcg, 10_000);
  const cholineMg = boundedOptional(input.cholineMg, 10_000);
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
    potassiumMg,
    calciumMg,
    ironMg,
    magnesiumMg,
    phosphorusMg,
    zincMg,
    folateMcg,
    iodineMcg,
    vitaminB12Mcg,
    vitaminDMcg,
    cholineMg,
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
    targetPotassiumMg: potassiumMg,
    targetCalciumMg: calciumMg,
    targetIronMg: ironMg,
    targetMagnesiumMg: magnesiumMg,
    targetPhosphorusMg: phosphorusMg,
    targetZincMg: zincMg,
    targetFolateMcg: folateMcg,
    targetIodineMcg: iodineMcg,
    targetVitaminB12Mcg: vitaminB12Mcg,
    targetVitaminDMcg: vitaminDMcg,
    targetCholineMg: cholineMg,
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
  const boundedOptional = (value: number | undefined, max: number) => typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(0, value))
    : undefined;
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
      carbs: boundedOptional(item.carbs, 5_000),
      fat: boundedOptional(item.fat, 2_000),
      fiber: bounded(item.fiber, 1_000),
      saturatedFat: boundedOptional(item.saturatedFat, 1_000),
      sodiumMg: boundedOptional(item.sodiumMg, 100_000),
      addedSugar: boundedOptional(item.addedSugar, 5_000),
      potassiumMg: boundedOptional(item.potassiumMg, 100_000),
      calciumMg: boundedOptional(item.calciumMg, 100_000),
      ironMg: boundedOptional(item.ironMg, 5_000),
      magnesiumMg: boundedOptional(item.magnesiumMg, 100_000),
      phosphorusMg: boundedOptional(item.phosphorusMg, 100_000),
      zincMg: boundedOptional(item.zincMg, 5_000),
      folateMcg: boundedOptional(item.folateMcg, 100_000),
      iodineMcg: boundedOptional(item.iodineMcg, 100_000),
      vitaminB12Mcg: boundedOptional(item.vitaminB12Mcg, 100_000),
      vitaminDMcg: boundedOptional(item.vitaminDMcg, 100_000),
      cholineMg: boundedOptional(item.cholineMg, 100_000),
    }));
  if (!ingredients.length) return day;

  type OptionalIngredientKey = "carbs" | "fat" | "saturatedFat" | "sodiumMg" | "addedSugar" | "potassiumMg" | "calciumMg" | "ironMg" | "magnesiumMg" | "phosphorusMg" | "zincMg" | "folateMcg" | "iodineMcg" | "vitaminB12Mcg" | "vitaminDMcg" | "cholineMg";
  const optionalTotal = (key: OptionalIngredientKey) => ingredients.every((item) => typeof item[key] === "number")
    ? ingredients.reduce((sum, item) => sum + (item[key] ?? 0), 0)
    : undefined;
  const total = {
    calories: ingredients.reduce((sum, item) => sum + item.calories, 0),
    protein: ingredients.reduce((sum, item) => sum + item.protein, 0),
    fiber: ingredients.reduce((sum, item) => sum + item.fiber, 0),
    carbs: optionalTotal("carbs"),
    fat: optionalTotal("fat"),
    saturatedFat: optionalTotal("saturatedFat"),
    sodiumMg: optionalTotal("sodiumMg"),
    addedSugar: optionalTotal("addedSugar"),
    potassiumMg: optionalTotal("potassiumMg"),
    calciumMg: optionalTotal("calciumMg"),
    ironMg: optionalTotal("ironMg"),
    magnesiumMg: optionalTotal("magnesiumMg"),
    phosphorusMg: optionalTotal("phosphorusMg"),
    zincMg: optionalTotal("zincMg"),
    folateMcg: optionalTotal("folateMcg"),
    iodineMcg: optionalTotal("iodineMcg"),
    vitaminB12Mcg: optionalTotal("vitaminB12Mcg"),
    vitaminDMcg: optionalTotal("vitaminDMcg"),
    cholineMg: optionalTotal("cholineMg"),
  };
  const roundedPerServing = (value: number | undefined, precision = 0) => typeof value === "number"
    ? Math.round((value / servings) * 10 ** precision) / 10 ** precision
    : undefined;
  const perServing = {
    calories: Math.round(total.calories / servings),
    protein: Math.round(total.protein / servings),
    fiber: Math.round(total.fiber / servings),
    carbs: roundedPerServing(total.carbs),
    fat: roundedPerServing(total.fat),
    saturatedFat: roundedPerServing(total.saturatedFat, 1),
    sodiumMg: roundedPerServing(total.sodiumMg),
    addedSugar: roundedPerServing(total.addedSugar, 1),
    potassiumMg: roundedPerServing(total.potassiumMg),
    calciumMg: roundedPerServing(total.calciumMg),
    ironMg: roundedPerServing(total.ironMg, 1),
    magnesiumMg: roundedPerServing(total.magnesiumMg),
    phosphorusMg: roundedPerServing(total.phosphorusMg),
    zincMg: roundedPerServing(total.zincMg, 1),
    folateMcg: roundedPerServing(total.folateMcg),
    iodineMcg: roundedPerServing(total.iodineMcg),
    vitaminB12Mcg: roundedPerServing(total.vitaminB12Mcg, 1),
    vitaminDMcg: roundedPerServing(total.vitaminDMcg, 1),
    cholineMg: roundedPerServing(total.cholineMg),
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
    potassiumMg: total.potassiumMg,
    calciumMg: total.calciumMg,
    ironMg: total.ironMg,
    magnesiumMg: total.magnesiumMg,
    phosphorusMg: total.phosphorusMg,
    zincMg: total.zincMg,
    folateMcg: total.folateMcg,
    iodineMcg: total.iodineMcg,
    vitaminB12Mcg: total.vitaminB12Mcg,
    vitaminDMcg: total.vitaminDMcg,
    cholineMg: total.cholineMg,
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
    targetPotassiumMg: perServing.potassiumMg,
    targetCalciumMg: perServing.calciumMg,
    targetIronMg: perServing.ironMg,
    targetMagnesiumMg: perServing.magnesiumMg,
    targetPhosphorusMg: perServing.phosphorusMg,
    targetZincMg: perServing.zincMg,
    targetFolateMcg: perServing.folateMcg,
    targetIodineMcg: perServing.iodineMcg,
    targetVitaminB12Mcg: perServing.vitaminB12Mcg,
    targetVitaminDMcg: perServing.vitaminDMcg,
    targetCholineMg: perServing.cholineMg,
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
  const profile = getClinicalNutritionProfile(form);
  for (const day of days) {
    for (const meal of day.meals) {
      const text = `${meal.title} ${meal.ingredients.join(" ")}`;
      const allergens = meal.allergens.filter((allergen) => form.allergies.includes(allergen));
      const forbiddenToken = profile.additionalAvoidTokens.find((token) => text.includes(token));
      if (allergens.length || forbiddenToken) {
        issues.push({
          kind: allergens.length ? "allergy" : "clinical",
          dayId: day.id,
          mealInstanceId: meal.instanceId,
          message: forbiddenToken
            ? `${meal.title} شامل «${forbiddenToken}» است و با محدودیت ثبت‌شده سازگار نیست.`
            : `${meal.title} با حساسیت ثبت‌شده سازگار نیست.`,
        });
      } else if (meal.userEntered && (form.allergies.length > 0 || form.seriousFoodAllergy)) {
        issues.push({ kind: "allergy", dayId: day.id, mealInstanceId: meal.instanceId, message: `سازگاری حساسیتی ${meal.title} تأیید نشده است؛ مواد، برچسب و تماس متقاطع را بررسی کنید.` });
      }
      if (meal.userEntered) {
        issues.push({ kind: "diet_style", dayId: day.id, mealInstanceId: meal.instanceId, message: `سازگاری ${meal.title} با الگوی غذایی انتخابی تأیید نشده است.` });
        if (profile.active) issues.push({ kind: "clinical", dayId: day.id, mealInstanceId: meal.instanceId, message: `مواد مغذی و محدودیت‌های درمانی ${meal.title} باید با برچسب یا منبع معتبر تأیید شود.` });
      } else if (meal.styles.length > 0 && !meal.styles.includes(form.dietStyle)) {
        issues.push({ kind: "diet_style", dayId: day.id, mealInstanceId: meal.instanceId, message: `${meal.title} با الگوی غذایی انتخابی سازگار نیست.` });
      }
      if (meal.nutritionCompleteness === "partial") {
        issues.push({ kind: "nutrition_incomplete", dayId: day.id, mealInstanceId: meal.instanceId, message: `بخشی از اطلاعات تغذیه‌ای ${meal.title} در دسترس نیست.` });
      }
      if (form.goal === "muscle_gain" && meal.targetProtein < 10) {
        issues.push({ kind: "goal", dayId: day.id, mealInstanceId: meal.instanceId, message: `${meal.title} برای توزیع پروتئین این هدف نزدیک نیست.` });
      }
      if (profile.carbohydratePerMealG && typeof meal.targetCarbs === "number" && Math.abs(meal.targetCarbs - profile.carbohydratePerMealG) > 15) {
        issues.push({ kind: "clinical", dayId: day.id, mealInstanceId: meal.instanceId, message: `کربوهیدرات ${meal.title} با مقدار ثبت‌شدهٔ هر وعده بیش از ۱۵ گرم تفاوت دارد.` });
      }
    }
    if (profile.sodiumTargetMg && typeof day.sodiumMg === "number" && day.sodiumMg > profile.sodiumTargetMg) {
      issues.push({ kind: "clinical", dayId: day.id, message: `${day.label}: سدیم برآوردی از حد ثبت‌شده بیشتر است.` });
    }
    if (profile.potassiumTargetMaxMg && typeof day.potassiumMg === "number" && day.potassiumMg > profile.potassiumTargetMaxMg) {
      issues.push({ kind: "clinical", dayId: day.id, message: `${day.label}: پتاسیم برآوردی از حد ثبت‌شده بیشتر است.` });
    }
    if (profile.phosphorusTargetMaxMg && typeof day.phosphorusMg === "number" && day.phosphorusMg > profile.phosphorusTargetMaxMg) {
      issues.push({ kind: "clinical", dayId: day.id, message: `${day.label}: فسفر برآوردی از حد ثبت‌شده بیشتر است.` });
    }
  }
  return issues;
}
