import type { Activity, Sex } from "@/lib/types";

export type EnergyEstimate = {
  estimate: number;
  uncertaintyKcal: number;
  equationLabel: string;
};

const adultEquations = {
  male: {
    sedentary: [753.07, -10.83, 6.5, 14.1],
    light: [581.47, -10.83, 8.3, 14.94],
    moderate: [1004.82, -10.83, 6.52, 15.91],
    active: [-517.88, -10.83, 15.61, 19.11],
  },
  female: {
    sedentary: [584.9, -7.01, 5.72, 11.71],
    light: [575.77, -7.01, 6.6, 12.14],
    moderate: [710.25, -7.01, 6.54, 12.34],
    active: [511.83, -7.01, 9.07, 12.56],
  },
} satisfies Record<Sex, Record<Activity, readonly [number, number, number, number]>>;

const adolescentEquations = {
  male: {
    sedentary: [-447.51, 3.68, 13.01, 13.15],
    light: [19.12, 3.68, 8.62, 20.28],
    moderate: [-388.19, 3.68, 12.66, 20.46],
    active: [-671.75, 3.68, 15.38, 23.25],
  },
  female: {
    sedentary: [55.59, -22.25, 8.43, 17.07],
    light: [-297.54, -22.25, 12.77, 14.73],
    moderate: [-189.55, -22.25, 11.74, 18.34],
    active: [-709.59, -22.25, 18.22, 14.25],
  },
} satisfies Record<Sex, Record<Activity, readonly [number, number, number, number]>>;

export function estimateAdultEnergy(input: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
}): EnergyEstimate {
  const adolescent = input.age < 19;
  const [constant, ageCoefficient, heightCoefficient, weightCoefficient] =
    (adolescent ? adolescentEquations : adultEquations)[input.sex][input.activity];
  const growthEnergy = adolescent ? 20 : 0;
  const estimate = Math.round(
    constant +
      ageCoefficient * input.age +
      heightCoefficient * input.heightCm +
      weightCoefficient * input.weightKg +
      growthEnergy,
  );
  return {
    estimate,
    uncertaintyKcal: adolescent ? 175 : input.sex === "male" ? 275 : 200,
    equationLabel: `NASEM 2023 ${adolescent ? "14-18" : "19+"} ${input.sex}/${input.activity}`,
  };
}
