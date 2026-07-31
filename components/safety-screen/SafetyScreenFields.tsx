"use client";

import type { MedicalCondition, PlannerForm, SafetyScreenResult } from "@/lib/types";

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

type Props = {
  form: PlannerForm;
  result: SafetyScreenResult;
  onChange: (next: PlannerForm) => void;
};

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

  return (
    <section className="safety-screen" aria-labelledby="safety-screen-title">
      <div className="safety-screen__heading">
        <div><span className="step-label">مرز ایمنی</span><h3 id="safety-screen-title">آیا برنامه‌ریزی عمومی برای شما مناسب است؟</h3></div>
        <span className={`safety-disposition safety-disposition--${result.disposition}`}>
          {result.disposition === "ordinary_scope" ? "در محدودهٔ عمومی" : result.disposition === "general_support_only" ? "فقط پشتیبانی عمومی" : result.disposition === "professional_review_required" ? "بررسی حرفه‌ای لازم است" : "ارزیابی با اولویت بالا"}
        </span>
      </div>

      <div className="check-grid">
        <label><input type="checkbox" checked={form.pregnant} onChange={(event) => patch({ pregnant: event.target.checked })} /><span>باردار هستم</span></label>
        <label><input type="checkbox" checked={form.breastfeeding} onChange={(event) => patch({ breastfeeding: event.target.checked })} /><span>در دوران شیردهی هستم</span></label>
        <label><input type="checkbox" checked={form.eatingDisorderConcern} onChange={(event) => patch({ eatingDisorderConcern: event.target.checked })} /><span>اختلال خوردن تشخیص‌داده‌شده یا نگرانی جدی دارم</span></label>
        <label><input type="checkbox" checked={form.seriousFoodAllergy} onChange={(event) => patch({ seriousFoodAllergy: event.target.checked })} /><span>حساسیت غذایی جدی یا خطر تماس متقاطع دارم</span></label>
        <label><input type="checkbox" checked={form.swallowingDifficulty} onChange={(event) => patch({ swallowingDifficulty: event.target.checked })} /><span>دشواری بلع یا جویدن دارم</span></label>
        <label><input type="checkbox" checked={form.severeDigestiveSymptoms} onChange={(event) => patch({ severeDigestiveSymptoms: event.target.checked })} /><span>علائم شدید گوارشی یا احتمال سوءجذب دارم</span></label>
      </div>

      <details>
        <summary>بیماری‌ها و شرایط نیازمند برنامهٔ تخصصی</summary>
        <div className="check-grid">
          {medicalOptions.map((option) => (
            <label key={option.id}><input type="checkbox" checked={form.medicalConditions.includes(option.id)} onChange={() => toggleCondition(option.id)} /><span>{option.label}</span></label>
          ))}
        </div>
      </details>

      <details open={form.goal === "healthy_weight_gain"}>
        <summary>کاهش وزن ناخواسته، دریافت ناچیز و خطر سوءتغذیه</summary>
        <div className="field-grid field-grid--three">
          <label><span>تغییر وزن عمدی است؟</span><select value={form.intentionalWeightChange ? "yes" : "no"} onChange={(event) => patch({ intentionalWeightChange: event.target.value === "yes" })}><option value="yes">بله</option><option value="no">خیر یا مطمئن نیستم</option></select></label>
          <label><span>درصد کاهش ناخواسته</span><span className="input-wrap"><input type="number" min="0" max="100" value={form.unintentionalLossPercent} onChange={(event) => patch({ unintentionalLossPercent: event.target.value })} /><small>٪</small></span></label>
          <label><span>این کاهش در چند ماه رخ داده؟</span><span className="input-wrap"><input type="number" min="0" max="24" value={form.unintentionalLossMonths} onChange={(event) => patch({ unintentionalLossMonths: event.target.value })} /><small>ماه</small></span></label>
          <label><span>روزهای دریافت ناچیز یا تقریباً صفر</span><span className="input-wrap"><input type="number" min="0" max="60" value={form.negligibleIntakeDays} onChange={(event) => patch({ negligibleIntakeDays: event.target.value })} /><small>روز</small></span></label>
        </div>
        <p className="form-note">کاهش وزن ناخواسته یا چند روز دریافت بسیار کم می‌تواند علت پزشکی یا خطر شروع مجدد تغذیه داشته باشد و با انتخاب هدف دیگر دور زده نمی‌شود.</p>
      </details>

      <details>
        <summary>فشار خون، قند خون و چربی خون — اختیاری</summary>
        <p className="form-note">این اطلاعات فقط برای تعیین مرز ایمنی و توضیح عمومی استفاده می‌شوند؛ میزانه تشخیص نمی‌دهد، دارو را تغییر نمی‌دهد و هدف ثابت LDL یا قند برای همه نمی‌سازد.</p>

        <fieldset className="health-context-card">
          <legend><label><input type="checkbox" checked={form.cardiometabolic.bloodPressure.enabled} onChange={(event) => patchBp({ enabled: event.target.checked })} /> فشار خون</label></legend>
          {form.cardiometabolic.bloodPressure.enabled && <>
            <div className="field-grid field-grid--three">
              <label><span>سیستولیک</span><span className="input-wrap"><input type="number" value={form.cardiometabolic.bloodPressure.systolic} onChange={(event) => patchBp({ systolic: event.target.value })} /><small>mmHg</small></span></label>
              <label><span>دیاستولیک</span><span className="input-wrap"><input type="number" value={form.cardiometabolic.bloodPressure.diastolic} onChange={(event) => patchBp({ diastolic: event.target.value })} /><small>mmHg</small></span></label>
              <label><span>زمینهٔ اندازه‌گیری</span><select value={form.cardiometabolic.bloodPressure.measurementContext} onChange={(event) => patchBp({ measurementContext: event.target.value as PlannerForm["cardiometabolic"]["bloodPressure"]["measurementContext"] })}><option value="home_average">میانگین تکرارشدهٔ خانه</option><option value="clinic">درمانگاه</option><option value="single_or_unknown">یک‌بار یا نامشخص</option></select></label>
              <label><span>تاریخ/زمان</span><input type="datetime-local" value={form.cardiometabolic.bloodPressure.measuredAt} onChange={(event) => patchBp({ measuredAt: event.target.value })} /></label>
              <label><span>دستگاه یا اندازهٔ کاف، در صورت اطلاع</span><input maxLength={120} value={form.cardiometabolic.bloodPressure.deviceContext} onChange={(event) => patchBp({ deviceContext: event.target.value })} placeholder="مثلاً بازویی، کاف مناسب" /></label>
            </div>
            <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.bloodPressure.diagnosedHypertension} onChange={(event) => patchBp({ diagnosedHypertension: event.target.checked })} /><span>سابقهٔ تشخیص فشار خون بالا دارم</span></label>
            {form.cardiometabolic.bloodPressure.diagnosedHypertension && <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.bloodPressure.stableUnderCare} onChange={(event) => patchBp({ stableUnderCare: event.target.checked })} /><span>وضعیت پایدار و تحت پیگیری حرفه‌ای است</span></label>}
            <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.bloodPressure.concerningSymptoms} onChange={(event) => patchBp({ concerningSymptoms: event.target.checked })} /><span>همراه با درد قفسه سینه، تنگی نفس شدید، علامت عصبی، گیجی یا غش است</span></label>
          </>}
        </fieldset>

        <fieldset className="health-context-card">
          <legend><label><input type="checkbox" checked={form.cardiometabolic.glycaemia.enabled} onChange={(event) => patchGlucose({ enabled: event.target.checked })} /> قند خون</label></legend>
          {form.cardiometabolic.glycaemia.enabled && <>
            <div className="field-grid field-grid--three">
              <label><span>نوع</span><select value={form.cardiometabolic.glycaemia.measurementType} onChange={(event) => patchGlucose({ measurementType: event.target.value as PlannerForm["cardiometabolic"]["glycaemia"]["measurementType"] })}><option value="fasting">ناشتا</option><option value="random">تصادفی/دستگاهی</option><option value="ogtt_2h">دو ساعت OGTT</option><option value="a1c">A1C</option></select></label>
              <label><span>مقدار</span><input type="number" step="0.1" value={form.cardiometabolic.glycaemia.value} onChange={(event) => patchGlucose({ value: event.target.value })} /></label>
              <label><span>واحد</span><select value={form.cardiometabolic.glycaemia.unit} onChange={(event) => patchGlucose({ unit: event.target.value as PlannerForm["cardiometabolic"]["glycaemia"]["unit"] })}><option value="mg_dl">mg/dL</option><option value="mmol_l">mmol/L</option><option value="percent">٪</option></select></label>
              <label><span>تاریخ/زمان</span><input type="datetime-local" value={form.cardiometabolic.glycaemia.measuredAt} onChange={(event) => patchGlucose({ measuredAt: event.target.value })} /></label>
              <label><span>منبع اندازه‌گیری</span><select value={form.cardiometabolic.glycaemia.sourceContext} onChange={(event) => patchGlucose({ sourceContext: event.target.value as PlannerForm["cardiometabolic"]["glycaemia"]["sourceContext"] })}><option value="laboratory">آزمایشگاه</option><option value="home_meter">دستگاه خانگی</option><option value="cgm">حسگر مداوم</option><option value="unknown">نامشخص</option></select></label>
            </div>
            <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.glycaemia.diabetesHistory} onChange={(event) => patchGlucose({ diabetesHistory: event.target.checked })} /><span>سابقهٔ دیابت یا پیش‌دیابت دارم</span></label>
            <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.glycaemia.insulinOrHypoglycaemiaMedicine} onChange={(event) => patchGlucose({ insulinOrHypoglycaemiaMedicine: event.target.checked })} /><span>انسولین یا دارویی با خطر افت قند مصرف می‌کنم</span></label>
            <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.glycaemia.recurrentOrSevereHypoglycaemia} onChange={(event) => patchGlucose({ recurrentOrSevereHypoglycaemia: event.target.checked })} /><span>افت قند تکرارشونده یا شدید داشته‌ام</span></label>
            <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.glycaemia.crisisSymptoms} onChange={(event) => patchGlucose({ crisisSymptoms: event.target.checked })} /><span>علائم بحران، نیاز به کمک یا نگرانی کتون وجود دارد</span></label>
          </>}
        </fieldset>

        <fieldset className="health-context-card">
          <legend><label><input type="checkbox" checked={form.cardiometabolic.lipids.enabled} onChange={(event) => patchLipids({ enabled: event.target.checked })} /> چربی خون</label></legend>
          {form.cardiometabolic.lipids.enabled && <>
            <div className="field-grid field-grid--three">
              <label><span>LDL-C</span><input type="number" value={form.cardiometabolic.lipids.ldl} onChange={(event) => patchLipids({ ldl: event.target.value })} /></label>
              <label><span>HDL-C</span><input type="number" value={form.cardiometabolic.lipids.hdl} onChange={(event) => patchLipids({ hdl: event.target.value })} /></label>
              <label><span>تری‌گلیسرید</span><input type="number" value={form.cardiometabolic.lipids.triglycerides} onChange={(event) => patchLipids({ triglycerides: event.target.value })} /></label>
              <label><span>تاریخ/زمان</span><input type="datetime-local" value={form.cardiometabolic.lipids.measuredAt} onChange={(event) => patchLipids({ measuredAt: event.target.value })} /></label>
            </div>
            <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.lipids.fastingKnown} onChange={(event) => patchLipids({ fastingKnown: event.target.checked })} /><span>وضعیت ناشتا بودن این آزمایش مشخص است</span></label>
            <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.lipids.diagnosedDyslipidaemia} onChange={(event) => patchLipids({ diagnosedDyslipidaemia: event.target.checked })} /><span>سابقهٔ تشخیص اختلال چربی خون دارم</span></label>
            {form.cardiometabolic.lipids.diagnosedDyslipidaemia && <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.lipids.reviewedProfessionally} onChange={(event) => patchLipids({ reviewedProfessionally: event.target.checked })} /><span>نتیجه توسط پزشک یا متخصص بررسی شده است</span></label>}
            <label className="wide-check"><input type="checkbox" checked={form.cardiometabolic.lipids.knownAscvdOrClinicianDirectedDiet} onChange={(event) => patchLipids({ knownAscvdOrClinicianDirectedDiet: event.target.checked })} /><span>بیماری قلبی‌عروقی شناخته‌شده یا رژیم درمانی تجویزشده دارم</span></label>
            <p className="form-note">هدف LDL به ریسک و زمینهٔ فرد وابسته است و اینجا تعیین نمی‌شود.</p>
          </>}
        </fieldset>
      </details>

      {(result.reasons.length > 0 || result.notices.length > 0) && (
        <div className={`safety-result safety-result--${result.disposition}`} role="status" aria-live="polite">
          {result.reasons.map((reason) => <p key={reason}>{reason}</p>)}
          {result.notices.map((notice) => <small key={notice}>{notice}</small>)}
        </div>
      )}
    </section>
  );
}
