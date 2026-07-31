import type { AdjustmentProposal, Goal, WeightMeasurement } from "@/lib/types";

export type WeightTrend = {
  weeklyChangeKg: number;
  sampleCount: number;
  firstDate: string;
  lastDate: string;
  spanDays: number;
  method: "theil-sen";
};

const DAY_MS = 86_400_000;
const MIN_MEASUREMENTS = 5;
const MIN_SPAN_DAYS = 14;
const WINDOW_DAYS = 21;

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function calculateWeightTrend(measurements: WeightMeasurement[]): WeightTrend | null {
  const valid = [...measurements]
    .filter((item) => Number.isFinite(item.weightKg) && Number.isFinite(Date.parse(item.date)))
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  if (!valid.length) return null;
  const grouped = new Map<string, WeightMeasurement[]>();
  for (const item of valid) grouped.set(item.date, [...(grouped.get(item.date) ?? []), item]);
  const daily = [...grouped.entries()].map(([date, items]) => ({
    ...items.at(-1)!,
    id: `daily-median-${date}`,
    date,
    weightKg: median(items.map((item) => item.weightKg)),
  })).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const lastObserved = Date.parse(daily.at(-1)!.date);
  const sorted = daily.filter((item) => (lastObserved - Date.parse(item.date)) / DAY_MS <= WINDOW_DAYS - 1);
  if (sorted.length < MIN_MEASUREMENTS) return null;

  const firstTime = Date.parse(sorted[0].date);
  const lastTime = Date.parse(sorted.at(-1)!.date);
  const spanDays = (lastTime - firstTime) / DAY_MS;
  if (spanDays < MIN_SPAN_DAYS) return null;

  const slopes: number[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const elapsedDays = (Date.parse(sorted[j].date) - Date.parse(sorted[i].date)) / DAY_MS;
      if (elapsedDays > 0) slopes.push((sorted[j].weightKg - sorted[i].weightKg) / elapsedDays);
    }
  }
  if (!slopes.length) return null;

  return {
    weeklyChangeKg: median(slopes) * 7,
    sampleCount: sorted.length,
    firstDate: sorted[0].date,
    lastDate: sorted.at(-1)!.date,
    spanDays,
    method: "theil-sen",
  };
}

function averageReported(measurements: WeightMeasurement[], key: keyof WeightMeasurement) {
  const values = measurements.map((item) => item[key]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
}

export function buildAdjustmentProposal(
  goal: Goal,
  measurements: WeightMeasurement[],
  lastAdjustmentAt?: string,
): AdjustmentProposal | null {
  const trend = calculateWeightTrend(measurements);
  if (!trend) return null;
  if (lastAdjustmentAt) {
    const elapsed = (Date.now() - Date.parse(lastAdjustmentAt)) / DAY_MS;
    if (Number.isFinite(elapsed) && elapsed < 14) return null;
  }

  let delta = 0;
  let rationale = "روند فعلی در محدوده‌ای است که فعلاً به تغییر نیاز ندارد.";
  const lastTime = Date.parse(trend.lastDate);
  const recent = measurements.filter((item) => Number.isFinite(Date.parse(item.date)) && (lastTime - Date.parse(item.date)) / DAY_MS <= WINDOW_DAYS - 1);
  const adherence = averageReported(recent, "adherence");
  const appetite = averageReported(recent, "appetite");
  const energy = averageReported(recent, "energy");
  const digestiveTolerance = averageReported(recent, "digestiveTolerance");
  const trainingPerformance = averageReported(recent, "trainingPerformance");
  const recovery = averageReported(recent, "recovery");
  const dataSupportsChange = adherence !== undefined && adherence >= 3;
  const toleranceConcern = [energy, digestiveTolerance, recovery].some((value) => value !== undefined && value < 2.5);
  if (goal === "weight_loss" && trend.weeklyChangeKg > -0.05) {
    if (dataSupportsChange && !toleranceConcern) {
      delta = -100;
      rationale = "روند چنداندازه‌گیری با پایبندی گزارش‌شده کاهش معناداری نشان نمی‌دهد؛ یک تغییر کوچک قابل بررسی است.";
    } else {
      rationale = "روند تخت است، اما پایبندی یا تحمل برای پیشنهاد کاهش انرژی کافی نیست؛ ابتدا کیفیت داده و اجرای برنامه را بررسی کنید.";
    }
  } else if (goal !== "weight_loss" && trend.weeklyChangeKg < 0.05) {
    const goalSupport = goal === "muscle_gain"
      ? (trainingPerformance === undefined || trainingPerformance >= 2.5) && (recovery === undefined || recovery >= 2.5)
      : (appetite === undefined || appetite >= 2.5) && (digestiveTolerance === undefined || digestiveTolerance >= 2.5);
    if (dataSupportsChange && !toleranceConcern && goalSupport) {
      delta = 100;
      rationale = "روند چنداندازه‌گیری با پایبندی و تحمل گزارش‌شده افزایش معناداری نشان نمی‌دهد؛ یک افزایش کوچک قابل بررسی است.";
    } else {
      rationale = "روند تخت است، اما پایبندی، اشتها، تحمل یا ریکاوری برای افزایش انرژی کافی نیست؛ ابتدا مانع اجرا را بررسی کنید.";
    }
  } else if (goal === "weight_loss" && trend.weeklyChangeKg < -1) {
    delta = 100;
    rationale = "روند کاهش سریع است؛ افزایش کوچک انرژی می‌تواند محافظه‌کارانه‌تر باشد.";
  } else if (goal !== "weight_loss" && trend.weeklyChangeKg > 0.75) {
    delta = -100;
    rationale = "روند افزایش سریع است؛ کاهش کوچک مازاد می‌تواند محافظه‌کارانه‌تر باشد.";
  }

  return {
    id: `adjustment-${goal}-${trend.lastDate}`,
    goal,
    proposedCaloriesDelta: Math.max(-100, Math.min(100, delta)),
    triggeredBy: [
      `${trend.sampleCount} اندازه‌گیری در ${Math.round(trend.spanDays)} روز`,
      `روند هفتگی ${trend.weeklyChangeKg.toFixed(2)} کیلوگرم`,
      adherence === undefined ? "پایبندی کافی گزارش نشده است" : `میانگین پایبندی ${adherence.toFixed(1)} از ۵`,
    ],
    method: "Theil–Sen روی میانهٔ وزن هر روز در پنجرهٔ ۲۱روزه؛ حداقل ۵ روز اندازه‌گیری در ۱۴ روز",
    rationale,
    uncertainty: "وزن تحت تأثیر آب، گلیکوژن و محتویات گوارشی است؛ پیشنهاد اختیاری است و زودتر از ۱۴ روز تکرار نمی‌شود.",
    status: "pending",
  };
}
