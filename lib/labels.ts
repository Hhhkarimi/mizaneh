// Pure label lookups for enum-like form values.

import type { DayPattern, MealPrep, SleepLevel, WaterLevel } from "@/lib/types";

export function dayPatternLabel(value: DayPattern) {
  return (
    {
      regular: "روز منظم",
      office: "محیط کار",
      shift: "شیفت متغیر",
      home: "بیشتر در خانه",
    } as const
  )[value];
}

export function prepLabel(value: MealPrep) {
  return (
    {
      daily: "پخت روزانه",
      batch: "آماده‌سازی جمعی",
      mixed: "ترکیبی",
    } as const
  )[value];
}

export function sleepLabel(value: SleepLevel) {
  return (
    {
      under6: "کمتر از ۶ ساعت",
      "6to7": "۶ تا ۷ ساعت",
      "7plus": "۷ ساعت یا بیشتر",
    } as const
  )[value];
}

export function waterLabel(value: WaterLevel) {
  return (
    {
      low: "نیاز به نظم بیشتر",
      medium: "نسبتاً منظم",
      good: "عادت منظم",
    } as const
  )[value];
}
