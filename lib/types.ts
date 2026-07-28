// Shared domain types for Mizaneh. This is the single source of truth for
// the domain vocabulary described in CONTEXT.md — no module should
// redeclare these types locally.

export type Sex = "male" | "female";
export type Activity = "sedentary" | "light" | "moderate" | "active";
export type DietStyle =
  | "balanced"
  | "vegetarian"
  | "mediterranean"
  | "highProtein";
export type PlanMode = "variety" | "quick" | "batch" | "protein";
export type Allergy = "gluten" | "dairy" | "egg" | "nuts" | "fish";
export type MealSlot = "breakfast" | "snack" | "lunch" | "dinner";
export type MealPrep = "daily" | "batch" | "mixed";
export type DayPattern = "regular" | "office" | "shift" | "home";
export type HungerPeak = "morning" | "afternoon" | "night";
export type BreakfastTaste = "savory" | "sweet" | "both";
export type SleepLevel = "under6" | "6to7" | "7plus";
export type WaterLevel = "low" | "medium" | "good";

export type PlannerForm = {
  age: string;
  height: string;
  weight: string;
  sex: Sex;
  activity: Activity;
  targetWeight: string;
  pace: "0.25" | "0.5" | "0.75";
  meals: "3" | "4" | "5";
  cookingTime: "15" | "30" | "45";
  dietStyle: DietStyle;
  allergies: Allergy[];
  mealPrep: MealPrep;
  dayPattern: DayPattern;
  hungerPeak: HungerPeak;
  breakfastTaste: BreakfastTaste;
  sleep: SleepLevel;
  water: WaterLevel;
  dislikes: string;
};

export type Metrics = {
  bmr: number;
  tdee: number;
  targetCalories: number;
  bmi: number;
  bmiLabel: string;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  weeklyPace: number;
  estimatedWeeks: number;
  deficit: number;
  produceGrams: number;
  waterLiters: number;
};

export type MealTemplate = {
  id: string;
  slot: MealSlot;
  title: string;
  serving: string;
  ingredients: string[];
  calories: number;
  protein: number;
  fiber: number;
  prep: number;
  batchFriendly: boolean;
  breakfastTaste?: BreakfastTaste;
  allergens: Allergy[];
  styles: DietStyle[];
};

export type PlannedMeal = MealTemplate & {
  displaySlot: string;
  targetCalories: number;
  targetProtein: number;
  targetFiber: number;
  portionCue: string;
};

export type DayPlan = {
  id: string;
  label: string;
  shortLabel: string;
  meals: PlannedMeal[];
  calories: number;
  protein: number;
  fiber: number;
};

export type ShoppingGroup = {
  title: string;
  tone: string;
  items: string[];
};
