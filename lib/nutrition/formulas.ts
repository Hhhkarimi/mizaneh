// Frozen legacy-v1 nutrition calculation and shared validation/BMI labels.
// Existing saved sessions depend on these exact Mifflin–St Jeor/PAL and
// weight-loss constants. New plans use the versioned policies in
// lib/calculations; do not silently modernize this compatibility path.

import type { Metrics, PlannerForm } from "@/lib/types";
import { activityOptions } from "@/lib/food/catalogue";
import { roundTo, toNumber } from "@/lib/nutrition/format";

export function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "کمتر از محدوده مرجع";
  if (bmi < 25) return "محدوده مرجع";
  if (bmi < 30) return "بالاتر از محدوده مرجع";
  return "نیازمند توجه بیشتر";
}

export function calculateMetrics(form: PlannerForm): Metrics {
  const age = toNumber(form.age);
  const height = toNumber(form.height);
  const weight = toNumber(form.weight);
  const targetWeight = toNumber(form.targetWeight);
  const activityFactor =
    activityOptions.find((option) => option.id === form.activity)?.factor ??
    1.2;
  const bmr = Math.round(
    10 * weight + 6.25 * height - 5 * age + (form.sex === "male" ? 5 : -161),
  );
  const tdee = Math.round(bmr * activityFactor);
  const desiredDeficit = (Number(form.pace) * 7700) / 7;
  const safeDeficit = Math.min(desiredDeficit, tdee * 0.2);
  const calorieFloor = form.sex === "male" ? 1500 : 1200;
  const targetCalories = Math.max(
    calorieFloor,
    roundTo(tdee - safeDeficit, 25),
  );
  const actualDeficit = Math.max(0, tdee - targetCalories);
  const weeklyPace = (actualDeficit * 7) / 7700;
  const proteinPerKg = form.dietStyle === "highProtein" ? 1.6 : 1.35;
  const protein = Math.round(
    Math.min(
      (targetCalories * 0.31) / 4,
      Math.max(targetWeight * proteinPerKg, (targetCalories * 0.22) / 4),
    ),
  );
  const fatRatio = form.dietStyle === "mediterranean" ? 0.34 : 0.3;
  const fat = Math.round((targetCalories * fatRatio) / 9);
  const carbs = Math.max(
    80,
    Math.round((targetCalories - protein * 4 - fat * 9) / 4),
  );
  const bmi = weight / (height / 100) ** 2;

  return {
    goal: form.goal,
    bmr,
    tdee,
    maintenanceCalories: tdee,
    targetCalories,
    targetCaloriesMin: targetCalories,
    targetCaloriesMax: targetCalories,
    uncertaintyKcal: 0,
    bmi,
    bmiLabel: bmiLabel(bmi),
    protein,
    proteinMin: protein,
    proteinMax: protein,
    carbs,
    fat,
    fiber: Math.max(25, Math.round((targetCalories / 1000) * 14)),
    weeklyPace,
    estimatedWeeks:
      targetWeight < weight && weeklyPace > 0
        ? Math.ceil((weight - targetWeight) / weeklyPace)
        : 0,
    deficit: actualDeficit,
    surplus: 0,
    energyAdjustment: -actualDeficit,
    produceGrams: 400,
    waterLiters: form.sex === "male" ? 2.5 : 2,
    policy: {
      calculationPolicyId: "loss.deficit.cap20.v1",
      calculationPolicyVersion: "1.0.0",
      energyEquationId: "energy.legacy.msj-pal.v1",
      energyEquationVersion: "1.0.0",
      evidenceRegistryVersion: "legacy-v1",
      reviewExpiresAt: "2026-07-31",
      evidenceCertainty: "legacy",
      productDecision: true,
    },
    warnings: ["این محاسبه متعلق به سیاست قدیمی میزانه است و فقط برای سازگاری نگه‌داری می‌شود."],
  };
}

/**
 * Shared onboarding validation. Original age/height/weight gates remain;
 * goal-specific target and resistance-training requirements are additive.
 * Medical-scope exclusions are evaluated separately by lib/safety/screen.
 */
export function getValidationMessage(form: PlannerForm, step: number) {
  const age = toNumber(form.age);
  const height = toNumber(form.height);
  const weight = toNumber(form.weight);
  const targetWeight = toNumber(form.targetWeight);

  if (step === 1) {
    if (!Number.isFinite(age) || age < 18 || age > 80) {
      return "سن را بین ۱۸ تا ۸۰ سال وارد کن.";
    }
    if (!Number.isFinite(height) || height < 130 || height > 220) {
      return "قد را بین ۱۳۰ تا ۲۲۰ سانتی‌متر وارد کن.";
    }
    if (!Number.isFinite(weight) || weight < 40 || weight > 250) {
      return "وزن را بین ۴۰ تا ۲۵۰ کیلوگرم وارد کن.";
    }
    if (form.goal === "weight_loss" && weight / (height / 100) ** 2 < 18.5) {
      return "این ابزار برای کاهش وزن در BMI کمتر از ۱۸٫۵ برنامه تولید نمی‌کند.";
    }
  }

  if (step === 2) {
    if (!Number.isFinite(targetWeight) || targetWeight < 40 || targetWeight > 300) {
      return "وزن هدف را بین ۴۰ تا ۳۰۰ کیلوگرم وارد کن.";
    }
    if (form.goal === "weight_loss") {
      if (targetWeight >= weight) {
        return "وزن هدف کاهش وزن باید کمتر از وزن فعلی باشد.";
      }
      if (targetWeight / (height / 100) ** 2 < 18.5) {
        return "وزن هدف انتخاب‌شده پایین‌تر از محدوده BMI مرجع است.";
      }
    } else if (targetWeight <= weight) {
      return "وزن هدف افزایش باید بیشتر از وزن فعلی باشد.";
    }
    if (
      form.goal === "muscle_gain" &&
      form.resistanceTraining === "none"
    ) {
      return "برای حجم عضله، تمرین مقاومتی فعلی یا برنامهٔ شروع تمرین را ثبت کن؛ در غیر این صورت افزایش وزن مناسب‌تر است.";
    }
  }

  if (step === 4 && form.dislikes.length > 100) {
    return "فهرست غذاهای نامطلوب را کوتاه‌تر از ۱۰۰ نویسه بنویس.";
  }
  if (
    step === 4 &&
    form.goal === "muscle_gain" &&
    !form.acknowledgesTrainingRequirement
  ) {
    return "برای ادامه تأیید کن که برنامهٔ غذایی جایگزین تمرین مقاومتی نیست.";
  }

  return "";
}
