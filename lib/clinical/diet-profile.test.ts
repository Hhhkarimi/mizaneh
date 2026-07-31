import { describe, expect, it } from "vitest";
import { getClinicalNutritionProfile, clinicalMealScore } from "@/lib/clinical/diet-profile";
import { defaultForm, mealTemplates } from "@/lib/food/catalogue";

function clinicalForm() {
  const form = structuredClone(defaultForm);
  form.cardiometabolic.bloodPressure = {
    ...form.cardiometabolic.bloodPressure,
    enabled: true,
    diagnosedHypertension: true,
    stableUnderCare: true,
    systolic: "142",
    diastolic: "88",
  };
  form.cardiometabolic.glycaemia = {
    ...form.cardiometabolic.glycaemia,
    enabled: true,
    diabetesHistory: true,
    measurementType: "a1c",
    unit: "percent",
    value: "7.1",
  };
  form.cardiometabolic.lipids = {
    ...form.cardiometabolic.lipids,
    enabled: true,
    diagnosedDyslipidaemia: true,
    reviewedProfessionally: true,
    ldl: "140",
    triglycerides: "230",
  };
  return form;
}

describe("clinical nutrition profile", () => {
  it("activates all three condition-specific focuses without claiming treatment", () => {
    const profile = getClinicalNutritionProfile(clinicalForm(), 2100);
    expect(profile.active).toBe(true);
    expect(profile.focuses).toEqual(["blood_pressure", "glycaemia", "lipids"]);
    expect(profile.sodiumTargetMg).toBe(2000);
    expect(profile.saturatedFatTargetG).toBeGreaterThan(0);
    expect(profile.consistentCarbohydratePattern).toBe(true);
    expect(profile.summary).toContain("جایگزین");
  });

  it("ranks a lower-sodium, high-fibre meal ahead of a saltier saturated-fat option", () => {
    const form = clinicalForm();
    const supportive = mealTemplates.find((meal) => meal.title.includes("عدسی"))!;
    const lessSupportive = mealTemplates.find((meal) => meal.title.includes("پنیر"))!;
    expect(clinicalMealScore(supportive, form)).toBeLessThan(clinicalMealScore(lessSupportive, form));
  });

  it("requires medication coordination when hypoglycaemia-risk treatment is reported", () => {
    const form = clinicalForm();
    form.cardiometabolic.glycaemia.insulinOrHypoglycaemiaMedicine = true;
    expect(getClinicalNutritionProfile(form).requiresMedicationCoordination).toBe(true);
  });
});
