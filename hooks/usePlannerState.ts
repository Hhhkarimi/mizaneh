"use client";

import { useRef, useState } from "react";
import { defaultForm } from "@/lib/food/catalogue";
import type {
  AdjustmentProposal,
  DayPlan,
  Goal,
  MealSlot,
  Metrics,
  PlanDocument,
  PlanMode,
  PlannerForm,
  WeightMeasurement,
} from "@/lib/types";
import type { PlanHistory } from "@/lib/plan/editor";

export function usePlannerState() {
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
  const [substitutionTarget, setSubstitutionTarget] = useState<{
    slot: MealSlot;
    occurrence: number;
  } | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  return {
    form,
    setForm,
    step,
    setStep,
    error,
    setError,
    metrics,
    setMetrics,
    submittedForm,
    setSubmittedForm,
    planMode,
    setPlanMode,
    variationSeed,
    setVariationSeed,
    activeDay,
    setActiveDay,
    copyState,
    setCopyState,
    planHistory,
    setPlanHistory,
    baselinePlan,
    setBaselinePlan,
    archivedPlans,
    setArchivedPlans,
    activePlanId,
    setActivePlanId,
    activePlanCreatedAt,
    setActivePlanCreatedAt,
    pendingGoal,
    setPendingGoal,
    liveAnnouncement,
    setLiveAnnouncement,
    measurements,
    setMeasurements,
    adjustmentProposal,
    setAdjustmentProposal,
    lastAdjustmentAt,
    setLastAdjustmentAt,
    startingTargetCalories,
    setStartingTargetCalories,
    comparisonPlanId,
    setComparisonPlanId,
    substitutionTarget,
    setSubstitutionTarget,
    savedAt,
    setSavedAt,
    justSaved,
    setJustSaved,
    resultsRef,
  } as const;
}
