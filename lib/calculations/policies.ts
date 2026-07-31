import type { CalculationPolicyMetadata, Goal, Metrics, PlannerForm } from "@/lib/types";
import { estimateAdultEnergy } from "@/lib/calculations/energy/nasem2023";
import { bmiLabel } from "@/lib/nutrition/formulas";
import { roundTo, toNumber } from "@/lib/nutrition/format";

const REVIEW_EXPIRES_AT = "2026-10-30";
const EVIDENCE_REGISTRY_VERSION = "2026-07-31";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function policyForGoal(goal: Goal): CalculationPolicyMetadata {
  const id = goal === "weight_loss"
    ? "weight-loss.start.v2"
    : goal === "muscle_gain"
      ? "muscle-gain.start.v1"
      : "healthy-weight-gain.start.v1";
  return {
    calculationPolicyId: id,
    calculationPolicyVersion: "1.0.0",
    energyEquationId: "energy.eer.nasem2023.v1",
    energyEquationVersion: "1.0.0",
    evidenceRegistryVersion: EVIDENCE_REGISTRY_VERSION,
    reviewExpiresAt: REVIEW_EXPIRES_AT,
    evidenceCertainty: "low_to_moderate",
    productDecision: true,
  };
}

function proteinRange(form: PlannerForm, weightKg: number) {
  if (form.goal === "muscle_gain") {
    return { min: Math.round(weightKg * 1.6), max: Math.round(weightKg * 2.2) };
  }
  if (form.goal === "weight_loss") {
    return { min: Math.round(weightKg * 1.2), max: Math.round(weightKg * 1.6) };
  }
  return { min: Math.round(weightKg * 1.0), max: Math.round(weightKg * 1.4) };
}

export function calculateCurrentMetrics(form: PlannerForm): Metrics {
  const age = toNumber(form.age);
  const height = toNumber(form.height);
  const weight = toNumber(form.weight);
  const targetWeight = toNumber(form.targetWeight);
  const energy = estimateAdultEnergy({
    sex: form.sex,
    age,
    heightCm: height,
    weightKg: weight,
    activity: form.activity,
  });
  const maintenance = Math.max(1000, energy.estimate);
  const restingEnergyEstimate = Math.round(
    10 * weight + 6.25 * height - 5 * age + (form.sex === "male" ? 5 : -161),
  );

  let adjustment = 0;
  if (form.goal === "weight_loss") {
    const standard = Math.min(500, Math.round(maintenance * 0.15));
    adjustment = -(form.startingAdjustmentPreference === "gentle" ? Math.round(standard * 0.65) : standard);
  } else if (form.goal === "muscle_gain") {
    adjustment = clamp(Math.round(maintenance * 0.05), 100, 300);
  } else {
    adjustment = clamp(Math.round(maintenance * 0.1), 200, 500);
  }

  const targetCalories = roundTo(maintenance + adjustment, 25);
  const proteinTarget = proteinRange(form, weight);
  const protein = Math.round((proteinTarget.min + proteinTarget.max) / 2);
  const fatRatio = form.dietStyle === "mediterranean" ? 0.34 : 0.3;
  const fat = Math.max(40, Math.round((targetCalories * fatRatio) / 9));
  const carbs = Math.max(80, Math.round((targetCalories - protein * 4 - fat * 9) / 4));
  const bmi = weight / (height / 100) ** 2;
  const staticWeeklyPace = form.goal === "weight_loss" ? (Math.abs(adjustment) * 7) / 7700 : 0;
  const warnings = [
    "برآورد انرژی خطای فردی قابل‌توجه دارد و با روند چند هفته‌ای بازبینی می‌شود.",
  ];
  if (form.goal === "muscle_gain") {
    warnings.push("تمرین مقاومتی برای افزایش معنادار حجم عضله ضروری است.");
  }
  if (form.goal === "healthy_weight_gain") {
    warnings.push("وزن اضافه‌شده می‌تواند ترکیبی از بافت بدون چربی، چربی، آب و گلیکوژن باشد.");
  }

  return {
    goal: form.goal,
    bmr: restingEnergyEstimate,
    tdee: maintenance,
    maintenanceCalories: maintenance,
    targetCalories,
    targetCaloriesMin: Math.max(0, targetCalories - energy.uncertaintyKcal),
    targetCaloriesMax: targetCalories + energy.uncertaintyKcal,
    uncertaintyKcal: energy.uncertaintyKcal,
    bmi,
    bmiLabel: bmiLabel(bmi),
    protein,
    proteinMin: proteinTarget.min,
    proteinMax: proteinTarget.max,
    carbs,
    fat,
    fiber: Math.max(25, Math.round((targetCalories / 1000) * 14)),
    weeklyPace: staticWeeklyPace,
    estimatedWeeks:
      form.goal === "weight_loss" && targetWeight > 0 && targetWeight < weight && staticWeeklyPace > 0
        ? Math.ceil((weight - targetWeight) / staticWeeklyPace)
        : 0,
    deficit: Math.max(0, -adjustment),
    surplus: Math.max(0, adjustment),
    energyAdjustment: adjustment,
    produceGrams: 400,
    waterLiters: form.sex === "male" ? 2.5 : 2,
    policy: policyForGoal(form.goal),
    warnings,
  };
}

export function getCalculationScopeIssue(form: PlannerForm, metrics: Metrics): string | null {
  if (form.goal === "weight_loss" && metrics.targetCalories <= 1200) {
    return "هدف محاسبه‌شده وارد محدودهٔ رژیم کم‌انرژی تخصصی می‌شود؛ میزانه در این وضعیت برنامهٔ عادی تولید نمی‌کند و بررسی حرفه‌ای لازم است.";
  }
  return null;
}

export function applyReviewedEnergyAdjustment(form: PlannerForm, metrics: Metrics, deltaKcal: number, startingTargetCalories = metrics.targetCalories): Metrics {
  const safeDelta = clamp(Math.round(deltaKcal / 25) * 25, -100, 100);
  const ordinaryFloor = form.goal === "weight_loss" ? 1225 : 800;
  const targetCalories = clamp(
    Math.max(ordinaryFloor, metrics.targetCalories + safeDelta),
    Math.max(ordinaryFloor, startingTargetCalories - 300),
    startingTargetCalories + 300,
  );
  const appliedDelta = targetCalories - metrics.targetCalories;
  const fatRatio = form.dietStyle === "mediterranean" ? 0.34 : 0.3;
  const fat = Math.max(40, Math.round((targetCalories * fatRatio) / 9));
  const carbs = Math.max(80, Math.round((targetCalories - metrics.protein * 4 - fat * 9) / 4));
  const energyAdjustment = targetCalories - metrics.maintenanceCalories;
  return {
    ...metrics,
    targetCalories,
    targetCaloriesMin: Math.max(0, targetCalories - metrics.uncertaintyKcal),
    targetCaloriesMax: targetCalories + metrics.uncertaintyKcal,
    energyAdjustment,
    deficit: Math.max(0, -energyAdjustment),
    surplus: Math.max(0, energyAdjustment),
    carbs,
    fat,
    fiber: Math.max(25, Math.round((targetCalories / 1000) * 14)),
    warnings: [...new Set([
      ...metrics.warnings,
      appliedDelta === 0
        ? "درخواست تنظیم روند به مرز ایمنی یا سقف تجمعی رسید و هدف انرژی تغییر نکرد."
        : `یک تنظیم روندی ${appliedDelta >= 0 ? "+" : ""}${appliedDelta} کیلوکالری با تأیید کاربر اعمال شده است.`,
    ])],
  };
}
