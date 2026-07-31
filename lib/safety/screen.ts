import type {
  MedicalCondition,
  PlannerForm,
  SafetyDisposition,
  SafetyIssue,
  SafetyScreenResult,
} from "@/lib/types";
import { toNumber } from "@/lib/nutrition/format";

const priority: Record<SafetyDisposition, number> = {
  ordinary_scope: 0,
  general_support_only: 1,
  professional_review_required: 2,
  urgent_or_high_priority_assessment: 3,
};

const medicalConditionLabels: Record<MedicalCondition, string> = {
  kidney_disease: "بیماری کلیه نیازمند تنظیم غذا",
  liver_disease: "بیماری مهم کبدی",
  uncontrolled_diabetes: "دیابت یا قند خون نیازمند هماهنگی نزدیک‌تر با درمان",
  serious_cardiovascular_disease: "سابقهٔ بیماری قلبی‌عروقی یا رژیم تجویزشده",
  active_cancer_treatment: "درمان فعال سرطان",
  recent_major_surgery: "جراحی بزرگ اخیر",
  severe_gastrointestinal_condition: "بیماری شدید گوارشی یا سوءجذب",
  medical_nutrition_therapy: "وضعیتی که تغذیه‌درمانی پزشکی می‌خواهد",
};

function glucoseToMgDl(value: number, unit: "mg_dl" | "mmol_l" | "percent") {
  if (unit === "mmol_l") return value * 18;
  return value;
}

function triglyceridesToMgDl(value: number, unit: "mg_dl" | "mmol_l") {
  if (unit === "mmol_l") return value * 88.57;
  return value;
}

type IssueInput = Omit<SafetyIssue, "severity" | "blocksPlanning">;

