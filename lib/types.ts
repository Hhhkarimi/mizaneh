// Shared domain types for Mizaneh. Keep goal, safety, calculation and plan
// vocabulary here so presentation components do not invent parallel shapes.

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

export type Goal = "weight_loss" | "muscle_gain" | "healthy_weight_gain";
export type GoalSelectionSource = "guided" | "direct" | "restored";
export type ResistanceTrainingStatus = "current" | "starting" | "none";
export type TrainingExperience = "beginner" | "intermediate" | "advanced";
export type AppetiteLevel = "low" | "normal" | "high";
export type DigestiveTolerance = "good" | "some_issues" | "poor";
export type StartingAdjustmentPreference = "gentle" | "standard";

export type MedicalCondition =
  | "kidney_disease"
  | "liver_disease"
  | "uncontrolled_diabetes"
  | "serious_cardiovascular_disease"
  | "active_cancer_treatment"
  | "recent_major_surgery"
  | "severe_gastrointestinal_condition"
  | "medical_nutrition_therapy";

export type BloodPressureContext = {
  enabled: boolean;
  systolic: string;
  diastolic: string;
  measuredAt: string;
  measurementContext: "home_average" | "clinic" | "single_or_unknown";
  deviceContext: string;
  concerningSymptoms: boolean;
  diagnosedHypertension: boolean;
  stableUnderCare: boolean;
};

export type GlycaemiaContext = {
  enabled: boolean;
  measurementType: "fasting" | "random" | "ogtt_2h" | "a1c";
  value: string;
  unit: "mg_dl" | "mmol_l" | "percent";
  measuredAt: string;
  sourceContext: "laboratory" | "home_meter" | "cgm" | "unknown";
  diabetesHistory: boolean;
  insulinOrHypoglycaemiaMedicine: boolean;
  recurrentOrSevereHypoglycaemia: boolean;
  crisisSymptoms: boolean;
};

export type LipidContext = {
  enabled: boolean;
  ldl: string;
  hdl: string;
  triglycerides: string;
  unit: "mg_dl" | "mmol_l";
  measuredAt: string;
  fastingKnown: boolean;
  diagnosedDyslipidaemia: boolean;
  reviewedProfessionally: boolean;
  knownAscvdOrClinicianDirectedDiet: boolean;
};

export type CardiometabolicContext = {
  bloodPressure: BloodPressureContext;
  glycaemia: GlycaemiaContext;
  lipids: LipidContext;
};

export type PlannerForm = {
  goal: Goal;
  goalSelectionSource: GoalSelectionSource;
  age: string;
  height: string;
  weight: string;
  sex: Sex;
  activity: Activity;
  targetWeight: string;
  pace: "0.25" | "0.5" | "0.75";
  startingAdjustmentPreference: StartingAdjustmentPreference;
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
  favourites: string[];
  hiddenFoods: string[];

  resistanceTraining: ResistanceTrainingStatus;
  trainingDays: string;
  trainingExperience: TrainingExperience;
  trainingProgress: "progressing" | "plateau" | "unknown";
  acknowledgesTrainingRequirement: boolean;

  intentionalWeightChange: boolean;
  unintentionalLossPercent: string;
  unintentionalLossMonths: string;
  negligibleIntakeDays: string;
  appetite: AppetiteLevel;
  digestiveTolerance: DigestiveTolerance;
  earlySatiety: boolean;
  swallowingDifficulty: boolean;
  severeDigestiveSymptoms: boolean;

  pregnant: boolean;
  breastfeeding: boolean;
  eatingDisorderConcern: boolean;
  seriousFoodAllergy: boolean;
  medicalConditions: MedicalCondition[];
  cardiometabolic: CardiometabolicContext;
};

export type CalculationPolicyMetadata = {
  calculationPolicyId: string;
  calculationPolicyVersion: string;
  energyEquationId: string;
  energyEquationVersion: string;
  evidenceRegistryVersion: string;
  reviewExpiresAt: string;
  evidenceCertainty: "low" | "low_to_moderate" | "moderate" | "legacy";
  productDecision: boolean;
};

