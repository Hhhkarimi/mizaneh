"use client";

import type {
  MedicalCondition,
  PlannerForm,
  SafetyIssue,
  SafetyIssueCategory,
  SafetyScreenResult,
} from "@/lib/types";
import type { ReactNode } from "react";

const medicalOptions: Array<{ id: MedicalCondition; label: string }> = [
  { id: "kidney_disease", label: "بیماری کلیه نیازمند تنظیم غذا" },
  { id: "liver_disease", label: "بیماری مهم کبدی" },
  { id: "uncontrolled_diabetes", label: "دیابت کنترل‌نشده یا نیازمند هماهنگی دارو" },
  { id: "serious_cardiovascular_disease", label: "بیماری جدی قلبی‌عروقی" },
  { id: "active_cancer_treatment", label: "درمان فعال سرطان" },
  { id: "recent_major_surgery", label: "جراحی بزرگ اخیر" },
  { id: "severe_gastrointestinal_condition", label: "بیماری شدید گوارشی یا سوءجذب" },
  { id: "medical_nutrition_therapy", label: "وضعیتی که تغذیه‌درمانی پزشکی می‌خواهد" },
];

const dispositionCopy: Record<
  SafetyScreenResult["disposition"],
  { label: string; title: string; description: string; symbol: string }
> = {
  ordinary_scope: {
    label: "قابل برنامه‌ریزی",
    title: "بر اساس پاسخ‌های فعلی، برنامهٔ عمومی قابل ساخت است",
    description: "اگر اطلاعات سلامت یا داروهایتان تغییر کرد، این بخش را دوباره بررسی کنید.",
    symbol: "✓",
  },
  general_support_only: {
    label: "پشتیبانی عمومی",
    title: "برنامه قابل ساخت است، اما نقش درمانی ندارد",
    description: "میزانه باید در کنار توصیه‌های پزشک یا متخصص تغذیه استفاده شود و جایگزین هدف درمانی یا دارو نیست.",
    symbol: "i",
  },
  professional_review_required: {
    label: "فعلاً متوقف",
    title: "فعلاً برنامهٔ خودکار ساخته نمی‌شود",
    description: "یک یا چند پاسخ نشان می‌دهد برنامه باید ابتدا با پزشک یا متخصص تغذیه هماهنگ شود. دلیل دقیق و اقدام بعدی پایین آمده است.",
    symbol: "!",
  },
  urgent_or_high_priority_assessment: {
    label: "اولویت بالا",
    title: "برنامه را ادامه ندهید؛ ارزیابی سریع‌تر لازم است",
    description: "پاسخ‌های فعلی می‌تواند نشان‌دهندهٔ وضعیتی باشد که برنامهٔ غذایی نباید رسیدگی به آن را به تأخیر بیندازد.",
    symbol: "!",
  },
};

const categoryLabels: Record<SafetyIssueCategory, string> = {
  scope: "محدودهٔ استفاده",
  nutrition_risk: "خطر تغذیه‌ای",
  blood_pressure: "فشار خون",
  glycaemia: "قند خون",
  lipids: "چربی خون",
  medical_condition: "شرایط پزشکی",
};

type Props = {
  form: PlannerForm;
  result: SafetyScreenResult;
  onChange: (next: PlannerForm) => void;
};

type CheckOptionProps = {
  checked: boolean;
  children: ReactNode;
  onChange: (checked: boolean) => void;
};

