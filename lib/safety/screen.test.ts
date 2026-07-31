import { describe, expect, it } from "vitest";
import { defaultForm } from "@/lib/food/catalogue";
import { screenSafety } from "@/lib/safety/screen";
import type { PlannerForm } from "@/lib/types";

function form(overrides: Partial<PlannerForm> = {}): PlannerForm {
  return { ...structuredClone(defaultForm), ...overrides };
}

describe("safety screening v5", () => {
  it("allows an ordinary healthy adult profile", () => {
    expect(screenSafety(form()).disposition).toBe("ordinary_scope");
  });

  it("generates condition-aware support for pregnancy and breastfeeding", () => {
    const pregnancy = screenSafety(form({ pregnant: true }));
    const lactation = screenSafety(form({ breastfeeding: true }));
    expect(pregnancy.blocked).toBe(false);
    expect(lactation.blocked).toBe(false);
    expect(pregnancy.issues[0].title).toContain("بارداری");
    expect(lactation.issues[0].title).toContain("شیردهی");
    expect(pregnancy.policyId).toBe("safety.screen.v5");
  });

  it("keeps eating-disorder concern in supported warning mode unless medically unstable", () => {
    const stable = form({ eatingDisorderConcern: true });
    expect(screenSafety(stable).blocked).toBe(false);
    stable.clinicalCare.eatingDisorder.faintingSevereWeaknessOrDehydration = true;
    expect(screenSafety(stable).blocked).toBe(true);
  });

  it("supports serious allergy but blocks an active reaction", () => {
    const allergy = form({ seriousFoodAllergy: true });
    expect(screenSafety(allergy).blocked).toBe(false);
    allergy.clinicalCare.allergy.activeReactionSymptoms = true;
    expect(screenSafety(allergy).blocked).toBe(true);
  });

  it("supports a clinician-specified dysphagia texture but blocks active airway signs", () => {
    const dysphagia = form({ swallowingDifficulty: true });
    dysphagia.clinicalCare.dysphagia.foodLevel = "5";
    dysphagia.clinicalCare.dysphagia.drinkLevel = "2";
    expect(screenSafety(dysphagia).blocked).toBe(false);
    dysphagia.clinicalCare.dysphagia.coughingChokingOrWetVoice = true;
    expect(screenSafety(dysphagia).blocked).toBe(true);
  });

  it("supports kidney, liver, cancer, surgery, GI and MNT conditions by default", () => {
    const clinical = form({
      medicalConditions: [
        "kidney_disease",
        "liver_disease",
        "active_cancer_treatment",
        "recent_major_surgery",
        "severe_gastrointestinal_condition",
        "medical_nutrition_therapy",
      ],
    });
    const result = screenSafety(clinical);
    expect(result.blocked).toBe(false);
    expect(result.disposition).toBe("professional_review_required");
  });

  it("blocks only active red flags in kidney, liver and GI conditions", () => {
    const kidney = form({ medicalConditions: ["kidney_disease"] });
    kidney.clinicalCare.kidney.swellingOrBreathlessness = true;
    expect(screenSafety(kidney).blocked).toBe(true);

    const liver = form({ medicalConditions: ["liver_disease"] });
    liver.clinicalCare.liver.encephalopathyOrConfusion = true;
    expect(screenSafety(liver).blocked).toBe(true);

    const gi = form({ medicalConditions: ["severe_gastrointestinal_condition"] });
    gi.clinicalCare.gastrointestinal.activeBleedingObstructionOrPersistentVomiting = true;
    expect(screenSafety(gi).blocked).toBe(true);
  });

  it("keeps severe refeeding-risk signals blocked", () => {
    expect(screenSafety(form({ height: "180", weight: "50" })).blocked).toBe(true);
    expect(screenSafety(form({ negligibleIntakeDays: "11" })).blocked).toBe(true);
    expect(screenSafety(form({ intentionalWeightChange: false, unintentionalLossPercent: "16", unintentionalLossMonths: "4" })).blocked).toBe(true);
  });

  it("keeps symptom-free severe BP in warning mode and symptoms urgent", () => {
    const bp = structuredClone(defaultForm);
    bp.cardiometabolic.bloodPressure = { ...bp.cardiometabolic.bloodPressure, enabled: true, systolic: "181", diastolic: "90" };
    expect(screenSafety(bp).blocked).toBe(false);
    bp.cardiometabolic.bloodPressure.concerningSymptoms = true;
    expect(screenSafety(bp).blocked).toBe(true);
  });

  it("treats glucose below 54 as urgent and ordinary diabetes as supported", () => {
    const diabetes = structuredClone(defaultForm);
    diabetes.cardiometabolic.glycaemia = { ...diabetes.cardiometabolic.glycaemia, enabled: true, diabetesHistory: true, value: "180", unit: "mg_dl" };
    expect(screenSafety(diabetes).blocked).toBe(false);
    diabetes.cardiometabolic.glycaemia.value = "50";
    expect(screenSafety(diabetes).blocked).toBe(true);
  });

  it("treats triglycerides at 650 as warning and 1000 as high priority", () => {
    const lipid = structuredClone(defaultForm);
    lipid.cardiometabolic.lipids = { ...lipid.cardiometabolic.lipids, enabled: true, triglycerides: "650" };
    expect(screenSafety(lipid).blocked).toBe(false);
    lipid.cardiometabolic.lipids.triglycerides = "1000";
    expect(screenSafety(lipid).blocked).toBe(true);
  });
});
