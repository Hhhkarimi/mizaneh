import type {
  MedicalCondition,
  PlannerForm,
  SafetyDisposition,
  SafetyIssue,
  SafetyIssueCategory,
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
  uncontrolled_diabetes: "دیابت کنترل‌نشده یا نیازمند هماهنگی دارو",
  serious_cardiovascular_disease: "بیماری جدی قلبی‌عروقی",
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

type IssueInput = Omit<SafetyIssue, "severity">;

export function screenSafety(form: PlannerForm): SafetyScreenResult {
  let disposition: SafetyDisposition = "ordinary_scope";
  const issues: SafetyIssue[] = [];
  const notices: string[] = [];
  const seenIssueIds = new Set<string>();

  const add = (
    next: Exclude<SafetyDisposition, "ordinary_scope">,
    issue: IssueInput,
  ) => {
    if (priority[next] > priority[disposition]) disposition = next;
    if (seenIssueIds.has(issue.id)) return;
    seenIssueIds.add(issue.id);
    issues.push({ ...issue, severity: next });
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
      explanation: "نیاز انرژی و رشد در کودکان و نوجوانان با بزرگسالان متفاوت است و برنامهٔ عمومی بزرگسالان می‌تواند مناسب نباشد.",
      nextStep: "برای برنامهٔ متناسب با سن و رشد، از پزشک یا متخصص تغذیهٔ واجد صلاحیت کمک بگیرید.",
    });
  }

  if (form.pregnant || form.breastfeeding) {
    add("professional_review_required", {
      id: "scope-pregnancy-breastfeeding",
      category: "scope",
      title: "بارداری یا شیردهی به برنامهٔ اختصاصی نیاز دارد",
      explanation: "در این دوره‌ها نیاز انرژی، پروتئین و ریزمغذی‌ها تغییر می‌کند و برنامهٔ عمومی میزانه برای آن طراحی نشده است.",
      nextStep: "پیش از تغییر هدف وزن یا دریافت انرژی، با پزشک یا متخصص تغذیهٔ آشنا با بارداری و شیردهی مشورت کنید.",
    });
  }

  if (form.eatingDisorderConcern) {
    add("professional_review_required", {
      id: "scope-eating-disorder",
      category: "scope",
      title: "نگرانی دربارهٔ اختلال خوردن نیازمند حمایت انسانی است",
      explanation: "محاسبهٔ کالری یا تغییر وزن ممکن است علائم را تشدید کند و ابزار خودکار نمی‌تواند ایمنی روانی و پزشکی را ارزیابی کند.",
      nextStep: "با پزشک، روان‌شناس یا متخصص تغذیهٔ آشنا با اختلالات خوردن تماس بگیرید. این محدودیت با پذیرش یک هشدار قابل دورزدن نیست.",
    });
  }

  if (form.seriousFoodAllergy) {
    add("professional_review_required", {
      id: "scope-serious-allergy",
      category: "medical_condition",
      title: "حساسیت غذایی جدی به کنترل تخصصی آلرژن نیاز دارد",
      explanation: "میزانه می‌تواند مواد ثبت‌شده را فیلتر کند، اما تماس متقاطع، برچسب محصول و ایمنی آماده‌سازی را تضمین نمی‌کند.",
      nextStep: "برنامه را با متخصص تغذیه یا تیم درمانی خود هماهنگ کنید و دستور اقدام اضطراری حساسیت را در دسترس نگه دارید.",
    });
  }

  if (form.medicalConditions.length > 0) {
    const selected = form.medicalConditions
      .map((condition) => medicalConditionLabels[condition])
      .join("، ");
    add("professional_review_required", {
      id: "scope-medical-condition",
      category: "medical_condition",
      title: "شرایط ثبت‌شده به تغذیه‌درمانی یا هماهنگی حرفه‌ای نیاز دارد",
      explanation: `موارد انتخاب‌شده: ${selected}. برنامهٔ عمومی نمی‌تواند محدودیت‌های آزمایشگاهی، دارویی یا درمانی این شرایط را به‌طور ایمن تنظیم کند.`,
      nextStep: "پیش از ساخت برنامه، هدف و محدودیت‌های غذایی را با پزشک یا متخصص تغذیهٔ درمانی خود مشخص کنید.",
    });
  }

  if (form.swallowingDifficulty) {
    add("professional_review_required", {
      id: "scope-swallowing",
      category: "medical_condition",
      title: "دشواری بلع یا جویدن به ارزیابی تخصصی نیاز دارد",
      explanation: "بافت، غلظت و ایمنی غذا باید متناسب با علت مشکل تعیین شود و برنامهٔ معمول ممکن است خطر خفگی یا دریافت ناکافی ایجاد کند.",
      nextStep: "برای ارزیابی بلع و تعیین بافت مناسب غذا از پزشک، گفتاردرمانگر یا متخصص تغذیه کمک بگیرید.",
    });
  }

  if (form.severeDigestiveSymptoms) {
    add("professional_review_required", {
      id: "scope-severe-digestive",
      category: "medical_condition",
      title: "علائم شدید گوارشی باید پیش از برنامه بررسی شود",
      explanation: "درد شدید، استفراغ مداوم، اسهال شدید یا احتمال سوءجذب می‌تواند بر جذب و ایمنی افزایش یا کاهش دریافت اثر بگذارد.",
      nextStep: "ابتدا علت علائم را با پزشک یا متخصص تغذیهٔ درمانی بررسی کنید و سپس برنامه را با توصیهٔ حرفه‌ای هماهنگ کنید.",
    });
  }

  if (Number.isFinite(bmi) && bmi < 16) {
    add("urgent_or_high_priority_assessment", {
      id: "nutrition-bmi-under-16",
      category: "nutrition_risk",
      title: "کم‌وزنی شدید و خطر شروع نامناسب تغذیه گزارش شده است",
      explanation: "در BMI کمتر از ۱۶، افزایش سریع دریافت بدون ارزیابی و پایش می‌تواند خطر بازغذیه و اختلالات الکترولیتی داشته باشد.",
      nextStep: "پیش از هر برنامهٔ افزایش یا کاهش انرژی، ارزیابی پزشکی و تغذیه‌ای با اولویت بالا دریافت کنید.",
    });
  } else if (Number.isFinite(bmi) && bmi < 18.5) {
    add("professional_review_required", {
      id: "nutrition-bmi-under-18-5",
      category: "nutrition_risk",
      title: form.goal === "weight_loss"
        ? "در این وزن، برنامهٔ خودکار کاهش وزن ایمن نیست"
        : "کم‌وزنی باید پیش از برنامهٔ افزایش وزن یا حجم بررسی شود",
      explanation: form.goal === "weight_loss"
        ? "BMI محاسبه‌شده کمتر از ۱۸٫۵ است و کاهش بیشتر وزن می‌تواند خطر کمبود تغذیه‌ای را افزایش دهد."
        : "BMI کمتر از ۱۸٫۵ می‌تواند با دریافت ناکافی یا یک علت پزشکی همراه باشد و فقط افزایش کالری پاسخ کافی نیست.",
      nextStep: "علت کم‌وزنی و وضعیت تغذیه‌ای را با پزشک یا متخصص تغذیه بررسی کنید.",
    });
  }

  const unintentionalLoss = toNumber(form.unintentionalLossPercent);
  const unintentionalLossMonths = toNumber(form.unintentionalLossMonths);
  const negligibleDays = toNumber(form.negligibleIntakeDays);
  const recentLossWindow = unintentionalLossMonths > 0 && unintentionalLossMonths <= 6;

  if (!form.intentionalWeightChange && unintentionalLoss > 0) {
    add("professional_review_required", {
      id: "nutrition-unintentional-loss",
      category: "nutrition_risk",
      title: "کاهش وزن ناخواسته باید علت‌یابی شود",
      explanation: "کاهش وزن بدون قصد قبلی می‌تواند ناشی از بیماری، دارو، کاهش اشتها یا مشکل جذب باشد و نباید فقط با یک برنامهٔ کالری جبران شود.",
      nextStep: "درصد و بازهٔ زمانی کاهش وزن را ثبت کنید و برای بررسی علت با پزشک یا متخصص تغذیه تماس بگیرید.",
    });
  }

  if (negligibleDays > 10 || (recentLossWindow && unintentionalLoss > 15)) {
    add("urgent_or_high_priority_assessment", {
      id: "nutrition-high-refeeding-risk",
      category: "nutrition_risk",
      title: "معیار پرخطر سوءتغذیه یا بازغذیه وجود دارد",
      explanation: negligibleDays > 10
        ? "بیش از ۱۰ روز دریافت ناچیز یا تقریباً صفر ثبت شده است. شروع سریع تغذیه می‌تواند نیازمند پایش پزشکی باشد."
        : "بیش از ۱۵٪ کاهش وزن ناخواسته در شش ماه یا کمتر ثبت شده است.",
      nextStep: "افزایش دریافت را خودسرانه و سریع شروع نکنید؛ ارزیابی با اولویت بالا توسط تیم درمانی لازم است.",
    });
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
        explanation: "ترکیب کم‌وزنی، کاهش وزن اخیر یا چند روز دریافت بسیار کم می‌تواند نیازمند شروع تدریجی و پایش باشد.",
        nextStep: "پیش از تغییر محسوس دریافت انرژی، ارزیابی تغذیه‌ای حرفه‌ای دریافت کنید.",
      });
    }
  }

  if (!form.intentionalWeightChange && unintentionalLoss > 0 && unintentionalLossMonths <= 0) {
    add("professional_review_required", {
      id: "nutrition-loss-window-unknown",
      category: "nutrition_risk",
      title: "بازهٔ زمانی کاهش وزن ناخواسته مشخص نیست",
      explanation: "بدون زمان وقوع کاهش وزن، شدت و فوریت خطر به‌درستی قابل ارزیابی نیست.",
      nextStep: "بازهٔ زمانی تقریبی را تکمیل کنید؛ اگر مطمئن نیستید، برای ارزیابی حرفه‌ای اقدام کنید.",
    });
  }

  const bp = form.cardiometabolic.bloodPressure;
  if (bp.enabled) {
    const systolic = toNumber(bp.systolic);
    const diastolic = toNumber(bp.diastolic);
    if (bp.concerningSymptoms) {
      add("urgent_or_high_priority_assessment", {
        id: "bp-warning-symptoms",
        category: "blood_pressure",
        title: "علائم هشدار قلبی، تنفسی یا عصبی گزارش شده است",
        explanation: "درد قفسهٔ سینه، تنگی نفس شدید، ضعف یا بی‌حسی، تغییر دید، اختلال گفتار، گیجی یا غش می‌تواند نیازمند ارزیابی فوری باشد.",
        nextStep: "برنامهٔ غذایی را ادامه ندهید و همین حالا از خدمات اورژانس محلی یا مراقبت پزشکی فوری کمک بگیرید.",
      });
    } else if (systolic > 180 || diastolic > 120) {
      add("professional_review_required", {
        id: "bp-severe-reading",
        category: "blood_pressure",
        title: "فشار خون ثبت‌شده بسیار بالاست",
        explanation: `عدد واردشده ${Number.isFinite(systolic) ? Math.round(systolic) : "—"}/${Number.isFinite(diastolic) ? Math.round(diastolic) : "—"} mmHg است. یک اندازه‌گیری را نمی‌توان تشخیص دانست، اما این محدوده باید به‌موقع بررسی شود.`,
        nextStep: "پس از حداقل یک دقیقه و با روش صحیح دوباره اندازه بگیرید. اگر همچنان بالاتر از ۱۸۰/۱۲۰ بود، در اسرع وقت با پزشک یا مرکز درمانی تماس بگیرید.",
      });
    } else if (bp.diagnosedHypertension) {
      add("general_support_only", {
        id: "bp-diagnosed-history",
        category: "blood_pressure",
        title: bp.stableUnderCare
          ? "برنامه فقط نقش حمایتی عمومی دارد"
          : "کنترل فشار خون نیازمند هماهنگی حرفه‌ای است",
        explanation: bp.stableUnderCare
          ? "سابقهٔ فشار خون ثبت شده و وضعیت پایدار و تحت پیگیری اعلام شده است. میزانه جایگزین هدف درمانی یا دارو نیست."
          : "سابقهٔ فشار خون ثبت شده، اما پایداری و پیگیری حرفه‌ای تأیید نشده است.",
        nextStep: bp.stableUnderCare
          ? "برنامه را فقط در کنار توصیه‌های تیم درمانی استفاده کنید و دارو یا هدف فشار را تغییر ندهید."
          : "پیش از تکیه بر برنامه، وضعیت و هدف‌های درمانی را با پزشک خود هماهنگ کنید.",
      });
    }
    notices.push("یک اندازه‌گیری منفرد برای تشخیص فشار خون کافی نیست؛ روند و روش اندازه‌گیری اهمیت دارد.");
  }

  const glycaemia = form.cardiometabolic.glycaemia;
  if (glycaemia.enabled) {
    const value = glucoseToMgDl(toNumber(glycaemia.value), glycaemia.unit);
    const isA1c = glycaemia.measurementType === "a1c" || glycaemia.unit === "percent";
    if (glycaemia.crisisSymptoms || (!isA1c && value > 0 && value < 54)) {
      add("urgent_or_high_priority_assessment", {
        id: "glycaemia-severe-low-or-crisis",
        category: "glycaemia",
        title: "افت قند شدید یا علائم بحران گزارش شده است",
        explanation: glycaemia.crisisSymptoms
          ? "علائم بحران، نیاز به کمک یا نگرانی کتون ثبت شده است؛ برنامهٔ غذایی عمومی برای این وضعیت کافی نیست."
          : `قند معادل حدود ${Math.round(value)} mg/dL است که در محدودهٔ افت قند شدید قرار می‌گیرد.`,
        nextStep: "در صورت علائم شدید یا ناتوانی در درمان افت قند، از خدمات اورژانس محلی کمک بگیرید؛ در غیر این صورت طبق برنامهٔ درمانی شخصی خود عمل و با تیم درمان تماس بگیرید.",
      });
    } else if (!isA1c && value > 0 && value < 70) {
      add("professional_review_required", {
        id: "glycaemia-low",
        category: "glycaemia",
        title: "قند خون پایین ثبت شده است",
        explanation: `قند معادل حدود ${Math.round(value)} mg/dL است. این مقدار می‌تواند به غذا، فعالیت یا دارو مرتبط باشد و پیش از تغییر برنامه باید بررسی شود.`,
        nextStep: "طبق دستور درمانی شخصی افت قند عمل کنید و علت این عدد را با پزشک یا تیم دیابت بررسی کنید.",
      });
    }

    if (glycaemia.insulinOrHypoglycaemiaMedicine || glycaemia.recurrentOrSevereHypoglycaemia) {
      add("professional_review_required", {
        id: "glycaemia-medication-or-recurrent-low",
        category: "glycaemia",
        title: "خطر افت قند به هماهنگی برنامه با درمان نیاز دارد",
        explanation: "انسولین، برخی داروها یا سابقهٔ افت قند تکرارشونده می‌تواند با تغییر مقدار و زمان کربوهیدرات تداخل داشته باشد.",
        nextStep: "پیش از اجرای برنامه، مقدار و زمان وعده‌ها را با پزشک یا متخصص تغذیهٔ آشنا با درمان دیابت هماهنگ کنید.",
      });
    } else if (glycaemia.diabetesHistory) {
      add("general_support_only", {
        id: "glycaemia-diabetes-history",
        category: "glycaemia",
        title: "میزانه فقط پشتیبانی عمومی ارائه می‌دهد",
        explanation: "سابقهٔ دیابت یا پیش‌دیابت ثبت شده است؛ یک الگوی ثابت کربوهیدرات یا هدف قند برای همه مناسب نیست.",
        nextStep: "برنامه را در کنار هدف‌ها و توصیه‌های تیم درمانی استفاده کنید و دارو را بر اساس این ابزار تغییر ندهید.",
      });
    }
    notices.push("میزانه از یک مقدار قند برای تشخیص دیابت یا تعیین هدف درمانی استفاده نمی‌کند.");
  }

  const lipids = form.cardiometabolic.lipids;
  if (lipids.enabled) {
    const triglycerides = triglyceridesToMgDl(toNumber(lipids.triglycerides), lipids.unit);
    if (triglycerides >= 1000) {
      add("urgent_or_high_priority_assessment", {
        id: "lipids-triglycerides-1000",
        category: "lipids",
        title: "تری‌گلیسرید در محدودهٔ بسیار بالا ثبت شده است",
        explanation: `مقدار معادل حدود ${Math.round(triglycerides)} mg/dL است. این سطح می‌تواند به ارزیابی سریع علت و خطر عوارض نیاز داشته باشد.`,
        nextStep: "پیش از اجرای برنامهٔ عمومی، در کوتاه‌ترین زمان ممکن با پزشک یا مرکز درمانی تماس بگیرید.",
      });
    } else if (triglycerides >= 500) {
      add("professional_review_required", {
        id: "lipids-triglycerides-500",
        category: "lipids",
        title: "تری‌گلیسرید بالا باید پیش از برنامه بررسی شود",
        explanation: `مقدار معادل حدود ${Math.round(triglycerides)} mg/dL است و برنامهٔ عمومی بدون شناخت علت، داروها و وضعیت آزمایش کافی نیست.`,
        nextStep: "نتیجهٔ آزمایش و ناشتا بودن آن را با پزشک بررسی کنید و سپس محدودیت‌های غذایی را وارد برنامه کنید.",
      });
    } else if (lipids.knownAscvdOrClinicianDirectedDiet || lipids.diagnosedDyslipidaemia) {
      add("general_support_only", {
        id: "lipids-history",
        category: "lipids",
        title: lipids.reviewedProfessionally
          ? "برنامه فقط نقش حمایتی عمومی دارد"
          : "نتیجهٔ چربی خون به تفسیر حرفه‌ای نیاز دارد",
        explanation: lipids.reviewedProfessionally
          ? "سابقهٔ اختلال چربی یا رژیم درمانی ثبت شده و نتیجه بررسی شده است؛ هدف LDL به ریسک فردی وابسته می‌ماند."
          : "هدف LDL و شدت مداخله فقط از روی یک عدد تعیین نمی‌شود و به ریسک قلبی‌عروقی و زمینهٔ پزشکی وابسته است.",
        nextStep: lipids.reviewedProfessionally
          ? "برنامه را مطابق محدودیت‌های تعیین‌شده توسط تیم درمانی اجرا کنید."
          : "نتیجه را با پزشک بررسی کنید و سپس هدف‌ها یا محدودیت‌های توصیه‌شده را در برنامه لحاظ کنید.",
      });
    }
    notices.push("میزانه هدف ثابت LDL برای همه تعیین نمی‌کند؛ هدف به ریسک و سابقهٔ فرد وابسته است.");
  }

  const reasons = issues.map(
    (issue) => `${issue.title} ${issue.explanation} اقدام بعدی: ${issue.nextStep}`,
  );

  return {
    disposition,
    blocked: priority[disposition] >= priority.professional_review_required,
    issues,
    reasons,
    notices: [...new Set(notices)],
    evaluatedAt: new Date().toISOString(),
    policyId: "safety.screen.v2",
  };
}
