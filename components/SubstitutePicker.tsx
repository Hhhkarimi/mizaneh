"use client";

import type { PlannedMeal } from "@/lib/types";
import { formatNumber } from "@/lib/nutrition/format";

type SubstitutePickerProps = {
  options: PlannedMeal[];
  onSelect: (meal: PlannedMeal) => void;
  onCancel: () => void;
};

/**
 * Round 2 (spec user story 24): shows the top-ranked compatible
 * alternatives for a meal slot so the user picks one, instead of round
 * 1's single automatic swap. Reuses `getSubstituteOptions` — no new
 * ranking logic lives in this component.
 */
export function SubstitutePicker({ options, onSelect, onCancel }: SubstitutePickerProps) {
  return (
    <div
      role="dialog"
      aria-label="انتخاب جایگزین وعده"
      className="substitute-picker"
    >
      {options.length === 0 ? (
        <p>گزینه‌ی جایگزین سازگاری برای این وعده پیدا نشد.</p>
      ) : (
        <ul>
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onSelect(option)}
                aria-label={`انتخاب ${option.title} به‌جای وعده فعلی`}
              >
                <strong>{option.title}</strong>
                <span>{option.serving}</span>
                <em>{formatNumber(option.targetCalories)} کیلوکالری</em>
                <small className="replacement-class">
                  {option.replacementClass === "close"
                    ? "جایگزین نزدیک تغذیه‌ای"
                    : option.replacementClass === "similar"
                      ? "جایگزین نسبتاً مشابه"
                      : option.replacementClass === "preference"
                        ? "جایگزین براساس سلیقه"
                        : "از نظر تغذیه‌ای معادل نیست"}
                </small>
                {option.replacementReason && <p>{option.replacementReason}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="substitute-picker__cancel"
        onClick={onCancel}
      >
        انصراف
      </button>
    </div>
  );
}
