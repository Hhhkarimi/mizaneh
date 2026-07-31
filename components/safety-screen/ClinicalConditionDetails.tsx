"use client";

import type { MedicalCondition, PlannerForm } from "@/lib/types";
import type { ReactNode } from "react";

type Props = {
  form: PlannerForm;
  onChange: (next: PlannerForm) => void;
};

type ToggleProps = {
  checked: boolean;
  children: ReactNode;
  onChange: (checked: boolean) => void;
};

function Toggle({ checked, children, onChange }: ToggleProps) {
  return (
    <label className={`safety-check ${checked ? "is-selected" : ""}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

function CareSection({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <details className="safety-details-group clinical-care-section" open>
      <summary><span>{title}</span><small>{note}</small></summary>
      <div className="clinical-care-section__body">{children}</div>
    </details>
  );
}

export function ClinicalConditionDetails({ form, onChange }: Props) {
  const patch = (value: Partial<PlannerForm>) => onChange({ ...form, ...value });
  const patchCare = <K extends keyof PlannerForm["clinicalCare"]>(
    key: K,
    value: Partial<PlannerForm["clinicalCare"][K]>,
  ) => patch({ clinicalCare: { ...form.clinicalCare, [key]: { ...form.clinicalCare[key], ...value } } });
  const has = (condition: MedicalCondition) => form.medicalConditions.includes(condition);

  return (
    <div className="clinical-care-details" aria-label="جزئیات لازم برای سازگارکردن برنامه با شرایط پزشکی">
      {form.pregnant && (
        <CareSection title="جزئیات بارداری" note="برای تعدیل انرژی، ریزمغذی‌ها و ایمنی غذا">
          <div className="field-grid field-grid--two safety-field-grid">
            <label><span>سه‌ماههٔ بارداری</span><select value={form.clinicalCare.pregnancy.trimester} onChange={(event) => patchCare("pregnancy", { trimester: event.target.value as PlannerForm["clinicalCare"]["pregnancy"]["trimester"] })}><option value="first">سه‌ماههٔ اول</option><option value="second">سه‌ماههٔ دوم</option><option value="third">سه‌ماههٔ سوم</option></select></label>
            <label><span>تعدیل انرژی تجویزشده، در صورت وجود</span><span className="input-wrap"><input type="number" min="-1000" max="2000" value={form.clinicalCare.pregnancy.clinicianEnergyAdjustmentKcal} onChange={(event) => patchCare("pregnancy", { clinicianEnergyAdjustmentKcal: event.target.value })} /><small>kcal</small></span></label>
          </div>
          <div className="health-check-list">
            <Toggle checked={form.clinicalCare.pregnancy.multiplePregnancy} onChange={(checked) => patchCare("pregnancy", { multiplePregnancy: checked })}>بارداری چندقلویی است</Toggle>
            <Toggle checked={form.clinicalCare.pregnancy.prenatalCare} onChange={(checked) => patchCare("pregnancy", { prenatalCare: checked })}>تحت مراقبت منظم بارداری هستم</Toggle>
            <Toggle checked={form.clinicalCare.pregnancy.gestationalDiabetes} onChange={(checked) => patchCare("pregnancy", { gestationalDiabetes: checked })}>دیابت بارداری دارم</Toggle>
            <Toggle checked={form.clinicalCare.pregnancy.severeVomitingOrDehydration} onChange={(checked) => patchCare("pregnancy", { severeVomitingOrDehydration: checked })}>استفراغ شدید، ناتوانی در نگه‌داشتن مایعات یا علائم کم‌آبی دارم</Toggle>
          </div>
          <p className="form-note form-note--prominent">مقدار مکمل آهن، فولات، ید یا ویتامین D از روی این فرم تعیین نمی‌شود و باید مطابق مراقبت بارداری باشد.</p>
        </CareSection>
      )}

      {form.breastfeeding && (
        <CareSection title="جزئیات شیردهی" note="برای برآورد محافظه‌کارانهٔ انرژی و کفایت غذایی">
          <div className="field-grid field-grid--two safety-field-grid">
            <label><span>نوع شیردهی</span><select value={form.clinicalCare.breastfeeding.mode} onChange={(event) => patchCare("breastfeeding", { mode: event.target.value as PlannerForm["clinicalCare"]["breastfeeding"]["mode"] })}><option value="exclusive">انحصاری یا تقریباً انحصاری</option><option value="partial">ترکیبی</option><option value="minimal">کم یا در حال قطع</option></select></label>
            <label><span>ماه پس از زایمان</span><input type="number" min="0" max="36" value={form.clinicalCare.breastfeeding.postpartumMonths} onChange={(event) => patchCare("breastfeeding", { postpartumMonths: event.target.value })} /></label>
            <label><span>تعدیل انرژی تجویزشده، در صورت وجود</span><span className="input-wrap"><input type="number" min="-1000" max="2000" value={form.clinicalCare.breastfeeding.clinicianEnergyAdjustmentKcal} onChange={(event) => patchCare("breastfeeding", { clinicianEnergyAdjustmentKcal: event.target.value })} /><small>kcal</small></span></label>
          </div>
          <Toggle checked={form.clinicalCare.breastfeeding.supplyConcern} onChange={(checked) => patchCare("breastfeeding", { supplyConcern: checked })}>نگرانی دربارهٔ شیر یا رشد شیرخوار دارم</Toggle>
        </CareSection>
      )}

      {form.eatingDisorderConcern && (
        <CareSection title="حمایت در اختلال خوردن" note="بدون کسری/مازاد خودکار و با وعده‌های منظم">
          <div className="health-check-list">
            <Toggle checked={form.clinicalCare.eatingDisorder.underProfessionalCare} onChange={(checked) => patchCare("eatingDisorder", { underProfessionalCare: checked })}>تحت مراقبت تیم درمان هستم</Toggle>
            <Toggle checked={form.clinicalCare.eatingDisorder.regularEatingSupport} onChange={(checked) => patchCare("eatingDisorder", { regularEatingSupport: checked })}>الگوی وعده و میان‌وعدهٔ منظم بخشی از برنامهٔ درمان است</Toggle>
            <Toggle checked={form.clinicalCare.eatingDisorder.currentPurging} onChange={(checked) => patchCare("eatingDisorder", { currentPurging: checked })}>استفراغ عمدی، ملین یا رفتار جبرانی فعال دارم</Toggle>
            <Toggle checked={form.clinicalCare.eatingDisorder.faintingSevereWeaknessOrDehydration} onChange={(checked) => patchCare("eatingDisorder", { faintingSevereWeaknessOrDehydration: checked })}>غش، ضعف شدید یا کم‌آبی دارم</Toggle>
          </div>
          <p className="form-note form-note--prominent">نمایش کالری و وزن می‌تواند برای بعضی افراد محرک باشد؛ برنامه باید با ترجیحات تیم درمان هماهنگ شود.</p>
        </CareSection>
      )}

      {form.seriousFoodAllergy && (
        <CareSection title="ایمنی حساسیت غذایی" note="برای حذف آلرژن و هشدار تماس متقاطع">
          <label><span>آلرژن‌های دیگر یا نام‌های جایگزین</span><textarea rows={2} maxLength={500} value={form.clinicalCare.allergy.additionalAllergens} onChange={(event) => patchCare("allergy", { additionalAllergens: event.target.value })} placeholder="مثلاً کنجد، سویا، بادام‌زمینی؛ با ویرگول جدا کنید" /></label>
          <div className="health-check-list">
            <Toggle checked={form.clinicalCare.allergy.strictCrossContact} onChange={(checked) => patchCare("allergy", { strictCrossContact: checked })}>تماس متقاطع باید کاملاً کنترل شود</Toggle>
            <Toggle checked={form.clinicalCare.allergy.carriesEpinephrine} onChange={(checked) => patchCare("allergy", { carriesEpinephrine: checked })}>اپی‌نفرین تجویزشده همراه دارم</Toggle>
            <Toggle checked={form.clinicalCare.allergy.activeReactionSymptoms} onChange={(checked) => patchCare("allergy", { activeReactionSymptoms: checked })}>در حال حاضر علائم واکنش آلرژیک دارم</Toggle>
          </div>
        </CareSection>
      )}

      {form.swallowingDifficulty && (
        <CareSection title="بافت غذا و مایعات" note="بر پایهٔ سطح IDDSI ثبت‌شده؛ نه حدس خودکار">
          <div className="field-grid field-grid--two safety-field-grid">
            <label><span>سطح بافت غذا</span><select value={form.clinicalCare.dysphagia.foodLevel} onChange={(event) => patchCare("dysphagia", { foodLevel: event.target.value as PlannerForm["clinicalCare"]["dysphagia"]["foodLevel"] })}><option value="unknown">نامشخص</option><option value="3">IDDSI 3 — مایع‌شده</option><option value="4">IDDSI 4 — پوره</option><option value="5">IDDSI 5 — خرد و مرطوب</option><option value="6">IDDSI 6 — نرم و لقمه‌ای</option><option value="7">IDDSI 7 — معمولی/آسان‌جویدن</option></select></label>
            <label><span>سطح غلظت نوشیدنی</span><select value={form.clinicalCare.dysphagia.drinkLevel} onChange={(event) => patchCare("dysphagia", { drinkLevel: event.target.value as PlannerForm["clinicalCare"]["dysphagia"]["drinkLevel"] })}><option value="unknown">نامشخص</option><option value="0">IDDSI 0 — رقیق</option><option value="1">IDDSI 1 — کمی غلیظ</option><option value="2">IDDSI 2 — اندکی غلیظ</option><option value="3">IDDSI 3 — نسبتاً غلیظ</option><option value="4">IDDSI 4 — بسیار غلیظ</option></select></label>
          </div>
          <div className="health-check-list">
            <Toggle checked={form.clinicalCare.dysphagia.assessedByProfessional} onChange={(checked) => patchCare("dysphagia", { assessedByProfessional: checked })}>این سطوح توسط متخصص بلع تعیین شده‌اند</Toggle>
            <Toggle checked={form.clinicalCare.dysphagia.coughingChokingOrWetVoice} onChange={(checked) => patchCare("dysphagia", { coughingChokingOrWetVoice: checked })}>هنگام خوردن سرفه، خفگی یا صدای خیس دارم</Toggle>
          </div>
        </CareSection>
      )}

      {has("kidney_disease") && (
        <CareSection title="تنظیمات بیماری کلیه" note="پتاسیم و فسفر فقط بر اساس آزمایش یا دستور واردشده محدود می‌شوند">
          <div className="field-grid field-grid--two safety-field-grid">
            <label><span>مرحله یا درمان کلیه</span><select value={form.clinicalCare.kidney.stage} onChange={(event) => patchCare("kidney", { stage: event.target.value as PlannerForm["clinicalCare"]["kidney"]["stage"] })}><option value="unknown">نامشخص</option><option value="1_2">مرحله ۱–۲</option><option value="3_5_no_dialysis">مرحله ۳–۵ بدون دیالیز</option><option value="hemodialysis">همودیالیز</option><option value="peritoneal_dialysis">دیالیز صفاقی</option><option value="transplant">پیوند کلیه</option></select></label>
            <label><span>وضعیت پتاسیم آزمایش</span><select value={form.clinicalCare.kidney.potassiumStatus} onChange={(event) => patchCare("kidney", { potassiumStatus: event.target.value as PlannerForm["clinicalCare"]["kidney"]["potassiumStatus"] })}><option value="unknown">نامشخص</option><option value="normal">طبیعی</option><option value="high">بالا</option><option value="low">پایین</option></select></label>
            <label><span>وضعیت فسفر آزمایش</span><select value={form.clinicalCare.kidney.phosphorusStatus} onChange={(event) => patchCare("kidney", { phosphorusStatus: event.target.value as PlannerForm["clinicalCare"]["kidney"]["phosphorusStatus"] })}><option value="unknown">نامشخص</option><option value="normal">طبیعی</option><option value="high">بالا</option><option value="low">پایین</option></select></label>
            <label><span>حد سدیم تجویزشده</span><span className="input-wrap"><input type="number" min="500" max="5000" value={form.clinicalCare.kidney.sodiumLimitMg} onChange={(event) => patchCare("kidney", { sodiumLimitMg: event.target.value })} /><small>mg/day</small></span></label>
            <label><span>حد مایعات تجویزشده</span><span className="input-wrap"><input type="number" min="250" max="6000" value={form.clinicalCare.kidney.fluidLimitMl} onChange={(event) => patchCare("kidney", { fluidLimitMl: event.target.value })} /><small>mL/day</small></span></label>
            <label><span>هدف پروتئین تجویزشده</span><span className="input-wrap"><input type="number" min="0.3" max="2.5" step="0.05" value={form.clinicalCare.kidney.proteinTargetGKg} onChange={(event) => patchCare("kidney", { proteinTargetGKg: event.target.value })} /><small>g/kg</small></span></label>
          </div>
          <Toggle checked={form.clinicalCare.kidney.swellingOrBreathlessness} onChange={(checked) => patchCare("kidney", { swellingOrBreathlessness: checked })}>تورم قابل‌توجه یا تنگی نفس دارم</Toggle>
        </CareSection>
      )}

      {has("liver_disease") && (
        <CareSection title="تنظیمات بیماری کبد" note="پروتئین خودسرانه محدود نمی‌شود؛ مرحله و آسیت مهم است">
          <div className="field-grid field-grid--two safety-field-grid">
            <label><span>وضعیت کبد</span><select value={form.clinicalCare.liver.stage} onChange={(event) => patchCare("liver", { stage: event.target.value as PlannerForm["clinicalCare"]["liver"]["stage"] })}><option value="unknown">نامشخص</option><option value="fatty_liver">کبد چرب/بیماری متابولیک</option><option value="compensated_cirrhosis">سیروز جبران‌شده</option><option value="decompensated_cirrhosis">سیروز دکمپنسته</option><option value="acute_or_severe">حاد یا شدید</option></select></label>
            <label><span>حد سدیم تجویزشده</span><span className="input-wrap"><input type="number" min="500" max="5000" value={form.clinicalCare.liver.sodiumLimitMg} onChange={(event) => patchCare("liver", { sodiumLimitMg: event.target.value })} /><small>mg/day</small></span></label>
            <label><span>حد مایعات تجویزشده</span><span className="input-wrap"><input type="number" min="250" max="6000" value={form.clinicalCare.liver.fluidLimitMl} onChange={(event) => patchCare("liver", { fluidLimitMl: event.target.value })} /><small>mL/day</small></span></label>
            <label><span>هدف پروتئین تجویزشده</span><span className="input-wrap"><input type="number" min="0.3" max="2.5" step="0.05" value={form.clinicalCare.liver.proteinTargetGKg} onChange={(event) => patchCare("liver", { proteinTargetGKg: event.target.value })} /><small>g/kg</small></span></label>
          </div>
          <div className="health-check-list">
            <Toggle checked={form.clinicalCare.liver.ascites} onChange={(checked) => patchCare("liver", { ascites: checked })}>آسیت یا ورم مرتبط دارم</Toggle>
            <Toggle checked={form.clinicalCare.liver.encephalopathyOrConfusion} onChange={(checked) => patchCare("liver", { encephalopathyOrConfusion: checked })}>گیجی یا سابقهٔ انسفالوپاتی فعال دارم</Toggle>
          </div>
        </CareSection>
      )}

      {has("active_cancer_treatment") && (
        <CareSection title="تغذیه در درمان سرطان" note="بر اساس درمان، اشتها و علائم خوراکی">
          <div className="field-grid field-grid--two safety-field-grid">
            <label><span>نوع درمان</span><select value={form.clinicalCare.cancer.treatmentType} onChange={(event) => patchCare("cancer", { treatmentType: event.target.value as PlannerForm["clinicalCare"]["cancer"]["treatmentType"] })}><option value="unknown">نامشخص</option><option value="chemotherapy">شیمی‌درمانی</option><option value="radiotherapy">پرتودرمانی</option><option value="immunotherapy">ایمنی‌درمانی</option><option value="surgery">جراحی</option><option value="combined">ترکیبی</option></select></label>
            <label><span>اثر بر اشتها</span><select value={form.clinicalCare.cancer.appetiteImpact} onChange={(event) => patchCare("cancer", { appetiteImpact: event.target.value as PlannerForm["clinicalCare"]["cancer"]["appetiteImpact"] })}><option value="none">بدون اثر محسوس</option><option value="moderate">کاهش متوسط</option><option value="severe">کاهش شدید</option></select></label>
            <label><span>هدف پروتئین تجویزشده</span><span className="input-wrap"><input type="number" min="0.6" max="2.5" step="0.05" value={form.clinicalCare.cancer.proteinTargetGKg} onChange={(event) => patchCare("cancer", { proteinTargetGKg: event.target.value })} /><small>g/kg</small></span></label>
          </div>
          <div className="health-check-list">
            <Toggle checked={form.clinicalCare.cancer.nausea} onChange={(checked) => patchCare("cancer", { nausea: checked })}>تهوع دارم</Toggle>
            <Toggle checked={form.clinicalCare.cancer.mouthSores} onChange={(checked) => patchCare("cancer", { mouthSores: checked })}>زخم یا درد دهان دارم</Toggle>
            <Toggle checked={form.clinicalCare.cancer.tasteChanges} onChange={(checked) => patchCare("cancer", { tasteChanges: checked })}>تغییر مزه یا بوی غذا دارم</Toggle>
            <Toggle checked={form.clinicalCare.cancer.feverOrNeutropeniaPrecautions} onChange={(checked) => patchCare("cancer", { feverOrNeutropeniaPrecautions: checked })}>تب یا دستور ایمنی غذایی در نوتروپنی دارم</Toggle>
          </div>
        </CareSection>
      )}

      {has("recent_major_surgery") && (
        <CareSection title="تغذیه پس از جراحی" note="مرحلهٔ رژیم جراح بر پیشنهادها اولویت دارد">
          <div className="field-grid field-grid--two safety-field-grid">
            <label><span>روز از جراحی</span><input type="number" min="0" max="365" value={form.clinicalCare.surgery.daysSince} onChange={(event) => patchCare("surgery", { daysSince: event.target.value })} /></label>
            <label><span>مرحلهٔ رژیم مجاز</span><select value={form.clinicalCare.surgery.dietStage} onChange={(event) => patchCare("surgery", { dietStage: event.target.value as PlannerForm["clinicalCare"]["surgery"]["dietStage"] })}><option value="regular">معمولی</option><option value="soft">نرم</option><option value="pureed">پوره</option><option value="full_liquid">مایع کامل</option><option value="clear_liquid">مایع شفاف</option><option value="enteral_or_other">لوله‌ای یا مسیر دیگر</option></select></label>
            <label><span>ناحیهٔ جراحی</span><select value={form.clinicalCare.surgery.surgeryArea} onChange={(event) => patchCare("surgery", { surgeryArea: event.target.value as PlannerForm["clinicalCare"]["surgery"]["surgeryArea"] })}><option value="general">عمومی/سایر</option><option value="upper_gi">گوارش فوقانی</option><option value="lower_gi">گوارش تحتانی</option><option value="head_neck">سر و گردن</option><option value="bariatric">چاقی</option><option value="other">سایر</option></select></label>
            <label className="health-field-grid__wide"><span>محدودیت‌های اعلام‌شده توسط جراح</span><textarea rows={2} maxLength={800} value={form.clinicalCare.surgery.surgeonRestrictions} onChange={(event) => patchCare("surgery", { surgeonRestrictions: event.target.value })} /></label>
          </div>
          <Toggle checked={form.clinicalCare.surgery.poorIntakeOrVomiting} onChange={(checked) => patchCare("surgery", { poorIntakeOrVomiting: checked })}>دریافت بسیار کم یا استفراغ دارم</Toggle>
        </CareSection>
      )}

      {(form.severeDigestiveSymptoms || has("severe_gastrointestinal_condition")) && (
        <CareSection title="پروفایل گوارشی و سوءجذب" note="محدودیت‌های عمومی فقط بر اساس پروفایل ثبت‌شده اعمال می‌شوند">
          <div className="field-grid field-grid--two safety-field-grid">
            <label><span>وضعیت اصلی</span><select value={form.clinicalCare.gastrointestinal.profile} onChange={(event) => patchCare("gastrointestinal", { profile: event.target.value as PlannerForm["clinicalCare"]["gastrointestinal"]["profile"] })}><option value="unknown">نامشخص</option><option value="ibd_flare">شعله‌وری IBD</option><option value="ibd_remission">IBD در فروکش</option><option value="celiac">سلیاک</option><option value="gastroparesis">گاستروپارزی</option><option value="pancreatic">نارسایی پانکراس</option><option value="short_bowel_malabsorption">روده کوتاه/سوءجذب</option><option value="chronic_diarrhea">اسهال مزمن</option><option value="constipation">یبوست</option></select></label>
            <label className="health-field-grid__wide"><span>محدودیت‌های تجویزشده</span><textarea rows={2} maxLength={800} value={form.clinicalCare.gastrointestinal.clinicianRestrictions} onChange={(event) => patchCare("gastrointestinal", { clinicianRestrictions: event.target.value })} /></label>
          </div>
          <div className="health-check-list">
            <Toggle checked={form.clinicalCare.gastrointestinal.lactoseRestriction} onChange={(checked) => patchCare("gastrointestinal", { lactoseRestriction: checked })}>محدودیت لاکتوز دارم</Toggle>
            <Toggle checked={form.clinicalCare.gastrointestinal.activeBleedingObstructionOrPersistentVomiting} onChange={(checked) => patchCare("gastrointestinal", { activeBleedingObstructionOrPersistentVomiting: checked })}>خون‌ریزی، احتمال انسداد یا استفراغ مداوم دارم</Toggle>
          </div>
        </CareSection>
      )}

      {has("medical_nutrition_therapy") && (
        <CareSection title="محدودیت‌های تجویزشدهٔ تغذیه‌درمانی" note="این اعداد بر پیش‌فرض‌های میزانه اولویت دارند">
          <div className="field-grid field-grid--two safety-field-grid">
            <label><span>حد سدیم</span><span className="input-wrap"><input type="number" min="500" max="6000" value={form.clinicalCare.customMnt.sodiumLimitMg} onChange={(event) => patchCare("customMnt", { sodiumLimitMg: event.target.value })} /><small>mg/day</small></span></label>
            <label><span>حد پتاسیم</span><span className="input-wrap"><input type="number" min="500" max="8000" value={form.clinicalCare.customMnt.potassiumLimitMg} onChange={(event) => patchCare("customMnt", { potassiumLimitMg: event.target.value })} /><small>mg/day</small></span></label>
            <label><span>حد فسفر</span><span className="input-wrap"><input type="number" min="300" max="3000" value={form.clinicalCare.customMnt.phosphorusLimitMg} onChange={(event) => patchCare("customMnt", { phosphorusLimitMg: event.target.value })} /><small>mg/day</small></span></label>
            <label><span>حد مایعات</span><span className="input-wrap"><input type="number" min="250" max="8000" value={form.clinicalCare.customMnt.fluidLimitMl} onChange={(event) => patchCare("customMnt", { fluidLimitMl: event.target.value })} /><small>mL/day</small></span></label>
            <label><span>هدف پروتئین</span><span className="input-wrap"><input type="number" min="0.3" max="3" step="0.05" value={form.clinicalCare.customMnt.proteinTargetGKg} onChange={(event) => patchCare("customMnt", { proteinTargetGKg: event.target.value })} /><small>g/kg</small></span></label>
            <label><span>کربوهیدرات هر وعده</span><span className="input-wrap"><input type="number" min="5" max="200" value={form.clinicalCare.customMnt.carbohydratePerMealG} onChange={(event) => patchCare("customMnt", { carbohydratePerMealG: event.target.value })} /><small>g</small></span></label>
            <label><span>غذاهای ممنوع/نامناسب</span><textarea rows={3} maxLength={1000} value={form.clinicalCare.customMnt.foodsToAvoid} onChange={(event) => patchCare("customMnt", { foodsToAvoid: event.target.value })} placeholder="با ویرگول جدا کنید" /></label>
            <label><span>غذاهای توصیه‌شده</span><textarea rows={3} maxLength={1000} value={form.clinicalCare.customMnt.foodsToInclude} onChange={(event) => patchCare("customMnt", { foodsToInclude: event.target.value })} placeholder="با ویرگول جدا کنید" /></label>
            <label className="health-field-grid__wide"><span>یادداشت تیم درمان</span><textarea rows={3} maxLength={1500} value={form.clinicalCare.customMnt.notes} onChange={(event) => patchCare("customMnt", { notes: event.target.value })} /></label>
          </div>
        </CareSection>
      )}
    </div>
  );
}
