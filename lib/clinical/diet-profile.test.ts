import { describe, expect, it } from "vitest";
import { getClinicalNutritionProfile, clinicalMealScore } from "@/lib/clinical/diet-profile";
import { defaultForm, mealTemplates } from "@/lib/food/catalogue";

describe("clinical nutrition profile v5", () => {
  it("creates a pregnancy profile with micronutrient and food-safety adaptations", () => {
    const form = structuredClone(defaultForm);
    form.pregnant = true;
    form.clinicalCare.pregnancy.trimester = "second";
    const profile = getClinicalNutritionProfile(form, 2200);
    expect(profile.focuses).toContain("pregnancy");
    expect(profile.foodsToLimit.join(" ")).toContain("غیرپاستوریزه");
    expect(profile.sourceIds).toContain("NIH-ODS-PREGNANCY");
  });

  it("does not infer potassium or phosphorus restriction for CKD without labs", () => {
    const form = structuredClone(defaultForm);
    form.medicalConditions = ["kidney_disease"];
    form.clinicalCare.kidney.stage = "3_5_no_dialysis";
    const profile = getClinicalNutritionProfile(form);
    expect(profile.focuses).toContain("kidney");
    expect(profile.potassiumTargetMaxMg).toBeUndefined();
    expect(profile.phosphorusTargetMaxMg).toBeUndefined();
  });

  it("applies clinician-entered kidney electrolyte limits", () => {
    const form = structuredClone(defaultForm);
    form.medicalConditions = ["kidney_disease", "medical_nutrition_therapy"];
    form.clinicalCare.kidney.potassiumStatus = "high";
    form.clinicalCare.customMnt.potassiumLimitMg = "2200";
    form.clinicalCare.customMnt.phosphorusLimitMg = "900";
    const profile = getClinicalNutritionProfile(form);
    expect(profile.potassiumTargetMaxMg).toBe(2200);
    expect(profile.phosphorusTargetMaxMg).toBe(900);
  });

  it("uses the entered IDDSI levels instead of guessing texture", () => {
    const form = structuredClone(defaultForm);
    form.swallowingDifficulty = true;
    form.clinicalCare.dysphagia.foodLevel = "5";
    form.clinicalCare.dysphagia.drinkLevel = "2";
    form.clinicalCare.dysphagia.assessedByProfessional = true;
    expect(getClinicalNutritionProfile(form).textureInstruction).toContain("سطح ۵");
  });

  it("ranks a lower-sodium high-fibre meal ahead of a saltier meal for cardiometabolic support", () => {
    const form = structuredClone(defaultForm);
    form.cardiometabolic.bloodPressure = { ...form.cardiometabolic.bloodPressure, enabled: true, diagnosedHypertension: true };
    form.cardiometabolic.glycaemia = { ...form.cardiometabolic.glycaemia, enabled: true, diabetesHistory: true };
    const supportive = mealTemplates.find((meal) => meal.title.includes("عدسی"))!;
    const lessSupportive = mealTemplates.find((meal) => meal.title.includes("پنیر"))!;
    expect(clinicalMealScore(supportive, form)).toBeLessThan(clinicalMealScore(lessSupportive, form));
  });
});
