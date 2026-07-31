import type { MealTemplate, PlannerForm } from "@/lib/types";
import { toNumber } from "@/lib/nutrition/format";

export type ClinicalNutritionFocus =
  | "blood_pressure"
  | "glycaemia"
  | "lipids"
  | "pregnancy"
  | "breastfeeding"
  | "eating_disorder_support"
  | "allergy"
  | "dysphagia"
  | "kidney"
  | "liver"
  | "cancer"
  | "surgery"
  | "gastrointestinal"
  | "medical_nutrition_therapy";

export type ClinicalNutritionProfile = {
  active: boolean;
  focuses: ClinicalNutritionFocus[];
  title: string;
  summary: string;
  adaptations: string[];
  cautions: string[];
  foodsToPrefer: string[];
  foodsToLimit: string[];
  assumptions: string[];
  sourceIds: string[];
  sodiumTargetMg?: number;
  potassiumTargetMaxMg?: number;
  phosphorusTargetMaxMg?: number;
  fluidTargetMl?: number;
  saturatedFatTargetG?: number;
  consistentCarbohydratePattern: boolean;
  carbohydratePerMealG?: number;
  requiresMedicationCoordination: boolean;
  requiresSmallFrequentMeals: boolean;
  requiresLateEveningSnack: boolean;
  additionalAvoidTokens: string[];
  additionalPreferTokens: string[];
  textureInstruction?: string;
};

