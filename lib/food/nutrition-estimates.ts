import type { MealTemplate } from "@/lib/types";

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));
const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Adds transparent, conservative nutrient estimates to the preserved meal
 * catalogue. The recipes use household measures rather than weighed
 * ingredients, so these values are suitable for planning and comparison—not
 * clinical dosing. Brand, salt, oil and cooking method can materially change
 * the result.
 */
export function estimateMealNutrition(meal: MealTemplate): MealTemplate {
  if (
    typeof meal.carbs === "number" &&
    typeof meal.fat === "number" &&
    typeof meal.saturatedFat === "number" &&
    typeof meal.sodiumMg === "number"
  ) {
    return {
      ...meal,
      nutritionCompleteness: meal.nutritionCompleteness ?? "complete",
      nutritionSource: meal.nutritionSource ?? "verified",
    };
  }

  const text = `${meal.title} ${meal.ingredients.join(" ")}`;
  const hasNuts = includesAny(text, ["گردو", "بادام", "پسته", "ارده", "تخم کتان", "کنجد"]);
  const hasDairy = includesAny(text, ["پنیر", "شیر", "ماست", "کشک"]);
  const hasEgg = text.includes("تخم‌مرغ");
  const hasRedMeat = includesAny(text, ["گوشت", "گوسفند", "گوساله"]);
  const hasLeanAnimal = includesAny(text, ["مرغ", "بوقلمون", "ماهی", "تن ماهی"]);
  const hasLegume = includesAny(text, ["عدس", "نخود", "لوبیا", "لپه", "حمص"]);
  const hasWholeGrain = includesAny(text, ["جو", "بلغور", "نان سبوس‌دار", "سنگک"]);
  const hasPotato = text.includes("سیب‌زمینی");
  const vegetableCount = ["گوجه", "خیار", "کاهو", "کلم", "هویج", "کرفس", "کدو", "قارچ", "اسفناج", "سبزی", "فلفل"].filter((item) => text.includes(item)).length;
  const fruitCount = ["سیب", "موز", "پرتقال", "گلابی", "توت", "خرما", "کشمش", "زرشک"].filter((item) => text.includes(item)).length;

  let fatEnergyShare = 0.22;
  if (hasNuts) fatEnergyShare += 0.08;
  if (hasDairy || hasEgg) fatEnergyShare += 0.04;
  if (hasRedMeat) fatEnergyShare += 0.05;
  if (hasLeanAnimal) fatEnergyShare += 0.02;
  fatEnergyShare = Math.min(0.39, fatEnergyShare);

  const fat = Math.max(3, Math.round((meal.calories * fatEnergyShare) / 9));
  const carbohydrateEnergy = Math.max(0, meal.calories - meal.protein * 4 - fat * 9);
  const carbs = Math.max(4, Math.round(carbohydrateEnergy / 4));

  let saturatedFactor = 0.12;
  if (hasDairy) saturatedFactor += 0.14;
  if (hasRedMeat) saturatedFactor += 0.13;
  if (hasEgg) saturatedFactor += 0.07;
  if (hasLeanAnimal) saturatedFactor += 0.04;
  const saturatedFat = round1(Math.min(fat, fat * saturatedFactor));

  let sodiumMg = 90;
  if (includesAny(text, ["نان", "سنگک", "لواش"])) sodiumMg += 210;
  if (text.includes("پنیر")) sodiumMg += 420;
  if (includesAny(text, ["ماست", "شیر"])) sodiumMg += 90;
  if (hasEgg) sodiumMg += 130;
  if (hasLeanAnimal || hasRedMeat) sodiumMg += 100;
  if (includesAny(text, ["سوپ", "خوراک", "خورش"])) sodiumMg += 120;
  sodiumMg = Math.round(Math.min(1200, sodiumMg));

  let addedSugar = 0;
  if (includesAny(text, ["عسل", "شکر", "مربا", "شکلات"])) addedSugar += 10;
  if (text.includes("نوشیدنی شیرین")) addedSugar += 20;

  let potassiumMg = 220;
  if (hasLegume) potassiumMg += 340;
  if (hasPotato) potassiumMg += 360;
  if (hasDairy) potassiumMg += 180;
  potassiumMg += vegetableCount * 75 + fruitCount * 130;
  potassiumMg = Math.round(Math.min(1600, potassiumMg));

  return {
    ...meal,
    carbs,
    fat,
    saturatedFat,
    sodiumMg,
    addedSugar,
    potassiumMg,
    nutritionCompleteness: "estimated",
    nutritionSource: "catalogue_estimate",
    sourceNote:
      meal.sourceNote ??
      "برآورد از ترکیب استاندارد مواد و داده‌های مرجع ترکیب غذا؛ برند، نمک، روغن و روش پخت می‌تواند مقدار واقعی را تغییر دهد.",
  };
}
