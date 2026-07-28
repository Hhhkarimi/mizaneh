// Single source of truth for nutrition calculations: BMR (Mifflin–St
// Jeor), TDEE, calorie-deficit safeguards, macro targets, and BMI.
//
// Extracted verbatim from the original DietPlanner.tsx — no constant,
// formula, or rounding rule was changed. See docs/research.md for the
// verification of these constants against primary sources, and
// CONTEXT.md §4 for the plain-language description of each rule.

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
    bmr,
    tdee,
    targetCalories,
    bmi,
    bmiLabel: bmiLabel(bmi),
    protein,
    carbs,
    fat,
    fiber: Math.max(25, Math.round((targetCalories / 1000) * 14)),
    weeklyPace,
    estimatedWeeks:
      targetWeight < weight && weeklyPace > 0
        ? Math.ceil((weight - targetWeight) / weeklyPace)
        : 0,
    deficit: actualDeficit,
    produceGrams: 400,
    waterLiters: form.sex === "male" ? 2.5 : 2,
  };
}

/**
 * Step validation, extracted verbatim from the original component. These
 * are hard gates (age 18–80, height 130–220 cm, weight 40–250 kg, BMI ≥
 * 18.5 for both current and target weight) — ADR-0001 preserves them
 * exactly as-is; only a separate, additive safety disclosure was added
 * elsewhere (see components/SafetyAdvisory.tsx).
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
    if (weight / (height / 100) ** 2 < 18.5) {
      return "این ابزار برای کاهش وزن در BMI کمتر از ۱۸٫۵ برنامه تولید نمی‌کند.";
    }
  }

  if (step === 2) {
    if (
      !Number.isFinite(targetWeight) ||
      targetWeight < 40 ||
      targetWeight >= weight
    ) {
      return "وزن هدف باید کمتر از وزن فعلی و حداقل ۴۰ کیلوگرم باشد.";
    }
    if (targetWeight / (height / 100) ** 2 < 18.5) {
      return "وزن هدف انتخاب‌شده پایین‌تر از محدوده BMI مرجع است.";
    }
  }

  if (step === 4 && form.dislikes.length > 100) {
    return "فهرست غذاهای نامطلوب را کوتاه‌تر از ۱۰۰ نویسه بنویس.";
  }

  return "";
}
