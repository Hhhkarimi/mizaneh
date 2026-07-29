"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { Allergy, DayPlan, MealSlot, Metrics, PlannedMeal, PlanMode, PlannerForm } from "@/lib/types";
import {
  activityOptions,
  allergyOptions,
  defaultForm,
  dietStyles,
  exchangeGroups,
  planModeOptions,
  sourceCards,
  stepTitles,
} from "@/lib/food/catalogue";
import { calculateMetrics, getValidationMessage } from "@/lib/nutrition/formulas";
import { formatDecimal, formatNumber, toNumber } from "@/lib/nutrition/format";
import { buildWeeklyPlan, applySubstitution, getMeal, getSubstituteOptions } from "@/lib/plan/build";
import { buildShoppingList } from "@/lib/plan/shopping";
import { dayPatternLabel, prepLabel, sleepLabel, waterLabel } from "@/lib/labels";
import { SafetyAdvisory } from "@/components/SafetyAdvisory";
import { SubstitutePicker } from "@/components/SubstitutePicker";
import { SaveSessionControls } from "@/components/SaveSessionControls";
import { RestoreSessionPrompt } from "@/components/RestoreSessionPrompt";
import { clearSession, saveSession, type StoredSession } from "@/lib/storage/session";

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="نشان میزانه"
    >
      <path
        d="M10 34h44c-1.8 12.7-10.5 20-22 20S11.8 46.7 10 34Z"
        fill="currentColor"
      />
      <path
        d="M17 34c2-8.2 7-12.3 15-12.3S45 25.8 47 34"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M33.8 20.7C34.2 11.7 40.2 7 50 8.3c-.9 8.4-6.2 12.6-16.2 12.4Z"
        fill="#9dd24b"
      />
      <path
        d="M29.8 20.5c-1.1-6.7-5.4-10.1-12.9-10.3.2 6.8 4.5 10.3 12.9 10.3Z"
        fill="#ff6b55"
      />
      <path d="M18 58h28" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}


