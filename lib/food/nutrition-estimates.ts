import type { MealTemplate } from "@/lib/types";

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));
const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Adds transparent, conservative nutrient estimates to the preserved meal
 * catalogue. Recipes use household measures rather than weighed ingredients,
 * so the values are for planning/comparison, not insulin dosing, renal
 * electrolyte prescriptions, pregnancy supplementation, or other medical
 * treatment. Brand, fortification, salt, oil, yield and cooking loss matter.
 */
export function estimateMealNutrition(meal: MealTemplate): MealTemplate {
  const alreadyComplete = [
    meal.carbs,
    meal.fat,
    meal.saturatedFat,
    meal.sodiumMg,
    meal.potassiumMg,
    meal.calciumMg,
    meal.ironMg,
    meal.magnesiumMg,
    meal.phosphorusMg,
    meal.zincMg,
    meal.folateMcg,
    meal.iodineMcg,
    meal.vitaminB12Mcg,
    meal.vitaminDMcg,
    meal.cholineMg,
  ].every((value) => typeof value === "number");

  if (alreadyComplete) {
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
  const hasFish = includesAny(text, ["ماهی", "تن ماهی"]);
  const hasLeanAnimal = includesAny(text, ["مرغ", "بوقلمون", "ماهی", "تن ماهی"]);
  const hasLegume = includesAny(text, ["عدس", "نخود", "لوبیا", "لپه", "حمص"]);
  const hasWholeGrain = includesAny(text, ["جو", "بلغور", "نان سبوس‌دار", "سنگک"]);
  const hasPotato = text.includes("سیب‌زمینی");
  const hasLeafyGreen = includesAny(text, ["اسفناج", "سبزی", "کلم", "برگ چغندر"]);
  const hasSesame = includesAny(text, ["ارده", "کنجد"]);
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

  const calciumMg = Math.round(
    70 + (hasDairy ? 260 : 0) + (hasSesame ? 120 : 0) + (hasLeafyGreen ? 70 : 0),
  );
  const ironMg = round1(
    1 + (hasRedMeat ? 2.6 : 0) + (hasLegume ? 2.1 : 0) + (hasLeafyGreen ? 1 : 0) + (hasEgg ? 0.8 : 0),
  );
  const magnesiumMg = Math.round(
    35 + (hasNuts ? 85 : 0) + (hasWholeGrain ? 55 : 0) + (hasLegume ? 65 : 0) + (hasLeafyGreen ? 40 : 0),
  );
  const phosphorusMg = Math.round(
    120 + (hasDairy ? 190 : 0) + (hasLeanAnimal || hasRedMeat ? 180 : 0) + (hasLegume ? 130 : 0) + (hasNuts ? 110 : 0),
  );
  const zincMg = round1(
    1 + (hasRedMeat ? 3.5 : 0) + (hasLeanAnimal ? 1.5 : 0) + (hasLegume ? 1.2 : 0) + (hasNuts ? 1 : 0),
  );
  const folateMcg = Math.round(
    30 + (hasLegume ? 120 : 0) + (hasLeafyGreen ? 95 : 0) + vegetableCount * 12 + fruitCount * 18,
  );
  const iodineMcg = Math.round(
    12 + (hasFish ? 65 : 0) + (hasDairy ? 35 : 0) + (hasEgg ? 24 : 0),
  );
  const vitaminB12Mcg = round1(
    (hasFish ? 2.5 : 0) + (hasRedMeat ? 2.2 : 0) + (hasLeanAnimal && !hasFish ? 0.8 : 0) + (hasDairy ? 0.8 : 0) + (hasEgg ? 0.6 : 0),
  );
  const vitaminDMcg = round1((hasFish ? 5 : 0) + (hasEgg ? 1 : 0) + (hasDairy ? 0.3 : 0));
  const cholineMg = Math.round(
    35 + (hasEgg ? 145 : 0) + (hasRedMeat || hasLeanAnimal ? 90 : 0) + (hasLegume ? 45 : 0) + (hasDairy ? 35 : 0),
  );

  return {
    ...meal,
    carbs,
    fat,
    saturatedFat,
    sodiumMg,
    addedSugar,
    potassiumMg,
    calciumMg,
    ironMg,
    magnesiumMg,
    phosphorusMg,
    zincMg,
    folateMcg,
    iodineMcg,
    vitaminB12Mcg,
    vitaminDMcg,
    cholineMg,
    nutritionCompleteness: "estimated",
    nutritionSource: "catalogue_estimate",
    sourceNote:
      meal.sourceNote ??
      "برآورد از ترکیب استاندارد مواد و داده‌های مرجع ترکیب غذا؛ برند، غنی‌سازی، نمک، روغن، وزن خام/پخته و روش پخت می‌تواند مقدار واقعی را تغییر دهد. برای دوز انسولین، محدودیت کلیه/کبد یا مکمل بارداری استفاده نشود.",
  };
}
