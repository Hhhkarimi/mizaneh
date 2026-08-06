import type { DayPlan, Metrics, PlannerForm, PlanMode } from "@/lib/types";
import { buildWeeklyPlan } from "@/lib/plan/build";
import { ensurePlanIdentity } from "@/lib/plan/editor";

export type BuildWeeklyPlanResult = { plan: DayPlan[]; error: string };

export function safeBuildWeeklyPlan(
  form: PlannerForm,
  metrics: Metrics,
  mode: PlanMode,
  variationSeed: number,
): BuildWeeklyPlanResult {
  try {
    return {
      plan: ensurePlanIdentity(buildWeeklyPlan(form, metrics, mode, variationSeed)),
      error: "",
    };
  } catch (cause) {
    return {
      plan: [],
      error: cause instanceof Error
        ? cause.message
        : "برای محدودیت‌های ثبت‌شده برنامهٔ سازگار ساخته نشد. مواد یا محدودیت‌ها را بازبینی کنید.",
    };
  }
}
