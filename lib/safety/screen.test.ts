import { describe, expect, it } from "vitest";
import { defaultForm } from "@/lib/food/catalogue";
import { screenSafety } from "@/lib/safety/screen";
import type { PlannerForm } from "@/lib/types";

function form(overrides: Partial<PlannerForm> = {}): PlannerForm {
  return { ...structuredClone(defaultForm), ...overrides };
}

describe("safety screening", () => {
  it("allows an ordinary healthy adult profile", () => {
    expect(screenSafety(form()).disposition).toBe("ordinary_scope");
  });

  it("blocks pregnancy and breastfeeding from ordinary automation", () => {
    expect(screenSafety(form({ pregnant: true })).blocked).toBe(true);
    expect(screenSafety(form({ breastfeeding: true })).blocked).toBe(true);
  });

  it("blocks eating-disorder concern without a disclaimer bypass", () => {
    const result = screenSafety(form({ eatingDisorderConcern: true }));
    expect(result.disposition).toBe("professional_review_required");
    expect(result.blocked).toBe(true);
  });

  it("detects high refeeding risk from BMI below 16", () => {
    const result = screenSafety(form({ goal: "healthy_weight_gain", height: "180", weight: "50" }));
    expect(result.disposition).toBe("urgent_or_high_priority_assessment");
  });

  it("detects high refeeding risk from prolonged negligible intake regardless of goal", () => {
    const result = screenSafety(form({ goal: "weight_loss", negligibleIntakeDays: "11" }));
    expect(result.disposition).toBe("urgent_or_high_priority_assessment");
  });

  it("treats recent unintentional loss over 15 percent as high priority", () => {
    const result = screenSafety(form({ intentionalWeightChange: false, unintentionalLossPercent: "16", unintentionalLossMonths: "4" }));
    expect(result.disposition).toBe("urgent_or_high_priority_assessment");
  });

  it("treats BP over 180/120 as blocking and symptoms as urgent", () => {
    const severe = structuredClone(defaultForm);
    severe.cardiometabolic.bloodPressure = {
      ...severe.cardiometabolic.bloodPressure,
      enabled: true,
      systolic: "181",
      diastolic: "90",
    };
    expect(screenSafety(severe).disposition).toBe("professional_review_required");
    severe.cardiometabolic.bloodPressure.concerningSymptoms = true;
    expect(screenSafety(severe).disposition).toBe("urgent_or_high_priority_assessment");
  });

  it("treats chest, breathing or neurological warning symptoms as urgent regardless of the pressure number", () => {
    const symptomatic = structuredClone(defaultForm);
    symptomatic.cardiometabolic.bloodPressure = {
      ...symptomatic.cardiometabolic.bloodPressure,
      enabled: true,
      systolic: "130",
      diastolic: "80",
      concerningSymptoms: true,
    };
    expect(screenSafety(symptomatic).disposition).toBe("urgent_or_high_priority_assessment");
  });

  it("treats glucose below 54 mg/dL as urgent and below 70 as review", () => {
    const low = structuredClone(defaultForm);
    low.cardiometabolic.glycaemia = {
      ...low.cardiometabolic.glycaemia,
      enabled: true,
      value: "65",
      unit: "mg_dl",
    };
    expect(screenSafety(low).disposition).toBe("professional_review_required");
    low.cardiometabolic.glycaemia.value = "50";
    expect(screenSafety(low).disposition).toBe("urgent_or_high_priority_assessment");
  });

  it("does not treat an A1C percentage as a low glucose reading", () => {
    const a1c = structuredClone(defaultForm);
    a1c.cardiometabolic.glycaemia = {
      ...a1c.cardiometabolic.glycaemia,
      enabled: true,
      measurementType: "a1c",
      value: "6.5",
      unit: "percent",
    };
    expect(screenSafety(a1c).disposition).toBe("ordinary_scope");
  });

  it("blocks severe underweight across every goal", () => {
    const low = form({ goal: "muscle_gain", height: "170", weight: "42" });
    expect(screenSafety(low).disposition).toBe("urgent_or_high_priority_assessment");
  });

  it("blocks ordinary weight-loss planning below BMI 18.5 even before form navigation validation", () => {
    const low = form({ goal: "weight_loss", height: "170", weight: "50" });
    expect(screenSafety(low).disposition).toBe("professional_review_required");
  });

  it("keeps diagnosed cardiometabolic conditions in general-support mode when no blocking signal exists", () => {
    const history = structuredClone(defaultForm);
    history.cardiometabolic.bloodPressure = {
      ...history.cardiometabolic.bloodPressure,
      enabled: true,
      diagnosedHypertension: true,
      stableUnderCare: true,
    };
    expect(screenSafety(history).disposition).toBe("general_support_only");

    history.cardiometabolic.bloodPressure.enabled = false;
    history.cardiometabolic.glycaemia = {
      ...history.cardiometabolic.glycaemia,
      enabled: true,
      diabetesHistory: true,
    };
    expect(screenSafety(history).disposition).toBe("general_support_only");
  });

  it("treats triglycerides at 500 as review and 1000 as high priority", () => {
    const lipid = structuredClone(defaultForm);
    lipid.cardiometabolic.lipids = {
      ...lipid.cardiometabolic.lipids,
      enabled: true,
      triglycerides: "500",
    };
    expect(screenSafety(lipid).disposition).toBe("professional_review_required");
    lipid.cardiometabolic.lipids.triglycerides = "1000";
    expect(screenSafety(lipid).disposition).toBe("urgent_or_high_priority_assessment");
  });
});
