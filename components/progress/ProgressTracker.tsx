"use client";

import { useMemo, useState } from "react";
import type { AdjustmentProposal, Goal, WeightMeasurement } from "@/lib/types";
import { buildAdjustmentProposal, calculateWeightTrend } from "@/lib/progress/trend";
import { formatDecimal, formatNumber } from "@/lib/nutrition/format";

type Props = {
  goal: Goal;
  measurements: WeightMeasurement[];
  onMeasurementsChange: (next: WeightMeasurement[]) => void;
  onProposalChange: (proposal: AdjustmentProposal | null) => void;
  decision?: AdjustmentProposal | null;
  lastAdjustmentAt?: string;
};

export function ProgressTracker({ goal, measurements, onMeasurementsChange, onProposalChange, decision, lastAdjustmentAt }: Props) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [modifiedDelta, setModifiedDelta] = useState("0");
  const [waist, setWaist] = useState("");
  const [adherence, setAdherence] = useState("3");
  const [appetite, setAppetite] = useState("3");
  const [energy, setEnergy] = useState("3");
  const [digestiveTolerance, setDigestiveTolerance] = useState("3");
  const [sleepQuality, setSleepQuality] = useState("3");
  const [trainingPerformance, setTrainingPerformance] = useState("3");
  const [recovery, setRecovery] = useState("3");
  const trend = useMemo(() => calculateWeightTrend(measurements), [measurements]);
  const proposal = useMemo(() => buildAdjustmentProposal(goal, measurements, lastAdjustmentAt), [goal, measurements, lastAdjustmentAt]);
  const decisionForCurrentProposal = proposal && decision?.id === proposal.id && decision.status !== "pending" ? decision : null;

  function addMeasurement() {
    const value = Number(weight);
    if (!Number.isFinite(value) || value < 30 || value > 350 || !date) return;
    onMeasurementsChange([
      ...measurements,
      {
        id: `measurement-${Date.now()}`,
        date,
        weightKg: value,
        waistCm: waist && Number.isFinite(Number(waist)) ? Number(waist) : undefined,
        adherence: Number(adherence),
        appetite: Number(appetite),
        energy: Number(energy),
        digestiveTolerance: Number(digestiveTolerance),
        sleepQuality: Number(sleepQuality),
        trainingPerformance: goal === "muscle_gain" ? Number(trainingPerformance) : undefined,
        recovery: goal === "muscle_gain" ? Number(recovery) : undefined,
        note: note.trim().slice(0, 300) || undefined,
      },
    ]);
    setWeight("");
    setWaist("");
    setNote("");
  }

  return (
    <section className="progress-tracker" aria-labelledby="progress-tracker-title">
      <div className="block-heading">
        <span>۰۷</span>
        <div><p>پیگیری روند</p><h3 id="progress-tracker-title">تصمیم بر پایهٔ چند اندازه‌گیری</h3></div>
      </div>
      <p className="form-note">یک وزن منفرد باعث تغییر خودکار انرژی نمی‌شود. آب، گلیکوژن و محتویات گوارشی می‌توانند عدد ترازو را جابه‌جا کنند.</p>
      <div className="progress-entry">
        <label><span>تاریخ</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label><span>وزن</span><span className="input-wrap"><input type="number" min="30" max="350" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} /><small>کیلوگرم</small></span></label>
        <label><span>یادداشت اختیاری</span><input maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} /></label>
        <button type="button" onClick={addMeasurement}>ثبت اندازه‌گیری</button>
      </div>
      <details className="progress-context-fields">
        <summary>ثبت شاخص‌های زمینه‌ای برای تفسیر بهتر</summary>
        <p className="form-note">امتیاز ۱ یعنی بسیار نامطلوب و ۵ یعنی بسیار مطلوب. این اطلاعات تشخیص پزشکی ایجاد نمی‌کنند.</p>
        <div className="field-grid field-grid--three">
          <label><span>دور کمر اختیاری</span><input type="number" min="40" max="250" step="0.1" value={waist} onChange={(event) => setWaist(event.target.value)} /></label>
          <Score label="پایبندی به برنامه" value={adherence} onChange={setAdherence} />
          <Score label="اشتهای قابل‌مدیریت" value={appetite} onChange={setAppetite} />
          <Score label="سطح انرژی" value={energy} onChange={setEnergy} />
          <Score label="تحمل گوارشی" value={digestiveTolerance} onChange={setDigestiveTolerance} />
          <Score label="کیفیت خواب" value={sleepQuality} onChange={setSleepQuality} />
          {goal === "muscle_gain" && <Score label="عملکرد تمرینی" value={trainingPerformance} onChange={setTrainingPerformance} />}
          {goal === "muscle_gain" && <Score label="ریکاوری" value={recovery} onChange={setRecovery} />}
        </div>
      </details>
      {measurements.length > 0 && (
        <div className="measurement-list">
          {measurements.map((item) => (
            <article key={item.id}><strong>{formatDecimal(item.weightKg)} کیلوگرم</strong><span>{item.date}</span>{item.note && <small>{item.note}</small>}<button type="button" onClick={() => onMeasurementsChange(measurements.filter((measurement) => measurement.id !== item.id))}>حذف</button></article>
          ))}
        </div>
      )}
      <div className="trend-result" role="status" aria-live="polite">
        {trend ? <><strong>روند تقریبی هفتگی: {formatDecimal(trend.weeklyChangeKg)} کیلوگرم</strong><span>براساس {formatNumber(trend.sampleCount)} اندازه‌گیری؛ عدم‌قطعیت همچنان وجود دارد.</span></> : <span>برای محاسبهٔ روند و پیشنهاد تغییر، حداقل پنج اندازه‌گیری در بازهٔ چهارده‌روزه لازم است.</span>}
      </div>
      {proposal && (
        <div className="adjustment-proposal">
          <span>پیشنهاد قابل رد یا تغییر</span>
          <strong>{proposal.proposedCaloriesDelta === 0 ? "فعلاً بدون تغییر" : `${proposal.proposedCaloriesDelta > 0 ? "+" : ""}${formatNumber(proposal.proposedCaloriesDelta)} کیلوکالری`}</strong>
          <p>{proposal.rationale}</p>
          <ul>{proposal.triggeredBy.map((item) => <li key={item}>{item}</li>)}</ul>
          <small>{proposal.method} — {proposal.uncertainty}</small>
          {decisionForCurrentProposal ? <p className="form-note" role="status">این پیشنهاد {decisionForCurrentProposal.status === "rejected" ? "رد شد و برنامه تغییر نکرد." : "قبلاً بررسی شده است."}</p> : <div className="adjustment-actions">
            {proposal.proposedCaloriesDelta !== 0 && <button type="button" onClick={() => onProposalChange({ ...proposal, status: "accepted" })}>پذیرش و اعمال</button>}
            <button type="button" onClick={() => onProposalChange({ ...proposal, status: "rejected" })}>رد</button>
            <label><span>مقدار دلخواه</span><select value={modifiedDelta} onChange={(event) => setModifiedDelta(event.target.value)}><option value="-100">۱۰۰−</option><option value="-75">۷۵−</option><option value="-50">۵۰−</option><option value="-25">۲۵−</option><option value="0">بدون تغییر</option><option value="25">۲۵+</option><option value="50">۵۰+</option><option value="75">۷۵+</option><option value="100">۱۰۰+</option></select></label>
            <button type="button" onClick={() => onProposalChange({ ...proposal, proposedCaloriesDelta: Number(modifiedDelta), status: "modified" })}>اعمال مقدار دلخواه</button>
          </div>}
        </div>
      )}
    </section>
  );
}

function Score({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{formatNumber(score)} از ۵</option>)}</select></label>;
}
