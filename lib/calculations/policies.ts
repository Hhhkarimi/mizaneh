import type { CalculationPolicyMetadata, Goal, Metrics, PlannerForm } from "@/lib/types";
import { estimateAdultEnergy } from "@/lib/calculations/energy/nasem2023";
import { bmiLabel } from "@/lib/nutrition/formulas";
import { roundTo, toNumber } from "@/lib/nutrition/format";

const REVIEW_EXPIRES_AT = "2026-10-30";
const EVIDENCE_REGISTRY_VERSION = "2026-07-31-v5";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function positiveNumber(value: string): number | undefined {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function policyForGoal(goal: Goal): CalculationPolicyMetadata {
  const id = goal === "weight_loss"
    ? "weight-loss.start.v3"
    : goal === "muscle_gain"
      ? "muscle-gain.start.v2"
      : "healthy-weight-gain.start.v2";
  return {
    calculationPolicyId: id,
    calculationPolicyVersion: "2.0.0",
    energyEquationId: "energy.eer.nasem2023.v1+clinical-overrides.v1",
    energyEquationVersion: "1.1.0",
    evidenceRegistryVersion: EVIDENCE_REGISTRY_VERSION,
    reviewExpiresAt: REVIEW_EXPIRES_AT,
    evidenceCertainty: "low_to_moderate",
    productDecision: true,
  };
}

function baseProteinRange(form: PlannerForm, weightKg: number) {
  if (form.goal === "muscle_gain") return { min: weightKg * 1.6, max: weightKg * 2.2 };
  if (form.goal === "weight_loss") return { min: weightKg * 1.2, max: weightKg * 1.6 };
  return { min: weightKg * 1.0, max: weightKg * 1.4 };
}

function clinicalProteinRange(form: PlannerForm, weightKg: number) {
  const explicit = positiveNumber(form.clinicalCare.customMnt.proteinTargetGKg)
    ?? (form.medicalConditions.includes("kidney_disease") ? positiveNumber(form.clinicalCare.kidney.proteinTargetGKg) : undefined)
    ?? (form.medicalConditions.includes("liver_disease") ? positiveNumber(form.clinicalCare.liver.proteinTargetGKg) : undefined)
    ?? (form.medicalConditions.includes("active_cancer_treatment") ? positiveNumber(form.clinicalCare.cancer.proteinTargetGKg) : undefined);
  if (explicit) return { min: weightKg * explicit, max: weightKg * explicit };

  if (form.eatingDisorderConcern) return { min: weightKg * 1.0, max: weightKg * 1.2 };
  if (form.pregnant) return { min: weightKg * 1.1, max: weightKg * 1.3 };
  if (form.breastfeeding) return { min: weightKg * 1.3, max: weightKg * 1.5 };

  const kidney = form.medicalConditions.includes("kidney_disease") ? form.clinicalCare.kidney.stage : null;
  const liver = form.medicalConditions.includes("liver_disease") ? form.clinicalCare.liver.stage : null;
  const catabolic = form.medicalConditions.includes("active_cancer_treatment") || form.medicalConditions.includes("recent_major_surgery");

  if (kidney === "hemodialysis" || kidney === "peritoneal_dialysis") {
    return { min: weightKg * 1.0, max: weightKg * 1.2 };
  }
  if (kidney === "3_5_no_dialysis") {
    // KDOQI's lower ranges require close clinical supervision. The product
    // uses the non-aggressive end unless a clinician-provided target exists.
    return catabolic || liver?.includes("cirrhosis")
      ? { min: weightKg * 0.8, max: weightKg * 1.0 }
      : { min: weightKg * 0.8, max: weightKg * 0.9 };
  }
  if (liver === "compensated_cirrhosis" || liver === "decompensated_cirrhosis") {
    return { min: weightKg * 1.2, max: weightKg * 1.5 };
  }
  if (catabolic) return { min: weightKg * 1.2, max: weightKg * 1.5 };

  return baseProteinRange(form, weightKg);
}

function pregnancyEnergyAdjustment(form: PlannerForm) {
  const explicit = positiveNumber(form.clinicalCare.pregnancy.clinicianEnergyAdjustmentKcal);
  if (explicit) return explicit;
  if (form.clinicalCare.pregnancy.trimester === "second") return 340;
  if (form.clinicalCare.pregnancy.trimester === "third") return 450;
  return 0;
}

function breastfeedingEnergyAdjustment(form: PlannerForm) {
  const explicit = positiveNumber(form.clinicalCare.breastfeeding.clinicianEnergyAdjustmentKcal);
  if (explicit) return explicit;
  if (form.clinicalCare.breastfeeding.mode === "exclusive") return 400;
  if (form.clinicalCare.breastfeeding.mode === "partial") return 200;
  return 100;
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
  let maintenance = Math.max(1000, energy.estimate);
  const restingEnergyEstimate = Math.round(
    10 * weight + 6.25 * height - 5 * age + (form.sex === "male" ? 5 : -161),
  );
  const warnings = [
    "برآورد انرژی خطای فردی قابل‌توجه دارد و با روند چند هفته‌ای بازبینی می‌شود.",
  ];

  if (form.medicalConditions.includes("liver_disease") && ["compensated_cirrhosis", "decompensated_cirrhosis"].includes(form.clinicalCare.liver.stage) && weight > 0) {
    maintenance = Math.max(maintenance, Math.round(weight * 30));
    warnings.push("در سیروز، حد پایین ۳۰ کیلوکالری به‌ازای هر کیلوگرم به‌عنوان برآورد حمایتی اعمال شده است؛ وزن خشک/هدف باید توسط تیم درمان تأیید شود.");
  }
  if (form.medicalConditions.includes("active_cancer_treatment") && weight > 0) {
    maintenance = clamp(maintenance, Math.round(weight * 25), Math.round(weight * 30));
    warnings.push("در درمان سرطان، برآورد انرژی در محدودهٔ عمومی ۲۵ تا ۳۰ کیلوکالری به‌ازای هر کیلوگرم نگه داشته شده و باید با روند وزن و دریافت واقعی بازبینی شود.");
  }

  let adjustment = 0;
  if (form.goal === "weight_loss") {
    const standard = Math.min(500, Math.round(maintenance * 0.15));
    adjustment = -(form.startingAdjustmentPreference === "gentle" ? Math.round(standard * 0.65) : standard);
  } else if (form.goal === "muscle_gain") {
    adjustment = clamp(Math.round(maintenance * 0.05), 100, 300);
  } else {
    adjustment = clamp(Math.round(maintenance * 0.1), 200, 500);
  }

  // Condition-aware overrides: generate a plan, but do not continue a
  // weight-change deficit/surplus when the evidence calls for adequacy and
  // clinician-led targets rather than autonomous weight manipulation.
  if (form.pregnant) {
    adjustment = pregnancyEnergyAdjustment(form);
    warnings.push("هدف انتخابی وزن در بارداری به برنامهٔ کفایت بارداری تبدیل شده است؛ کاهش وزن عمدی یا حجم‌گیری خودکار اعمال نمی‌شود.");
    if (form.clinicalCare.pregnancy.multiplePregnancy && !positiveNumber(form.clinicalCare.pregnancy.clinicianEnergyAdjustmentKcal)) {
      warnings.push("برای بارداری چندقلویی، افزایش انرژی اضافه حدس زده نشده و باید از تیم مراقبت وارد شود.");
    }
  } else if (form.breastfeeding) {
    adjustment = breastfeedingEnergyAdjustment(form);
    warnings.push("هدف انرژی بر اساس نوع شیردهی تعدیل شده است؛ کاهش سریع وزن پس از زایمان هدف‌گذاری نمی‌شود.");
  }

  if (form.eatingDisorderConcern) {
    adjustment = 0;
    warnings.push("به‌دلیل نگرانی اختلال خوردن، کسری یا مازاد هدف‌محور حذف و برنامه به الگوی منظم نگهدارنده تبدیل شده است.");
  }

  if (
    form.medicalConditions.includes("active_cancer_treatment") ||
    form.medicalConditions.includes("recent_major_surgery") ||
    form.medicalConditions.includes("severe_gastrointestinal_condition")
  ) {
    const poorIntake = form.clinicalCare.cancer.appetiteImpact !== "none"
      || form.clinicalCare.surgery.poorIntakeOrVomiting
      || ["short_bowel_malabsorption", "chronic_diarrhea", "ibd_flare"].includes(form.clinicalCare.gastrointestinal.profile);
    if (poorIntake && adjustment < 0) {
      adjustment = 0;
      warnings.push("به‌دلیل خطر دریافت ناکافی در وضعیت درمانی ثبت‌شده، کسری انرژی حذف شده است.");
    }
  }

  const targetCalories = roundTo(maintenance + adjustment, 25);
  const proteinTarget = clinicalProteinRange(form, weight);
  const proteinMin = Math.round(proteinTarget.min);
  const proteinMax = Math.round(proteinTarget.max);
  const protein = Math.round((proteinMin + proteinMax) / 2);
  const fatRatio = form.dietStyle === "mediterranean" ? 0.34 : 0.3;
  const fat = Math.max(40, Math.round((targetCalories * fatRatio) / 9));
  const carbs = Math.max(80, Math.round((targetCalories - protein * 4 - fat * 9) / 4));
  const bmi = weight / (height / 100) ** 2;
  const staticWeeklyPace = form.goal === "weight_loss" && adjustment < 0 ? (Math.abs(adjustment) * 7) / 7700 : 0;

  if (form.goal === "muscle_gain" && !form.pregnant && !form.eatingDisorderConcern) {
    warnings.push("تمرین مقاومتی برای افزایش معنادار حجم عضله ضروری است.");
  }
  if (form.goal === "healthy_weight_gain" && !form.pregnant && !form.eatingDisorderConcern) {
    warnings.push("وزن اضافه‌شده می‌تواند ترکیبی از بافت بدون چربی، چربی، آب و گلیکوژن باشد.");
  }
  if (form.medicalConditions.includes("kidney_disease") && form.clinicalCare.kidney.stage === "unknown") {
    warnings.push("مرحلهٔ بیماری کلیه نامشخص است؛ پروتئین/پتاسیم/فسفر محدود نشده‌اند مگر اینکه مقدار درمانی وارد شود.");
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
    proteinMin,
    proteinMax,
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
  if (form.goal === "weight_loss" && !form.pregnant && !form.breastfeeding && !form.eatingDisorderConcern && metrics.targetCalories <= 1200) {
    return "هدف محاسبه‌شده وارد محدودهٔ رژیم کم‌انرژی تخصصی می‌شود؛ میزانه در این وضعیت برنامهٔ عادی تولید نمی‌کند و بررسی حرفه‌ای لازم است.";
  }
  return null;
}

export function applyReviewedEnergyAdjustment(form: PlannerForm, metrics: Metrics, deltaKcal: number, startingTargetCalories = metrics.targetCalories): Metrics {
  const safeDelta = clamp(Math.round(deltaKcal / 25) * 25, -100, 100);
  if (form.pregnant || form.eatingDisorderConcern) {
    return {
      ...metrics,
      warnings: [...new Set([...metrics.warnings, "تنظیم خودکار انرژی در بارداری یا نگرانی اختلال خوردن اعمال نشد؛ تغییر باید با تیم درمان هماهنگ شود."])],
    };
  }
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
