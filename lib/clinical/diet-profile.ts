import type { MealTemplate, PlannerForm } from "@/lib/types";
import { toNumber } from "@/lib/nutrition/format";

export type ClinicalNutritionFocus = "blood_pressure" | "glycaemia" | "lipids";

export type ClinicalNutritionProfile = {
  active: boolean;
  focuses: ClinicalNutritionFocus[];
  title: string;
  summary: string;
  adaptations: string[];
  cautions: string[];
  sodiumTargetMg?: number;
  saturatedFatTargetG?: number;
  consistentCarbohydratePattern: boolean;
  requiresMedicationCoordination: boolean;
};

function hasValidValue(value: string) {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function getClinicalNutritionProfile(
  form: PlannerForm,
  targetCalories = 2000,
): ClinicalNutritionProfile {
  const focuses: ClinicalNutritionFocus[] = [];
  const adaptations: string[] = [];
  const cautions: string[] = [];

  const bp = form.cardiometabolic.bloodPressure;
  const glycaemia = form.cardiometabolic.glycaemia;
  const lipids = form.cardiometabolic.lipids;

  const bpActive = bp.enabled && (bp.diagnosedHypertension || hasValidValue(bp.systolic) || hasValidValue(bp.diastolic));
  const glycaemiaActive = glycaemia.enabled && (glycaemia.diabetesHistory || hasValidValue(glycaemia.value));
  const lipidsActive = lipids.enabled && (
    lipids.diagnosedDyslipidaemia ||
    lipids.knownAscvdOrClinicianDirectedDiet ||
    hasValidValue(lipids.ldl) ||
    hasValidValue(lipids.triglycerides)
  );

  if (bpActive) {
    focuses.push("blood_pressure");
    adaptations.push("الگوی نزدیک به DASH: سبزی، میوه، حبوبات، غلات کامل و پروتئین‌های کم‌چرب بیشتر می‌شود.");
    adaptations.push("وعده‌های کم‌سدیم‌تر در رتبه‌بندی بالاتر قرار می‌گیرند و نمک افزوده باید حداقل نگه داشته شود.");
    cautions.push("اگر بیماری کلیه یا محدودیت پتاسیم دارید، افزایش پتاسیم غذایی باید فقط با نظر پزشک انجام شود.");
  }

  if (glycaemiaActive) {
    focuses.push("glycaemia");
    adaptations.push("کربوهیدرات در وعده‌ها یکنواخت‌تر توزیع می‌شود و غذاهای پرفیبر و کم‌فرآوری اولویت می‌گیرند.");
    adaptations.push("نوشیدنی شیرین، قند افزوده و غلات بسیار تصفیه‌شده در پیشنهادها محدود می‌شوند.");
    cautions.push("مقدار و زمان کربوهیدرات باید با انسولین، دارو و فعالیت هماهنگ شود؛ دارو را با این برنامه تغییر ندهید.");
  }

  if (lipidsActive) {
    focuses.push("lipids");
    adaptations.push("چربی غیراشباع، حبوبات، مغزها، ماهی و فیبر محلول بیشتر و چربی اشباع کمتر ترجیح داده می‌شود.");
    adaptations.push("غذاهای کم‌فرآوری و پروتئین‌های گیاهی یا کم‌چرب در رتبه‌بندی بالاتر قرار می‌گیرند.");
    cautions.push("هدف LDL و نیاز به دارو به ریسک قلبی‌عروقی فرد وابسته است و از روی یک عدد در این برنامه تعیین نمی‌شود.");
  }

  const active = focuses.length > 0;
  return {
    active,
    focuses,
    title: active ? "برنامه با ملاحظات قلبی‌ـ‌متابولیک ساخته می‌شود" : "برنامهٔ عمومی تغذیه",
    summary: active
      ? "میزانه غذاها را بر اساس اطلاعات ثبت‌شده اولویت‌بندی می‌کند، اما این خروجی جایگزین تغذیه‌درمانی پزشکی یا تنظیم دارو نیست."
      : "برنامه بر اساس هدف، انرژی، ترجیحات و حساسیت‌های ثبت‌شده ساخته می‌شود.",
    adaptations,
    cautions,
    sodiumTargetMg: bpActive ? 2000 : undefined,
    saturatedFatTargetG: lipidsActive ? Math.max(10, Math.round((targetCalories * 0.10) / 9)) : undefined,
    consistentCarbohydratePattern: glycaemiaActive,
    requiresMedicationCoordination:
      glycaemia.insulinOrHypoglycaemiaMedicine || glycaemia.recurrentOrSevereHypoglycaemia,
  };
}

export function clinicalMealScore(meal: MealTemplate, form: PlannerForm): number {
  const profile = getClinicalNutritionProfile(form);
  if (!profile.active) return 0;

  const text = `${meal.title} ${meal.ingredients.join(" ")}`;
  let score = 0;

  if (profile.focuses.includes("blood_pressure")) {
    score += (meal.sodiumMg ?? 700) * 0.7;
    score -= Math.min(12, meal.fiber) * 14;
    if (/حبوبات|عدس|نخود|لوبیا|سبزی|میوه|جو|بلغور/.test(text)) score -= 120;
    if (/پنیر|نان لواش|غذای آماده|کنسرو/.test(text)) score += 90;
  }

  if (profile.focuses.includes("glycaemia")) {
    const carbs = meal.carbs ?? Math.max(0, (meal.calories - meal.protein * 4) / 4);
    const fiberRatio = meal.fiber / Math.max(1, carbs);
    score += (meal.addedSugar ?? 0) * 55;
    score += Math.max(0, carbs - 75) * 4;
    score -= Math.min(0.3, fiberRatio) * 500;
    if (/نوشیدنی شیرین|شکر|مربا|عسل/.test(text)) score += 250;
    if (/حبوبات|عدس|نخود|لوبیا|جو|بلغور|سبوس/.test(text)) score -= 110;
  }

  if (profile.focuses.includes("lipids")) {
    score += (meal.saturatedFat ?? 8) * 42;
    score -= Math.min(15, meal.fiber) * 13;
    if (/ماهی|گردو|بادام|پسته|ارده|تخم کتان|حبوبات|عدس|نخود|لوبیا/.test(text)) score -= 125;
    if (/گوشت پرچرب|کره|خامه|پنیر/.test(text)) score += 120;
  }

  return score;
}
