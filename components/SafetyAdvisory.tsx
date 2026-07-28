"use client";

import { useState } from "react";

/**
 * One-time safety/privacy disclosure shown before step 1 (ADR-0001).
 * Does not gate or block anything — the existing hard validation in
 * lib/nutrition/formulas.ts (age 18–80, BMI ≥ 18.5) is unchanged and
 * unrelated to this component. This closes the gap found during the
 * domain-modeling pass: no disclaimer text existed anywhere in the app.
 *
 * Dismissible so it doesn't cost scroll space on every visit; per the
 * prototype evaluation (docs/prototype-evaluation.md) it is shown once,
 * prominently, rather than repeated on every step.
 */
export function SafetyAdvisory() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="note"
      aria-label="یادداشت ایمنی و حریم خصوصی"
      className="safety-advisory"
    >
      <p>
        <strong>قبل از شروع:</strong> میزانه یک ابزار تخمینی است و جایگزین
        پزشک یا متخصص تغذیه نیست. هیچ‌کدام از اطلاعات شما ذخیره یا ارسال
        نمی‌شود؛ همه‌ی محاسبات در همین مرورگر انجام می‌شود.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="بستن یادداشت ایمنی"
        className="safety-advisory__dismiss"
      >
        متوجه شدم
      </button>
    </div>
  );
}
