"use client";

import { goalCopy } from "@/lib/domain/goals";
import type { Goal, PlannerForm } from "@/lib/types";

type GoalSelectionProps = {
  form: PlannerForm;
  onGoalChange: (goal: Goal, source: "guided" | "direct") => void;
};

const goals: Goal[] = ["weight_loss", "muscle_gain", "healthy_weight_gain"];

const goalBadges: Record<Goal, string> = {
  weight_loss: "کاهش تدریجی و محافظه‌کارانه",
  muscle_gain: "همراه تمرین مقاومتی",
  healthy_weight_gain: "افزایش وزن و دریافت تدریجی",
};

export function GoalSelection({ form, onGoalChange }: GoalSelectionProps) {
  return (
    <section className="goal-selection" aria-labelledby="goal-selection-title">
      <div className="goal-selection__heading">
        <div>
          <span className="step-label">انتخاب مستقیم هدف</span>
          <h3 id="goal-selection-title">کدام برنامه را می‌خواهید؟</h3>
          <p className="goal-selection__intro">
            هر سه مسیر از ابتدا در دسترس‌اند. هدف را خودتان انتخاب کنید؛ با تغییر هدف، برنامهٔ قبلی حفظ می‌شود و یک نسخهٔ تازه ساخته خواهد شد.
          </p>
        </div>
      </div>

      <div className="goal-choice-grid" role="radiogroup" aria-label="انتخاب هدف برنامه">
        {goals.map((goal) => {
          const selected = form.goal === goal;
          return (
            <button
              key={goal}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`goal-choice-card ${selected ? "is-selected" : ""}`}
              onClick={() => onGoalChange(goal, "direct")}
            >
              <span className="goal-choice-card__check" aria-hidden="true">{selected ? "✓" : ""}</span>
              <span className="goal-choice-card__badge">{goalBadges[goal]}</span>
              <strong>{goalCopy[goal].title}</strong>
              <p>{goalCopy[goal].suitableFor}</p>
              <small>{goalCopy[goal].warning}</small>
              <span className="goal-choice-card__action">{selected ? "انتخاب شده" : "انتخاب این هدف"}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
