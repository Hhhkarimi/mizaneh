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

  it("returns structured plain-language issues with a next step", () => {
    const result = screenSafety(form({ pregnant: true }));
    expect(result.policyId).toBe("safety.screen.v3");
    expect(result.issues[0]).toEqual(expect.objectContaining({
      category: "scope",
      title: expect.stringContaining("بارداری"),
      explanation: expect.any(String),
      nextStep: expect.any(String),
    }));
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

  it("keeps a symptom-free BP over 180/120 in warning mode and treats symptoms as urgent", () => {
    const severe = structuredClone(defaultForm);
    severe.cardiometabolic.bloodPressure = {
      ...severe.cardiometabolic.bloodPressure,
      enabled: true,
      systolic: "181",
      diastolic: "90",
    };
    expect(screenSafety(severe).disposition).toBe("professional_review_required");
    expect(screenSafety(severe).blocked).toBe(false);
    severe.cardiometabolic.bloodPressure.concerningSymptoms = true;
    expect(screenSafety(severe).disposition).toBe("urgent_or_high_priority_assessment");
    expect(screenSafety(severe).blocked).toBe(true);
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
    expect(screenSafety(low).blocked).toBe(false);
    low.cardiometabolic.glycaemia.value = "50";
    expect(screenSafety(low).disposition).toBe("urgent_or_high_priority_assessment");
    expect(screenSafety(low).blocked).toBe(true);
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
    expect(screenSafety(lipid).blocked).toBe(false);
    lipid.cardiometabolic.lipids.triglycerides = "1000";
    expect(screenSafety(lipid).disposition).toBe("urgent_or_high_priority_assessment");
    expect(screenSafety(lipid).blocked).toBe(true);
  });

  it("does not block stable hypertension, diabetes or dyslipidaemia", () => {
    const clinical = structuredClone(defaultForm);
    clinical.cardiometabolic.bloodPressure = {
      ...clinical.cardiometabolic.bloodPressure,
      enabled: true,
      diagnosedHypertension: true,
      stableUnderCare: true,
      systolic: "145",
      diastolic: "90",
    };
    clinical.cardiometabolic.glycaemia = {
      ...clinical.cardiometabolic.glycaemia,
      enabled: true,
      diabetesHistory: true,
      measurementType: "a1c",
      unit: "percent",
      value: "7.2",
    };
    clinical.cardiometabolic.lipids = {
      ...clinical.cardiometabolic.lipids,
      enabled: true,
      diagnosedDyslipidaemia: true,
      reviewedProfessionally: true,
      ldl: "135",
      triglycerides: "220",
    };
    const result = screenSafety(clinical);
    expect(result.blocked).toBe(false);
    expect(["general_support_only", "professional_review_required"]).toContain(result.disposition);
  });

  it("allows diabetes and serious cardiovascular history with a prominent professional-review warning", () => {
    const result = screenSafety(form({
      medicalConditions: ["uncontrolled_diabetes", "serious_cardiovascular_disease"],
    }));
    expect(result.disposition).toBe("professional_review_required");
    expect(result.blocked).toBe(false);
    expect(result.issues.some((issue) => issue.id === "scope-adapted-medical-condition")).toBe(true);
  });

});
