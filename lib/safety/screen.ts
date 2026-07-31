import type { PlannerForm, SafetyDisposition, SafetyScreenResult } from "@/lib/types";
import { toNumber } from "@/lib/nutrition/format";

const priority: Record<SafetyDisposition, number> = {
  ordinary_scope: 0,
  general_support_only: 1,
  professional_review_required: 2,
  urgent_or_high_priority_assessment: 3,
};

function glucoseToMgDl(value: number, unit: "mg_dl" | "mmol_l" | "percent") {
  if (unit === "mmol_l") return value * 18;
  return value;
}

function triglyceridesToMgDl(value: number, unit: "mg_dl" | "mmol_l") {
  if (unit === "mmol_l") return value * 88.57;
  return value;
}

export function screenSafety(form: PlannerForm): SafetyScreenResult {
  let disposition: SafetyDisposition = "ordinary_scope";
  const reasons: string[] = [];
  const notices: string[] = [];

  const add = (next: SafetyDisposition, reason: string) => {
    if (priority[next] > priority[disposition]) disposition = next;
    reasons.push(reason);
  };

  const age = toNumber(form.age);
  const height = toNumber(form.height);
  const weight = toNumber(form.weight);
  const bmi = weight / (height / 100) ** 2;

  if (!Number.isFinite(age) || age < 18) add("professional_review_required", "این نسخه برای افراد زیر ۱۸ سال برنامهٔ خودکار تولید نمی‌کند.");
  if (form.pregnant || form.breastfeeding) add("professional_review_required", "بارداری یا شیردهی به ارزیابی تغذیه‌ای اختصاصی نیاز دارد.");
  if (form.eatingDisorderConcern) add("professional_review_required", "نگرانی دربارهٔ اختلال خوردن یا رفتار غذایی آشفته نیازمند حمایت حرفه‌ای است.");
  if (form.seriousFoodAllergy) add("professional_review_required", "حساسیت غذایی جدی فراتر از توان بررسی تماس متقاطع این ابزار است.");
  if (form.medicalConditions.length > 0) add("professional_review_required", "یک وضعیت ثبت‌شده به تغذیه‌درمانی یا هماهنگی حرفه‌ای نیاز دارد.");
  if (form.swallowingDifficulty) add("professional_review_required", "دشواری بلع یا جویدن نیازمند ارزیابی تخصصی است.");
  if (form.severeDigestiveSymptoms) add("professional_review_required", "علائم شدید گوارشی یا احتمال سوءجذب باید پیش از برنامه بررسی شود.");
  if (Number.isFinite(bmi) && bmi < 16) {
    add("urgent_or_high_priority_assessment", "کم‌وزنی شدید گزارش شده است و پیش از هر برنامهٔ خودکار به ارزیابی با اولویت بالا نیاز دارد.");
  } else if (Number.isFinite(bmi) && bmi < 18.5) {
    add(
      "professional_review_required",
      form.goal === "weight_loss"
        ? "در BMI کمتر از ۱۸٫۵، برنامهٔ خودکار کاهش وزن تولید نمی‌شود."
        : "کم‌وزنی باید پیش از شروع برنامهٔ افزایش وزن یا حجم از نظر علت و خطر سوءتغذیه بررسی شود.",
    );
  }

  const unintentionalLoss = toNumber(form.unintentionalLossPercent);
  const unintentionalLossMonths = toNumber(form.unintentionalLossMonths);
  const negligibleDays = toNumber(form.negligibleIntakeDays);
  const recentLossWindow = unintentionalLossMonths > 0 && unintentionalLossMonths <= 6;
  if (!form.intentionalWeightChange && unintentionalLoss > 0) {
    add("professional_review_required", "کاهش وزن ناخواسته باید پیش از برنامه‌ریزی عادی بررسی شود.");
  }
  if (negligibleDays > 10 || (recentLossWindow && unintentionalLoss > 15)) {
    add("urgent_or_high_priority_assessment", "یکی از معیارهای پرخطر سوءتغذیه یا شروع مجدد تغذیه گزارش شده است.");
  } else {
    const secondaryRiskCount = [bmi < 18.5, recentLossWindow && unintentionalLoss > 10, negligibleDays > 5].filter(Boolean).length;
    if (secondaryRiskCount >= 2) add("professional_review_required", "چند معیار خطر سوءتغذیه یا refeeding هم‌زمان وجود دارد.");
  }
  if (!form.intentionalWeightChange && unintentionalLoss > 0 && unintentionalLossMonths <= 0) {
    add("professional_review_required", "بازهٔ زمانی کاهش وزن ناخواسته مشخص نیست؛ این عدم‌قطعیت نیازمند بررسی حرفه‌ای است.");
  }

  const bp = form.cardiometabolic.bloodPressure;
  if (bp.enabled) {
    const systolic = toNumber(bp.systolic);
    const diastolic = toNumber(bp.diastolic);
    if (bp.concerningSymptoms) {
      add("urgent_or_high_priority_assessment", "علائم هشدار قلبی، تنفسی یا عصبی گزارش شده است و مستقل از یک عدد فشار به ارزیابی فوری نیاز دارد.");
    } else if (systolic > 180 || diastolic > 120) {
      add("professional_review_required", "فشار بسیار بالا نیازمند بررسی به‌موقع حرفه‌ای است.");
    } else if (bp.diagnosedHypertension) {
      add("general_support_only", bp.stableUnderCare
        ? "برای سابقهٔ فشار خون، برنامه فقط پشتیبانی عمومی ارائه می‌دهد و جایگزین برنامهٔ درمانی نیست."
        : "فشار خون ثبت‌شده پایدار و تحت پیگیری اعلام نشده است؛ فقط راهنمای عمومی ارائه می‌شود.");
    }
    notices.push("یک اندازه‌گیری منفرد برای تشخیص فشار خون کافی نیست.");
  }

  const glycaemia = form.cardiometabolic.glycaemia;
  if (glycaemia.enabled) {
    const value = glucoseToMgDl(toNumber(glycaemia.value), glycaemia.unit);
    const isA1c = glycaemia.measurementType === "a1c" || glycaemia.unit === "percent";
    if (glycaemia.crisisSymptoms || (!isA1c && value > 0 && value < 54)) {
      add("urgent_or_high_priority_assessment", "افت قند شدید یا علائم بحران گزارش شده است.");
    } else if (!isA1c && value > 0 && value < 70) {
      add("professional_review_required", "قند پایین یک علامت ایمنی است و پیش از برنامه باید بررسی شود.");
    }
    if (glycaemia.insulinOrHypoglycaemiaMedicine || glycaemia.recurrentOrSevereHypoglycaemia) {
      add("professional_review_required", "دارو یا سابقهٔ افت قند نیازمند هماهنگی حرفه‌ای است.");
    } else if (glycaemia.diabetesHistory) {
      add("general_support_only", "برای سابقهٔ دیابت یا پیش‌دیابت، برنامه فقط پشتیبانی عمومی ارائه می‌دهد و هدف درمانی نمی‌سازد.");
    }
    notices.push("میزانه از یک مقدار قند برای تشخیص دیابت استفاده نمی‌کند.");
  }

  const lipids = form.cardiometabolic.lipids;
  if (lipids.enabled) {
    const triglycerides = triglyceridesToMgDl(toNumber(lipids.triglycerides), lipids.unit);
    if (triglycerides >= 1000) {
      add("urgent_or_high_priority_assessment", "تری‌گلیسرید بسیار بالا نیازمند ارزیابی با اولویت بالاست.");
    } else if (triglycerides >= 500) {
      add("professional_review_required", "تری‌گلیسرید بالا باید پیش از برنامهٔ عادی بررسی شود.");
    } else if (lipids.knownAscvdOrClinicianDirectedDiet || lipids.diagnosedDyslipidaemia) {
      add("general_support_only", lipids.reviewedProfessionally
        ? "برای سابقهٔ اختلال چربی خون، برنامه فقط پشتیبانی عمومی ارائه می‌دهد و جایگزین برنامهٔ درمانی نیست."
        : "هدف‌های چربی خون به ریسک و بررسی حرفه‌ای نتیجه وابسته‌اند؛ فقط راهنمای عمومی ارائه می‌شود.");
    }
    notices.push("میزانه هدف ثابت LDL برای همه تعیین نمی‌کند.");
  }

  return {
    disposition,
    blocked: priority[disposition] >= priority.professional_review_required,
    reasons: [...new Set(reasons)],
    notices: [...new Set(notices)],
    evaluatedAt: new Date().toISOString(),
    policyId: "safety.screen.v1",
  };
}