function CheckOption({ checked, children, onChange }: CheckOptionProps) {
  return (
    <label className={`safety-check ${checked ? "is-selected" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

type HealthDisclosureProps = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children: ReactNode;
};

function HealthDisclosure({
  id,
  title,
  description,
  enabled,
  onToggle,
  children,
}: HealthDisclosureProps) {
  return (
    <section className={`health-context-card ${enabled ? "is-enabled" : ""}`}>
      <button
        type="button"
        className="health-context-toggle"
        aria-expanded={enabled}
        aria-controls={`${id}-fields`}
        aria-pressed={enabled}
        onClick={onToggle}
      >
        <span className="health-context-toggle__indicator" aria-hidden="true">
          {enabled ? "✓" : "+"}
        </span>
        <span className="health-context-toggle__copy">
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        <span className="health-context-toggle__state">
          {enabled ? "فعال" : "اختیاری"}
        </span>
      </button>
      {enabled && (
        <div className="health-context-card__body" id={`${id}-fields`}>
          {children}
        </div>
      )}
    </section>
  );
}

function SafetyIssueCard({ issue }: { issue: SafetyIssue }) {
  const urgent = issue.severity === "urgent_or_high_priority_assessment";
  return (
    <article className={`safety-issue ${urgent ? "is-urgent" : ""}`}>
      <div className="safety-issue__heading">
        <span>{categoryLabels[issue.category]}</span>
        <strong>{urgent ? "اولویت بالا" : issue.severity === "professional_review_required" ? "نیازمند بررسی" : "پشتیبانی عمومی"}</strong>
      </div>
      <h4>{issue.title}</h4>
      <p>{issue.explanation}</p>
      <div className="safety-issue__next-step">
        <span aria-hidden="true">←</span>
        <p><strong>اقدام بعدی:</strong> {issue.nextStep}</p>
      </div>
    </article>
  );
}

export function SafetyScreenFields({ form, result, onChange }: Props) {
  const patch = (value: Partial<PlannerForm>) => onChange({ ...form, ...value });
  const patchBp = (value: Partial<PlannerForm["cardiometabolic"]["bloodPressure"]>) =>
    patch({ cardiometabolic: { ...form.cardiometabolic, bloodPressure: { ...form.cardiometabolic.bloodPressure, ...value } } });
  const patchGlucose = (value: Partial<PlannerForm["cardiometabolic"]["glycaemia"]>) =>
    patch({ cardiometabolic: { ...form.cardiometabolic, glycaemia: { ...form.cardiometabolic.glycaemia, ...value } } });
  const patchLipids = (value: Partial<PlannerForm["cardiometabolic"]["lipids"]>) =>
    patch({ cardiometabolic: { ...form.cardiometabolic, lipids: { ...form.cardiometabolic.lipids, ...value } } });

  function toggleCondition(id: MedicalCondition) {
    patch({
      medicalConditions: form.medicalConditions.includes(id)
        ? form.medicalConditions.filter((item) => item !== id)
        : [...form.medicalConditions, id],
    });
  }

  const status = dispositionCopy[result.disposition];

  return (
    <section className="safety-screen" aria-labelledby="safety-screen-title">
      <div className="safety-screen__heading">
        <div>
          <span className="step-label">بررسی ایمنی پیش از ساخت برنامه</span>
          <h3 id="safety-screen-title">چند سؤال کوتاه دربارهٔ وضعیت سلامت</h3>
          <p className="safety-screen__intro">
            فقط مواردی را انتخاب کنید که درباره‌شان اطلاع دارید. انتخاب یک مورد به معنی تشخیص نیست؛ هدف این بخش جلوگیری از ساخت برنامهٔ عمومی در موقعیت‌های نامناسب است.
          </p>
        </div>
        <span className={`safety-disposition safety-disposition--${result.disposition}`}>
          <span aria-hidden="true">{status.symbol}</span>
          {status.label}
        </span>
      </div>

      <div
        id="safety-screen-result"
        className={`safety-decision safety-decision--${result.disposition}`}
        role="status"
        aria-live="polite"
        tabIndex={-1}
      >
        <div className="safety-decision__summary">
          <span className="safety-decision__symbol" aria-hidden="true">{status.symbol}</span>
          <div>
            <h4>{status.title}</h4>
            <p>{status.description}</p>
          </div>
        </div>

        {result.issues.length > 0 && (
          <div className="safety-issue-list" aria-label="دلایل نتیجهٔ بررسی ایمنی">
            {result.issues.map((issue) => <SafetyIssueCard key={issue.id} issue={issue} />)}
          </div>
        )}

        {result.notices.length > 0 && (
          <details className="safety-notices">
            <summary>نکات تکمیلی دربارهٔ اعداد واردشده</summary>
            <ul>{result.notices.map((notice) => <li key={notice}>{notice}</li>)}</ul>
          </details>
        )}
      </div>

      <div className="check-grid" aria-label="شرایط عمومی سلامت">
        <CheckOption checked={form.pregnant} onChange={(checked) => patch({ pregnant: checked })}>باردار هستم</CheckOption>
        <CheckOption checked={form.breastfeeding} onChange={(checked) => patch({ breastfeeding: checked })}>در دوران شیردهی هستم</CheckOption>
        <CheckOption checked={form.eatingDisorderConcern} onChange={(checked) => patch({ eatingDisorderConcern: checked })}>اختلال خوردن تشخیص‌داده‌شده یا نگرانی جدی دارم</CheckOption>
        <CheckOption checked={form.seriousFoodAllergy} onChange={(checked) => patch({ seriousFoodAllergy: checked })}>حساسیت غذایی جدی یا خطر تماس متقاطع دارم</CheckOption>
        <CheckOption checked={form.swallowingDifficulty} onChange={(checked) => patch({ swallowingDifficulty: checked })}>دشواری بلع یا جویدن دارم</CheckOption>
        <CheckOption checked={form.severeDigestiveSymptoms} onChange={(checked) => patch({ severeDigestiveSymptoms: checked })}>علائم شدید گوارشی یا احتمال سوءجذب دارم</CheckOption>
      </div>

      <details className="safety-details-group">
        <summary>
          <span>بیماری‌ها و شرایط نیازمند برنامهٔ تخصصی</span>
          <small>{form.medicalConditions.length > 0 ? `${form.medicalConditions.length.toLocaleString("fa-IR")} مورد انتخاب شده` : "در صورت وجود باز کنید"}</small>
        </summary>
        <div className="check-grid">
          {medicalOptions.map((option) => (
            <CheckOption
              key={option.id}
              checked={form.medicalConditions.includes(option.id)}
              onChange={() => toggleCondition(option.id)}
            >
              {option.label}
            </CheckOption>
          ))}
        </div>
      </details>

      <details className="safety-details-group" open={form.goal === "healthy_weight_gain"}>
        <summary>
          <span>کاهش وزن ناخواسته و دریافت بسیار کم</span>
          <small>برای بررسی خطر سوءتغذیه و بازغذیه</small>
        </summary>
        <div className="field-grid field-grid--two safety-field-grid">
          <label>
            <span>آیا تغییر وزن با قصد خودتان بوده است؟</span>
            <select value={form.intentionalWeightChange ? "yes" : "no"} onChange={(event) => patch({ intentionalWeightChange: event.target.value === "yes" })}>
              <option value="yes">بله، عمدی بوده</option>
              <option value="no">خیر یا مطمئن نیستم</option>
            </select>
          </label>
          <label>
            <span>درصد کاهش وزن ناخواسته</span>
            <span className="input-wrap"><input type="number" min="0" max="100" value={form.unintentionalLossPercent} onChange={(event) => patch({ unintentionalLossPercent: event.target.value })} /><small>٪</small></span>
          </label>
          <label>
            <span>این کاهش در چند ماه رخ داده است؟</span>
            <span className="input-wrap"><input type="number" min="0" max="24" value={form.unintentionalLossMonths} onChange={(event) => patch({ unintentionalLossMonths: event.target.value })} /><small>ماه</small></span>
          </label>
          <label>
            <span>روزهای دریافت ناچیز یا تقریباً صفر</span>
            <span className="input-wrap"><input type="number" min="0" max="60" value={form.negligibleIntakeDays} onChange={(event) => patch({ negligibleIntakeDays: event.target.value })} /><small>روز</small></span>
          </label>
        </div>
        <p className="form-note form-note--prominent">کاهش وزن ناخواسته یا چند روز دریافت بسیار کم می‌تواند علت پزشکی یا خطر شروع مجدد تغذیه داشته باشد و با انتخاب هدف دیگر دور زده نمی‌شود.</p>
      </details>

      <details className="safety-details-group health-details">
        <summary>
          <span>فشار خون، قند خون و چربی خون</span>
          <small>اختیاری؛ فقط برای تعیین مرز ایمنی</small>
        </summary>
        <p className="health-details__intro">هر کارت را فقط در صورت داشتن سابقه یا عدد معتبر فعال کنید. خاموش‌کردن کارت، اطلاعات واردشده را پاک نمی‌کند.</p>

        <HealthDisclosure
          id="blood-pressure"
          title="فشار خون"
          description="سابقهٔ فشار یا یک اندازه‌گیری اخیر را ثبت کنید"
          enabled={form.cardiometabolic.bloodPressure.enabled}
          onToggle={() => patchBp({ enabled: !form.cardiometabolic.bloodPressure.enabled })}
        >
          <div className="field-grid field-grid--two health-field-grid">
            <label><span>فشار بالا (سیستولیک)</span><span className="input-wrap"><input type="number" inputMode="numeric" min="40" max="300" value={form.cardiometabolic.bloodPressure.systolic} onChange={(event) => patchBp({ systolic: event.target.value })} /><small>mmHg</small></span></label>
            <label><span>فشار پایین (دیاستولیک)</span><span className="input-wrap"><input type="number" inputMode="numeric" min="20" max="200" value={form.cardiometabolic.bloodPressure.diastolic} onChange={(event) => patchBp({ diastolic: event.target.value })} /><small>mmHg</small></span></label>
            <label><span>زمینهٔ اندازه‌گیری</span><select value={form.cardiometabolic.bloodPressure.measurementContext} onChange={(event) => patchBp({ measurementContext: event.target.value as PlannerForm["cardiometabolic"]["bloodPressure"]["measurementContext"] })}><option value="home_average">میانگین چند بار اندازه‌گیری در خانه</option><option value="clinic">درمانگاه یا مطب</option><option value="single_or_unknown">یک‌بار یا نامشخص</option></select></label>
            <label><span>تاریخ و زمان، در صورت اطلاع</span><input type="datetime-local" value={form.cardiometabolic.bloodPressure.measuredAt} onChange={(event) => patchBp({ measuredAt: event.target.value })} /></label>
            <label className="health-field-grid__wide"><span>دستگاه یا اندازهٔ کاف، در صورت اطلاع</span><input maxLength={120} value={form.cardiometabolic.bloodPressure.deviceContext} onChange={(event) => patchBp({ deviceContext: event.target.value })} placeholder="مثلاً دستگاه بازویی با کاف مناسب" /></label>
          </div>
          <div className="health-check-list">
            <CheckOption checked={form.cardiometabolic.bloodPressure.diagnosedHypertension} onChange={(checked) => patchBp({ diagnosedHypertension: checked })}>سابقهٔ تشخیص فشار خون بالا دارم</CheckOption>
            {form.cardiometabolic.bloodPressure.diagnosedHypertension && <CheckOption checked={form.cardiometabolic.bloodPressure.stableUnderCare} onChange={(checked) => patchBp({ stableUnderCare: checked })}>وضعیت پایدار و تحت پیگیری حرفه‌ای است</CheckOption>}
            <CheckOption checked={form.cardiometabolic.bloodPressure.concerningSymptoms} onChange={(checked) => patchBp({ concerningSymptoms: checked })}>هم‌زمان درد قفسهٔ سینه، تنگی نفس شدید، ضعف یا بی‌حسی، تغییر دید، اختلال گفتار، گیجی یا غش دارم</CheckOption>
          </div>
        </HealthDisclosure>

        <HealthDisclosure
          id="glycaemia"
          title="قند خون"
          description="سابقهٔ دیابت، دارو یا یک نتیجهٔ معتبر را ثبت کنید"
          enabled={form.cardiometabolic.glycaemia.enabled}
          onToggle={() => patchGlucose({ enabled: !form.cardiometabolic.glycaemia.enabled })}
        >
          <div className="field-grid field-grid--two health-field-grid">
            <label><span>نوع اندازه‌گیری</span><select value={form.cardiometabolic.glycaemia.measurementType} onChange={(event) => patchGlucose({ measurementType: event.target.value as PlannerForm["cardiometabolic"]["glycaemia"]["measurementType"] })}><option value="fasting">قند ناشتا</option><option value="random">قند تصادفی یا دستگاهی</option><option value="ogtt_2h">دو ساعت پس از OGTT</option><option value="a1c">A1C</option></select></label>
            <label><span>مقدار</span><input type="number" inputMode="decimal" min="0" step="0.1" value={form.cardiometabolic.glycaemia.value} onChange={(event) => patchGlucose({ value: event.target.value })} /></label>
            <label><span>واحد</span><select value={form.cardiometabolic.glycaemia.unit} onChange={(event) => patchGlucose({ unit: event.target.value as PlannerForm["cardiometabolic"]["glycaemia"]["unit"] })}><option value="mg_dl">mg/dL</option><option value="mmol_l">mmol/L</option><option value="percent">درصد برای A1C</option></select></label>
            <label><span>منبع اندازه‌گیری</span><select value={form.cardiometabolic.glycaemia.sourceContext} onChange={(event) => patchGlucose({ sourceContext: event.target.value as PlannerForm["cardiometabolic"]["glycaemia"]["sourceContext"] })}><option value="laboratory">آزمایشگاه</option><option value="home_meter">دستگاه خانگی</option><option value="cgm">حسگر مداوم قند</option><option value="unknown">نامشخص</option></select></label>
            <label><span>تاریخ و زمان، در صورت اطلاع</span><input type="datetime-local" value={form.cardiometabolic.glycaemia.measuredAt} onChange={(event) => patchGlucose({ measuredAt: event.target.value })} /></label>
          </div>
          <div className="health-check-list">
            <CheckOption checked={form.cardiometabolic.glycaemia.diabetesHistory} onChange={(checked) => patchGlucose({ diabetesHistory: checked })}>سابقهٔ دیابت یا پیش‌دیابت دارم</CheckOption>
            <CheckOption checked={form.cardiometabolic.glycaemia.insulinOrHypoglycaemiaMedicine} onChange={(checked) => patchGlucose({ insulinOrHypoglycaemiaMedicine: checked })}>انسولین یا دارویی با خطر افت قند مصرف می‌کنم</CheckOption>
            <CheckOption checked={form.cardiometabolic.glycaemia.recurrentOrSevereHypoglycaemia} onChange={(checked) => patchGlucose({ recurrentOrSevereHypoglycaemia: checked })}>افت قند تکرارشونده یا شدید داشته‌ام</CheckOption>
            <CheckOption checked={form.cardiometabolic.glycaemia.crisisSymptoms} onChange={(checked) => patchGlucose({ crisisSymptoms: checked })}>علائم شدید، نیاز به کمک دیگران یا نگرانی کتون وجود دارد</CheckOption>
          </div>
        </HealthDisclosure>

        <HealthDisclosure
          id="lipids"
          title="چربی خون"
          description="نتیجهٔ آزمایش یا سابقهٔ اختلال چربی را ثبت کنید"
          enabled={form.cardiometabolic.lipids.enabled}
          onToggle={() => patchLipids({ enabled: !form.cardiometabolic.lipids.enabled })}
        >
          <div className="field-grid field-grid--two health-field-grid">
            <label><span>LDL-C</span><span className="input-wrap"><input type="number" inputMode="decimal" min="0" value={form.cardiometabolic.lipids.ldl} onChange={(event) => patchLipids({ ldl: event.target.value })} /><small>{form.cardiometabolic.lipids.unit === "mg_dl" ? "mg/dL" : "mmol/L"}</small></span></label>
            <label><span>HDL-C</span><span className="input-wrap"><input type="number" inputMode="decimal" min="0" value={form.cardiometabolic.lipids.hdl} onChange={(event) => patchLipids({ hdl: event.target.value })} /><small>{form.cardiometabolic.lipids.unit === "mg_dl" ? "mg/dL" : "mmol/L"}</small></span></label>
            <label><span>تری‌گلیسرید</span><span className="input-wrap"><input type="number" inputMode="decimal" min="0" value={form.cardiometabolic.lipids.triglycerides} onChange={(event) => patchLipids({ triglycerides: event.target.value })} /><small>{form.cardiometabolic.lipids.unit === "mg_dl" ? "mg/dL" : "mmol/L"}</small></span></label>
            <label><span>واحد همهٔ اعداد</span><select value={form.cardiometabolic.lipids.unit} onChange={(event) => patchLipids({ unit: event.target.value as PlannerForm["cardiometabolic"]["lipids"]["unit"] })}><option value="mg_dl">mg/dL</option><option value="mmol_l">mmol/L</option></select></label>
            <label><span>تاریخ و زمان آزمایش</span><input type="datetime-local" value={form.cardiometabolic.lipids.measuredAt} onChange={(event) => patchLipids({ measuredAt: event.target.value })} /></label>
          </div>
          <div className="health-check-list">
            <CheckOption checked={form.cardiometabolic.lipids.fastingKnown} onChange={(checked) => patchLipids({ fastingKnown: checked })}>وضعیت ناشتا بودن این آزمایش مشخص است</CheckOption>
            <CheckOption checked={form.cardiometabolic.lipids.diagnosedDyslipidaemia} onChange={(checked) => patchLipids({ diagnosedDyslipidaemia: checked })}>سابقهٔ تشخیص اختلال چربی خون دارم</CheckOption>
            {form.cardiometabolic.lipids.diagnosedDyslipidaemia && <CheckOption checked={form.cardiometabolic.lipids.reviewedProfessionally} onChange={(checked) => patchLipids({ reviewedProfessionally: checked })}>این نتیجه توسط پزشک یا متخصص بررسی شده است</CheckOption>}
            <CheckOption checked={form.cardiometabolic.lipids.knownAscvdOrClinicianDirectedDiet} onChange={(checked) => patchLipids({ knownAscvdOrClinicianDirectedDiet: checked })}>بیماری قلبی‌عروقی شناخته‌شده یا رژیم درمانی تجویزشده دارم</CheckOption>
          </div>
          <p className="form-note form-note--prominent">میزانه برای همه یک هدف LDL تعیین نمی‌کند؛ هدف مناسب به ریسک قلبی‌عروقی و نظر تیم درمانی وابسته است.</p>
        </HealthDisclosure>
      </details>
    </section>
  );
}
