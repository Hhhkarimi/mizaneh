"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type {
  AdjustmentProposal,
  Allergy,
  DayPlan,
  Goal,
  MealSlot,
  Metrics,
  PlannedMeal,
  PlanDocument,
  PlanMode,
  PlannerForm,
  WeightMeasurement,
} from "@/lib/types";
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
import { formatDecimal, formatNumber } from "@/lib/nutrition/format";
import { applyReviewedEnergyAdjustment, calculateCurrentMetrics, getCalculationScopeIssue } from "@/lib/calculations/policies";
import { goalCopy } from "@/lib/domain/goals";
import { buildWeeklyPlan, applySubstitution, getMeal, getSubstituteOptions } from "@/lib/plan/build";
import {
  commitHistory,
  copyDayTo,
  createHistory,
  duplicateDay,
  ensurePlanIdentity,
  evaluatePlanCompatibility,
  recalculateDay,
  redoHistory,
  summarizePlan,
  undoHistory,
  type PlanHistory,
} from "@/lib/plan/editor";
import { buildShoppingList } from "@/lib/plan/shopping";
import { dayPatternLabel, prepLabel, sleepLabel, waterLabel } from "@/lib/labels";
import { screenSafety } from "@/lib/safety/screen";
import { SafetyAdvisory } from "@/components/SafetyAdvisory";
import { SubstitutePicker } from "@/components/SubstitutePicker";
import { SaveSessionControls } from "@/components/SaveSessionControls";
import { RestoreSessionPrompt } from "@/components/RestoreSessionPrompt";
import { GoalSelection } from "@/components/goal-selection/GoalSelection";
import { SafetyScreenFields } from "@/components/safety-screen/SafetyScreenFields";
import { MealEditor } from "@/components/meal-editor/MealEditor";
import { ProgressTracker } from "@/components/progress/ProgressTracker";
import { clearSession, saveSession, type StoredSession } from "@/lib/storage/session";
import { clearWorkspace, saveWorkspace, type StoredWorkspace } from "@/lib/storage/workspace";

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
  const [planHistory, setPlanHistory] = useState<PlanHistory | null>(null);
  const [baselinePlan, setBaselinePlan] = useState<DayPlan[]>([]);
  const [archivedPlans, setArchivedPlans] = useState<PlanDocument[]>([]);
  const [activePlanId, setActivePlanId] = useState(() => `plan-${Date.now()}`);
  const [activePlanCreatedAt, setActivePlanCreatedAt] = useState(() => new Date().toISOString());
  const [pendingGoal, setPendingGoal] = useState<{ goal: Goal; source: "guided" | "direct" } | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [adjustmentProposal, setAdjustmentProposal] = useState<AdjustmentProposal | null>(null);
  const [lastAdjustmentAt, setLastAdjustmentAt] = useState<string | undefined>(undefined);
  const [startingTargetCalories, setStartingTargetCalories] = useState<number | null>(null);
  const [comparisonPlanId, setComparisonPlanId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const previewMetrics = useMemo(() => calculateCurrentMetrics(form), [form]);
  const safetyResult = useMemo(() => screenSafety(form), [form]);
  const activeForm = submittedForm ?? form;
  const generatedPlan = useMemo(
    () => metrics ? ensurePlanIdentity(buildWeeklyPlan(activeForm, metrics, planMode, variationSeed)) : [],
    [activeForm, metrics, planMode, variationSeed],
  );
  const displayedPlan = planHistory?.present ?? generatedPlan;
  const { groups: shoppingGroups, note: shoppingListNote } = useMemo(
    () => buildShoppingList(displayedPlan),
    [displayedPlan],
  );
  const selectedDay = displayedPlan[activeDay];
  const planSummary = useMemo(() => summarizePlan(displayedPlan), [displayedPlan]);
  const compatibilityIssues = useMemo(
    () => evaluatePlanCompatibility(displayedPlan, activeForm),
    [displayedPlan, activeForm],
  );
  const comparisonPlan = useMemo(
    () => archivedPlans.find((plan) => plan.id === comparisonPlanId) ?? null,
    [archivedPlans, comparisonPlanId],
  );
  const comparisonSummary = useMemo(
    () => comparisonPlan ? summarizePlan(comparisonPlan.days) : null,
    [comparisonPlan],
  );

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

  function commitPlan(next: DayPlan[], announcement: string) {
    setPlanHistory((current) => current ? commitHistory(current, next) : createHistory(next));
    setLiveAnnouncement(announcement);
  }

  function replaceDay(index: number, day: DayPlan, announcement: string) {
    const next = displayedPlan.map((item, itemIndex) => itemIndex === index ? day : item);
    commitPlan(next, announcement);
  }

  function openSubstitutePicker(slot: MealSlot, occurrence: number) {
    setSubstitutionTarget({ slot, occurrence });
  }

  function applySubstitutionChoice(meal: PlannedMeal) {
    if (!substitutionTarget || !selectedDay) return;
    const nextDay = applySubstitution(
      selectedDay,
      substitutionTarget.slot,
      substitutionTarget.occurrence,
      meal,
    );
    replaceDay(activeDay, nextDay, "جایگزین انتخاب شد و جمع روز دوباره محاسبه شد.");
    setSubstitutionTarget(null);
  }

  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function currentPlanDocument(name = "برنامهٔ فعال", id = activePlanId, parentPlanId = archivedPlans.at(-1)?.id ?? null): PlanDocument | null {
    if (!metrics || !submittedForm || displayedPlan.length === 0) return null;
    const now = new Date().toISOString();
    return {
      schemaVersion: 2,
      id,
      parentPlanId,
      name,
      goal: submittedForm.goal,
      form: structuredClone(submittedForm),
      safetyScreen: screenSafety(submittedForm),
      calculation: structuredClone(metrics),
      startingTargetCalories: startingTargetCalories ?? metrics.targetCalories,
      planMode,
      variationSeed,
      days: structuredClone(displayedPlan),
      versions: archivedPlans.map((plan) => ({ id: plan.id, name: plan.name, goal: plan.goal, createdAt: plan.createdAt, parentPlanId: plan.parentPlanId })),
      measurements: structuredClone(measurements),
      adjustmentProposals: adjustmentProposal ? [structuredClone(adjustmentProposal)] : [],
      lastAdjustmentAt,
      createdAt: id === activePlanId ? activePlanCreatedAt : now,
      updatedAt: now,
      legacy: metrics.policy.evidenceCertainty === "legacy",
    };
  }

  function handleSaveSession() {
    const substitutions = Object.fromEntries(displayedPlan.map((day, index) => [index, day]));
    const legacyOk = activeForm.goal === "weight_loss"
      ? saveSession({ form: activeForm, planMode, variationSeed, substitutions })
      : false;
    const current = currentPlanDocument();
    const workspacePlans = current
      ? [...archivedPlans.filter((plan) => plan.id !== current.id), current].slice(-50)
      : archivedPlans.slice(-50);
    const workspaceOk = current
      ? saveWorkspace({
          version: 2,
          savedAt: new Date().toISOString(),
          activePlanId: current.id,
          plans: workspacePlans,
        })
      : false;
    if (legacyOk || workspaceOk) {
      setSavedAt(new Date().toISOString());
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 3000);
    }
  }

  function handleClearSession() {
    clearSession();
    clearWorkspace();
    setSavedAt(null);
    setJustSaved(false);
  }

  function handleRestoreSession(session: StoredSession) {
    const restoredForm = { ...session.form, goal: "weight_loss" as const, goalSelectionSource: "restored" as const };
    const restoredMetrics = calculateMetrics(restoredForm);
    const generated = ensurePlanIdentity(buildWeeklyPlan(restoredForm, restoredMetrics, session.planMode, session.variationSeed));
    const restoredPlan = generated.map((day, index) => ensurePlanIdentity([session.substitutions[index] ?? day])[0]);
    setForm(restoredForm);
    setSubmittedForm(restoredForm);
    setMetrics(restoredMetrics);
    setPlanMode(session.planMode);
    setVariationSeed(session.variationSeed);
    setBaselinePlan(structuredClone(restoredPlan));
    setPlanHistory(createHistory(restoredPlan));
    setActiveDay(0);
    setStep(4);
    setError("");
    setSavedAt(session.savedAt);
    setActivePlanId(`legacy-${Date.parse(session.savedAt) || Date.now()}`);
    setActivePlanCreatedAt(session.savedAt);
    setArchivedPlans([]);
    setMeasurements([]);
    setAdjustmentProposal(null);
    setLastAdjustmentAt(undefined);
    setStartingTargetCalories(restoredMetrics.targetCalories);
  }

  function handleRestoreWorkspace(workspace: StoredWorkspace) {
    const active = workspace.plans.find((plan) => plan.id === workspace.activePlanId) ?? workspace.plans.at(-1);
    if (!active) return;
    setArchivedPlans(workspace.plans.filter((plan) => plan.id !== active.id));
    setActivePlanId(active.id);
    setActivePlanCreatedAt(active.createdAt);
    restoreArchivedPlan(active);
    setSavedAt(workspace.savedAt);
  }

  function requestGoalChange(goal: Goal, source: "guided" | "direct") {
    if (goal === form.goal) {
      setForm((current) => ({ ...current, goalSelectionSource: source }));
      return;
    }
    if (metrics && submittedForm) {
      setPendingGoal({ goal, source });
      return;
    }
    setForm((current) => ({
      ...current,
      goal,
      goalSelectionSource: source,
      targetWeight: goal === "weight_loss"
        ? String(Math.max(40, Number(current.weight) - 5))
        : String(Math.min(300, Number(current.weight) + 5)),
    }));
    setError("");
  }

  function confirmGoalSwitch() {
    if (!pendingGoal) return;
    const current = currentPlanDocument(
      `نسخهٔ ${goalCopy[submittedForm?.goal ?? form.goal].title}`,
      `version-${Date.now()}`,
      activePlanId,
    );
    if (current) setArchivedPlans((plans) => [...plans.filter((plan) => plan.id !== current.id), current].slice(-49));
    setForm((currentForm) => ({
      ...currentForm,
      goal: pendingGoal.goal,
      goalSelectionSource: pendingGoal.source,
      targetWeight: pendingGoal.goal === "weight_loss"
        ? String(Math.max(40, Number(currentForm.weight) - 5))
        : String(Math.min(300, Number(currentForm.weight) + 5)),
    }));
    setSubmittedForm(null);
    setMetrics(null);
    setPlanHistory(null);
    setBaselinePlan([]);
    setActiveDay(0);
    setStep(1);
    setPendingGoal(null);
    setError("");
    setActivePlanId(`plan-${Date.now()}`);
    setActivePlanCreatedAt(new Date().toISOString());
    setMeasurements([]);
    setAdjustmentProposal(null);
    setLastAdjustmentAt(undefined);
    setStartingTargetCalories(null);
    setComparisonPlanId(null);
  }

  function restoreArchivedPlan(plan: PlanDocument) {
    setForm(structuredClone(plan.form));
    setSubmittedForm(structuredClone(plan.form));
    setMetrics(structuredClone(plan.calculation));
    setPlanMode(plan.planMode);
    setVariationSeed(plan.variationSeed);
    setBaselinePlan(structuredClone(plan.days));
    setPlanHistory(createHistory(plan.days));
    setActiveDay(0);
    setStep(4);
    setLiveAnnouncement(`نسخهٔ ${plan.name} باز شد.`);
    setActivePlanId(plan.id);
    setActivePlanCreatedAt(plan.createdAt);
    setMeasurements(structuredClone(plan.measurements ?? []));
    setAdjustmentProposal(structuredClone(plan.adjustmentProposals?.at(-1) ?? null));
    setLastAdjustmentAt(plan.lastAdjustmentAt);
    setStartingTargetCalories(plan.startingTargetCalories ?? plan.calculation.targetCalories);
    setComparisonPlanId(null);
  }

  function openArchivedPlan(plan: PlanDocument) {
    const current = currentPlanDocument(
      `نسخهٔ حفظ‌شده پیش از بازکردن ${plan.name}`,
      activePlanId,
      plan.id,
    );
    if (current) {
      setArchivedPlans((plans) => [
        ...plans.filter((item) => item.id !== plan.id && item.id !== current.id),
        current,
      ].slice(-49));
    } else {
      setArchivedPlans((plans) => plans.filter((item) => item.id !== plan.id));
    }
    restoreArchivedPlan(plan);
  }

  function updateForm<K extends keyof PlannerForm>(key: K, value: PlannerForm[K]) {
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
    const screening = screenSafety(form);
    if (screening.blocked) {
      setError("برنامه ساخته نشد. دلیل دقیق توقف و اقدام پیشنهادی در بخش «بررسی ایمنی» نمایش داده شده است.");
      window.setTimeout(() => {
        const safetyPanel = document.getElementById("safety-screen-result");
        safetyPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
        safetyPanel?.focus({ preventScroll: true });
      }, 40);
      return;
    }

    const calculated = calculateCurrentMetrics(form);
    const calculationScopeIssue = getCalculationScopeIssue(form, calculated);
    if (calculationScopeIssue) {
      setError(calculationScopeIssue);
      return;
    }
    const preferredMode: PlanMode =
      form.cookingTime === "15"
        ? "quick"
        : form.mealPrep === "batch"
          ? "batch"
          : form.dietStyle === "highProtein" || form.goal === "muscle_gain"
            ? "protein"
            : "variety";
    const nextSeed = variationSeed + 1;
    const submitted = { ...structuredClone(form), allergies: [...form.allergies] };
    const plan = ensurePlanIdentity(buildWeeklyPlan(submitted, calculated, preferredMode, nextSeed));

    if (!metrics) {
      setActivePlanId(`plan-${Date.now()}`);
      setActivePlanCreatedAt(new Date().toISOString());
    }

    setMetrics(calculated);
    setSubmittedForm(submitted);
    setPlanMode(preferredMode);
    setVariationSeed(nextSeed);
    setBaselinePlan(structuredClone(plan));
    setPlanHistory(createHistory(plan));
    setActiveDay(0);
    setError("");
    setStartingTargetCalories(calculated.targetCalories);
    setMeasurements([]);
    setAdjustmentProposal(null);
    setLastAdjustmentAt(undefined);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }

  function regeneratePlan(nextMode = planMode, nextSeed = variationSeed + 1) {
    if (!metrics || !submittedForm) return;
    const plan = ensurePlanIdentity(buildWeeklyPlan(submittedForm, metrics, nextMode, nextSeed));
    setPlanMode(nextMode);
    setVariationSeed(nextSeed);
    setBaselinePlan(structuredClone(plan));
    setPlanHistory(createHistory(plan));
    setLiveAnnouncement("چیدمان تازه ساخته شد؛ نسخهٔ قبلی فقط در صورت ذخیرهٔ نسخه نگه‌داری می‌شود.");
  }

  function handleAdjustmentDecision(proposal: AdjustmentProposal | null) {
    setAdjustmentProposal(proposal);
    if (!proposal || (proposal.status !== "accepted" && proposal.status !== "modified") || !metrics || !submittedForm) return;
    const snapshot = currentPlanDocument(
      `پیش از تنظیم روند — ${new Date().toLocaleDateString("fa-IR")}`,
      `version-${Date.now()}`,
      activePlanId,
    );
    if (snapshot) setArchivedPlans((plans) => [...plans.filter((plan) => plan.id !== snapshot.id), snapshot].slice(-49));
    const nextMetrics = applyReviewedEnergyAdjustment(submittedForm, metrics, proposal.proposedCaloriesDelta, startingTargetCalories ?? metrics.targetCalories);
    const nextSeed = variationSeed + 1;
    const nextPlan = ensurePlanIdentity(buildWeeklyPlan(submittedForm, nextMetrics, planMode, nextSeed));
    setMetrics(nextMetrics);
    setVariationSeed(nextSeed);
    setBaselinePlan(structuredClone(nextPlan));
    setPlanHistory(createHistory(nextPlan));
    setLastAdjustmentAt(new Date().toISOString());
    setLiveAnnouncement(`تنظیم ${proposal.proposedCaloriesDelta >= 0 ? "+" : ""}${proposal.proposedCaloriesDelta} کیلوکالری با انتخاب شما اعمال و برنامه دوباره ساخته شد.`);
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
      `هدف: ${goalCopy[submittedForm.goal].title}`,
      `هدف روزانه: ${formatNumber(metrics.targetCalories)} کیلوکالری`,
      `بازهٔ عدم‌قطعیت نگهدارنده: ±${formatNumber(metrics.uncertaintyKcal)} کیلوکالری`,
      `پروتئین: ${formatNumber(metrics.proteinMin)} تا ${formatNumber(metrics.proteinMax)} گرم`,
      `سیاست محاسبه: ${metrics.policy.calculationPolicyId}`,
      "",
      ...displayedPlan.flatMap((day) => [
        day.label,
        ...day.meals.map((meal) => `${meal.displaySlot}${meal.mealTime ? ` (${meal.mealTime})` : ""}: ${meal.title} — ${meal.serving}`),
        "",
      ]),
    ];
    return lines.join("\n");
  }

  function downloadPlan() {
    const blob = new Blob([planAsText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "barname-haftegi-mizaneh.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copyShoppingList() {
    const text = shoppingGroups
      .flatMap((group) => [group.title, ...group.items.map((item) => `• ${item}`), ""])
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("done");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("idle");
    }
  }

  function undoPlan() {
    setPlanHistory((current) => current ? undoHistory(current) : current);
    setLiveAnnouncement("آخرین ویرایش واگرد شد.");
  }

  function redoPlan() {
    setPlanHistory((current) => current ? redoHistory(current) : current);
    setLiveAnnouncement("ویرایش دوباره اعمال شد.");
  }

  function resetMeal(instanceId: string) {
    if (!selectedDay) return;
    const baselineDay = baselinePlan.find((day) => day.id === selectedDay.id) ?? baselinePlan[activeDay];
    const currentIndex = selectedDay.meals.findIndex((meal) => meal.instanceId === instanceId);
    const baselineMeal = baselineDay?.meals.find((meal) => meal.instanceId === instanceId) ?? baselineDay?.meals[currentIndex];
    if (!baselineMeal || currentIndex < 0) return;
    const meals = selectedDay.meals.map((meal, index) => index === currentIndex ? structuredClone(baselineMeal) : meal);
    replaceDay(activeDay, recalculateDay({ ...selectedDay, meals }), "وعده به نسخهٔ اولیه بازگشت و جمع روز دوباره محاسبه شد.");
  }

  function resetDay() {
    const baselineDay = baselinePlan.find((day) => day.id === selectedDay?.id) ?? baselinePlan[activeDay];
    if (!baselineDay) return;
    replaceDay(activeDay, structuredClone(baselineDay), "روز به نسخهٔ اولیه بازگشت.");
  }

  function resetWholePlan() {
    if (!baselinePlan.length) return;
    commitPlan(structuredClone(baselinePlan), "کل برنامه به نسخهٔ اولیه بازگشت.");
    setActiveDay(0);
  }

  function duplicateActiveDay() {
    if (!selectedDay) return;
    const number = displayedPlan.length + 1;
    const copy = duplicateDay(selectedDay, `custom-day-${Date.now()}`, `روز کپی ${formatNumber(number)}`);
    commitPlan([...displayedPlan, copy], "یک نسخه از روز به انتهای برنامه افزوده شد.");
    setActiveDay(displayedPlan.length);
  }

  function copyActiveDay(targetDayId: string) {
    if (!selectedDay) return;
    const targetIndex = displayedPlan.findIndex((day) => day.id === targetDayId);
    if (targetIndex < 0) return;
    const next = displayedPlan.map((day, index) => index === targetIndex ? copyDayTo(selectedDay, day) : day);
    commitPlan(next, "محتوای روز روی روز مقصد کپی شد.");
  }

  function toggleFavourite(foodId: string) {
    const apply = (current: PlannerForm) => ({
      ...current,
      favourites: current.favourites.includes(foodId)
        ? current.favourites.filter((id) => id !== foodId)
        : [...current.favourites, foodId],
    });
    setForm(apply);
    setSubmittedForm((current) => current ? apply(current) : current);
    setLiveAnnouncement("فهرست غذاهای محبوب به‌روزرسانی شد.");
  }

  function toggleHiddenFood(foodId: string) {
    const apply = (current: PlannerForm) => ({
      ...current,
      hiddenFoods: current.hiddenFoods.includes(foodId)
        ? current.hiddenFoods.filter((id) => id !== foodId)
        : [...current.hiddenFoods, foodId],
    });
    setForm(apply);
    setSubmittedForm((current) => current ? apply(current) : current);
    setLiveAnnouncement("ترجیحات پیشنهاد غذا به‌روزرسانی شد.");
  }

  function saveNamedVersion() {
    const plan = currentPlanDocument(
      `نسخهٔ ${goalCopy[activeForm.goal].title} — ${new Date().toLocaleDateString("fa-IR")}`,
      `version-${Date.now()}`,
      activePlanId,
    );
    if (!plan) return;
    setArchivedPlans((plans) => [...plans, plan].slice(-49));
    setLiveAnnouncement("نسخه در فضای کاری جاری حفظ شد؛ برای ماندگاری روی دستگاه، گزینهٔ ذخیره را هم بزنید.");
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

      <RestoreSessionPrompt onRestore={handleRestoreSession} onRestoreWorkspace={handleRestoreWorkspace} />

      {pendingGoal && (
        <div className="dialog-backdrop" role="presentation">
          <section className="goal-switch-dialog" role="dialog" aria-modal="true" aria-labelledby="goal-switch-title">
            <h2 id="goal-switch-title">هدف برنامه تغییر می‌کند</h2>
            <p>هدف فعلی «{goalCopy[submittedForm?.goal ?? form.goal].title}» به «{goalCopy[pendingGoal.goal].title}» تغییر می‌کند. برنامهٔ فعلی به‌عنوان یک نسخهٔ جدا حفظ می‌شود و اطلاعات مشترک دوباره استفاده خواهند شد.</p>
            <p className="form-note">هدف تازه محاسبه، هشدارها و اولویت‌های پیگیری متفاوتی دارد و برنامهٔ فعال را بی‌صدا بازنویسی نمی‌کند.</p>
            <div className="dialog-actions"><button type="button" onClick={() => setPendingGoal(null)}>انصراف</button><button type="button" className="continue-button" onClick={confirmGoalSwitch}>حفظ نسخه و ساخت برنامهٔ جدید</button></div>
          </section>
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">{liveAnnouncement}</p>

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
            سه مسیر جدا برای کاهش وزن، افزایش حجم عضله و افزایش وزن سالم؛ همراه با برنامهٔ هفتگی قابل ویرایش، فهرست خرید، غربالگری ایمنی و پیگیری روند.
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
            <span className="privacy-note">ذخیره فقط با انتخاب شما</span>
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
                <GoalSelection
                  form={form}
                  onGoalChange={requestGoalChange}
                  onResistanceTrainingChange={(status) => updateForm("resistanceTraining", status)}
                />

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

                {form.goal === "weight_loss" && (
                  <fieldset>
                    <legend>شروع محافظه‌کارانهٔ کاهش انرژی</legend>
                    <div className="segmented segmented--two">
                      <button type="button" aria-pressed={form.startingAdjustmentPreference === "gentle"} className={form.startingAdjustmentPreference === "gentle" ? "is-selected" : ""} onClick={() => updateForm("startingAdjustmentPreference", "gentle")}>ملایم‌تر</button>
                      <button type="button" aria-pressed={form.startingAdjustmentPreference === "standard"} className={form.startingAdjustmentPreference === "standard" ? "is-selected" : ""} onClick={() => updateForm("startingAdjustmentPreference", "standard")}>استاندارد محافظه‌کارانه</button>
                    </div>
                    <p className="field-hint">شروع برنامه از مقدار کمترِ ۱۵٪ نیاز نگهدارنده یا ۵۰۰ کیلوکالری استفاده می‌کند؛ نتیجهٔ وزن تضمین نمی‌شود و با روند چند هفته‌ای بازبینی خواهد شد.</p>
                  </fieldset>
                )}

                {form.goal === "muscle_gain" && (
                  <section className="goal-specific-fields" aria-labelledby="muscle-fields-title">
                    <h3 id="muscle-fields-title">اطلاعات تمرین مقاومتی</h3>
                    <div className="field-grid field-grid--three">
                      <label><span>وضعیت تمرین</span><select value={form.resistanceTraining} onChange={(event) => updateForm("resistanceTraining", event.target.value as PlannerForm["resistanceTraining"])}><option value="current">اکنون منظم تمرین می‌کنم</option><option value="starting">هم‌زمان شروع می‌کنم</option><option value="none">تمرین مقاومتی ندارم</option></select></label>
                      <label><span>جلسه در هفته</span><span className="input-wrap"><input type="number" min="0" max="14" value={form.trainingDays} onChange={(event) => updateForm("trainingDays", event.target.value)} /><small>جلسه</small></span></label>
                      <label><span>سابقهٔ تمرین</span><select value={form.trainingExperience} onChange={(event) => updateForm("trainingExperience", event.target.value as PlannerForm["trainingExperience"])}><option value="beginner">تازه‌کار</option><option value="intermediate">متوسط</option><option value="advanced">پیشرفته</option></select></label>
                    </div>
                    <label><span>روند عملکرد تمرینی</span><select value={form.trainingProgress} onChange={(event) => updateForm("trainingProgress", event.target.value as PlannerForm["trainingProgress"])}><option value="progressing">در حال پیشرفت</option><option value="plateau">متوقف یا افت‌کرده</option><option value="unknown">هنوز مشخص نیست</option></select></label>
                    <p className="field-hint">تغذیه به‌تنهایی افزایش معنادار حجم عضله را تضمین نمی‌کند؛ تمرین مقاومتی و ریکاوری بخش ضروری این هدف‌اند.</p>
                  </section>
                )}

                {form.goal === "healthy_weight_gain" && (
                  <section className="goal-specific-fields" aria-labelledby="gain-fields-title">
                    <h3 id="gain-fields-title">اشتها و تحمل غذا</h3>
                    <div className="field-grid field-grid--three">
                      <label><span>اشتها</span><select value={form.appetite} onChange={(event) => updateForm("appetite", event.target.value as PlannerForm["appetite"])}><option value="low">کم</option><option value="normal">معمولی</option><option value="high">زیاد</option></select></label>
                      <label><span>تحمل گوارشی</span><select value={form.digestiveTolerance} onChange={(event) => updateForm("digestiveTolerance", event.target.value as PlannerForm["digestiveTolerance"])}><option value="good">خوب</option><option value="some_issues">گاهی مشکل دارم</option><option value="poor">ضعیف</option></select></label>
                      <label className="check-chip"><input type="checkbox" checked={form.earlySatiety} onChange={(event) => updateForm("earlySatiety", event.target.checked)} /><span>زود سیر می‌شوم</span></label>
                    </div>
                    <p className="field-hint">افزایش وزن می‌تواند ترکیبی از بافت بدون چربی، چربی، آب و گلیکوژن باشد. برنامه بر افزایش تدریجی و غذاهای مغذی تمرکز می‌کند.</p>
                  </section>
                )}

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

                {form.goal === "muscle_gain" && (
                  <label className="training-acknowledgement">
                    <input type="checkbox" checked={form.acknowledgesTrainingRequirement} onChange={(event) => updateForm("acknowledgesTrainingRequirement", event.target.checked)} />
                    <span>می‌دانم که تمرین مقاومتی برای افزایش معنادار حجم عضله ضروری است و همهٔ وزن اضافه‌شده عضله نخواهد بود.</span>
                  </label>
                )}

                <SafetyScreenFields form={form} result={safetyResult} onChange={(next) => { setForm(next); setError(""); }} />

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
                    <span>عدم‌قطعیت برآورد</span>
                    <strong>±{formatNumber(previewMetrics.uncertaintyKcal)}</strong>
                    <small>کیلوکالری</small>
                  </div>
                </div>

                <p className="form-note">
                  خروجی فقط برای برنامه‌ریزی عمومی بزرگسالان در محدودهٔ ایمن است؛ تشخیص، درمان، تعیین هدف پزشکی یا تغییر دارو انجام نمی‌دهد.
                </p>
              </>
            )}
          </div>

          {step === 4 && safetyResult.blocked && (
            <p className="submit-safety-hint">
              ساخت برنامه فعلاً متوقف است. دکمهٔ زیر شما را به توضیح دلیل و اقدام بعدی در بخش بررسی ایمنی می‌برد؛ پاسخ‌هایتان پاک نمی‌شوند.
            </p>
          )}

          <p className="form-error" role="alert" aria-live="assertive">
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
              {step === 4
                ? safetyResult.blocked
                  ? "دیدن دلیل توقف برنامه"
                  : safetyResult.disposition === "general_support_only"
                    ? "ساخت برنامهٔ عمومی"
                    : "ساخت برنامه هفتگی"
                : "ادامه"}
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
                <p className="section-kicker">نسخهٔ شخصی شما — {goalCopy[submittedForm.goal].title}</p>
                <h2 id="results-title">هفت روز روشن، قابل ویرایش و هدف‌محور</h2>
                <p>{goalCopy[submittedForm.goal].short} برنامه براساس برآورد انرژی، ترجیحات، حساسیت‌ها، مرزهای ایمنی و اطلاعات مخصوص همین هدف چیده شده است.</p>
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
                <button type="button" onClick={saveNamedVersion}>ذخیرهٔ نسخه</button>
              </div>
            </div>

            <SaveSessionControls
              onSave={handleSaveSession}
              onClear={handleClearSession}
              savedAt={savedAt}
              justSaved={justSaved}
            />

            <section className="plan-version-panel" aria-label="هدف و نسخه‌های برنامه">
              <div><span>هدف فعال</span><strong>{goalCopy[submittedForm.goal].title}</strong><small>{metrics.policy.calculationPolicyId}</small></div>
              <div className="compact-goal-switch" role="group" aria-label="ساخت برنامه با هدف دیگر">
                {(["weight_loss", "muscle_gain", "healthy_weight_gain"] as Goal[]).map((goal) => <button key={goal} type="button" aria-pressed={goal === submittedForm.goal} onClick={() => requestGoalChange(goal, "direct")}>{goalCopy[goal].title}</button>)}
              </div>
              {archivedPlans.length > 0 && <div className="archived-plans"><span>نسخه‌های حفظ‌شده</span>{archivedPlans.map((plan) => <div className="archived-plan-row" key={plan.id}><button type="button" onClick={() => openArchivedPlan(plan)}>بازکردن {plan.name}</button><button type="button" aria-pressed={comparisonPlanId === plan.id} onClick={() => setComparisonPlanId((current) => current === plan.id ? null : plan.id)}>مقایسه</button></div>)}</div>}
              {comparisonPlan && comparisonSummary && <section className="version-comparison" aria-label="مقایسهٔ نسخه‌های برنامه"><div><span>نسخهٔ فعال</span><strong>{goalCopy[submittedForm.goal].title}</strong><small>{formatNumber(metrics.targetCalories)} کیلوکالری هدف روزانه</small><small>{formatNumber(planSummary.averageCalories)} میانگین برنامه</small></div><div><span>{comparisonPlan.name}</span><strong>{goalCopy[comparisonPlan.goal].title}</strong><small>{formatNumber(comparisonPlan.calculation.targetCalories)} کیلوکالری هدف روزانه</small><small>{formatNumber(comparisonSummary.averageCalories)} میانگین برنامه</small></div><p>تفاوت هدف انرژی: {formatNumber(comparisonPlan.calculation.targetCalories - metrics.targetCalories)} کیلوکالری. این مقایسه فقط تفاوت نسخه‌ها را نشان می‌دهد و نسخه‌ای را خودکار جایگزین نمی‌کند.</p></section>}
            </section>

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
                  <span>برآورد معادلهٔ انرژی</span>
                  <strong>{formatNumber(metrics.maintenanceCalories)}</strong>
                  <small>کیلوکالری نگهدارنده</small>
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
                <span>{metrics.energyAdjustment < 0 ? "کسری شروع" : "مازاد شروع"} <strong>{metrics.energyAdjustment > 0 ? "+" : ""}{formatNumber(metrics.energyAdjustment)} کیلوکالری</strong></span>
                <span>عدم‌قطعیت نگهدارنده <strong>±{formatNumber(metrics.uncertaintyKcal)} کیلوکالری</strong></span>
                <span>بازهٔ پروتئین <strong>{formatNumber(metrics.proteinMin)} تا {formatNumber(metrics.proteinMax)} گرم</strong></span>
              </div>
              <div className="calculation-disclosure"><strong>این عدد نسخهٔ پزشکی یا نتیجهٔ تضمین‌شده نیست.</strong><span>معادله: {metrics.policy.energyEquationId} — بازبینی تا {metrics.policy.reviewExpiresAt}</span>{metrics.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>
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
                  <h3>روزهای برنامه، با امکان چیدمان تازه</h3>
                </div>
                <button
                  className="shuffle-button"
                  type="button"
                  onClick={() => regeneratePlan(planMode, variationSeed + 1)}
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
                    onClick={() => regeneratePlan(mode.id, variationSeed + 1)}
                    key={mode.id}
                  >
                    <strong>{mode.title}</strong>
                    <small>{mode.note}</small>
                  </button>
                ))}
              </div>

              <div className="weekly-nutrition-summary" aria-label="خلاصهٔ تغذیه‌ای برنامه">
                <div><span>میانگین انرژی روزانه</span><strong>{formatNumber(planSummary.averageCalories)} کیلوکالری</strong></div>
                <div><span>انرژی کل برنامه</span><strong>{formatNumber(planSummary.weeklyCalories)} کیلوکالری</strong></div>
                <div><span>میانگین پروتئین</span><strong>{formatNumber(planSummary.averageProtein)} گرم</strong></div>
                <div><span>میانگین فیبر</span><strong>{formatNumber(planSummary.averageFiber)} گرم</strong></div>
                <p>{planSummary.nutritionCompleteness === "complete" ? "داده‌های تغذیه‌ای کامل‌اند." : planSummary.nutritionCompleteness === "user_entered" ? "خلاصه شامل داده‌های واردشده توسط کاربر است." : "اطلاعات تغذیه‌ای برخی غذاها ناقص است."}</p>
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

                  {compatibilityIssues.length > 0 && (
                    <section className="compatibility-summary" aria-label="پیامد ویرایش‌ها">
                      <strong>پیامدهای فعلی برنامه</strong>
                      <ul>{compatibilityIssues.slice(0, 8).map((issue, index) => <li key={`${issue.dayId}-${issue.mealInstanceId ?? index}-${issue.kind}`}>{issue.message}</li>)}</ul>
                    </section>
                  )}

                  <MealEditor
                    day={selectedDay}
                    canUndo={Boolean(planHistory?.past.length)}
                    canRedo={Boolean(planHistory?.future.length)}
                    favourites={activeForm.favourites}
                    hiddenFoods={activeForm.hiddenFoods}
                    onChange={(next, announcement) => replaceDay(activeDay, next, announcement)}
                    onUndo={undoPlan}
                    onRedo={redoPlan}
                    onResetMeal={resetMeal}
                    onResetDay={resetDay}
                    onResetPlan={resetWholePlan}
                    onDuplicateDay={duplicateActiveDay}
                    onCopyDay={copyActiveDay}
                    otherDays={displayedPlan.filter((_, index) => index !== activeDay).map((day) => ({ id: day.id, label: day.label }))}
                    onToggleFavourite={toggleFavourite}
                    onHideFood={toggleHiddenFood}
                  />
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
              <ProgressTracker
                goal={submittedForm.goal}
                measurements={measurements}
                onMeasurementsChange={setMeasurements}
                onProposalChange={handleAdjustmentDecision}
                decision={adjustmentProposal}
                lastAdjustmentAt={lastAdjustmentAt}
              />
              {adjustmentProposal && (
                <p className="form-note" role="status">وضعیت پیشنهاد: {adjustmentProposal.status === "accepted" ? "پذیرفته و در برنامه اعمال شد." : adjustmentProposal.status === "modified" ? "مقدار دلخواه شما اعمال شد." : adjustmentProposal.status === "rejected" ? "رد شد و برنامه تغییر نکرد." : "در انتظار تصمیم شما"}</p>
              )}
              <div className="rhythm-card">
                <p>ریتم شخصی شما</p>
                <dl>
                  <div><dt>الگوی روز</dt><dd>{dayPatternLabel(submittedForm.dayPattern)}</dd></div>
                  <div><dt>آماده‌سازی</dt><dd>{prepLabel(submittedForm.mealPrep)}</dd></div>
                  <div><dt>خواب ثبت‌شده</dt><dd>{sleepLabel(submittedForm.sleep)}</dd></div>
                  <div><dt>نظم آب</dt><dd>{waterLabel(submittedForm.water)}</dd></div>
                </dl>
                <ul>
                  <li>روند چنداندازه‌گیری مهم‌تر از یک عدد منفرد است.</li>
                  <li>پیشنهاد تغییر انرژی در هر بازبینی حداکثر ۱۰۰ کیلوکالری است.</li>
                  <li>می‌توانید هر پیشنهاد را رد یا بعداً بازبینی کنید.</li>
                </ul>
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
              خروجی از برآورد نسخه‌دار انرژی، سیاست جداگانهٔ هر هدف، کیفیت غذا، مرزهای ایمنی و بازبینی مبتنی بر روند ساخته می‌شود.
            </p>
          </div>

          <div className="method-flow">
            {[
              {
                number: "۱",
                title: "برآورد انرژی",
                formula: "NASEM EER 2023",
                copy: "سن، اندازهٔ بدن و فعالیت برای یک برآورد جمعیتی استفاده می‌شوند؛ خطای فردی صریحاً نمایش داده می‌شود.",
              },
              {
                number: "۲",
                title: "سه سیاست جدا",
                formula: "کسری یا مازاد نسخه‌دار",
                copy: "کاهش وزن، حجم عضله و افزایش وزن برچسب‌های متفاوت یک فرمول نیستند و قواعد شروع و پایش مستقل دارند.",
              },
              {
                number: "۳",
                title: "مرز ایمنی",
                formula: "غربالگری پیش از تولید",
                copy: "شرایط پزشکی، کاهش وزن ناخواسته، خطر بازغذیه و مقادیر پرخطر فشار، قند یا چربی خون تولید عادی را متوقف می‌کنند.",
              },
              {
                number: "۴",
                title: "بازبینی روند",
                formula: "چند اندازه‌گیری، تغییر کوچک",
                copy: "یک عدد منفرد باعث تغییر خودکار نمی‌شود؛ پیشنهادها قابل ردند و عدم‌قطعیت حفظ می‌شود.",
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
              لازم نیست هر روز بی‌نقص باشد. برنامه را ویرایش کن، پیامد تغذیه‌ای هر تغییر را ببین و نسخه‌های مختلف را بدون از دست‌دادن هدف قبلی نگه دار.
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
                از جایگزین‌های توضیح‌دار استفاده کن یا ابزار ویرایش همان روز را باز کن؛ مقدار، نام، زمان، نوع وعده و دادهٔ غذای سفارشی قابل تغییر است و جمع برنامه دوباره محاسبه می‌شود.
              </p>
            </details>
            <details>
              <summary>چه زمانی برنامه را بازبینی کنم؟</summary>
              <p>
                پس از سه تا چهار هفته، میانگین روند، گرسنگی، انرژی روزانه و
                قابلیت اجرای وعده‌ها را با هدف اولیه مقایسه کن.
              </p>
            </details>
            <details>
              <summary>تفاوت کاهش وزن، حجم عضله و افزایش وزن چیست؟</summary>
              <p>کاهش وزن با کسری محافظه‌کارانه آغاز می‌شود؛ حجم عضله به تمرین مقاومتی و پایش عملکرد وابسته است؛ افزایش وزن بر اشتها، تحمل گوارشی و افزایش تدریجی انرژی تمرکز دارد.</p>
            </details>
            <details>
              <summary>فشار، قند و چربی خون چگونه استفاده می‌شوند؟</summary>
              <p>این داده‌ها فقط برای مرز ایمنی و توضیح عمومی‌اند. میزانه تشخیص نمی‌دهد، هدف ثابت درمانی نمی‌سازد و دارو را تغییر نمی‌دهد.</p>
            </details>
            <details>
              <summary>جایگزینی غذا چگونه ارزیابی می‌شود؟</summary>
              <p>انرژی، پروتئین، فیبر، نقش وعده، حساسیت، سبک غذایی و ترجیحات در نظر گرفته می‌شوند و دلیل نزدیک یا نامعادل بودن جایگزین نمایش داده می‌شود.</p>
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
        <span>برای برنامه‌ریزی عمومی بزرگسالان در محدودهٔ ایمن</span>
        <a className="creator-credit" href="https://www.linkedin.com/in/hossein-karimi-8a452153/" target="_blank" rel="noreferrer">کاری از حسین کریمی</a>
      </footer>
    </main>
  );
}
