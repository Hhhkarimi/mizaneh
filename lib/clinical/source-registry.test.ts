import { describe, expect, it } from "vitest";
import { clinicalEvidenceSources, resolveClinicalSources } from "@/lib/clinical/source-registry";
import { defaultForm } from "@/lib/food/catalogue";
import { getClinicalNutritionProfile } from "@/lib/clinical/diet-profile";

const expectedIds = [
  "AHA-HTN-2025", "AHA-DIET-2026", "WHO-SODIUM", "ADA-SOC-2026",
  "ACC-AHA-LIPIDS-2026", "NASEM-DRI-ENERGY-2023", "NIH-ODS-PREGNANCY",
  "WHO-ANC-NUTRITION", "NICE-MATERNAL-2025", "CDC-LACTATION-2026",
  "NICE-EATING-DISORDERS-NG69", "AAAAI-FOOD-ALLERGY-2026", "IDDSI-FRAMEWORK",
  "ASHA-DYSPHAGIA", "KDOQI-CKD-NUTRITION-2020", "KDIGO-CKD-2024",
  "ESPEN-LIVER-2020", "ESPEN-CANCER-2021", "ESPEN-SURGERY-2025",
  "ESPEN-IBD-2023", "ESPEN-MALABSORPTION-2025", "USER-CLINICIAN-CONSTRAINTS",
];

describe("clinical evidence source registry", () => {
  it("contains every source used by the clinical profile", () => {
    expect(new Set(clinicalEvidenceSources.map((source) => source.id))).toEqual(new Set(expectedIds));
  });

  it("resolves source metadata and keeps unknown IDs explicit", () => {
    const [known, unknown] = resolveClinicalSources(["KDIGO-CKD-2024", "UNKNOWN-SOURCE"]);
    expect(known.url).toContain("kdigo.org");
    expect(unknown.organization).toBe("منبع ثبت‌نشده");
  });

  it("resolves all sources emitted for a complex clinical plan", () => {
    const form = structuredClone(defaultForm);
    form.pregnant = true;
    form.medicalConditions = ["kidney_disease", "active_cancer_treatment", "medical_nutrition_therapy"];
    const profile = getClinicalNutritionProfile(form);
    const resolved = resolveClinicalSources(profile.sourceIds);
    expect(resolved).toHaveLength(profile.sourceIds.length);
    expect(resolved.every((item) => item.organization !== "منبع ثبت‌نشده")).toBe(true);
  });
});