export function screenSafety(form: PlannerForm): SafetyScreenResult {
  let disposition: SafetyDisposition = "ordinary_scope";
  const issues: SafetyIssue[] = [];
  const notices: string[] = [];
  const seenIssueIds = new Set<string>();
  const care = form.clinicalCare;

  const add = (
    next: Exclude<SafetyDisposition, "ordinary_scope">,
    issue: IssueInput,
    blocksPlanning = false,
  ) => {
    if (priority[next] > priority[disposition]) disposition = next;
    if (seenIssueIds.has(issue.id)) return;
    seenIssueIds.add(issue.id);
    issues.push({ ...issue, severity: next, blocksPlanning });
  };

  const age = toNumber(form.age);
  const height = toNumber(form.height);
  const weight = toNumber(form.weight);
  const bmi = weight / (height / 100) ** 2;

  if (!Number.isFinite(age) || age < 18) {
    add("professional_review_required", {
      id: "scope-under-18",
      category: "scope",
      title: "این نسخه برای افراد زیر ۱۸ سال طراحی نشده است",
      explanation: "رشد، بلوغ و نیاز انرژی کودکان و نوجوانان به ارزیابی اختصاصی نیاز دارد و معادلات بزرگسالان برای این گروه معتبر نیست.",
      nextStep: "برای برنامهٔ متناسب با سن و رشد از پزشک یا متخصص تغذیهٔ کودکان کمک بگیرید.",
    }, true);
  }

  if (form.pregnant) {
    add("professional_review_required", {
      id: "condition-pregnancy",
      category: "medical_condition",
      title: "برنامهٔ حمایتی بارداری ساخته می‌شود",
      explanation: "میزانه کسری وزن یا حجم‌گیری معمول را کنار می‌گذارد و بر کفایت انرژی، پروتئین، آهن، فولات، ید، کلسیم، کولین و ایمنی غذا تمرکز می‌کند.",
      nextStep: "برنامه و مکمل‌ها را در ویزیت بارداری بررسی کنید؛ مقدار مکمل یا افزایش وزن هدف را از روی این ابزار تغییر ندهید.",
    });
    if (care.pregnancy.severeVomitingOrDehydration) {
      add("urgent_or_high_priority_assessment", {
        id: "pregnancy-severe-vomiting-dehydration",
        category: "medical_condition",
        title: "استفراغ شدید یا کم‌آبی در بارداری ثبت شده است",
        explanation: "این وضعیت می‌تواند دریافت مایعات و الکترولیت‌ها را مختل کند و برنامهٔ خوراکی معمول ممکن است کافی نباشد.",
        nextStep: "همین امروز با تیم مراقبت بارداری یا مرکز درمانی تماس بگیرید؛ پس از ارزیابی می‌توانید برنامه را با محدودیت‌های اعلام‌شده بسازید.",
      }, true);
    }
  }

  if (form.breastfeeding) {
    add("professional_review_required", {
      id: "condition-breastfeeding",
      category: "medical_condition",
      title: "برنامهٔ حمایتی شیردهی ساخته می‌شود",
      explanation: "انرژی و مواد مغذی با توجه به نوع شیردهی و ماه‌های پس از زایمان تعدیل می‌شود و کاهش سریع وزن هدف‌گذاری نمی‌شود.",
      nextStep: "در صورت نگرانی دربارهٔ شیر، رشد شیرخوار یا محدودیت غذایی، برنامه را با پزشک، ماما یا مشاور شیردهی مرور کنید.",
    });
  }

  if (form.eatingDisorderConcern) {
    add("professional_review_required", {
      id: "condition-eating-disorder",
      category: "medical_condition",
      title: "برنامهٔ منظم و غیرکاهشی ساخته می‌شود",
      explanation: "کسری یا مازاد هدف‌محور حذف می‌شود و برنامه بر نظم وعده‌ها، کفایت و زبان غیرقضاوتی تمرکز می‌کند؛ این ابزار درمان اختلال خوردن نیست.",
      nextStep: "برنامه را با تیم درمان اختلال خوردن هماهنگ کنید و از وزن‌کشی یا تغییرات کالری خارج از برنامهٔ درمانی پرهیز کنید.",
    });
    if (care.eatingDisorder.faintingSevereWeaknessOrDehydration) {
      add("urgent_or_high_priority_assessment", {
        id: "eating-disorder-medical-instability",
        category: "nutrition_risk",
        title: "غش، ضعف شدید یا کم‌آبی گزارش شده است",
        explanation: "این نشانه‌ها می‌توانند با ناپایداری پزشکی یا اختلال الکترولیتی همراه باشند و برنامهٔ آنلاین نباید رسیدگی فوری را عقب بیندازد.",
        nextStep: "ارزیابی پزشکی فوری یا با اولویت بالا دریافت کنید.",
      }, true);
    }
  }

  if (form.seriousFoodAllergy) {
    add("professional_review_required", {
      id: "condition-serious-allergy",
      category: "medical_condition",
      title: "برنامه با حذف سخت‌گیرانهٔ آلرژن‌های ثبت‌شده ساخته می‌شود",
      explanation: "مواد دارای آلرژن و نام‌های ثبت‌شده حذف می‌شوند، اما میزانه نمی‌تواند برچسب کارخانه، آلودگی خط تولید یا تماس متقاطع آشپزخانه را تضمین کند.",
      nextStep: "برچسب هر محصول را بررسی کنید، دستور اقدام اضطراری و اپی‌نفرین تجویزشده را همراه داشته باشید و جایگزین‌ها را با متخصص آلرژی یا تغذیه مرور کنید.",
    });
    if (care.allergy.activeReactionSymptoms) {
      add("urgent_or_high_priority_assessment", {
        id: "allergy-active-reaction",
        category: "medical_condition",
        title: "علائم واکنش آلرژیک فعال ثبت شده است",
        explanation: "واکنش فعال می‌تواند سریع پیشرفت کند و انتخاب غذا در این لحظه اولویت نیست.",
        nextStep: "طبق برنامهٔ اضطراری حساسیت اقدام کنید و در صورت علائم شدید از خدمات اورژانس کمک بگیرید.",
      }, true);
    }
  }

  if (form.swallowingDifficulty) {
    add("professional_review_required", {
      id: "condition-dysphagia",
      category: "medical_condition",
      title: "برنامه بر اساس بافت ثبت‌شده ساخته می‌شود",
      explanation: care.dysphagia.foodLevel === "unknown" || care.dysphagia.drinkLevel === "unknown"
        ? "سطح بافت غذا یا غلظت نوشیدنی مشخص نیست؛ میزانه سطح را حدس نمی‌زند و فقط پیشنهادهای نرم و قابل‌تطبیق ارائه می‌کند."
        : "بافت غذا و نوشیدنی مطابق سطح IDDSI ثبت‌شده در یادداشت هر وعده نمایش داده می‌شود.",
      nextStep: "سطح بافت و غلظت را با گفتاردرمانگر یا تیم بلع تأیید کنید؛ غذا را صرفاً بر اساس ظاهر رقیق یا غلیظ نکنید.",
    });
    if (care.dysphagia.coughingChokingOrWetVoice) {
      add("urgent_or_high_priority_assessment", {
        id: "dysphagia-active-airway-signs",
        category: "medical_condition",
        title: "سرفه، خفگی یا صدای خیس هنگام خوردن ثبت شده است",
        explanation: "این نشانه‌ها می‌توانند با ورود غذا یا مایع به راه هوایی همراه باشند و تغییر خودسرانهٔ بافت همیشه خطر را برطرف نمی‌کند.",
        nextStep: "پیش از ادامهٔ برنامهٔ خوراکی، ارزیابی بلع با اولویت بالا دریافت کنید.",
      }, true);
    }
  }

  if (form.severeDigestiveSymptoms) {
    add("professional_review_required", {
      id: "condition-severe-digestive",
      category: "medical_condition",
      title: "برنامه با الگوی گوارشی ثبت‌شده سازگار می‌شود",
      explanation: "اندازه و تعداد وعده‌ها، فیبر، لاکتوز و بافت غذا بر اساس پروفایل انتخاب‌شده تنظیم می‌شود؛ محدودیت‌های بیماری‌ویژه بدون اطلاعات بالینی حدس زده نمی‌شوند.",
      nextStep: "علت و مرحلهٔ بیماری را با پزشک یا متخصص تغذیهٔ گوارش مشخص کنید و محدودیت‌های تجویزشده را در بخش تغذیه‌درمانی وارد کنید.",
    });
    if (care.gastrointestinal.activeBleedingObstructionOrPersistentVomiting) {
      add("urgent_or_high_priority_assessment", {
        id: "gastrointestinal-red-flags",
        category: "medical_condition",
        title: "خون‌ریزی، احتمال انسداد یا استفراغ مداوم ثبت شده است",
        explanation: "این علائم می‌توانند به ارزیابی فوری و گاهی توقف یا تغییر مسیر تغذیه نیاز داشته باشند.",
        nextStep: "پیش از اجرای برنامهٔ خوراکی، ارزیابی پزشکی فوری دریافت کنید.",
      }, true);
    }
  }

  if (form.medicalConditions.length > 0) {
    const selected = form.medicalConditions.map((condition) => medicalConditionLabels[condition]).join("، ");
    add("professional_review_required", {
      id: "condition-medical-nutrition-support",
      category: "medical_condition",
      title: "برنامهٔ شرط‌محور با هشدار پزشکی ساخته می‌شود",
      explanation: `موارد انتخاب‌شده: ${selected}. میزانه فقط محدودیت‌های واردشده و قواعد حمایتی محافظه‌کارانه را اعمال می‌کند و مرحلهٔ بیماری، دارو یا نتایج آزمایش را حدس نمی‌زند.`,
      nextStep: "برنامه را با تیم درمانی بازبینی کنید و محدودیت‌های دقیق سدیم، مایعات، پتاسیم، فسفر، پروتئین، کربوهیدرات یا بافت را در فیلدهای اختصاصی وارد کنید.",
    });
  }

  if (form.medicalConditions.includes("kidney_disease") && care.kidney.swellingOrBreathlessness) {
    add("urgent_or_high_priority_assessment", {
      id: "kidney-fluid-overload-symptoms",
      category: "medical_condition",
      title: "تورم قابل‌توجه یا تنگی نفس در بیماری کلیه ثبت شده است",
      explanation: "این نشانه‌ها می‌توانند با اضافه‌بار مایع یا وضعیت ناپایدار همراه باشند و مقدار مایعات نباید به‌طور خودکار تعیین شود.",
      nextStep: "برای ارزیابی سریع با تیم کلیه یا مرکز درمانی تماس بگیرید.",
    }, true);
  }

  if (form.medicalConditions.includes("liver_disease") && care.liver.encephalopathyOrConfusion) {
    add("urgent_or_high_priority_assessment", {
      id: "liver-confusion",
      category: "medical_condition",
      title: "گیجی یا نشانهٔ احتمالی انسفالوپاتی ثبت شده است",
      explanation: "تغییر سطح هوشیاری در بیماری کبدی نیازمند ارزیابی فوری است و محدودکردن خودسرانهٔ پروتئین توصیه نمی‌شود.",
      nextStep: "همین امروز با تیم کبد یا خدمات اورژانس تماس بگیرید.",
    }, true);
  }

  const conditionGi = form.medicalConditions.includes("severe_gastrointestinal_condition");
  if (conditionGi && care.gastrointestinal.activeBleedingObstructionOrPersistentVomiting) {
    add("urgent_or_high_priority_assessment", {
      id: "condition-gi-red-flags",
      category: "medical_condition",
      title: "علائم هشدار گوارشی فعال ثبت شده است",
      explanation: "خون‌ریزی، انسداد یا استفراغ مداوم ممکن است نیازمند ارزیابی و مسیر تغذیه‌ای متفاوت باشد.",
      nextStep: "پیش از ادامهٔ برنامه، ارزیابی پزشکی فوری دریافت کنید.",
    }, true);
  }

  if (Number.isFinite(bmi) && bmi < 16) {
    add("urgent_or_high_priority_assessment", {
      id: "nutrition-bmi-under-16",
      category: "nutrition_risk",
      title: "کم‌وزنی شدید و خطر شروع نامناسب تغذیه گزارش شده است",
      explanation: "در BMI کمتر از ۱۶، افزایش سریع دریافت می‌تواند نیازمند بررسی الکترولیت‌ها و شروع تحت پایش باشد.",
      nextStep: "پیش از اجرای برنامه، ارزیابی پزشکی و تغذیه‌ای با اولویت بالا دریافت کنید.",
    }, true);
  } else if (Number.isFinite(bmi) && bmi < 18.5) {
    add("professional_review_required", {
      id: "nutrition-bmi-under-18-5",
      category: "nutrition_risk",
      title: form.goal === "weight_loss" ? "کاهش وزن بیشتر در این BMI مناسب نیست" : "کم‌وزنی در برنامه لحاظ می‌شود",
      explanation: form.goal === "weight_loss"
        ? "BMI محاسبه‌شده کمتر از ۱۸٫۵ است؛ برنامهٔ کاهش وزن می‌تواند خطر کمبود تغذیه‌ای را افزایش دهد."
        : "برنامهٔ افزایش وزن به‌صورت تدریجی ساخته می‌شود، اما علت کم‌وزنی و کفایت دریافت نیز باید بررسی شود.",
      nextStep: "علت کم‌وزنی و روند وزن را با پزشک یا متخصص تغذیه مرور کنید.",
    }, form.goal === "weight_loss");
  }

  const unintentionalLoss = toNumber(form.unintentionalLossPercent);
  const unintentionalLossMonths = toNumber(form.unintentionalLossMonths);
  const negligibleDays = toNumber(form.negligibleIntakeDays);
  const recentLossWindow = unintentionalLossMonths > 0 && unintentionalLossMonths <= 6;

  if (!form.intentionalWeightChange && unintentionalLoss > 0) {
    add("professional_review_required", {
      id: "nutrition-unintentional-loss",
      category: "nutrition_risk",
      title: "کاهش وزن ناخواسته در برنامه لحاظ می‌شود",
      explanation: "کسری انرژی حذف می‌شود و غذاهای پرانرژی/پروتئین و وعده‌های کوچک‌تر می‌توانند اولویت بگیرند، اما علت کاهش وزن باید مشخص شود.",
      nextStep: "درصد و بازهٔ کاهش وزن را با پزشک یا متخصص تغذیه بررسی کنید.",
    });
  }

  if (negligibleDays > 10 || (recentLossWindow && unintentionalLoss > 15)) {
    add("urgent_or_high_priority_assessment", {
      id: "nutrition-high-refeeding-risk",
      category: "nutrition_risk",
      title: "معیار پرخطر سوءتغذیه یا بازغذیه وجود دارد",
      explanation: negligibleDays > 10
        ? "بیش از ۱۰ روز دریافت ناچیز یا تقریباً صفر ثبت شده است؛ شروع سریع تغذیه ممکن است نیازمند پایش الکترولیت باشد."
        : "بیش از ۱۵٪ کاهش وزن ناخواسته در شش ماه یا کمتر ثبت شده است.",
      nextStep: "افزایش دریافت را خودسرانه و سریع شروع نکنید؛ ارزیابی با اولویت بالا لازم است.",
    }, true);
  } else {
    const secondaryRiskCount = [
      Number.isFinite(bmi) && bmi < 18.5,
      recentLossWindow && unintentionalLoss > 10,
      negligibleDays > 5,
    ].filter(Boolean).length;
    if (secondaryRiskCount >= 2) {
      add("professional_review_required", {
        id: "nutrition-combined-refeeding-risk",
        category: "nutrition_risk",
        title: "چند نشانهٔ خطر سوءتغذیه هم‌زمان ثبت شده است",
        explanation: "برنامه با احتیاط و بدون افزایش تهاجمی ساخته می‌شود، اما ممکن است شروع تدریجی و پایش لازم باشد.",
        nextStep: "پیش از تغییر محسوس دریافت انرژی، ارزیابی تغذیه‌ای حرفه‌ای دریافت کنید.",
      });
    }
  }

  const bp = form.cardiometabolic.bloodPressure;
  if (bp.enabled) {
    const systolic = toNumber(bp.systolic);
    const diastolic = toNumber(bp.diastolic);
    if (bp.concerningSymptoms) {
      add("urgent_or_high_priority_assessment", {
        id: "bp-concerning-symptoms",
        category: "blood_pressure",
        title: "علائم هشدار قلبی یا عصبی ثبت شده است",
        explanation: "درد قفسهٔ سینه، تنگی نفس شدید، ضعف یا بی‌حسی، تغییر دید، اختلال گفتار، گیجی یا غش نیازمند ارزیابی فوری‌اند.",
        nextStep: "از خدمات اورژانس یا مرکز درمانی کمک بگیرید و ساخت برنامه را به بعد از ارزیابی موکول کنید.",
      }, true);
    } else if (systolic >= 180 || diastolic >= 120) {
      add("professional_review_required", {
        id: "bp-severe-without-symptoms",
        category: "blood_pressure",
        title: "فشار بسیار بالا بدون علائم ثبت شده است",
        explanation: "یک اندازه‌گیری منفرد تشخیص قطعی نیست، اما این مقدار باید با روش درست تکرار و سریع بررسی شود.",
        nextStep: "پس از چند دقیقه استراحت فشار را دوباره بگیرید و در صورت تداوم، همان روز با پزشک تماس بگیرید؛ برنامه با الگوی کم‌سدیم ساخته می‌شود.",
      });
    } else if (bp.diagnosedHypertension || systolic >= 130 || diastolic >= 80) {
      add("professional_review_required", {
        id: "bp-support",
        category: "blood_pressure",
        title: "برنامهٔ کم‌سدیم و نزدیک به DASH ساخته می‌شود",
        explanation: "سبزی، میوه، حبوبات، غلات کامل و پروتئین کم‌چرب اولویت می‌گیرند و غذاهای شور محدود می‌شوند.",
        nextStep: "فشار و دارو را با پزشک پیگیری کنید؛ دارو یا هدف فشار را بر اساس این برنامه تغییر ندهید.",
      });
    }
    notices.push("یک اندازه‌گیری فشار خون به‌تنهایی برای تشخیص کافی نیست؛ میانگین چند اندازه‌گیری معتبرتر است.");
  }

  const glycaemia = form.cardiometabolic.glycaemia;
  if (glycaemia.enabled) {
    const rawValue = toNumber(glycaemia.value);
    const mgDl = glucoseToMgDl(rawValue, glycaemia.unit);
    const isA1c = glycaemia.measurementType === "a1c";
    if (glycaemia.crisisSymptoms || (!isA1c && mgDl > 0 && mgDl < 54)) {
      add("urgent_or_high_priority_assessment", {
        id: "glycaemia-urgent",
        category: "glycaemia",
        title: glycaemia.crisisSymptoms ? "علائم بحران قند ثبت شده است" : "افت قند شدید ثبت شده است",
        explanation: glycaemia.crisisSymptoms
          ? "علائم شدید، کتون یا نیاز به کمک دیگران می‌تواند نیازمند رسیدگی فوری باشد."
          : `مقدار معادل حدود ${Math.round(mgDl)} mg/dL است و در محدودهٔ افت قند شدید قرار می‌گیرد.`,
        nextStep: "طبق برنامهٔ درمان افت/افزایش قند اقدام کنید و در صورت علائم شدید یا ناتوانی در درمان از خدمات اورژانس کمک بگیرید.",
      }, true);
    } else if (!isA1c && mgDl > 0 && mgDl < 70) {
      add("professional_review_required", {
        id: "glycaemia-low",
        category: "glycaemia",
        title: "افت قند ثبت شده است",
        explanation: "برنامه با توزیع منظم‌تر کربوهیدرات ساخته می‌شود، اما مقدار و زمان وعده باید با دارو هماهنگ باشد.",
        nextStep: "رویداد را با تیم درمان مرور کنید و انسولین یا دارو را خودسرانه تغییر ندهید.",
      });
    } else if (glycaemia.diabetesHistory || glycaemia.insulinOrHypoglycaemiaMedicine || rawValue > 0) {
      add("professional_review_required", {
        id: "glycaemia-support",
        category: "glycaemia",
        title: "برنامه با کربوهیدرات یکنواخت‌تر و فیبر بیشتر ساخته می‌شود",
        explanation: "سبزی غیرنشاسته‌ای، حبوبات، غلات کامل و پروتئین کم‌چرب اولویت می‌گیرند و قند افزوده و نوشیدنی شیرین محدود می‌شوند.",
        nextStep: "برنامه را با دارو، فعالیت و اهداف قند تعیین‌شده توسط تیم درمان هماهنگ کنید.",
      });
    }
    notices.push("میزانه از یک مقدار قند برای تشخیص یا تعیین هدف درمانی استفاده نمی‌کند.");
  }

  const lipids = form.cardiometabolic.lipids;
  if (lipids.enabled) {
    const triglycerides = triglyceridesToMgDl(toNumber(lipids.triglycerides), lipids.unit);
    if (triglycerides >= 1000) {
      add("urgent_or_high_priority_assessment", {
        id: "lipids-triglycerides-1000",
        category: "lipids",
        title: "تری‌گلیسرید در محدودهٔ بسیار بالا ثبت شده است",
        explanation: `مقدار معادل حدود ${Math.round(triglycerides)} mg/dL است و می‌تواند به ارزیابی سریع نیاز داشته باشد.`,
        nextStep: "پیش از اجرای برنامهٔ عادی در کوتاه‌ترین زمان با پزشک یا مرکز درمانی تماس بگیرید.",
      }, true);
    } else if (triglycerides >= 500 || lipids.diagnosedDyslipidaemia || lipids.knownAscvdOrClinicianDirectedDiet) {
      add("professional_review_required", {
        id: "lipids-support",
        category: "lipids",
        title: "برنامه با چربی اشباع کمتر و فیبر بیشتر ساخته می‌شود",
        explanation: "حبوبات، جو، مغزها، ماهی و چربی غیراشباع اولویت می‌گیرند و غذاهای سرخ‌شده و پرچرب محدود می‌شوند.",
        nextStep: "نتیجهٔ آزمایش و هدف LDL یا تری‌گلیسرید را با پزشک مرور کنید؛ هدف درمانی برای همه یکسان نیست.",
      });
    }
    notices.push("میزانه هدف ثابت LDL برای همه تعیین نمی‌کند؛ هدف به ریسک و سابقهٔ فرد وابسته است.");
  }

  const reasons = issues.map((issue) => `${issue.title} ${issue.explanation} اقدام بعدی: ${issue.nextStep}`);
  return {
    disposition,
    blocked: issues.some((issue) => issue.blocksPlanning),
    issues,
    reasons,
    notices: [...new Set(notices)],
    evaluatedAt: new Date().toISOString(),
    policyId: "safety.screen.v5",
  };
}
