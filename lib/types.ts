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


export type PregnancyTrimester = "first" | "second" | "third";
export type BreastfeedingMode = "exclusive" | "partial" | "minimal";
export type IdDSIFoodLevel = "unknown" | "3" | "4" | "5" | "6" | "7";
export type IdDSIDrinkLevel = "unknown" | "0" | "1" | "2" | "3" | "4";
export type KidneyStage = "unknown" | "1_2" | "3_5_no_dialysis" | "hemodialysis" | "peritoneal_dialysis" | "transplant";
export type LabStatus = "unknown" | "normal" | "high" | "low";
export type LiverStage = "unknown" | "fatty_liver" | "compensated_cirrhosis" | "decompensated_cirrhosis" | "acute_or_severe";
export type CancerTreatmentType = "unknown" | "chemotherapy" | "radiotherapy" | "immunotherapy" | "surgery" | "combined";
export type SurgeryDietStage = "regular" | "soft" | "pureed" | "full_liquid" | "clear_liquid" | "enteral_or_other";
export type GastrointestinalProfile = "unknown" | "ibd_flare" | "ibd_remission" | "celiac" | "gastroparesis" | "pancreatic" | "short_bowel_malabsorption" | "chronic_diarrhea" | "constipation";

export type ClinicalCareContext = {
  pregnancy: {
    trimester: PregnancyTrimester;
    multiplePregnancy: boolean;
    prenatalCare: boolean;
    gestationalDiabetes: boolean;
    severeVomitingOrDehydration: boolean;
    clinicianEnergyAdjustmentKcal: string;
  };
  breastfeeding: {
    mode: BreastfeedingMode;
    postpartumMonths: string;
    supplyConcern: boolean;
    clinicianEnergyAdjustmentKcal: string;
  };
  eatingDisorder: {
    underProfessionalCare: boolean;
    currentPurging: boolean;
    faintingSevereWeaknessOrDehydration: boolean;
    regularEatingSupport: boolean;
  };
  allergy: {
    additionalAllergens: string;
    strictCrossContact: boolean;
    carriesEpinephrine: boolean;
    activeReactionSymptoms: boolean;
  };
  dysphagia: {
    foodLevel: IdDSIFoodLevel;
    drinkLevel: IdDSIDrinkLevel;
    assessedByProfessional: boolean;
    coughingChokingOrWetVoice: boolean;
  };
  kidney: {
    stage: KidneyStage;
    potassiumStatus: LabStatus;
    phosphorusStatus: LabStatus;
    swellingOrBreathlessness: boolean;
    sodiumLimitMg: string;
    fluidLimitMl: string;
    proteinTargetGKg: string;
  };
  liver: {
    stage: LiverStage;
    ascites: boolean;
    encephalopathyOrConfusion: boolean;
    sodiumLimitMg: string;
    fluidLimitMl: string;
    proteinTargetGKg: string;
  };
  cancer: {
    treatmentType: CancerTreatmentType;
    appetiteImpact: "none" | "moderate" | "severe";
    nausea: boolean;
    mouthSores: boolean;
    tasteChanges: boolean;
    feverOrNeutropeniaPrecautions: boolean;
    proteinTargetGKg: string;
  };
  surgery: {
    daysSince: string;
    dietStage: SurgeryDietStage;
    surgeryArea: "general" | "upper_gi" | "lower_gi" | "head_neck" | "bariatric" | "other";
    poorIntakeOrVomiting: boolean;
    surgeonRestrictions: string;
  };
  gastrointestinal: {
    profile: GastrointestinalProfile;
    activeBleedingObstructionOrPersistentVomiting: boolean;
    lactoseRestriction: boolean;
    clinicianRestrictions: string;
  };
  customMnt: {
    sodiumLimitMg: string;
    potassiumLimitMg: string;
    phosphorusLimitMg: string;
    fluidLimitMl: string;
    proteinTargetGKg: string;
    carbohydratePerMealG: string;
    foodsToAvoid: string;
    foodsToInclude: string;
    notes: string;
  };
};

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
  clinicalCare: ClinicalCareContext;
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

export type NutrientCompleteness = "complete" | "estimated" | "partial" | "user_entered";

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
  nutritionSource?: "catalogue_estimate" | "verified" | "user_entered";
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
  targetSaturatedFat?: number;
  targetSodiumMg?: number;
  targetAddedSugar?: number;
  targetPotassiumMg?: number;
  targetCalciumMg?: number;
  targetIronMg?: number;
  targetMagnesiumMg?: number;
  targetPhosphorusMg?: number;
  targetZincMg?: number;
  targetFolateMcg?: number;
  targetIodineMcg?: number;
  targetVitaminB12Mcg?: number;
  targetVitaminDMcg?: number;
  targetCholineMg?: number;
  clinicalNote?: string;
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
  locked?: boolean;
  nutritionCompleteness?: NutrientCompleteness;
};

export type SafetyDisposition =
  | "ordinary_scope"
  | "general_support_only"
  | "professional_review_required"
  | "urgent_or_high_priority_assessment";

export type SafetyIssueCategory =
  | "scope"
  | "nutrition_risk"
  | "blood_pressure"
  | "glycaemia"
  | "lipids"
  | "medical_condition";

export type SafetyIssue = {
  id: string;
  category: SafetyIssueCategory;
  severity: Exclude<SafetyDisposition, "ordinary_scope">;
  title: string;
  explanation: string;
  nextStep: string;
  blocksPlanning: boolean;
};

export type SafetyScreenResult = {
  disposition: SafetyDisposition;
  blocked: boolean;
  issues: SafetyIssue[];
  /** Kept for stored-plan and export compatibility. Prefer issues in new UI. */
  reasons: string[];
  notices: string[];
  evaluatedAt: string;
  policyId: "safety.screen.v3" | "safety.screen.v4" | "safety.screen.v5";
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
