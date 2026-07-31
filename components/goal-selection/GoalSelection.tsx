"use client";

import { useState } from "react";
import { goalCopy, recommendGoal } from "@/lib/domain/goals";
import type { Goal, PlannerForm, ResistanceTrainingStatus } from "@/lib/types";

type GoalSelectionProps = {
  form: PlannerForm;
  onGoalChange: (goal: Goal, source: "guided" | "direct") => void;
  onResistanceTrainingChange: (status: ResistanceTrainingStatus) => void;
};

const goals: Goal[] = ["weight_loss", "muscle_gain", "healthy_weight_gain"];

export function GoalSelection({ form, onGoalChange, onResistanceTrainingChange }: GoalSelectionProps) {
  const [direction, setDirection] = useState<"lose" | "gain">(
    form.goal === "weight_loss" ? "lose" : "gain",
  );
  const [showComparison, setShowComparison] = useState(false);
  const recommendation = recommendGoal({ direction, resistanceTraining: form.resistanceTraining });

  function applyRecommendation() {
    onGoalChange(recommendation.goal, "guided");
  }

  return (
    <section className="goal-selection" aria-labelledby="goal-selection-title">
      <div className="goal-selection__heading">
        <div>
          <span className="step-label">انتخاب هدایت‌شده</span>
          <h3 id="goal-selection-title">هدف اصلی برنامه چیست؟</h3>
        </div>
        <button type="button" className="text-button" onClick={() => setShowComparison((value) => !value)}>
          {showComparison ? "بستن مقایسه" : "مقایسهٔ کامل هدف‌ها"}
        </button>
      </div>

      <fieldset>
        <legend>تغییر اصلی مدنظر چیست؟</legend>
        <div className="segmented segmented--two">
          <button type="button" aria-pressed={direction === "lose"} className={direction === "lose" ? "is-selected" : ""} onClick={() => setDirection("lose")}>کاهش وزن</button>
          <button type="button" aria-pressed={direction === "gain"} className={direction === "gain" ? "is-selected" : ""} onClick={() => setDirection("gain")}>افزایش وزن یا توده</button>
        </div>
      </fieldset>

      {direction === "gain" && (
        <fieldset>
          <legend>تمرین مقاومتی منظم دارید یا همراه برنامه شروع می‌کنید؟</legend>
          <div className="segmented segmented--three">
            {[
              { id: "current" as const, label: "اکنون دارم" },
              { id: "starting" as const, label: "هم‌زمان شروع می‌کنم" },
              { id: "none" as const, label: "خیر" },
            ].map((option) => (
              <button key={option.id} type="button" aria-pressed={form.resistanceTraining === option.id} className={form.resistanceTraining === option.id ? "is-selected" : ""} onClick={() => onResistanceTrainingChange(option.id)}>
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="goal-recommendation" role="status" aria-live="polite">
        <span>پیشنهاد میزانه</span>
        <strong>{goalCopy[recommendation.goal].title}</strong>
        <p>{recommendation.reason} این پیشنهاد اجباری نیست و می‌توانید هدف دیگری را دستی انتخاب کنید.</p>
        <button type="button" onClick={applyRecommendation}>انتخاب پیشنهاد</button>
      </div>

      <div className="compact-goal-selector" role="group" aria-label="انتخاب مستقیم هدف">
        {goals.map((goal) => (
          <button key={goal} type="button" aria-pressed={form.goal === goal} className={form.goal === goal ? "is-selected" : ""} onClick={() => onGoalChange(goal, "direct")}>
            <strong>{goalCopy[goal].title}</strong>
            <small>{goalCopy[goal].short}</small>
          </button>
        ))}
      </div>

      {showComparison && (
        <div className="goal-comparison" aria-label="مقایسهٔ سه هدف">
          {goals.map((goal) => (
            <article key={goal} className={form.goal === goal ? "is-selected" : ""}>
              <h4>{goalCopy[goal].title}</h4>
              <p>{goalCopy[goal].suitableFor}</p>
              <dl>
                <div><dt>پیگیری اصلی</dt><dd>{goalCopy[goal].monitors}</dd></div>
                <div><dt>مرز ادعا</dt><dd>{goalCopy[goal].warning}</dd></div>
              </dl>
              <button type="button" onClick={() => onGoalChange(goal, "direct")}>{form.goal === goal ? "انتخاب شده" : "انتخاب این هدف"}</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