export type Metrics = {
  goal: Goal;
  bmr: number;
  tdee: number;
  maintenanceCalories: number;
  targetCalories: number;
  targetCaloriesMin: number;
  targetCaloriesMax: number;
  uncertaintyKcal: number;
  bmi: number;
  bmiLabel: string;
  protein: number;
  proteinMin: number;
  proteinMax: number;
  carbs: number;
  fat: number;
  fiber: number;
  weeklyPace: number;
  estimatedWeeks: number;
  deficit: number;
  surplus: number;
  energyAdjustment: number;
  produceGrams: number;
  waterLiters: number;
  policy: CalculationPolicyMetadata;
  warnings: string[];
};

export type NutrientCompleteness = "complete" | "partial" | "user_entered";

export type FoodState = "raw" | "cooked" | "not_applicable";

export type CustomRecipeIngredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  state: FoodState;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  fiber: number;
};

export type CustomRecipeDetails = {
  ingredients: CustomRecipeIngredient[];
  totalYield: number;
  yieldUnit: string;
  servings: number;
  nutritionPerRecipe: {
    calories: number;
    protein: number;
    carbs?: number;
    fat?: number;
    fiber: number;
  };
};

export type MealTemplate = {
  id: string;
  slot: MealSlot;
  title: string;
  serving: string;
  servingAmount?: number;
  servingUnit?: string;
  ingredients: string[];
  calories: number;
  protein: number;
  fiber: number;
  carbs?: number;
  fat?: number;
  saturatedFat?: number;
  sodiumMg?: number;
  prep: number;
  batchFriendly: boolean;
  breakfastTaste?: BreakfastTaste;
  allergens: Allergy[];
  styles: DietStyle[];
  nutritionCompleteness?: NutrientCompleteness;
  sourceNote?: string;
};

export type PlannedMeal = MealTemplate & {
  instanceId?: string;
  displaySlot: string;
  mealTime?: string;
  targetCalories: number;
  targetProtein: number;
  targetFiber: number;
  targetCarbs?: number;
  targetFat?: number;
  portionCue: string;
  portionMultiplier?: number;
  locked?: boolean;
  custom?: boolean;
  userEntered?: boolean;
  replacementClass?: "close" | "similar" | "preference" | "not_equivalent";
  replacementReason?: string;
  recipe?: CustomRecipeDetails;
};

export type DayPlan = {
  id: string;
  label: string;
  shortLabel: string;
  name?: string;
  meals: PlannedMeal[];
  calories: number;
  protein: number;
  fiber: number;
  carbs?: number;
  fat?: number;
  locked?: boolean;
  nutritionCompleteness?: NutrientCompleteness;
};

export type SafetyDisposition =
  | "ordinary_scope"
  | "general_support_only"
  | "professional_review_required"
  | "urgent_or_high_priority_assessment";

export type SafetyScreenResult = {
  disposition: SafetyDisposition;
  blocked: boolean;
  reasons: string[];
  notices: string[];
  evaluatedAt: string;
  policyId: "safety.screen.v1";
};

export type PlanVersionMetadata = {
  id: string;
  name: string;
  goal: Goal;
  createdAt: string;
  parentPlanId: string | null;
};

export type PlanDocument = {
  schemaVersion: 2;
  id: string;
  parentPlanId: string | null;
  name: string;
  goal: Goal;
  form: PlannerForm;
  safetyScreen: SafetyScreenResult;
  calculation: Metrics;
  startingTargetCalories: number;
  planMode: PlanMode;
  variationSeed: number;
  days: DayPlan[];
  versions: PlanVersionMetadata[];
  measurements: WeightMeasurement[];
  adjustmentProposals: AdjustmentProposal[];
  lastAdjustmentAt?: string;
  createdAt: string;
  updatedAt: string;
  legacy: boolean;
};

export type ShoppingEntry = {
  name: string;
  count: number;
};

export type ShoppingGroup = {
  title: string;
  tone: string;
  items: string[];
  entries: ShoppingEntry[];
};

export type WeightMeasurement = {
  id: string;
  date: string;
  weightKg: number;
  waistCm?: number;
  adherence?: number;
  appetite?: number;
  energy?: number;
  digestiveTolerance?: number;
  sleepQuality?: number;
  trainingPerformance?: number;
  recovery?: number;
  note?: string;
};

export type AdjustmentProposal = {
  id: string;
  goal: Goal;
  proposedCaloriesDelta: number;
  triggeredBy: string[];
  method: string;
  rationale: string;
  uncertainty: string;
  status: "pending" | "accepted" | "rejected" | "modified";
};