export default function DietPlanner() {
  const [form, setForm] = useState<PlannerForm>(defaultForm);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [submittedForm, setSubmittedForm] = useState<PlannerForm | null>(null);
  const [planMode, setPlanMode] = useState<PlanMode>("variety");
  const [variationSeed, setVariationSeed] = useState(1);
  const [activeDay, setActiveDay] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const resultsRef = useRef<HTMLElement>(null);

  const previewMetrics = useMemo(() => calculateMetrics(form), [form]);
  const activeForm = submittedForm ?? form;
  const weeklyPlan = useMemo(
    () =>
      metrics
        ? buildWeeklyPlan(activeForm, metrics, planMode, variationSeed)
        : [],
    [activeForm, metrics, planMode, variationSeed],
  );
  const [substitutions, setSubstitutions] = useState<
    Record<number, DayPlan>
  >({});
  const displayedPlan = useMemo(
    () => weeklyPlan.map((day, index) => substitutions[index] ?? day),
    [weeklyPlan, substitutions],
  );
  const { groups: shoppingGroups, note: shoppingListNote } = useMemo(
    () => buildShoppingList(displayedPlan),
    [displayedPlan],
  );
  const selectedDay = displayedPlan[activeDay];

  const [substitutionTarget, setSubstitutionTarget] = useState<{
    slot: MealSlot;
    occurrence: number;
  } | null>(null);
  const substituteOptions = useMemo(() => {
    if (!substitutionTarget || !selectedDay) return [];
    return getSubstituteOptions(
      selectedDay,
      substitutionTarget.slot,
      substitutionTarget.occurrence,
      activeForm,
      variationSeed,
      3,
    );
  }, [substitutionTarget, selectedDay, activeForm, variationSeed]);

  function openSubstitutePicker(slot: MealSlot, occurrence: number) {
    setSubstitutionTarget({ slot, occurrence });
  }

  function applySubstitutionChoice(meal: PlannedMeal) {
    if (!substitutionTarget || !selectedDay) return;
    const next = applySubstitution(
      selectedDay,
      substitutionTarget.slot,
      substitutionTarget.occurrence,
      meal,
    );
    setSubstitutions((current) => ({ ...current, [activeDay]: next }));
    setSubstitutionTarget(null);
  }

  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function handleSaveSession() {
    const ok = saveSession({
      form: activeForm,
      planMode,
      variationSeed,
      substitutions,
    });
    if (ok) {
      setSavedAt(new Date().toISOString());
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 3000);
    }
  }

  function handleClearSession() {
    clearSession();
    setSavedAt(null);
    setJustSaved(false);
  }

  function handleRestoreSession(session: StoredSession) {
    setForm(session.form);
    setSubmittedForm(session.form);
    setMetrics(calculateMetrics(session.form));
    setPlanMode(session.planMode);
    setVariationSeed(session.variationSeed);
    setSubstitutions(session.substitutions ?? {});
    setActiveDay(0);
    setStep(4);
    setError("");
    setSavedAt(session.savedAt);
  }

  const projection = useMemo(() => {
    if (!metrics || !submittedForm) return [];
    const start = toNumber(submittedForm.weight);
    const target = toNumber(submittedForm.targetWeight);
    return [0, 4, 8, 12].map((week) => ({
      week,
      weight: Math.max(target, start - metrics.weeklyPace * week),
    }));
  }, [metrics, submittedForm]);

  function updateForm<K extends keyof PlannerForm>(
    key: K,
    value: PlannerForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function toggleAllergy(allergy: Allergy) {
    updateForm(
      "allergies",
      form.allergies.includes(allergy)
        ? form.allergies.filter((item) => item !== allergy)
        : [...form.allergies, allergy],
    );
  }

  function nextStep() {
    const validationMessage = getValidationMessage(form, step);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setStep((current) => Math.min(4, current + 1));
    setError("");
  }

  function generatePlan() {
    const validationMessage =
      getValidationMessage(form, 1) ||
      getValidationMessage(form, 2) ||
      getValidationMessage(form, 3) ||
      getValidationMessage(form, 4);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const calculated = calculateMetrics(form);
    const preferredMode: PlanMode =
      form.cookingTime === "15"
        ? "quick"
        : form.mealPrep === "batch"
          ? "batch"
          : form.dietStyle === "highProtein"
            ? "protein"
            : "variety";

    setMetrics(calculated);
    setSubmittedForm({ ...form, allergies: [...form.allergies] });
    setPlanMode(preferredMode);
    setVariationSeed((current) => current + 1);
    setActiveDay(0);
    setSubstitutions({});
    setError("");
    window.setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4) nextStep();
    else generatePlan();
  }

  function planAsText() {
    if (!metrics || !submittedForm) return "";
    const lines = [
      "برنامه هفتگی میزانه",
      `هدف روزانه: ${formatNumber(metrics.targetCalories)} کیلوکالری`,
      `پروتئین: ${formatNumber(metrics.protein)} گرم`,
      "",
      ...displayedPlan.flatMap((day) => [
        day.label,
        ...day.meals.map(
          (meal) =>
            `${meal.displaySlot}: ${meal.title} — ${meal.serving}`,
        ),
        "",
      ]),
    ];
    return lines.join("\n");
  }

  function downloadPlan() {
    const blob = new Blob([planAsText()], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "barname-haftegi-mizaneh.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copyShoppingList() {
    const text = shoppingGroups
      .flatMap((group) => [
        group.title,
        ...group.items.map((item) => `• ${item}`),
        "",
      ])
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("done");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("idle");
    }
  }

  return (
    <main className="site-shell">
      <header className="topbar" aria-label="ناوبری اصلی">
        <a className="brand" href="#top" aria-label="میزانه، صفحه نخست">
          <BrandMark className="brand-logo" />
          <span>
            <strong>میزانه</strong>
            <small>برنامه غذایی علمی</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="بخش‌های سایت">
          <a href="#calculator">محاسبه‌گر</a>
          <a href="#weekly-plan">برنامه هفتگی</a>
          <a href="#method">روش علمی</a>
          <a href="#guide">راهنما</a>
        </nav>

        <a className="header-action" href="#calculator">
          شروع برنامه
          <span aria-hidden="true">←</span>
        </a>
      </header>

      <RestoreSessionPrompt onRestore={handleRestoreSession} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            <span aria-hidden="true">●</span>
            ریتم سالم، داده‌های روشن
          </p>
          <h1>
            برنامه غذایی
            <br />
            <em>متعادل</em> و هفتگی
          </h1>
          <p className="hero-lead">
            از محاسبه نیاز روزانه تا هفت روز وعده متنوع، فهرست خرید،
            آماده‌سازی و جایگزین‌های هم‌گروه؛ همه‌چیز روشن و قابل اجراست.
          </p>
          <div className="hero-actions">
            <a className="primary-cta" href="#calculator">
              برنامه من را بساز
              <span aria-hidden="true">←</span>
            </a>
            <a className="text-link" href="#method">
              روش محاسبه را ببین
            </a>
          </div>

          <div className="hero-metrics" aria-label="پیش‌نمایش محاسبه">
            <div>
              <span>هدف روزانه</span>
              <strong>{formatNumber(previewMetrics.targetCalories)}</strong>
              <small>کیلوکالری</small>
            </div>
            <div>
              <span>پروتئین</span>
              <strong>{formatNumber(previewMetrics.protein)}</strong>
              <small>گرم</small>
            </div>
            <div>
              <span>فیبر</span>
              <strong>{formatNumber(previewMetrics.fiber)}</strong>
              <small>گرم</small>
            </div>
          </div>

          <div className="calligraphy-card" aria-label="شعار میزانه">
            <BrandMark className="calligraphy-logo" />
            <p className="nastaliq">به‌اندازه، به‌موقع، با آگاهی</p>
            <small>برنامه‌ای که با زندگی واقعی هماهنگ می‌شود.</small>
          </div>
        </div>

        <form
          className="calculator-card"
          id="calculator"
          aria-labelledby="calculator-title"
          onSubmit={handleSubmit}
          noValidate
        >
          <SafetyAdvisory />

          <div className="calculator-heading">
            <div>
              <span className="step-label">
                مرحله {formatNumber(step)} از ۴
              </span>
              <h2 id="calculator-title">{stepTitles[step - 1]}</h2>
            </div>
            <span className="privacy-note">بدون ذخیره اطلاعات</span>
          </div>

          <ol className="stepper" aria-label="مراحل ساخت برنامه">
            {[1, 2, 3, 4].map((item) => (
              <li
                className={
                  item === step
                    ? "is-active"
                    : item < step
                      ? "is-complete"
                      : ""
                }
                key={item}
              >
                <span>{formatNumber(item)}</span>
              </li>
            ))}
          </ol>

          <div className="wizard-panel" key={step}>
            {step === 1 && (
              <>
                <div className="field-grid field-grid--three">
                  <label>
                    <span>سن</span>
                    <span className="input-wrap">
                      <input
                        type="number"
                        min="18"
                        max="80"
                        value={form.age}
                        onChange={(event) => updateForm("age", event.target.value)}
                        inputMode="numeric"
                        aria-label="سن به سال"
                        aria-invalid={Boolean(error) && step === 1}
                      />
                      <small>سال</small>
                    </span>
                  </label>
                  <label>
                    <span>قد</span>
                    <span className="input-wrap">
                      <input
                        type="number"
                        min="130"
                        max="220"
                        value={form.height}
                        onChange={(event) =>
                          updateForm("height", event.target.value)
                        }
                        inputMode="numeric"
                        aria-label="قد به سانتی‌متر"
                        aria-invalid={Boolean(error) && step === 1}
                      />
                      <small>سانتی‌متر</small>
                    </span>
                  </label>
                  <label>
                    <span>وزن</span>
                    <span className="input-wrap">
                      <input
                        type="number"
                        min="40"
                        max="250"
                        step="0.1"
                        value={form.weight}
                        onChange={(event) =>
                          updateForm("weight", event.target.value)
                        }
                        inputMode="decimal"
                        aria-label="وزن به کیلوگرم"
                        aria-invalid={Boolean(error) && step === 1}
                      />
                      <small>کیلوگرم</small>
                    </span>
                  </label>
                </div>

                <fieldset>
                  <legend>جنسیت در فرمول سوخت‌وساز</legend>
                  <div className="segmented segmented--two">
                    {[
                      { id: "female" as const, label: "زن" },
                      { id: "male" as const, label: "مرد" },
                    ].map((option) => (
                      <button
                        className={form.sex === option.id ? "is-selected" : ""}
                        type="button"
                        aria-pressed={form.sex === option.id}
                        onClick={() => updateForm("sex", option.id)}
                        key={option.id}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>میانگین فعالیت هفتگی</legend>
                  <div className="activity-grid">
                    {activityOptions.map((option) => (
                      <button
                        className={
                          form.activity === option.id
                            ? "activity-card is-selected"
                            : "activity-card"
                        }
                        type="button"
                        aria-pressed={form.activity === option.id}
                        onClick={() => updateForm("activity", option.id)}
                        key={option.id}
                      >
                        <strong>{option.label}</strong>
                        <small>{option.note}</small>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 2 && (
              <>
                <div className="field-grid field-grid--two">
                  <label>
                    <span>وزن هدف</span>
                    <span className="input-wrap">
                      <input
                        type="number"
                        min="40"
                        step="0.1"
                        value={form.targetWeight}
                        onChange={(event) =>
                          updateForm("targetWeight", event.target.value)
                        }
                        inputMode="decimal"
                        aria-label="وزن هدف به کیلوگرم"
                      />
                      <small>کیلوگرم</small>
                    </span>
                  </label>
                  <label>
                    <span>زمان آشپزی هر وعده</span>
                    <span className="select-wrap">
                      <select
                        value={form.cookingTime}
                        onChange={(event) =>
                          updateForm(
                            "cookingTime",
                            event.target.value as PlannerForm["cookingTime"],
                          )
                        }
                      >
                        <option value="15">تا ۱۵ دقیقه</option>
                        <option value="30">تا ۳۰ دقیقه</option>
                        <option value="45">تا ۴۵ دقیقه</option>
                      </select>
                    </span>
                  </label>
                </div>

                <fieldset>
                  <legend>ریتم کاهش دلخواه</legend>
                  <div className="choice-grid choice-grid--three">
                    {(["0.25", "0.5", "0.75"] as const).map((pace) => (
                      <button
                        className={
                          form.pace === pace ? "choice is-selected" : "choice"
                        }
                        type="button"
                        aria-pressed={form.pace === pace}
                        onClick={() => updateForm("pace", pace)}
                        key={pace}
                      >
                        <strong>{pace.replace(".", "٫")} کیلو</strong>
                        <small>در هفته</small>
                      </button>
                    ))}
                  </div>
                  <p className="field-hint">
                    کسری انرژی به حداکثر ۲۰٪ نیاز روزانه محدود می‌شود.
                  </p>
                </fieldset>

                <fieldset>
                  <legend>تعداد وعده‌های روزانه</legend>
                  <div className="segmented segmented--three">
                    {(["3", "4", "5"] as const).map((count) => (
                      <button
                        className={form.meals === count ? "is-selected" : ""}
                        type="button"
                        aria-pressed={form.meals === count}
                        onClick={() => updateForm("meals", count)}
                        key={count}
                      >
                        {formatNumber(Number(count))} وعده
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 3 && (
              <>
                <fieldset className="no-margin">
                  <legend>سبک غذایی</legend>
                  <div className="diet-style-grid">
                    {dietStyles.map((style) => (
                      <button
                        className={
                          form.dietStyle === style.id
                            ? "diet-style is-selected"
                            : "diet-style"
                        }
                        type="button"
                        aria-pressed={form.dietStyle === style.id}
                        onClick={() => updateForm("dietStyle", style.id)}
                        key={style.id}
                      >
                        <span aria-hidden="true">{style.icon}</span>
                        <strong>{style.title}</strong>
                        <small>{style.note}</small>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>حساسیت یا حذف غذایی</legend>
                  <div className="chip-row">
                    {allergyOptions.map((allergy) => (
                      <label className="check-chip" key={allergy.id}>
                        <input
                          type="checkbox"
                          checked={form.allergies.includes(allergy.id)}
                          onChange={() => toggleAllergy(allergy.id)}
                        />
                        <span>{allergy.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="field-grid field-grid--two preference-fields">
                  <label>
                    <span>حال‌وهوای صبحانه</span>
                    <span className="select-wrap">
                      <select
                        value={form.breakfastTaste}
                        onChange={(event) =>
                          updateForm(
                            "breakfastTaste",
                            event.target
                              .value as PlannerForm["breakfastTaste"],
                          )
                        }
                      >
                        <option value="savory">شور و ایرانی</option>
                        <option value="sweet">شیرین و میوه‌ای</option>
                        <option value="both">هر دو</option>
                      </select>
                    </span>
                  </label>
                  <label>
                    <span>الگوی آماده‌سازی</span>
                    <span className="select-wrap">
                      <select
                        value={form.mealPrep}
                        onChange={(event) =>
                          updateForm(
                            "mealPrep",
                            event.target.value as PlannerForm["mealPrep"],
                          )
                        }
                      >
                        <option value="daily">پخت روزانه</option>
                        <option value="batch">آماده‌سازی جمعی</option>
                        <option value="mixed">ترکیبی</option>
                      </select>
                    </span>
                  </label>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="field-grid field-grid--two">
                  <label>
                    <span>الگوی روز</span>
                    <span className="select-wrap">
                      <select
                        value={form.dayPattern}
                        onChange={(event) =>
                          updateForm(
                            "dayPattern",
                            event.target.value as PlannerForm["dayPattern"],
                          )
                        }
                      >
                        <option value="regular">روز منظم</option>
                        <option value="office">محیط کار</option>
                        <option value="shift">شیفت متغیر</option>
                        <option value="home">بیشتر در خانه</option>
                      </select>
                    </span>
                  </label>
                  <label>
                    <span>اوج گرسنگی</span>
                    <span className="select-wrap">
                      <select
                        value={form.hungerPeak}
                        onChange={(event) =>
                          updateForm(
                            "hungerPeak",
                            event.target.value as PlannerForm["hungerPeak"],
                          )
                        }
                      >
                        <option value="morning">صبح</option>
                        <option value="afternoon">ظهر و عصر</option>
                        <option value="night">شب</option>
                      </select>
                    </span>
                  </label>
                  <label>
                    <span>خواب شبانه</span>
                    <span className="select-wrap">
                      <select
                        value={form.sleep}
                        onChange={(event) =>
                          updateForm(
                            "sleep",
                            event.target.value as PlannerForm["sleep"],
                          )
                        }
                      >
                        <option value="under6">کمتر از ۶ ساعت</option>
                        <option value="6to7">۶ تا ۷ ساعت</option>
                        <option value="7plus">۷ ساعت یا بیشتر</option>
                      </select>
                    </span>
                  </label>
                  <label>
                    <span>نظم نوشیدن آب</span>
                    <span className="select-wrap">
                      <select
                        value={form.water}
                        onChange={(event) =>
                          updateForm(
                            "water",
                            event.target.value as PlannerForm["water"],
                          )
                        }
                      >
                        <option value="low">نامنظم</option>
                        <option value="medium">نسبتاً منظم</option>
                        <option value="good">منظم</option>
                      </select>
                    </span>
                  </label>
                </div>

                <label className="wide-field">
                  <span>غذاهایی که نمی‌پسندی (اختیاری)</span>
                  <input
                    type="text"
                    maxLength={100}
                    value={form.dislikes}
                    onChange={(event) =>
                      updateForm("dislikes", event.target.value)
                    }
                    placeholder="مثلاً قارچ، غذای تند، بادمجان"
                  />
                </label>

                <div className="review-card">
                  <div>
                    <span>نیاز نگهدارنده</span>
                    <strong>{formatNumber(previewMetrics.tdee)}</strong>
                  </div>
                  <div>
                    <span>هدف روزانه</span>
                    <strong>{formatNumber(previewMetrics.targetCalories)}</strong>
                  </div>
                  <div>
                    <span>زمان تخمینی</span>
                    <strong>
                      {previewMetrics.estimatedWeeks
                        ? `${formatNumber(previewMetrics.estimatedWeeks)} هفته`
                        : "—"}
                    </strong>
                  </div>
                </div>

                <p className="form-note">
                  خروجی برای برنامه‌ریزی غذایی بزرگسالان سالم طراحی شده است.
                </p>
              </>
            )}
          </div>

          <p className="form-error" role="alert" aria-live="polite">
            {error}
          </p>

          <div className="form-nav">
            {step > 1 && (
              <button
                className="back-button"
                type="button"
                onClick={() => {
                  setStep((current) => Math.max(1, current - 1));
                  setError("");
                }}
              >
                بازگشت
              </button>
            )}
            <button className="continue-button" type="submit">
              {step === 4 ? "ساخت برنامه هفتگی" : "ادامه"}
              <span aria-hidden="true">←</span>
            </button>
          </div>
        </form>
      </section>

      {metrics && submittedForm && (
        <section
          className="results-section"
          id="results"
          ref={resultsRef}
          aria-labelledby="results-title"
        >
          <div className="section-wrap">
            <div className="result-hero">
              <div>
                <p className="section-kicker">نسخه شخصی شما</p>
                <h2 id="results-title">هفت روز روشن و قابل اجرا</h2>
                <p>
                  برنامه براساس هدف انرژی، سبک غذایی، حساسیت‌ها، زمان آشپزی و
                  ریتم گرسنگی شما چیده شده است.
                </p>
              </div>
              <div className="result-actions">
                <button type="button" onClick={() => window.print()}>
                  چاپ یا ذخیره
                  <span aria-hidden="true">↗</span>
                </button>
                <button type="button" onClick={downloadPlan}>
                  دریافت متن برنامه
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </div>

            <SaveSessionControls
              onSave={handleSaveSession}
              onClear={handleClearSession}
              savedAt={savedAt}
              justSaved={justSaved}
            />

            <article className="result-block numbers-block">
              <div className="block-heading">
                <span>۰۱</span>
                <div>
                  <p>محاسبه نیاز روزانه</p>
                  <h3>اعداد پایه و قابل توضیح</h3>
                </div>
              </div>

              <div className="metric-grid">
                <div>
                  <span>سوخت‌وساز استراحت</span>
                  <strong>{formatNumber(metrics.bmr)}</strong>
                  <small>کیلوکالری</small>
                </div>
                <div>
                  <span>نیاز نگهدارنده</span>
                  <strong>{formatNumber(metrics.tdee)}</strong>
                  <small>کیلوکالری</small>
                </div>
                <div className="metric-primary">
                  <span>هدف روزانه</span>
                  <strong>{formatNumber(metrics.targetCalories)}</strong>
                  <small>کیلوکالری</small>
                </div>
                <div>
                  <span>BMI فعلی</span>
                  <strong>{formatDecimal(metrics.bmi)}</strong>
                  <small>{metrics.bmiLabel}</small>
                </div>
              </div>

              <div className="equation-strip">
                <span>
                  کسری روزانه <strong>{formatNumber(metrics.deficit)}</strong>
                </span>
                <span>
                  ریتم هفتگی{" "}
                  <strong>{formatDecimal(metrics.weeklyPace)} کیلوگرم</strong>
                </span>
                <span>
                  زمان تخمینی{" "}
                  <strong>{formatNumber(metrics.estimatedWeeks)} هفته</strong>
                </span>
              </div>
            </article>

            <article className="result-block nutrition-block">
              <div className="block-heading">
                <span>۰۲</span>
                <div>
                  <p>هدف‌های تغذیه‌ای</p>
                  <h3>ترکیب روزانه، نه فقط یک عدد</h3>
                </div>
              </div>

              <div className="nutrition-grid">
                <div className="macro-card macro-card--protein">
                  <span>پروتئین</span>
                  <strong>{formatNumber(metrics.protein)} گرم</strong>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.protein * 4 * 100) /
                            metrics.targetCalories,
                        )}%`,
                      }}
                    />
                  </div>
                  <small>پخش‌شده میان وعده‌ها</small>
                </div>
                <div className="macro-card macro-card--carb">
                  <span>کربوهیدرات</span>
                  <strong>{formatNumber(metrics.carbs)} گرم</strong>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.carbs * 4 * 100) / metrics.targetCalories,
                        )}%`,
                      }}
                    />
                  </div>
                  <small>با اولویت غلات کامل</small>
                </div>
                <div className="macro-card macro-card--fat">
                  <span>چربی</span>
                  <strong>{formatNumber(metrics.fat)} گرم</strong>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.fat * 9 * 100) / metrics.targetCalories,
                        )}%`,
                      }}
                    />
                  </div>
                  <small>با اولویت چربی غیراشباع</small>
                </div>
              </div>

              <div className="quality-targets">
                <div>
                  <span aria-hidden="true">◉</span>
                  <strong>{formatNumber(metrics.fiber)} گرم فیبر</strong>
                  <small>حبوبات، سبزی، میوه و غلات کامل</small>
                </div>
                <div>
                  <span aria-hidden="true">✦</span>
                  <strong>{formatNumber(metrics.produceGrams)} گرم گیاه</strong>
                  <small>حداقل پنج سهم میوه و سبزی</small>
                </div>
                <div>
                  <span aria-hidden="true">≈</span>
                  <strong>{formatDecimal(metrics.waterLiters)} لیتر آب کل</strong>
                  <small>مرجع روزانه شامل غذا و نوشیدنی</small>
                </div>
                <div>
                  <span aria-hidden="true">◷</span>
                  <strong>{sleepLabel(submittedForm.sleep)}</strong>
                  <small>ثبت خواب برای دیدن الگوی گرسنگی</small>
                </div>
              </div>
            </article>

            <article className="result-block weekly-block" id="weekly-plan">
              <div className="block-heading block-heading--controls">
                <span>۰۳</span>
                <div>
                  <p>طراحی برنامه هفتگی</p>
                  <h3>هفت روز، با امکان چیدمان تازه</h3>
                </div>
                <button
                  className="shuffle-button"
                  type="button"
                  onClick={() => {
                    setVariationSeed((current) => current + 1);
                    setSubstitutions({});
                  }}
                >
                  چیدمان تازه
                  <span aria-hidden="true">↻</span>
                </button>
              </div>

              <div className="mode-tabs" aria-label="نوع چیدمان">
                {planModeOptions.map((mode) => (
                  <button
                    className={planMode === mode.id ? "is-selected" : ""}
                    type="button"
                    aria-pressed={planMode === mode.id}
                    onClick={() => {
                      setPlanMode(mode.id);
                      setSubstitutions({});
                    }}
                    key={mode.id}
                  >
                    <strong>{mode.title}</strong>
                    <small>{mode.note}</small>
                  </button>
                ))}
              </div>

              <div className="weekly-table-wrap">
                <table className="weekly-table">
                  <thead>
                    <tr>
                      <th>روز</th>
                      <th>صبحانه</th>
                      <th>میان‌وعده</th>
                      <th>ناهار</th>
                      <th>شام</th>
                      <th>جمع روز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedPlan.map((day, index) => {
                      const snacks = day.meals.filter(
                        (meal) => meal.slot === "snack",
                      );
                      return (
                        <tr
                          className={activeDay === index ? "is-active" : ""}
                          key={day.id}
                        >
                          <th>
                            <button
                              type="button"
                              onClick={() => setActiveDay(index)}
                              aria-pressed={activeDay === index}
                            >
                              {day.label}
                            </button>
                          </th>
                          <td>{getMeal(day, "breakfast")?.title}</td>
                          <td>
                            {snacks.length > 0
                              ? snacks.map((meal) => meal.title).join(" / ")
                              : "—"}
                          </td>
                          <td>{getMeal(day, "lunch")?.title}</td>
                          <td>{getMeal(day, "dinner")?.title}</td>
                          <td>
                            <strong>{formatNumber(day.calories)}</strong>
                            <small>کیلوکالری</small>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedDay && (
                <div className="day-detail" aria-live="polite">
                  <div className="day-summary">
                    <div>
                      <p>جزئیات {selectedDay.label}</p>
                      <h4>
                        {formatNumber(selectedDay.calories)} کیلوکالری
                      </h4>
                    </div>
                    <span>{formatNumber(selectedDay.protein)} گرم پروتئین</span>
                    <span>{formatNumber(selectedDay.fiber)} گرم فیبر</span>
                  </div>
                  <div className="meal-detail-list">
                    {selectedDay.meals.map((meal, index) => {
                      const occurrence = selectedDay.meals
                        .slice(0, index)
                        .filter((other) => other.slot === meal.slot).length;
                      return (
                        <article key={`${meal.id}-${meal.displaySlot}-${index}`}>
                          <span>{formatNumber(index + 1)}</span>
                          <div>
                            <small>{meal.displaySlot}</small>
                            <h5>{meal.title}</h5>
                            <p>{meal.serving}</p>
                            <em>{meal.portionCue}</em>
                          </div>
                          <dl>
                            <div>
                              <dt>انرژی</dt>
                              <dd>{formatNumber(meal.targetCalories)}</dd>
                            </div>
                            <div>
                              <dt>پروتئین</dt>
                              <dd>{formatNumber(meal.targetProtein)} گرم</dd>
                            </div>
                            <div>
                              <dt>زمان</dt>
                              <dd>{formatNumber(meal.prep)} دقیقه</dd>
                            </div>
                          </dl>
                          <button
                            type="button"
                            className="substitute-button"
                            onClick={() => openSubstitutePicker(meal.slot, occurrence)}
                            aria-label={`جایگزینی ${meal.title}`}
                          >
                            جایگزین کن
                          </button>
                        </article>
                      );
                    })}
                  </div>

                  {substitutionTarget && (
                    <SubstitutePicker
                      options={substituteOptions}
                      onSelect={applySubstitutionChoice}
                      onCancel={() => setSubstitutionTarget(null)}
                    />
                  )}
                </div>
              )}
            </article>

            <article className="result-block exchange-block">
              <div className="block-heading">
                <span>۰۴</span>
                <div>
                  <p>انعطاف بدون گم‌کردن مسیر</p>
                  <h3>جایگزین‌های هم‌گروه</h3>
                </div>
              </div>
              <div className="exchange-grid">
                {exchangeGroups.map((group) => (
                  <div
                    className={`exchange-card exchange-card--${group.color}`}
                    key={group.title}
                  >
                    <h4>{group.title}</h4>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p>{group.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="result-block shopping-block">
              <div className="block-heading block-heading--controls">
                <span>۰۵</span>
                <div>
                  <p>اجرای ساده‌تر برنامه</p>
                  <h3>فهرست خرید و آماده‌سازی</h3>
                </div>
                <button
                  className="copy-button"
                  type="button"
                  onClick={copyShoppingList}
                >
                  {copyState === "done" ? "کپی شد" : "کپی فهرست"}
                </button>
              </div>

              <p className="shopping-note">{shoppingListNote}</p>

              <div className="shopping-layout">
                <div className="shopping-groups">
                  {shoppingGroups.map((group) => (
                    <section
                      className={`shopping-group shopping-group--${group.tone}`}
                      key={group.title}
                    >
                      <h4>{group.title}</h4>
                      <ul>
                        {group.entries.map((entry) => (
                          <li key={entry.name}>
                            <span>{entry.name}</span>
                            <small>× {formatNumber(entry.count)}</small>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>

                <aside className="prep-panel">
                  <p>نقشه آماده‌سازی</p>
                  <h4>{prepLabel(submittedForm.mealPrep)}</h4>
                  <ol>
                    <li>
                      <span>۱</span>
                      <div>
                        <strong>حبوبات پایه</strong>
                        <small>خیساندن، پخت و تقسیم در ظرف‌های کوچک</small>
                      </div>
                    </li>
                    <li>
                      <span>۲</span>
                      <div>
                        <strong>غلات دو روز</strong>
                        <small>برنج یا بلغور را برای دو وعده آماده کن</small>
                      </div>
                    </li>
                    <li>
                      <span>۳</span>
                      <div>
                        <strong>سبزیجات آماده</strong>
                        <small>شست‌وشو، خشک‌کردن و نگهداری جداگانه</small>
                      </div>
                    </li>
                    <li>
                      <span>۴</span>
                      <div>
                        <strong>میان‌وعده قابل حمل</strong>
                        <small>میوه، نخود برشته یا مغزها را سهم‌بندی کن</small>
                      </div>
                    </li>
                  </ol>
                </aside>
              </div>
            </article>

            <article className="result-block progress-block">
              <div className="block-heading">
                <span>۰۶</span>
                <div>
                  <p>پیگیری بدون وسواس</p>
                  <h3>مسیر تخمینی و ریتم هفتگی</h3>
                </div>
              </div>

              <div className="progress-layout">
                <div className="projection-card">
                  <div>
                    <p>برآورد روند</p>
                    <small>تخمینی است و خط مستقیم تضمین‌شده نیست.</small>
                  </div>
                  <div className="projection-bars">
                    {projection.map((item, index) => (
                      <div key={item.week}>
                        <span
                          style={{
                            height: `${Math.max(
                              24,
                              100 -
                                (index / Math.max(1, projection.length - 1)) *
                                  58,
                            )}%`,
                          }}
                        />
                        <strong>{formatDecimal(item.weight)}</strong>
                        <small>
                          {item.week === 0
                            ? "شروع"
                            : `هفته ${formatNumber(item.week)}`}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rhythm-card">
                  <p>ریتم شخصی شما</p>
                  <dl>
                    <div>
                      <dt>الگوی روز</dt>
                      <dd>{dayPatternLabel(submittedForm.dayPattern)}</dd>
                    </div>
                    <div>
                      <dt>آماده‌سازی</dt>
                      <dd>{prepLabel(submittedForm.mealPrep)}</dd>
                    </div>
                    <div>
                      <dt>خواب ثبت‌شده</dt>
                      <dd>{sleepLabel(submittedForm.sleep)}</dd>
                    </div>
                    <div>
                      <dt>نظم آب</dt>
                      <dd>{waterLabel(submittedForm.water)}</dd>
                    </div>
                  </dl>
                  <ul>
                    <li>وزن‌کشی یک‌بار در هفته، در شرایط مشابه</li>
                    <li>ثبت دور کمر هر چهار هفته</li>
                    <li>میانگین هفتگی مهم‌تر از یک روز منفرد است</li>
                    <li>۱۵۰ دقیقه فعالیت متوسط در هفته را هدف بگیر</li>
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="method-section" id="method">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <p className="section-kicker">مبنای علمی میزانه</p>
              <h2>هر عدد، یک منطق روشن دارد</h2>
            </div>
            <p>
              خروجی از ترکیب فرمول انرژی، کسری محافظه‌کارانه، کیفیت غذا،
              پروتئین کافی و تنوع هفتگی ساخته می‌شود.
            </p>
          </div>

          <div className="method-flow">
            {[
              {
                number: "۱",
                title: "سوخت‌وساز استراحت",
                formula: "۱۰×وزن + ۶٫۲۵×قد − ۵×سن",
                copy: "فرمول Mifflin–St Jeor نقطه شروع برآورد انرژی است.",
              },
              {
                number: "۲",
                title: "نیاز نگهدارنده",
                formula: "سوخت‌وساز × ضریب فعالیت",
                copy: "فعالیت روزانه فاصله میان استراحت و نیاز واقعی را تنظیم می‌کند.",
              },
              {
                number: "۳",
                title: "هدف کاهش",
                formula: "حداکثر ۲۰٪ کسری روزانه",
                copy: "سرعت انتخابی کاربر با یک سقف محافظه‌کارانه محدود می‌شود.",
              },
              {
                number: "۴",
                title: "کیفیت برنامه",
                formula: "پروتئین + فیبر + تنوع",
                copy: "فقط انرژی مهم نیست؛ ترکیب وعده‌ها قابلیت اجرا را می‌سازد.",
              },
            ].map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <strong>{item.formula}</strong>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>

          <div className="source-grid">
            {sourceCards.map((source) => (
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                key={source.title}
              >
                <span>{source.tag}</span>
                <h3>{source.title}</h3>
                <p>{source.copy}</p>
                <strong>مشاهده منبع ↗</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section" id="guide">
        <div className="section-wrap guide-layout">
          <div>
            <p className="section-kicker">راهنمای استفاده</p>
            <h2>برنامه خوب، برنامه قابل تکرار است</h2>
            <p>
              لازم نیست هر روز بی‌نقص باشد. از جدول هفتگی به‌عنوان نقشه استفاده
              کن و با جایگزین‌های هم‌گروه، انعطاف را حفظ کن.
            </p>
          </div>
          <div className="faq-list">
            <details open>
              <summary>آیا انرژی محاسبه‌شده دقیق است؟</summary>
              <p>
                این عدد یک برآورد علمی است، نه اندازه‌گیری آزمایشگاهی. روند وزن
                در چند هفته بهترین بازخورد برای تنظیم بعدی است.
              </p>
            </details>
            <details>
              <summary>می‌توانم روزهای جدول را جابه‌جا کنم؟</summary>
              <p>
                بله. روزها و وعده‌های هم‌رده قابل جابه‌جایی‌اند؛ سهم نوشته‌شده
                و مجموع روزانه را نزدیک به هدف نگه دار.
              </p>
            </details>
            <details>
              <summary>چطور تنوع بیشتری بگیرم؟</summary>
              <p>
                گزینه «چیدمان تازه» ترکیب دیگری از غذاهای سازگار می‌سازد.
                حالت‌های سریع، متنوع، آماده‌سازی جمعی و پروتئین‌محور نیز قابل
                انتخاب‌اند.
              </p>
            </details>
            <details>
              <summary>اگر یک وعده را نپسندیدم چه کنم؟</summary>
              <p>
                از بخش جایگزین‌های هم‌گروه استفاده کن یا نام آن غذا را در فرم
                ترجیحات بنویس و برنامه را دوباره بساز.
              </p>
            </details>
            <details>
              <summary>چه زمانی برنامه را بازبینی کنم؟</summary>
              <p>
                پس از سه تا چهار هفته، میانگین روند، گرسنگی، انرژی روزانه و
                قابلیت اجرای وعده‌ها را با هدف اولیه مقایسه کن.
              </p>
            </details>
          </div>
        </div>
      </section>

      <footer>
        <a className="brand brand--footer" href="#top">
          <BrandMark className="brand-logo" />
          <span>
            <strong>میزانه</strong>
            <small>برنامه غذایی علمی</small>
          </span>
        </a>
        <p>تعادل روشن، ریتم پایدار.</p>
        <span>برای برنامه‌ریزی غذایی بزرگسالان سالم</span>
      </footer>
    </main>
  );
}