function hasValidValue(value: string) {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function positiveNumber(value: string): number | undefined {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function tokens(value: string) {
  return value
    .split(/[،,\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1)
    .slice(0, 40);
}

function addUnique(list: string[], value: string) {
  if (!list.includes(value)) list.push(value);
}

function iddsiFoodLabel(level: PlannerForm["clinicalCare"]["dysphagia"]["foodLevel"]) {
  return ({
    unknown: "نامشخص",
    "3": "سطح ۳: مایع‌شده",
    "4": "سطح ۴: پورهٔ یکنواخت",
    "5": "سطح ۵: خرد و مرطوب",
    "6": "سطح ۶: نرم و لقمه‌ای",
    "7": "سطح ۷: معمولی/آسان‌جویدن",
  } as const)[level];
}

function iddsiDrinkLabel(level: PlannerForm["clinicalCare"]["dysphagia"]["drinkLevel"]) {
  return ({
    unknown: "نامشخص",
    "0": "سطح ۰: رقیق",
    "1": "سطح ۱: کمی غلیظ",
    "2": "سطح ۲: اندکی غلیظ",
    "3": "سطح ۳: نسبتاً غلیظ",
    "4": "سطح ۴: بسیار غلیظ",
  } as const)[level];
}

export function getClinicalNutritionProfile(
  form: PlannerForm,
  targetCalories = 2000,
): ClinicalNutritionProfile {
  const focuses: ClinicalNutritionFocus[] = [];
  const adaptations: string[] = [];
  const cautions: string[] = [];
  const foodsToPrefer: string[] = [];
  const foodsToLimit: string[] = [];
  const assumptions: string[] = [];
  const sourceIds: string[] = [];

  const bp = form.cardiometabolic.bloodPressure;
  const glycaemia = form.cardiometabolic.glycaemia;
  const lipids = form.cardiometabolic.lipids;
  const care = form.clinicalCare;
  const conditions = new Set(form.medicalConditions);

  let sodiumTargetMg: number | undefined;
  let potassiumTargetMaxMg: number | undefined;
  let phosphorusTargetMaxMg: number | undefined;
  let fluidTargetMl: number | undefined;
  let saturatedFatTargetG: number | undefined;
  let carbohydratePerMealG: number | undefined;
  let consistentCarbohydratePattern = false;
  let requiresMedicationCoordination = false;
  let requiresSmallFrequentMeals = false;
  let requiresLateEveningSnack = false;
  let textureInstruction: string | undefined;

  const bpActive = bp.enabled && (bp.diagnosedHypertension || hasValidValue(bp.systolic) || hasValidValue(bp.diastolic));
  const glycaemiaActive = glycaemia.enabled && (glycaemia.diabetesHistory || hasValidValue(glycaemia.value));
  const lipidsActive = lipids.enabled && (
    lipids.diagnosedDyslipidaemia ||
    lipids.knownAscvdOrClinicianDirectedDiet ||
    hasValidValue(lipids.ldl) ||
    hasValidValue(lipids.triglycerides)
  );

  if (bpActive || conditions.has("serious_cardiovascular_disease")) {
    focuses.push("blood_pressure");
    addUnique(adaptations, "الگوی نزدیک به DASH: سبزی، میوه، حبوبات، غلات کامل و پروتئین‌های کم‌چرب بیشتر می‌شود.");
    addUnique(adaptations, "وعده‌های کم‌سدیم‌تر در رتبه‌بندی بالاتر قرار می‌گیرند و نمک افزوده باید حداقل نگه داشته شود.");
    addUnique(foodsToPrefer, "سبزی، میوه، حبوبات، غلات کامل، ماهی و لبنیات کم‌چرب در صورت سازگاری");
    addUnique(foodsToLimit, "غذاهای شور، فرآوری‌شده، کنسروی، سوسیس‌وکالباس، پنیر بسیار شور و نمک افزوده");
    addUnique(cautions, "اگر بیماری کلیه یا محدودیت پتاسیم دارید، افزایش پتاسیم غذایی فقط باید بر اساس آزمایش و نظر تیم درمان باشد.");
    sodiumTargetMg = positiveNumber(care.customMnt.sodiumLimitMg) ?? 2000;
    sourceIds.push("AHA-HTN-2025", "AHA-DIET-2026", "WHO-SODIUM");
  }

  if (glycaemiaActive || conditions.has("uncontrolled_diabetes") || care.pregnancy.gestationalDiabetes) {
    focuses.push("glycaemia");
    consistentCarbohydratePattern = true;
    carbohydratePerMealG = positiveNumber(care.customMnt.carbohydratePerMealG);
    addUnique(adaptations, "کربوهیدرات در وعده‌ها یکنواخت‌تر توزیع می‌شود و غذاهای پرفیبر و کم‌فرآوری اولویت می‌گیرند.");
    addUnique(adaptations, "نوشیدنی شیرین، قند افزوده و غلات بسیار تصفیه‌شده در پیشنهادها محدود می‌شوند.");
    addUnique(foodsToPrefer, "سبزی غیرنشاسته‌ای، حبوبات، غلات کامل، میوهٔ کامل و پروتئین کم‌چرب");
    addUnique(foodsToLimit, "نوشیدنی شیرین، قند افزوده، شیرینی، آبمیوه و سهم‌های بزرگ غلات تصفیه‌شده");
    addUnique(cautions, "مقدار و زمان کربوهیدرات باید با انسولین، دارو، فعالیت و برنامهٔ درمانی هماهنگ شود؛ دارو را با این برنامه تغییر ندهید.");
    requiresMedicationCoordination = glycaemia.insulinOrHypoglycaemiaMedicine || glycaemia.recurrentOrSevereHypoglycaemia;
    sourceIds.push("ADA-SOC-2026");
  }

  if (lipidsActive || conditions.has("serious_cardiovascular_disease")) {
    focuses.push("lipids");
    saturatedFatTargetG = Math.max(8, Math.round((targetCalories * 0.10) / 9));
    addUnique(adaptations, "چربی غیراشباع، حبوبات، مغزها، ماهی و فیبر محلول بیشتر و چربی اشباع کمتر ترجیح داده می‌شود.");
    addUnique(foodsToPrefer, "روغن‌های غیراشباع، مغزها، ماهی، جو، حبوبات و سبزی‌ها");
    addUnique(foodsToLimit, "کره، خامه، گوشت پرچرب، روغن جامد، سرخ‌کردنی و چربی ترانس");
    addUnique(cautions, "هدف LDL و نیاز به دارو به ریسک قلبی‌عروقی فرد وابسته است و از روی یک عدد در این برنامه تعیین نمی‌شود.");
    sourceIds.push("ACC-AHA-LIPIDS-2026", "AHA-DIET-2026");
  }

  if (form.pregnant) {
    focuses.push("pregnancy");
    addUnique(adaptations, "برنامه از کاهش انرژی عمدی فاصله می‌گیرد و بر کفایت انرژی، پروتئین، آهن، فولات، ید، کلسیم، کولین و ایمنی غذا تمرکز می‌کند.");
    addUnique(foodsToPrefer, "منابع آهن و فولات، لبنیات یا جایگزین غنی‌شده، تخم‌مرغ، حبوبات، سبزی برگ‌سبز و ماهی کم‌جیوه");
    addUnique(foodsToLimit, "غذای خام یا نیم‌پز، لبنیات غیرپاستوریزه، ماهی پرجیوه، الکل و مکمل خودسرانه");
    addUnique(cautions, "مکمل آهن، فولات، ید یا ویتامین D باید طبق برنامهٔ مراقبت بارداری تعیین شود؛ برآورد غذایی جایگزین مکمل تجویزشده نیست.");
    if (care.pregnancy.multiplePregnancy) addUnique(cautions, "بارداری چندقلویی به هدف انرژی و ریزمغذی اختصاصی‌تر نیاز دارد؛ میزانه مقدار اضافه را حدس نمی‌زند.");
    if (!care.pregnancy.prenatalCare) addUnique(cautions, "شروع یا ادامهٔ مراقبت بارداری برای بررسی رشد جنین، کم‌خونی و مکمل‌ها ضروری است.");
    if (care.pregnancy.severeVomitingOrDehydration) addUnique(cautions, "استفراغ شدید یا کم‌آبی نیازمند ارزیابی سریع است و برنامهٔ خوراکی معمول ممکن است کافی نباشد.");
    requiresSmallFrequentMeals = care.pregnancy.severeVomitingOrDehydration;
    sourceIds.push("NASEM-DRI-ENERGY-2023", "NIH-ODS-PREGNANCY", "WHO-ANC-NUTRITION", "NICE-MATERNAL-2025");
  }

  if (form.breastfeeding) {
    focuses.push("breastfeeding");
    addUnique(adaptations, "انرژی و پروتئین برای شیردهی افزایش می‌یابد و منابع ید، کولین، کلسیم، B12 و امگا-۳ در اولویت قرار می‌گیرند.");
    addUnique(foodsToPrefer, "تخم‌مرغ، لبنیات یا جایگزین غنی‌شده، حبوبات، ماهی کم‌جیوه، مغزها و غلات کامل");
    addUnique(foodsToLimit, "الکل، مصرف زیاد کافئین و ماهی‌های پرجیوه");
    addUnique(cautions, "نیاز انرژی به انحصاری یا ترکیبی بودن شیردهی، ماه‌های پس از زایمان، BMI و فعالیت بستگی دارد.");
    if (care.breastfeeding.supplyConcern) addUnique(cautions, "نگرانی دربارهٔ شیر یا رشد شیرخوار باید با ماما، پزشک یا مشاور شیردهی ارزیابی شود؛ غذا به‌تنهایی علت همهٔ مشکلات شیر نیست.");
    sourceIds.push("CDC-LACTATION-2026", "NIH-ODS-PREGNANCY");
  }

  if (form.eatingDisorderConcern) {
    focuses.push("eating_disorder_support");
    requiresSmallFrequentMeals = true;
    addUnique(adaptations, "برنامه به الگوی منظم سه وعده و میان‌وعده‌ها برمی‌گردد و کسری یا مازاد هدف‌محور را اعمال نمی‌کند.");
    addUnique(foodsToPrefer, "وعده‌های کامل، متنوع و قابل‌پیش‌بینی از همهٔ گروه‌های غذایی");
    addUnique(foodsToLimit, "حذف گروه‌های غذایی، جبران وعده، روزه‌داری طولانی و قواعد سخت‌گیرانهٔ بدون نظر درمانگر");
    addUnique(cautions, "ابزار خودکار درمان اختلال خوردن نیست؛ برنامه باید در کنار درمان روان‌شناختی و پایش پزشکی استفاده شود.");
    if (!care.eatingDisorder.underProfessionalCare) addUnique(cautions, "به‌ویژه در صورت کاهش وزن سریع، استفراغ، مصرف ملین یا ضعف، ارزیابی حرفه‌ای را در اولویت قرار دهید.");
    sourceIds.push("NICE-EATING-DISORDERS-NG69");
  }

  const additionalAllergens = tokens(care.allergy.additionalAllergens);
  if (form.seriousFoodAllergy || additionalAllergens.length > 0) {
    focuses.push("allergy");
    addUnique(adaptations, "آلرژن‌های ثبت‌شده از کاتالوگ و مواد تشکیل‌دهنده حذف می‌شوند و جایگزین‌ها نیز دوباره بررسی می‌شوند.");
    addUnique(cautions, "میزانه نمی‌تواند تماس متقاطع کارخانه، رستوران یا آشپزخانه را تضمین کند؛ برچسب محصول و برنامهٔ اقدام آنافیلاکسی همچنان ضروری است.");
    if (!care.allergy.carriesEpinephrine) addUnique(cautions, "اگر اپی‌نفرین برای شما تجویز شده است، همراه‌داشتن و آموزش استفاده از آن بخشی از برنامهٔ ایمنی است.");
    sourceIds.push("AAAAI-FOOD-ALLERGY-2026");
  }

  if (form.swallowingDifficulty) {
    focuses.push("dysphagia");
    const food = care.dysphagia.foodLevel;
    const drink = care.dysphagia.drinkLevel;
    textureInstruction = food === "unknown" || drink === "unknown"
      ? "سطح بافت غذا یا غلظت نوشیدنی نامشخص است؛ غذاهای برنامه تا زمان تعیین سطح توسط متخصص بلع، ایمن تلقی نمی‌شوند."
      : `هر وعده باید مطابق ${iddsiFoodLabel(food)} و نوشیدنی مطابق ${iddsiDrinkLabel(drink)} آماده و با روش‌های آزمون IDDSI بررسی شود.`;
    addUnique(adaptations, textureInstruction);
    addUnique(foodsToPrefer, "غذاهای مرطوب، یکنواخت و قابل‌تطبیق با سطح IDDSI تجویزشده");
    addUnique(foodsToLimit, "بافت‌های خشک، خردشونده، چسبنده، رشته‌ای یا مخلوط جامدـمایع مگر اینکه در سطح تجویزشده مجاز باشند");
    addUnique(cautions, "تغییر بافت و غلظت فقط بر اساس ارزیابی بلع انجام می‌شود؛ غلیظ‌کردن خودسرانه می‌تواند دریافت مایع و دارو را مختل کند.");
    if (!care.dysphagia.assessedByProfessional) addUnique(cautions, "سطح بافت هنوز توسط گفتاردرمانگر یا تیم درمان تأیید نشده است.");
    sourceIds.push("IDDSI-FRAMEWORK", "ASHA-DYSPHAGIA");
  }

  if (conditions.has("kidney_disease")) {
    focuses.push("kidney");
    sodiumTargetMg = positiveNumber(care.kidney.sodiumLimitMg) ?? positiveNumber(care.customMnt.sodiumLimitMg) ?? sodiumTargetMg ?? 2000;
    if (care.kidney.potassiumStatus === "high") potassiumTargetMaxMg = positiveNumber(care.customMnt.potassiumLimitMg) ?? 2000;
    if (care.kidney.phosphorusStatus === "high") phosphorusTargetMaxMg = positiveNumber(care.customMnt.phosphorusLimitMg) ?? 800;
    fluidTargetMl = positiveNumber(care.kidney.fluidLimitMl) ?? positiveNumber(care.customMnt.fluidLimitMl);
    addUnique(adaptations, "سدیم کاهش می‌یابد؛ پروتئین، پتاسیم، فسفر و مایعات فقط بر اساس مرحلهٔ کلیه، دیالیز، آزمایش و محدودیت ثبت‌شده تنظیم می‌شوند.");
    addUnique(foodsToPrefer, "غذاهای کم‌سدیم و کم‌فرآوری؛ مقدار پروتئین و الکترولیت مطابق مرحله و آزمایش ثبت‌شده");
    addUnique(foodsToLimit, "نمک، غذاهای فرآوری‌شده و افزودنی‌های فسفاته؛ محدودیت پتاسیم فقط در صورت بالا بودن آزمایش یا دستور درمانی");
    addUnique(cautions, "یک «رژیم کلیوی» واحد وجود ندارد؛ نیاز پروتئین در دیالیز با بیماری کلیهٔ بدون دیالیز متفاوت است.");
    if (care.kidney.stage === "unknown") addUnique(assumptions, "مرحلهٔ بیماری کلیه نامشخص است؛ برنامه فقط سدیم را محافظه‌کارانه می‌کند و محدودیت پتاسیم/فسفر را حدس نمی‌زند.");
    sourceIds.push("KDOQI-CKD-NUTRITION-2020", "KDIGO-CKD-2024");
  }

  if (conditions.has("liver_disease")) {
    focuses.push("liver");
    requiresSmallFrequentMeals = care.liver.stage.includes("cirrhosis");
    requiresLateEveningSnack = care.liver.stage.includes("cirrhosis");
    if (care.liver.ascites) sodiumTargetMg = positiveNumber(care.liver.sodiumLimitMg) ?? positiveNumber(care.customMnt.sodiumLimitMg) ?? 2000;
    fluidTargetMl = positiveNumber(care.liver.fluidLimitMl) ?? fluidTargetMl;
    addUnique(adaptations, "از ناشتایی طولانی جلوگیری می‌شود؛ در سیروز، وعده‌های کوچک‌تر و میان‌وعدهٔ آخر شب برای حفظ تودهٔ بدون چربی در نظر گرفته می‌شود.");
    addUnique(foodsToPrefer, "پروتئین کافی، وعده‌های منظم، منابع گیاهی و لبنی در صورت تحمل");
    addUnique(foodsToLimit, "الکل؛ در آسیت، نمک و غذاهای بسیار شور طبق دستور درمانی");
    addUnique(cautions, "پروتئین در بیماری کبدی نباید خودسرانه حذف شود؛ گیجی یا تغییر هوشیاری نیازمند ارزیابی فوری است.");
    if (care.liver.stage === "unknown") addUnique(assumptions, "مرحله و وجود سیروز/آسیت نامشخص است؛ برنامه محدودیت شدید پروتئین یا مایع را حدس نمی‌زند.");
    sourceIds.push("ESPEN-LIVER-2020");
  }

  if (conditions.has("active_cancer_treatment")) {
    focuses.push("cancer");
    requiresSmallFrequentMeals = care.cancer.appetiteImpact !== "none" || care.cancer.nausea || care.cancer.mouthSores;
    addUnique(adaptations, "انرژی و پروتئین کافی، وعده‌های کوچک و پرتراکم و سازگاری با علائم اثرگذار بر خوردن در اولویت قرار می‌گیرد.");
    addUnique(foodsToPrefer, "غذاهای پرپروتئین و پرتراکمِ قابل‌تحمل، میان‌وعده‌ها و مایعات مغذی در صورت نیاز");
    addUnique(foodsToLimit, "مکمل‌های گیاهی یا دوزهای بالای آنتی‌اکسیدان بدون هماهنگی درمان؛ غذاهای ناایمن در صورت دستور احتیاط عفونت");
    if (care.cancer.mouthSores) addUnique(adaptations, "غذاهای نرم، خنک و غیرتند برای زخم دهان ترجیح داده می‌شوند.");
    if (care.cancer.nausea) addUnique(adaptations, "وعده‌های کوچک، کم‌بو و کم‌چرب‌تر برای تهوع ترجیح داده می‌شوند.");
    if (care.cancer.feverOrNeutropeniaPrecautions) addUnique(cautions, "تب یا دستور احتیاط نوتروپنی باید با تیم سرطان هماهنگ شود؛ ایمنی غذا از حذف غیرضروری گروه‌های غذایی مهم‌تر است.");
    sourceIds.push("ESPEN-CANCER-2021");
  }

  if (conditions.has("recent_major_surgery")) {
    focuses.push("surgery");
    requiresSmallFrequentMeals = care.surgery.poorIntakeOrVomiting || care.surgery.dietStage !== "regular";
    addUnique(adaptations, "برنامه با مرحلهٔ فعلی رژیم پس از جراحی، تحمل خوراکی و نیاز به پروتئین برای ترمیم سازگار می‌شود.");
    addUnique(foodsToPrefer, "خوراکی‌های پروتئینی و انرژی‌دار در حجم قابل‌تحمل، با پیشروی بافت طبق دستور جراح");
    addUnique(foodsToLimit, "غذاهای خارج از مرحلهٔ رژیم تجویزشده، الکل و مکمل‌های تداخلی");
    if (care.surgery.dietStage !== "regular") textureInstruction = `مرحلهٔ رژیم پس از جراحی: ${care.surgery.dietStage}. فقط غذاهای سازگار با این مرحله و دستور جراح مصرف شود.`;
    addUnique(cautions, "نوع جراحی و عوارض مسیر پیشروی غذا را تعیین می‌کند؛ استفراغ مداوم یا ناتوانی در تأمین خوراک نیازمند تماس با تیم جراحی است.");
    sourceIds.push("ESPEN-SURGERY-2025");
  }

  if (conditions.has("severe_gastrointestinal_condition") || form.severeDigestiveSymptoms) {
    focuses.push("gastrointestinal");
    const profile = care.gastrointestinal.profile;
    if (["gastroparesis", "chronic_diarrhea", "short_bowel_malabsorption", "ibd_flare", "pancreatic"].includes(profile)) requiresSmallFrequentMeals = true;
    if (profile === "celiac") addUnique(foodsToLimit, "تمام منابع گلوتن و تماس متقاطع گلوتن");
    if (profile === "gastroparesis") {
      addUnique(adaptations, "وعده‌ها کوچک‌تر، نرم‌تر و معمولاً کم‌چرب و کم‌فیبرتر می‌شوند تا تخلیهٔ معده آسان‌تر شود.");
      addUnique(foodsToLimit, "وعدهٔ حجیم، چربی زیاد، فیبر خشن و سبزی خام در صورت تشدید علائم");
    } else if (profile === "constipation") {
      addUnique(adaptations, "فیبر و مایعات به‌تدریج افزایش می‌یابد، مگر اینکه انسداد، محدودیت مایع یا منع پزشکی وجود داشته باشد.");
    } else if (profile === "ibd_flare") {
      addUnique(adaptations, "در دورهٔ شعله‌وری، بافت و فیبر بر اساس تحمل کاهش می‌یابد و حذف‌های طولانی بدون ارزیابی کمبود انجام نمی‌شود.");
    } else if (profile === "pancreatic") {
      addUnique(adaptations, "چربی هر وعده بر اساس تحمل و درمان آنزیمی توزیع می‌شود؛ حذف کامل چربی هدف نیست.");
    } else {
      addUnique(adaptations, "حجم، بافت، چربی، فیبر و لبنیات بر اساس زیرنوع بیماری و تحمل ثبت‌شده تنظیم می‌شود؛ محدودیت درمانی حدس زده نمی‌شود.");
    }
    if (care.gastrointestinal.lactoseRestriction) addUnique(foodsToLimit, "لاکتوز طبق تحمل و تشخیص ثبت‌شده");
    addUnique(cautions, "خونریزی، انسداد، استفراغ مداوم، کم‌آبی یا سوءجذب شدید به ارزیابی پزشکی و گاهی تغذیهٔ تخصصی نیاز دارد.");
    sourceIds.push("ESPEN-IBD-2023", "ESPEN-MALABSORPTION-2025");
  }

  if (conditions.has("medical_nutrition_therapy")) {
    focuses.push("medical_nutrition_therapy");
    sodiumTargetMg = positiveNumber(care.customMnt.sodiumLimitMg) ?? sodiumTargetMg;
    potassiumTargetMaxMg = positiveNumber(care.customMnt.potassiumLimitMg) ?? potassiumTargetMaxMg;
    phosphorusTargetMaxMg = positiveNumber(care.customMnt.phosphorusLimitMg) ?? phosphorusTargetMaxMg;
    fluidTargetMl = positiveNumber(care.customMnt.fluidLimitMl) ?? fluidTargetMl;
    carbohydratePerMealG = positiveNumber(care.customMnt.carbohydratePerMealG) ?? carbohydratePerMealG;
    addUnique(adaptations, "محدودیت‌های عددی و فهرست غذاهای واردشده توسط تیم درمانی در رتبه‌بندی و هشدارها اعمال می‌شوند.");
    addUnique(cautions, "اگر محدودیت درمانی وارد نشده باشد، میزانه آن را از نام بیماری حدس نمی‌زند.");
    sourceIds.push("USER-CLINICIAN-CONSTRAINTS");
  }

  const additionalAvoidTokens = [
    ...additionalAllergens,
    ...tokens(care.customMnt.foodsToAvoid),
    ...(form.pregnant ? ["خام", "نیم‌پز", "غیرپاستوریزه", "ماهی پرجیوه", "الکل"] : []),
    ...(care.gastrointestinal.profile === "celiac" ? ["گندم", "جو", "نان", "بلغور", "گلوتن"] : []),
    ...(care.gastrointestinal.lactoseRestriction ? ["شیر", "ماست", "پنیر", "کشک"] : []),
  ];
  const additionalPreferTokens = tokens(care.customMnt.foodsToInclude);

  const active = focuses.length > 0;
  return {
    active,
    focuses: [...new Set(focuses)],
    title: active ? "برنامهٔ حمایتیِ سازگار با وضعیت‌های ثبت‌شده" : "برنامهٔ عمومی تغذیه",
    summary: active
      ? "میزانه از اطلاعات واردشده برای انرژی، الگوی وعده، مواد مغذی و رتبه‌بندی غذا استفاده می‌کند. محدودیت‌های درمانی نامشخص را حدس نمی‌زند و خروجی همچنان باید با تیم درمان مرور شود."
      : "برنامه بر اساس هدف، انرژی، ترجیحات و حساسیت‌های ثبت‌شده ساخته می‌شود.",
    adaptations,
    cautions,
    foodsToPrefer,
    foodsToLimit,
    assumptions,
    sourceIds: [...new Set(sourceIds)],
    sodiumTargetMg,
    potassiumTargetMaxMg,
    phosphorusTargetMaxMg,
    fluidTargetMl,
    saturatedFatTargetG,
    consistentCarbohydratePattern,
    carbohydratePerMealG,
    requiresMedicationCoordination,
    requiresSmallFrequentMeals,
    requiresLateEveningSnack,
    additionalAvoidTokens: [...new Set(additionalAvoidTokens)],
    additionalPreferTokens: [...new Set(additionalPreferTokens)],
    textureInstruction,
  };
}

function textOf(meal: MealTemplate) {
  return `${meal.title} ${meal.ingredients.join(" ")}`;
}

export function clinicalMealScore(meal: MealTemplate, form: PlannerForm): number {
  const profile = getClinicalNutritionProfile(form);
  if (!profile.active) return 0;

  const text = textOf(meal);
  let score = 0;

  if (profile.additionalAvoidTokens.some((token) => text.includes(token))) score += 100_000;
  if (profile.additionalPreferTokens.some((token) => text.includes(token))) score -= 220;

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

  if (profile.focuses.includes("pregnancy")) {
    score -= (meal.ironMg ?? 0) * 20;
    score -= (meal.folateMcg ?? 0) * 0.4;
    score -= (meal.calciumMg ?? 0) * 0.15;
    score -= (meal.iodineMcg ?? 0) * 0.8;
    score -= (meal.cholineMg ?? 0) * 0.25;
    if (/خام|نیم‌پز|غیرپاستوریزه/.test(text)) score += 100_000;
  }

  if (profile.focuses.includes("breastfeeding")) {
    score -= (meal.iodineMcg ?? 0) * 0.8;
    score -= (meal.cholineMg ?? 0) * 0.3;
    score -= (meal.calciumMg ?? 0) * 0.1;
    score -= meal.protein * 4;
  }

  if (profile.focuses.includes("kidney")) {
    score += (meal.sodiumMg ?? 700) * 0.7;
    if (profile.potassiumTargetMaxMg) score += (meal.potassiumMg ?? 600) * 0.45;
    if (profile.phosphorusTargetMaxMg) score += (meal.phosphorusMg ?? 350) * 0.55;
  }

  if (profile.focuses.includes("liver")) {
    score -= meal.protein * 6;
    if (profile.sodiumTargetMg) score += (meal.sodiumMg ?? 700) * 0.5;
  }

  if (profile.focuses.includes("cancer") || profile.focuses.includes("surgery")) {
    score -= meal.protein * 8;
    if (form.clinicalCare.cancer.nausea || form.clinicalCare.surgery.poorIntakeOrVomiting) score += (meal.fat ?? 10) * 7 + meal.prep * 3;
    if (form.clinicalCare.cancer.mouthSores && /تند|ترش|خشک|نان تست/.test(text)) score += 350;
  }

  const gi = form.clinicalCare.gastrointestinal.profile;
  if (profile.focuses.includes("gastrointestinal")) {
    if (gi === "gastroparesis") score += (meal.fat ?? 10) * 12 + meal.fiber * 15;
    if (gi === "constipation") score -= meal.fiber * 20;
    if (gi === "ibd_flare" || gi === "chronic_diarrhea") score += Math.max(0, meal.fiber - 8) * 20 + (meal.fat ?? 10) * 4;
    if (gi === "pancreatic") score += (meal.fat ?? 10) * 10;
  }

  return score;
}

export function clinicalPreparationNote(form: PlannerForm): string | undefined {
  const profile = getClinicalNutritionProfile(form);
  const notes: string[] = [];
  if (profile.textureInstruction) notes.push(profile.textureInstruction);
  if (form.clinicalCare.cancer.mouthSores) notes.push("برای زخم دهان، غذا را نرم، مرطوب، خنک و بدون ادویهٔ تند/اسید زیاد آماده کنید.");
  if (form.clinicalCare.cancer.nausea) notes.push("برای تهوع، سهم کوچک، بوی کمتر و چربی کمتر را امتحان کنید.");
  if (form.clinicalCare.gastrointestinal.profile === "gastroparesis") notes.push("سهم کوچک و بافت نرم‌تر؛ چربی و فیبر را بر اساس تحمل محدود کنید.");
  if (form.clinicalCare.surgery.dietStage !== "regular" && form.medicalConditions.includes("recent_major_surgery")) notes.push(`فقط در صورت سازگاری با مرحلهٔ ${form.clinicalCare.surgery.dietStage} و دستور جراح مصرف شود.`);
  return notes.length ? notes.join(" ") : undefined;
}
