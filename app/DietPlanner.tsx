"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type Sex = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "active";
type DietStyle = "balanced" | "vegetarian" | "mediterranean" | "highProtein";
type PlanMode = "variety" | "quick" | "batch" | "protein";
type Allergy = "gluten" | "dairy" | "egg" | "nuts" | "fish";
type MealSlot = "breakfast" | "snack" | "lunch" | "dinner";
type MealPrep = "daily" | "batch" | "mixed";
type DayPattern = "regular" | "office" | "shift" | "home";
type HungerPeak = "morning" | "afternoon" | "night";
type BreakfastTaste = "savory" | "sweet" | "both";
type SleepLevel = "under6" | "6to7" | "7plus";
type WaterLevel = "low" | "medium" | "good";

type PlannerForm = {
  age: string;
  height: string;
  weight: string;
  sex: Sex;
  activity: Activity;
  targetWeight: string;
  pace: "0.25" | "0.5" | "0.75";
  meals: "3" | "4" | "5";
  cookingTime: "15" | "30" | "45";
  dietStyle: DietStyle;
  allergies: Allergy[];
  mealPrep: MealPrep;
  dayPattern: DayPattern;
  hungerPeak: HungerPeak;
  breakfastTaste: BreakfastTaste;
  sleep: SleepLevel;
  water: WaterLevel;
  dislikes: string;
};

type Metrics = {
  bmr: number;
  tdee: number;
  targetCalories: number;
  bmi: number;
  bmiLabel: string;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  weeklyPace: number;
  estimatedWeeks: number;
  deficit: number;
  produceGrams: number;
  waterLiters: number;
};

type MealTemplate = {
  id: string;
  slot: MealSlot;
  title: string;
  serving: string;
  ingredients: string[];
  calories: number;
  protein: number;
  fiber: number;
  prep: number;
  batchFriendly: boolean;
  breakfastTaste?: BreakfastTaste;
  allergens: Allergy[];
  styles: DietStyle[];
};

type PlannedMeal = MealTemplate & {
  displaySlot: string;
  targetCalories: number;
  targetProtein: number;
  targetFiber: number;
  portionCue: string;
};

type DayPlan = {
  id: string;
  label: string;
  shortLabel: string;
  meals: PlannedMeal[];
  calories: number;
  protein: number;
  fiber: number;
};

type ShoppingGroup = {
  title: string;
  tone: string;
  items: string[];
};

const numberFormatter = new Intl.NumberFormat("fa-IR");
const decimalFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 1,
});

const defaultForm: PlannerForm = {
  age: "32",
  height: "170",
  weight: "78",
  sex: "female",
  activity: "light",
  targetWeight: "70",
  pace: "0.5",
  meals: "4",
  cookingTime: "30",
  dietStyle: "balanced",
  allergies: [],
  mealPrep: "mixed",
  dayPattern: "office",
  hungerPeak: "night",
  breakfastTaste: "savory",
  sleep: "6to7",
  water: "medium",
  dislikes: "",
};

const days = [
  { id: "shanbe", label: "شنبه", shortLabel: "ش" },
  { id: "yekshanbe", label: "یکشنبه", shortLabel: "ی" },
  { id: "doshanbe", label: "دوشنبه", shortLabel: "د" },
  { id: "seshanbe", label: "سه‌شنبه", shortLabel: "س" },
  { id: "chaharshanbe", label: "چهارشنبه", shortLabel: "چ" },
  { id: "panjshanbe", label: "پنجشنبه", shortLabel: "پ" },
  { id: "jome", label: "جمعه", shortLabel: "ج" },
];

const activityOptions: Array<{
  id: Activity;
  label: string;
  note: string;
  factor: number;
}> = [
  { id: "sedentary", label: "کم", note: "بیشترِ روز نشسته", factor: 1.2 },
  { id: "light", label: "سبک", note: "۱ تا ۳ روز فعالیت", factor: 1.375 },
  { id: "moderate", label: "متوسط", note: "۳ تا ۵ روز فعالیت", factor: 1.55 },
  { id: "active", label: "زیاد", note: "۶ تا ۷ روز فعالیت", factor: 1.725 },
];

const dietStyles: Array<{
  id: DietStyle;
  title: string;
  note: string;
  icon: string;
}> = [
  { id: "balanced", title: "متعادل ایرانی", note: "آشنا، متنوع و منعطف", icon: "●" },
  { id: "vegetarian", title: "گیاه‌خواری", note: "حبوبات، غلات و لبنیات", icon: "◆" },
  {
    id: "mediterranean",
    title: "مدیترانه‌ای",
    note: "سبزی، حبوبات و چربی مفید",
    icon: "◐",
  },
  {
    id: "highProtein",
    title: "پروتئین بیشتر",
    note: "توزیع پروتئین در طول روز",
    icon: "▲",
  },
];

const allergyOptions: Array<{ id: Allergy; label: string }> = [
  { id: "gluten", label: "گلوتن" },
  { id: "dairy", label: "لبنیات" },
  { id: "egg", label: "تخم‌مرغ" },
  { id: "nuts", label: "مغزها" },
  { id: "fish", label: "ماهی" },
];

const planModeOptions: Array<{
  id: PlanMode;
  title: string;
  note: string;
}> = [
  { id: "variety", title: "بیشترین تنوع", note: "تکرار کمتر در هفته" },
  { id: "quick", title: "سریع", note: "زمان آماده‌سازی کوتاه‌تر" },
  { id: "batch", title: "آماده‌سازی جمعی", note: "پخت پایه برای چند وعده" },
  { id: "protein", title: "پروتئین‌محور", note: "سهم پروتئین بالاتر" },
];

const stepTitles = [
  "بدن و فعالیت",
  "هدف و وعده‌ها",
  "سبک و ترجیحات",
  "ریتم زندگی",
];

const allStyles: DietStyle[] = [
  "balanced",
  "vegetarian",
  "mediterranean",
  "highProtein",
];

const mealTemplates: MealTemplate[] = [
  {
    id: "lentil-sangak",
    slot: "breakfast",
    title: "عدسی با لیمو و سنگک",
    serving: "۱ پیمانه عدسی + ¼ نان سنگک + سبزی تازه",
    ingredients: ["عدس", "نان سنگک", "لیمو", "خیار", "گوجه"],
    calories: 405,
    protein: 19,
    fiber: 12,
    prep: 20,
    batchFriendly: true,
    breakfastTaste: "savory",
    allergens: ["gluten"],
    styles: allStyles,
  },
  {
    id: "vegetable-omelet",
    slot: "breakfast",
    title: "املت سبزیجات و نان سبوس‌دار",
    serving: "۲ تخم‌مرغ + گوجه و قارچ + ۱ کف دست نان",
    ingredients: ["تخم‌مرغ", "گوجه", "قارچ", "نان سبوس‌دار"],
    calories: 425,
    protein: 24,
    fiber: 6,
    prep: 15,
    batchFriendly: false,
    breakfastTaste: "savory",
    allergens: ["egg", "gluten"],
    styles: ["balanced", "vegetarian", "highProtein"],
  },
  {
    id: "apple-oatmeal",
    slot: "breakfast",
    title: "اوتمیل سیب و دارچین",
    serving: "½ پیمانه جو دوسر + شیر + سیب + دارچین",
    ingredients: ["جو دوسر", "شیر", "سیب", "دارچین"],
    calories: 410,
    protein: 18,
    fiber: 9,
    prep: 10,
    batchFriendly: true,
    breakfastTaste: "sweet",
    allergens: ["gluten", "dairy"],
    styles: ["balanced", "vegetarian", "mediterranean"],
  },
  {
    id: "hummus-breakfast",
    slot: "breakfast",
    title: "حمص، سنگک و سبزی خوردن",
    serving: "¾ پیمانه حمص + ¼ سنگک + سبزی خوردن",
    ingredients: ["نخود", "ارده", "نان سنگک", "سبزی خوردن", "لیمو"],
    calories: 430,
    protein: 17,
    fiber: 11,
    prep: 12,
    batchFriendly: true,
    breakfastTaste: "savory",
    allergens: ["gluten"],
    styles: allStyles,
  },
  {
    id: "yogurt-fruit-bowl",
    slot: "breakfast",
    title: "کاسه ماست، میوه و جو پرک",
    serving: "۱ پیمانه ماست چکیده + میوه + ۳ قاشق جو پرک",
    ingredients: ["ماست چکیده", "جو پرک", "موز", "توت", "دارچین"],
    calories: 395,
    protein: 27,
    fiber: 7,
    prep: 5,
    batchFriendly: false,
    breakfastTaste: "sweet",
    allergens: ["dairy", "gluten"],
    styles: ["balanced", "vegetarian", "highProtein"],
  },
  {
    id: "egg-herb-plate",
    slot: "breakfast",
    title: "تخم‌مرغ، سیب‌زمینی و سبزی",
    serving: "۲ تخم‌مرغ + ۱ سیب‌زمینی کوچک + خیار و سبزی",
    ingredients: ["تخم‌مرغ", "سیب‌زمینی", "خیار", "سبزی خوردن"],
    calories: 400,
    protein: 23,
    fiber: 6,
    prep: 12,
    batchFriendly: true,
    breakfastTaste: "savory",
    allergens: ["egg"],
    styles: ["balanced", "vegetarian", "highProtein"],
  },
  {
    id: "chickpea-potato",
    slot: "breakfast",
    title: "خوراک نخود و سیب‌زمینی",
    serving: "¾ پیمانه نخود + سیب‌زمینی کوچک + سبزی و لیمو",
    ingredients: ["نخود", "سیب‌زمینی", "جعفری", "لیمو", "گوجه"],
    calories: 415,
    protein: 18,
    fiber: 13,
    prep: 18,
    batchFriendly: true,
    breakfastTaste: "savory",
    allergens: [],
    styles: allStyles,
  },
  {
    id: "cheese-herb-walnut",
    slot: "breakfast",
    title: "پنیر، گردو و سبزی با سنگک",
    serving: "۶۰ گرم پنیر + ۲ نیمه گردو + ¼ نان سنگک",
    ingredients: ["پنیر", "گردو", "نان سنگک", "سبزی خوردن", "خیار"],
    calories: 420,
    protein: 20,
    fiber: 5,
    prep: 4,
    batchFriendly: false,
    breakfastTaste: "savory",
    allergens: ["dairy", "nuts", "gluten"],
    styles: ["balanced", "vegetarian", "mediterranean"],
  },
  {
    id: "banana-overnight-oats",
    slot: "breakfast",
    title: "جو دوسر شبانه با موز",
    serving: "½ پیمانه جو + شیر + ½ موز + تخم کتان",
    ingredients: ["جو دوسر", "شیر", "موز", "تخم کتان"],
    calories: 425,
    protein: 19,
    fiber: 10,
    prep: 5,
    batchFriendly: true,
    breakfastTaste: "sweet",
    allergens: ["gluten", "dairy"],
    styles: ["balanced", "vegetarian", "mediterranean"],
  },
  {
    id: "tofu-scramble",
    slot: "breakfast",
    title: "توفوی ادویه‌ای و سبزیجات",
    serving: "۱۵۰ گرم توفو + فلفل دلمه + قارچ + سیب‌زمینی کوچک",
    ingredients: ["توفو", "فلفل دلمه", "قارچ", "سیب‌زمینی", "زردچوبه"],
    calories: 405,
    protein: 29,
    fiber: 7,
    prep: 15,
    batchFriendly: true,
    breakfastTaste: "savory",
    allergens: [],
    styles: ["vegetarian", "mediterranean", "highProtein"],
  },
  {
    id: "saffron-chicken-rice",
    slot: "lunch",
    title: "مرغ زعفرانی، برنج و سالاد شیرازی",
    serving: "۱۵۰ گرم مرغ + ۸ قاشق برنج + ۲ پیمانه سالاد",
    ingredients: ["مرغ", "برنج", "گوجه", "خیار", "پیاز", "زعفران"],
    calories: 640,
    protein: 47,
    fiber: 7,
    prep: 35,
    batchFriendly: true,
    allergens: [],
    styles: ["balanced", "highProtein"],
  },
  {
    id: "lentil-rice",
    slot: "lunch",
    title: "عدس‌پلو با کشمش و سالاد",
    serving: "۸ قاشق عدس‌پلو + کشمش کم + سالاد کاهو",
    ingredients: ["عدس", "برنج", "کشمش", "کاهو", "هویج", "لیمو"],
    calories: 605,
    protein: 25,
    fiber: 13,
    prep: 35,
    batchFriendly: true,
    allergens: [],
    styles: ["balanced", "vegetarian"],
  },
  {
    id: "fish-dill-rice",
    slot: "lunch",
    title: "ماهی تنوری، شویدپلو و سبزیجات",
    serving: "۱۵۰ گرم ماهی + ۷ قاشق شویدپلو + سبزیجات تنوری",
    ingredients: ["ماهی", "برنج", "شوید", "کدو", "هویج", "لیمو"],
    calories: 620,
    protein: 44,
    fiber: 8,
    prep: 32,
    batchFriendly: false,
    allergens: ["fish"],
    styles: ["balanced", "mediterranean", "highProtein"],
  },
  {
    id: "bean-rice-mushroom",
    slot: "lunch",
    title: "لوبیاپلو با قارچ و سالاد",
    serving: "۸ قاشق لوبیاپلو گیاهی + سالاد فصل",
    ingredients: ["لوبیا سبز", "برنج", "قارچ", "گوجه", "کاهو", "هویج"],
    calories: 610,
    protein: 24,
    fiber: 12,
    prep: 40,
    batchFriendly: true,
    allergens: [],
    styles: ["balanced", "vegetarian"],
  },
  {
    id: "chickpea-bowl",
    slot: "lunch",
    title: "کاسه نخود، بلغور و سبزیجات",
    serving: "۱ پیمانه نخود + ¾ پیمانه بلغور + سبزیجات رنگی",
    ingredients: ["نخود", "بلغور", "فلفل دلمه", "خیار", "گوجه", "جعفری"],
    calories: 595,
    protein: 27,
    fiber: 16,
    prep: 28,
    batchFriendly: true,
    allergens: ["gluten"],
    styles: ["vegetarian", "mediterranean"],
  },
  {
    id: "lean-ghormeh",
    slot: "lunch",
    title: "قورمه‌سبزی کم‌چرب و برنج",
    serving: "۱ پیمانه خورش + ۷ قاشق برنج + سبزی خوردن",
    ingredients: ["گوشت کم‌چرب", "لوبیا قرمز", "سبزی خورشتی", "برنج", "لیمو عمانی"],
    calories: 650,
    protein: 39,
    fiber: 11,
    prep: 45,
    batchFriendly: true,
    allergens: [],
    styles: ["balanced", "highProtein"],
  },
  {
    id: "turkey-kebab",
    slot: "lunch",
    title: "کباب بوقلمون و سبزیجات کبابی",
    serving: "۱۵۰ گرم بوقلمون + سیب‌زمینی متوسط + سبزیجات",
    ingredients: ["بوقلمون", "سیب‌زمینی", "فلفل دلمه", "کدو", "گوجه"],
    calories: 610,
    protein: 48,
    fiber: 9,
    prep: 30,
    batchFriendly: true,
    allergens: [],
    styles: ["balanced", "mediterranean", "highProtein"],
  },
  {
    id: "eggplant-lentil-stew",
    slot: "lunch",
    title: "خورش بادمجان و عدس با برنج",
    serving: "۱ پیمانه خورش گیاهی + ۷ قاشق برنج + سالاد",
    ingredients: ["بادمجان", "عدس", "گوجه", "برنج", "کاهو", "لیمو"],
    calories: 600,
    protein: 26,
    fiber: 15,
    prep: 40,
    batchFriendly: true,
    allergens: [],
    styles: ["vegetarian", "mediterranean"],
  },
  {
    id: "chicken-barley-soup",
    slot: "lunch",
    title: "سوپ جو و مرغ با سالاد",
    serving: "۲ پیمانه سوپ جو و مرغ + سالاد فصل",
    ingredients: ["مرغ", "جو", "هویج", "کرفس", "قارچ", "کاهو"],
    calories: 575,
    protein: 42,
    fiber: 11,
    prep: 35,
    batchFriendly: true,
    allergens: ["gluten"],
    styles: ["balanced", "highProtein"],
  },
  {
    id: "baked-falafel-bowl",
    slot: "lunch",
    title: "فلافل تنوری و سالاد تبوله",
    serving: "۵ فلافل کوچک تنوری + تبوله + سس ارده و لیمو",
    ingredients: ["نخود", "جعفری", "بلغور", "گوجه", "خیار", "ارده"],
    calories: 605,
    protein: 25,
    fiber: 16,
    prep: 30,
    batchFriendly: true,
    allergens: ["gluten"],
    styles: ["vegetarian", "mediterranean"],
  },
  {
    id: "soy-kebab-rice",
    slot: "lunch",
    title: "کباب سویا، برنج و گوجه",
    serving: "۲ کباب کوچک سویا + ۷ قاشق برنج + گوجه کبابی",
    ingredients: ["سویا", "برنج", "گوجه", "پیاز", "جعفری"],
    calories: 590,
    protein: 31,
    fiber: 11,
    prep: 30,
    batchFriendly: true,
    allergens: [],
    styles: ["vegetarian", "highProtein"],
  },
  {
    id: "white-bean-rice",
    slot: "lunch",
    title: "خوراک لوبیا سفید و برنج قهوه‌ای",
    serving: "۱ پیمانه خوراک لوبیا + ۶ قاشق برنج + سبزی",
    ingredients: ["لوبیا سفید", "برنج قهوه‌ای", "گوجه", "هویج", "کرفس"],
    calories: 600,
    protein: 28,
    fiber: 17,
    prep: 38,
    batchFriendly: true,
    allergens: [],
    styles: ["vegetarian", "mediterranean"],
  },
  {
    id: "chicken-zereshk",
    slot: "lunch",
    title: "زرشک‌پلو با مرغ و سالاد کلم",
    serving: "۱۴۰ گرم مرغ + ۷ قاشق زرشک‌پلو + سالاد کلم",
    ingredients: ["مرغ", "برنج", "زرشک", "کلم", "هویج", "لیمو"],
    calories: 635,
    protein: 45,
    fiber: 8,
    prep: 40,
    batchFriendly: true,
    allergens: [],
    styles: ["balanced", "highProtein"],
  },
  {
    id: "vegetable-ash",
    slot: "lunch",
    title: "آش جو و حبوبات",
    serving: "۲ پیمانه آش جو + سبزی تازه + پیاز داغ کم",
    ingredients: ["جو", "عدس", "نخود", "لوبیا", "سبزی آش", "پیاز"],
    calories: 585,
    protein: 29,
    fiber: 18,
    prep: 45,
    batchFriendly: true,
    allergens: ["gluten"],
    styles: ["balanced", "vegetarian"],
  },
  {
    id: "chicken-potato-salad",
    slot: "dinner",
    title: "سالاد مرغ و سیب‌زمینی",
    serving: "۱۲۰ گرم مرغ + سیب‌زمینی کوچک + کاهو و خیار",
    ingredients: ["مرغ", "سیب‌زمینی", "کاهو", "خیار", "گوجه", "لیمو"],
    calories: 485,
    protein: 41,
    fiber: 8,
    prep: 22,
    batchFriendly: true,
    allergens: [],
    styles: ["balanced", "mediterranean", "highProtein"],
  },
  {
    id: "pinto-bean-stew",
    slot: "dinner",
    title: "خوراک لوبیا چیتی و قارچ",
    serving: "۱٫۵ پیمانه خوراک لوبیا + سبزی تازه",
    ingredients: ["لوبیا چیتی", "قارچ", "گوجه", "کرفس", "لیمو"],
    calories: 470,
    protein: 25,
    fiber: 17,
    prep: 25,
    batchFriendly: true,
    allergens: [],
    styles: allStyles,
  },
  {
    id: "herb-kuku",
    slot: "dinner",
    title: "کوکوی سبزی در فر و ماست",
    serving: "۲ برش کوکو + ½ پیمانه ماست + گوجه",
    ingredients: ["تخم‌مرغ", "سبزی کوکو", "ماست", "گوجه", "خیار"],
    calories: 465,
    protein: 28,
    fiber: 7,
    prep: 30,
    batchFriendly: true,
    allergens: ["egg", "dairy"],
    styles: ["balanced", "vegetarian", "highProtein"],
  },
  {
    id: "chickpea-salad",
    slot: "dinner",
    title: "سالاد نخود و سبزیجات",
    serving: "۱ پیمانه نخود + ۲ پیمانه سبزیجات + روغن زیتون",
    ingredients: ["نخود", "خیار", "گوجه", "کاهو", "جعفری", "روغن زیتون"],
    calories: 460,
    protein: 21,
    fiber: 15,
    prep: 12,
    batchFriendly: true,
    allergens: [],
    styles: ["vegetarian", "mediterranean"],
  },
  {
    id: "red-lentil-soup",
    slot: "dinner",
    title: "سوپ عدس قرمز و سبزیجات",
    serving: "۲ پیمانه سوپ + ۱ کف دست نان سبوس‌دار",
    ingredients: ["عدس قرمز", "هویج", "گوجه", "کرفس", "نان سبوس‌دار"],
    calories: 455,
    protein: 24,
    fiber: 14,
    prep: 25,
    batchFriendly: true,
    allergens: ["gluten"],
    styles: allStyles,
  },
  {
    id: "fish-green-salad",
    slot: "dinner",
    title: "ماهی و سالاد سبز",
    serving: "۱۴۰ گرم ماهی + سالاد بزرگ + سیب‌زمینی کوچک",
    ingredients: ["ماهی", "کاهو", "خیار", "کلم", "سیب‌زمینی", "لیمو"],
    calories: 480,
    protein: 42,
    fiber: 9,
    prep: 25,
    batchFriendly: false,
    allergens: ["fish"],
    styles: ["mediterranean", "highProtein"],
  },
  {
    id: "eggplant-yogurt",
    slot: "dinner",
    title: "بادمجان کبابی، ماست و عدس",
    serving: "۱ بادمجان متوسط + ¾ پیمانه عدس + ½ پیمانه ماست",
    ingredients: ["بادمجان", "عدس", "ماست", "گوجه", "نعنا"],
    calories: 450,
    protein: 26,
    fiber: 13,
    prep: 25,
    batchFriendly: true,
    allergens: ["dairy"],
    styles: ["vegetarian", "mediterranean"],
  },
  {
    id: "chicken-wrap",
    slot: "dinner",
    title: "رپ مرغ و سبزیجات",
    serving: "۱ نان لواش سبوس‌دار + ۱۲۰ گرم مرغ + سبزیجات",
    ingredients: ["مرغ", "نان لواش", "کاهو", "گوجه", "فلفل دلمه"],
    calories: 490,
    protein: 39,
    fiber: 8,
    prep: 15,
    batchFriendly: true,
    allergens: ["gluten"],
    styles: ["balanced", "highProtein"],
  },
  {
    id: "mushroom-egg-pan",
    slot: "dinner",
    title: "تابه قارچ، تخم‌مرغ و اسفناج",
    serving: "۲ تخم‌مرغ + قارچ و اسفناج + سیب‌زمینی کوچک",
    ingredients: ["تخم‌مرغ", "قارچ", "اسفناج", "سیب‌زمینی", "گوجه"],
    calories: 455,
    protein: 27,
    fiber: 8,
    prep: 15,
    batchFriendly: false,
    allergens: ["egg"],
    styles: ["balanced", "vegetarian", "highProtein"],
  },
  {
    id: "spinach-potato-bowl",
    slot: "dinner",
    title: "کاسه اسفناج، سیب‌زمینی و لوبیا",
    serving: "۱ سیب‌زمینی متوسط + ¾ پیمانه لوبیا + اسفناج",
    ingredients: ["اسفناج", "سیب‌زمینی", "لوبیا سفید", "گوجه", "لیمو"],
    calories: 465,
    protein: 23,
    fiber: 15,
    prep: 20,
    batchFriendly: true,
    allergens: [],
    styles: ["vegetarian", "mediterranean"],
  },
  {
    id: "lentil-patties",
    slot: "dinner",
    title: "کتلت عدس تنوری و سالاد",
    serving: "۳ کتلت عدس + سالاد کلم و هویج",
    ingredients: ["عدس", "سیب‌زمینی", "پیاز", "کلم", "هویج"],
    calories: 470,
    protein: 24,
    fiber: 14,
    prep: 30,
    batchFriendly: true,
    allergens: [],
    styles: ["vegetarian", "balanced"],
  },
  {
    id: "tomato-bean-soup",
    slot: "dinner",
    title: "سوپ گوجه، لوبیا و سبزیجات",
    serving: "۲ پیمانه سوپ غلیظ + سبزی خوردن",
    ingredients: ["لوبیا قرمز", "گوجه", "هویج", "کرفس", "جعفری"],
    calories: 445,
    protein: 24,
    fiber: 16,
    prep: 28,
    batchFriendly: true,
    allergens: [],
    styles: allStyles,
  },
  {
    id: "apple-cucumber",
    slot: "snack",
    title: "سیب و خیار",
    serving: "۱ سیب متوسط + ۱ خیار",
    ingredients: ["سیب", "خیار"],
    calories: 125,
    protein: 2,
    fiber: 5,
    prep: 2,
    batchFriendly: true,
    allergens: [],
    styles: allStyles,
  },
  {
    id: "yogurt-berry",
    slot: "snack",
    title: "ماست و میوه",
    serving: "¾ پیمانه ماست + ۱ میوه کوچک + دارچین",
    ingredients: ["ماست", "میوه فصل", "دارچین"],
    calories: 155,
    protein: 10,
    fiber: 3,
    prep: 3,
    batchFriendly: false,
    allergens: ["dairy"],
    styles: allStyles,
  },
  {
    id: "date-walnut",
    slot: "snack",
    title: "خرما و گردو",
    serving: "۲ خرما + ۲ نیمه گردو",
    ingredients: ["خرما", "گردو"],
    calories: 165,
    protein: 4,
    fiber: 3,
    prep: 1,
    batchFriendly: true,
    allergens: ["nuts"],
    styles: allStyles,
  },
  {
    id: "roasted-chickpea",
    slot: "snack",
    title: "نخود برشته",
    serving: "½ پیمانه نخود برشته با ادویه",
    ingredients: ["نخود", "پاپریکا", "لیمو"],
    calories: 155,
    protein: 8,
    fiber: 6,
    prep: 5,
    batchFriendly: true,
    allergens: [],
    styles: allStyles,
  },
  {
    id: "egg-carrot",
    slot: "snack",
    title: "تخم‌مرغ و هویج",
    serving: "۱ تخم‌مرغ آب‌پز + ۱ هویج",
    ingredients: ["تخم‌مرغ", "هویج"],
    calories: 135,
    protein: 8,
    fiber: 3,
    prep: 4,
    batchFriendly: true,
    allergens: ["egg"],
    styles: ["balanced", "vegetarian", "highProtein"],
  },
  {
    id: "milk-banana",
    slot: "snack",
    title: "شیر و موز کوچک",
    serving: "۱ پیمانه شیر + ½ موز",
    ingredients: ["شیر", "موز"],
    calories: 170,
    protein: 9,
    fiber: 2,
    prep: 2,
    batchFriendly: false,
    allergens: ["dairy"],
    styles: allStyles,
  },
  {
    id: "hummus-vegetables",
    slot: "snack",
    title: "حمص و سبزیجات خام",
    serving: "¼ پیمانه حمص + خیار و هویج",
    ingredients: ["نخود", "ارده", "خیار", "هویج"],
    calories: 150,
    protein: 6,
    fiber: 5,
    prep: 4,
    batchFriendly: true,
    allergens: [],
    styles: allStyles,
  },
  {
    id: "herb-popcorn",
    slot: "snack",
    title: "ذرت بوداده خانگی",
    serving: "۳ پیمانه ذرت بوداده با ادویه",
    ingredients: ["ذرت", "پاپریکا"],
    calories: 135,
    protein: 4,
    fiber: 4,
    prep: 6,
    batchFriendly: false,
    allergens: [],
    styles: allStyles,
  },
  {
    id: "pear-almond",
    slot: "snack",
    title: "گلابی و بادام",
    serving: "۱ گلابی کوچک + ۸ عدد بادام",
    ingredients: ["گلابی", "بادام"],
    calories: 165,
    protein: 4,
    fiber: 6,
    prep: 1,
    batchFriendly: true,
    allergens: ["nuts"],
    styles: allStyles,
  },
  {
    id: "cheese-cucumber",
    slot: "snack",
    title: "پنیر و خیار",
    serving: "۳۰ گرم پنیر + خیار و گوجه گیلاسی",
    ingredients: ["پنیر", "خیار", "گوجه"],
    calories: 145,
    protein: 9,
    fiber: 2,
    prep: 3,
    batchFriendly: false,
    allergens: ["dairy"],
    styles: ["balanced", "vegetarian", "highProtein"],
  },
  {
    id: "orange-pistachio",
    slot: "snack",
    title: "پرتقال و پسته",
    serving: "۱ پرتقال + ۱۰ عدد پسته",
    ingredients: ["پرتقال", "پسته"],
    calories: 160,
    protein: 5,
    fiber: 5,
    prep: 1,
    batchFriendly: true,
    allergens: ["nuts"],
    styles: allStyles,
  },
  {
    id: "fruit-plate",
    slot: "snack",
    title: "بشقاب میوه فصل",
    serving: "۲ سهم کوچک از دو میوه متفاوت",
    ingredients: ["میوه فصل"],
    calories: 140,
    protein: 2,
    fiber: 5,
    prep: 3,
    batchFriendly: true,
    allergens: [],
    styles: allStyles,
  },
];

const exchangeGroups = [
  {
    title: "غلات و نشاسته",
    color: "lime",
    items: ["¼ نان سنگک", "۶ قاشق برنج پخته", "۱ سیب‌زمینی متوسط", "½ پیمانه بلغور"],
    note: "هر بار یکی را انتخاب کن.",
  },
  {
    title: "پروتئین اصلی",
    color: "navy",
    items: ["۱۲۰ گرم مرغ", "۱۴۰ گرم ماهی", "۱ پیمانه حبوبات", "۱۵۰ گرم توفو"],
    note: "روش پخت کم‌روغن بماند.",
  },
  {
    title: "میان‌وعده",
    color: "coral",
    items: ["۱ میوه + ۸ بادام", "¾ پیمانه ماست", "½ پیمانه نخود برشته", "۱ تخم‌مرغ + سبزی"],
    note: "یک گزینه، نه همه گزینه‌ها.",
  },
  {
    title: "چربی مفید",
    color: "mint",
    items: ["۱ قاشق روغن زیتون", "۲ نیمه گردو", "۱ قاشق ارده", "۱۰ عدد پسته"],
    note: "سهم کوچک و اندازه‌گیری‌شده.",
  },
];

const sourceCards = [
  {
    tag: "فرمول انرژی",
    title: "Mifflin–St Jeor",
    copy: "سوخت‌وساز استراحت از سن، قد، وزن و جنسیت برآورد می‌شود و سپس ضریب فعالیت اعمال می‌گردد.",
    href: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
  },
  {
    tag: "کیفیت الگو",
    title: "راهنمای تغذیه سالم WHO",
    copy: "حداقل ۴۰۰ گرم میوه و سبزی و دست‌کم ۲۵ گرم فیبر طبیعی در روز، پایه کیفیت برنامه است.",
    href: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
  },
  {
    tag: "ریتم کاهش",
    title: "کاهش تدریجی CDC",
    copy: "هدف‌گذاری آهسته و پیوسته، نسبت به کاهش سریع، احتمال حفظ نتیجه را بیشتر می‌کند.",
    href: "https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html",
  },
  {
    tag: "پروتئین",
    title: "مرور پژوهش‌های مدیریت وزن",
    copy: "پروتئین بیشتر در محدوده منطقی می‌تواند به سیری و حفظ توده بدون چربی کمک کند.",
    href: "https://pubmed.ncbi.nlm.nih.gov/25926512/",
  },
];

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="نشان میزانه"
    >
      <path
        d="M10 34h44c-1.8 12.7-10.5 20-22 20S11.8 46.7 10 34Z"
        fill="currentColor"
      />
      <path
        d="M17 34c2-8.2 7-12.3 15-12.3S45 25.8 47 34"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M33.8 20.7C34.2 11.7 40.2 7 50 8.3c-.9 8.4-6.2 12.6-16.2 12.4Z"
        fill="#9dd24b"
      />
      <path
        d="M29.8 20.5c-1.1-6.7-5.4-10.1-12.9-10.3.2 6.8 4.5 10.3 12.9 10.3Z"
        fill="#ff6b55"
      />
      <path d="M18 58h28" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

function toNumber(value: string) {
  return Number(
    value.replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
    ),
  );
}

function formatNumber(value: number) {
  return numberFormatter.format(Math.round(value));
}

function formatDecimal(value: number) {
  return decimalFormatter.format(value);
}

function roundTo(value: number, increment: number) {
  return Math.round(value / increment) * increment;
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return "کمتر از محدوده مرجع";
  if (bmi < 25) return "محدوده مرجع";
  if (bmi < 30) return "بالاتر از محدوده مرجع";
  return "نیازمند توجه بیشتر";
}

function calculateMetrics(form: PlannerForm): Metrics {
  const age = toNumber(form.age);
  const height = toNumber(form.height);
  const weight = toNumber(form.weight);
  const targetWeight = toNumber(form.targetWeight);
  const activityFactor =
    activityOptions.find((option) => option.id === form.activity)?.factor ?? 1.2;
  const bmr = Math.round(
    10 * weight + 6.25 * height - 5 * age + (form.sex === "male" ? 5 : -161),
  );
  const tdee = Math.round(bmr * activityFactor);
  const desiredDeficit = (Number(form.pace) * 7700) / 7;
  const safeDeficit = Math.min(desiredDeficit, tdee * 0.2);
  const calorieFloor = form.sex === "male" ? 1500 : 1200;
  const targetCalories = Math.max(
    calorieFloor,
    roundTo(tdee - safeDeficit, 25),
  );
  const actualDeficit = Math.max(0, tdee - targetCalories);
  const weeklyPace = (actualDeficit * 7) / 7700;
  const proteinPerKg = form.dietStyle === "highProtein" ? 1.6 : 1.35;
  const protein = Math.round(
    Math.min(
      (targetCalories * 0.31) / 4,
      Math.max(targetWeight * proteinPerKg, (targetCalories * 0.22) / 4),
    ),
  );
  const fatRatio = form.dietStyle === "mediterranean" ? 0.34 : 0.3;
  const fat = Math.round((targetCalories * fatRatio) / 9);
  const carbs = Math.max(
    80,
    Math.round((targetCalories - protein * 4 - fat * 9) / 4),
  );
  const bmi = weight / (height / 100) ** 2;

  return {
    bmr,
    tdee,
    targetCalories,
    bmi,
    bmiLabel: bmiLabel(bmi),
    protein,
    carbs,
    fat,
    fiber: Math.max(25, Math.round((targetCalories / 1000) * 14)),
    weeklyPace,
    estimatedWeeks:
      targetWeight < weight && weeklyPace > 0
        ? Math.ceil((weight - targetWeight) / weeklyPace)
        : 0,
    deficit: actualDeficit,
    produceGrams: 400,
    waterLiters: form.sex === "male" ? 2.5 : 2,
  };
}

function getSlotShares(form: PlannerForm) {
  let breakfast = form.meals === "5" ? 0.22 : form.meals === "4" ? 0.24 : 0.28;
  let lunch = form.meals === "5" ? 0.34 : form.meals === "4" ? 0.36 : 0.4;
  let dinner = form.meals === "5" ? 0.26 : form.meals === "4" ? 0.3 : 0.32;
  const snackTotal = Math.max(0, 1 - breakfast - lunch - dinner);

  if (form.hungerPeak === "morning") {
    breakfast += 0.04;
    dinner -= 0.03;
    lunch -= 0.01;
  } else if (form.hungerPeak === "afternoon") {
    lunch += 0.03;
    breakfast -= 0.02;
    dinner -= 0.01;
  } else {
    dinner += 0.04;
    breakfast -= 0.03;
    lunch -= 0.01;
  }

  return { breakfast, lunch, dinner, snackTotal };
}

function getDaySlots(form: PlannerForm) {
  const shares = getSlotShares(form);
  const slots: Array<{ slot: MealSlot; label: string; share: number }> = [
    { slot: "breakfast", label: "صبحانه", share: shares.breakfast },
  ];

  if (form.meals === "5") {
    slots.push({
      slot: "snack",
      label: "میان‌وعده صبح",
      share: shares.snackTotal / 2,
    });
  }

  slots.push({ slot: "lunch", label: "ناهار", share: shares.lunch });

  if (form.meals !== "3") {
    slots.push({
      slot: "snack",
      label: "میان‌وعده عصر",
      share: form.meals === "5" ? shares.snackTotal / 2 : shares.snackTotal,
    });
  }

  slots.push({ slot: "dinner", label: "شام", share: shares.dinner });
  return slots;
}

function hashValue(value: string) {
  return Array.from(value).reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) % 1009,
    17,
  );
}

function dislikeTokens(value: string) {
  return value
    .split(/[،,\s]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1);
}

function portionCue(scale: number) {
  if (scale < 0.84) return "سهم غله یا سیب‌زمینی را کمی کمتر کن.";
  if (scale > 1.18) return "یک سهم کوچک غله یا پروتئین اضافه کن.";
  return "همان سهم نوشته‌شده مناسب است.";
}

function buildWeeklyPlan(
  form: PlannerForm,
  metrics: Metrics,
  mode: PlanMode,
  variationSeed: number,
): DayPlan[] {
  const used = new Map<MealSlot, Set<string>>([
    ["breakfast", new Set()],
    ["snack", new Set()],
    ["lunch", new Set()],
    ["dinner", new Set()],
  ]);
  const disliked = dislikeTokens(form.dislikes);
  const slots = getDaySlots(form);

  return days.map((day, dayIndex) => {
    const plannedMeals = slots.map((slot, slotIndex) => {
      const targetCalories = Math.round(metrics.targetCalories * slot.share);
      const filtered = mealTemplates
        .filter((meal) => meal.slot === slot.slot)
        .filter((meal) => meal.styles.includes(form.dietStyle))
        .filter(
          (meal) =>
            !meal.allergens.some((allergen) =>
              form.allergies.includes(allergen),
            ),
        )
        .filter(
          (meal) =>
            slot.slot === "snack" ||
            meal.prep <= Number(form.cookingTime) + 10,
        )
        .filter((meal) => {
          if (
            slot.slot === "breakfast" &&
            form.breakfastTaste !== "both" &&
            meal.breakfastTaste !== form.breakfastTaste
          ) {
            return false;
          }
          return !disliked.some((token) =>
            `${meal.title} ${meal.ingredients.join(" ")}`.includes(token),
          );
        });

      const allergySafe = mealTemplates
        .filter((meal) => meal.slot === slot.slot)
        .filter(
          (meal) =>
            !meal.allergens.some((allergen) =>
              form.allergies.includes(allergen),
            ),
        )
        .filter(
          (meal) =>
            !disliked.some((token) =>
              `${meal.title} ${meal.ingredients.join(" ")}`.includes(token),
            ),
        );

      const candidates = filtered.length > 0 ? filtered : allergySafe;
      const ranked = [...candidates].sort((a, b) => {
        const score = (meal: MealTemplate) => {
          let result = Math.abs(meal.calories - targetCalories);
          if (used.get(slot.slot)?.has(meal.id)) result += 2500;
          if (mode === "quick") result += meal.prep * 22;
          if (mode === "batch" && !meal.batchFriendly) result += 900;
          if (mode === "protein") {
            result -= (meal.protein / meal.calories) * 3600;
          }
          if (form.mealPrep === "batch" && !meal.batchFriendly) result += 500;
          if (form.dayPattern === "office" && slot.slot === "snack") {
            result += meal.prep * 12;
          }
          result +=
            (hashValue(
              `${meal.id}-${dayIndex}-${slotIndex}-${variationSeed}`,
            ) %
              140) -
            70;
          return result;
        };
        return score(a) - score(b);
      });

      const selected =
        ranked[0] ??
        mealTemplates.find(
          (meal) => meal.slot === slot.slot && meal.allergens.length === 0,
        ) ??
        mealTemplates[0];
      used.get(slot.slot)?.add(selected.id);
      const scale = Math.min(
        1.35,
        Math.max(0.7, targetCalories / selected.calories),
      );

      return {
        ...selected,
        displaySlot: slot.label,
        targetCalories,
        targetProtein: Math.round(selected.protein * scale),
        targetFiber: Math.round(selected.fiber * scale),
        portionCue: portionCue(scale),
      };
    });

    return {
      ...day,
      meals: plannedMeals,
      calories: plannedMeals.reduce(
        (total, meal) => total + meal.targetCalories,
        0,
      ),
      protein: plannedMeals.reduce(
        (total, meal) => total + meal.targetProtein,
        0,
      ),
      fiber: plannedMeals.reduce(
        (total, meal) => total + meal.targetFiber,
        0,
      ),
    };
  });
}

function getMeal(day: DayPlan, slot: MealSlot, occurrence = 0) {
  return day.meals.filter((meal) => meal.slot === slot)[occurrence];
}

function categoryForIngredient(ingredient: string) {
  const proteins = [
    "مرغ",
    "ماهی",
    "گوشت",
    "بوقلمون",
    "تخم‌مرغ",
    "توفو",
    "سویا",
    "ماست",
    "شیر",
    "پنیر",
  ];
  const grains = [
    "برنج",
    "نان",
    "جو",
    "بلغور",
    "سیب‌زمینی",
    "ذرت",
  ];
  const legumes = ["عدس", "نخود", "لوبیا"];
  const fats = [
    "گردو",
    "بادام",
    "پسته",
    "ارده",
    "روغن زیتون",
    "تخم کتان",
  ];
  const pantry = [
    "دارچین",
    "پاپریکا",
    "زعفران",
    "زردچوبه",
    "لیمو عمانی",
  ];

  if (proteins.some((item) => ingredient.includes(item))) return "protein";
  if (grains.some((item) => ingredient.includes(item))) return "grain";
  if (legumes.some((item) => ingredient.includes(item))) return "legume";
  if (fats.some((item) => ingredient.includes(item))) return "fat";
  if (pantry.some((item) => ingredient.includes(item))) return "pantry";
  return "produce";
}

function buildShoppingGroups(weeklyPlan: DayPlan[]): ShoppingGroup[] {
  const buckets: Record<string, Set<string>> = {
    produce: new Set(),
    protein: new Set(),
    legume: new Set(),
    grain: new Set(),
    fat: new Set(),
    pantry: new Set(),
  };

  weeklyPlan
    .flatMap((day) => day.meals)
    .flatMap((meal) => meal.ingredients)
    .forEach((ingredient) => {
      buckets[categoryForIngredient(ingredient)].add(ingredient);
    });

  return [
    {
      title: "سبزی و میوه",
      tone: "lime",
      items: [...buckets.produce].sort(),
    },
    {
      title: "منابع پروتئین",
      tone: "navy",
      items: [...buckets.protein].sort(),
    },
    {
      title: "حبوبات",
      tone: "coral",
      items: [...buckets.legume].sort(),
    },
    {
      title: "غلات و نشاسته",
      tone: "sand",
      items: [...buckets.grain].sort(),
    },
    {
      title: "چربی‌های مفید",
      tone: "mint",
      items: [...buckets.fat].sort(),
    },
    {
      title: "چاشنی‌های پایه",
      tone: "sky",
      items: [...buckets.pantry].sort(),
    },
  ].filter((group) => group.items.length > 0);
}

function getValidationMessage(form: PlannerForm, step: number) {
  const age = toNumber(form.age);
  const height = toNumber(form.height);
  const weight = toNumber(form.weight);
  const targetWeight = toNumber(form.targetWeight);

  if (step === 1) {
    if (!Number.isFinite(age) || age < 18 || age > 80) {
      return "سن را بین ۱۸ تا ۸۰ سال وارد کن.";
    }
    if (!Number.isFinite(height) || height < 130 || height > 220) {
      return "قد را بین ۱۳۰ تا ۲۲۰ سانتی‌متر وارد کن.";
    }
    if (!Number.isFinite(weight) || weight < 40 || weight > 250) {
      return "وزن را بین ۴۰ تا ۲۵۰ کیلوگرم وارد کن.";
    }
    if (weight / (height / 100) ** 2 < 18.5) {
      return "این ابزار برای کاهش وزن در BMI کمتر از ۱۸٫۵ برنامه تولید نمی‌کند.";
    }
  }

  if (step === 2) {
    if (
      !Number.isFinite(targetWeight) ||
      targetWeight < 40 ||
      targetWeight >= weight
    ) {
      return "وزن هدف باید کمتر از وزن فعلی و حداقل ۴۰ کیلوگرم باشد.";
    }
    if (targetWeight / (height / 100) ** 2 < 18.5) {
      return "وزن هدف انتخاب‌شده پایین‌تر از محدوده BMI مرجع است.";
    }
  }

  if (step === 4 && form.dislikes.length > 100) {
    return "فهرست غذاهای نامطلوب را کوتاه‌تر از ۱۰۰ نویسه بنویس.";
  }

  return "";
}

function dayPatternLabel(value: DayPattern) {
  return (
    {
      regular: "روز منظم",
      office: "محیط کار",
      shift: "شیفت متغیر",
      home: "بیشتر در خانه",
    } as const
  )[value];
}

function prepLabel(value: MealPrep) {
  return (
    {
      daily: "پخت روزانه",
      batch: "آماده‌سازی جمعی",
      mixed: "ترکیبی",
    } as const
  )[value];
}

function sleepLabel(value: SleepLevel) {
  return (
    {
      under6: "کمتر از ۶ ساعت",
      "6to7": "۶ تا ۷ ساعت",
      "7plus": "۷ ساعت یا بیشتر",
    } as const
  )[value];
}

function waterLabel(value: WaterLevel) {
  return (
    {
      low: "نیاز به نظم بیشتر",
      medium: "نسبتاً منظم",
      good: "عادت منظم",
    } as const
  )[value];
}

export default function DietPlanner() {
  const [form, setForm] = useState<PlannerForm>(defaultForm);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [submittedForm, setSubmittedForm] = useState<PlannerForm | null>(null);
  const [planMode, setPlanMode] = useState<PlanMode>("variety");
  const [variationSeed, setVariationSeed] = useState(1);
  const [activeDay, setActiveDay] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const resultsRef = useRef<HTMLElement>(null);

  const previewMetrics = useMemo(() => calculateMetrics(form), [form]);
  const activeForm = submittedForm ?? form;
  const weeklyPlan = useMemo(
    () =>
      metrics
        ? buildWeeklyPlan(activeForm, metrics, planMode, variationSeed)
        : [],
    [activeForm, metrics, planMode, variationSeed],
  );
  const shoppingGroups = useMemo(
    () => buildShoppingGroups(weeklyPlan),
    [weeklyPlan],
  );
  const selectedDay = weeklyPlan[activeDay];
  const projection = useMemo(() => {
    if (!metrics || !submittedForm) return [];
    const start = toNumber(submittedForm.weight);
    const target = toNumber(submittedForm.targetWeight);
    return [0, 4, 8, 12].map((week) => ({
      week,
      weight: Math.max(target, start - metrics.weeklyPace * week),
    }));
  }, [metrics, submittedForm]);

  function updateForm<K extends keyof PlannerForm>(
    key: K,
    value: PlannerForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function toggleAllergy(allergy: Allergy) {
    updateForm(
      "allergies",
      form.allergies.includes(allergy)
        ? form.allergies.filter((item) => item !== allergy)
        : [...form.allergies, allergy],
    );
  }

  function nextStep() {
    const validationMessage = getValidationMessage(form, step);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setStep((current) => Math.min(4, current + 1));
    setError("");
  }

  function generatePlan() {
    const validationMessage =
      getValidationMessage(form, 1) ||
      getValidationMessage(form, 2) ||
      getValidationMessage(form, 3) ||
      getValidationMessage(form, 4);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const calculated = calculateMetrics(form);
    const preferredMode: PlanMode =
      form.cookingTime === "15"
        ? "quick"
        : form.mealPrep === "batch"
          ? "batch"
          : form.dietStyle === "highProtein"
            ? "protein"
            : "variety";

    setMetrics(calculated);
    setSubmittedForm({ ...form, allergies: [...form.allergies] });
    setPlanMode(preferredMode);
    setVariationSeed((current) => current + 1);
    setActiveDay(0);
    setError("");
    window.setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4) nextStep();
    else generatePlan();
  }

  function planAsText() {
    if (!metrics || !submittedForm) return "";
    const lines = [
      "برنامه هفتگی میزانه",
      `هدف روزانه: ${formatNumber(metrics.targetCalories)} کیلوکالری`,
      `پروتئین: ${formatNumber(metrics.protein)} گرم`,
      "",
      ...weeklyPlan.flatMap((day) => [
        day.label,
        ...day.meals.map(
          (meal) =>
            `${meal.displaySlot}: ${meal.title} — ${meal.serving}`,
        ),
        "",
      ]),
    ];
    return lines.join("\n");
  }

  function downloadPlan() {
    const blob = new Blob([planAsText()], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "barname-haftegi-mizaneh.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copyShoppingList() {
    const text = shoppingGroups
      .flatMap((group) => [
        group.title,
        ...group.items.map((item) => `• ${item}`),
        "",
      ])
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("done");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("idle");
    }
  }

  return (
    <main className="site-shell">
      <header className="topbar" aria-label="ناوبری اصلی">
        <a className="brand" href="#top" aria-label="میزانه، صفحه نخست">
          <BrandMark className="brand-logo" />
          <span>
            <strong>میزانه</strong>
            <small>برنامه غذایی علمی</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="بخش‌های سایت">
          <a href="#calculator">محاسبه‌گر</a>
          <a href="#weekly-plan">برنامه هفتگی</a>
          <a href="#method">روش علمی</a>
          <a href="#guide">راهنما</a>
        </nav>

        <a className="header-action" href="#calculator">
          شروع برنامه
          <span aria-hidden="true">←</span>
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            <span aria-hidden="true">●</span>
            ریتم سالم، داده‌های روشن
          </p>
          <h1>
            برنامه غذایی
            <br />
            <em>متعادل</em> و هفتگی
          </h1>
          <p className="hero-lead">
            از محاسبه نیاز روزانه تا هفت روز وعده متنوع، فهرست خرید،
            آماده‌سازی و جایگزین‌های هم‌گروه؛ همه‌چیز روشن و قابل اجراست.
          </p>
          <div className="hero-actions">
            <a className="primary-cta" href="#calculator">
              برنامه من را بساز
              <span aria-hidden="true">←</span>
            </a>
            <a className="text-link" href="#method">
              روش محاسبه را ببین
            </a>
          </div>

          <div className="hero-metrics" aria-label="پیش‌نمایش محاسبه">
            <div>
              <span>هدف روزانه</span>
              <strong>{formatNumber(previewMetrics.targetCalories)}</strong>
              <small>کیلوکالری</small>
            </div>
            <div>
              <span>پروتئین</span>
              <strong>{formatNumber(previewMetrics.protein)}</strong>
              <small>گرم</small>
            </div>
            <div>
              <span>فیبر</span>
              <strong>{formatNumber(previewMetrics.fiber)}</strong>
              <small>گرم</small>
            </div>
          </div>

          <div className="calligraphy-card" aria-label="شعار میزانه">
            <BrandMark className="calligraphy-logo" />
            <p className="nastaliq">به‌اندازه، به‌موقع، با آگاهی</p>
            <small>برنامه‌ای که با زندگی واقعی هماهنگ می‌شود.</small>
          </div>
        </div>

        <form
          className="calculator-card"
          id="calculator"
          aria-labelledby="calculator-title"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="calculator-heading">
            <div>
              <span className="step-label">
                مرحله {formatNumber(step)} از ۴
              </span>
              <h2 id="calculator-title">{stepTitles[step - 1]}</h2>
            </div>
            <span className="privacy-note">بدون ذخیره اطلاعات</span>
          </div>

          <ol className="stepper" aria-label="مراحل ساخت برنامه">
            {[1, 2, 3, 4].map((item) => (
              <li
                className={
                  item === step
                    ? "is-active"
                    : item < step
                      ? "is-complete"
                      : ""
                }
                key={item}
              >
                <span>{formatNumber(item)}</span>
              </li>
            ))}
          </ol>

          <div className="wizard-panel" key={step}>
            {step === 1 && (
              <>
                <div className="field-grid field-grid--three">
                  <label>
                    <span>سن</span>
                    <span className="input-wrap">
                      <input
                        type="number"
                        min="18"
                        max="80"
                        value={form.age}
                        onChange={(event) => updateForm("age", event.target.value)}
                        inputMode="numeric"
                      />
                      <small>سال</small>
                    </span>
                  </label>
                  <label>
                    <span>قد</span>
                    <span className="input-wrap">
                      <input
                        type="number"
                        min="130"
                        max="220"
                        value={form.height}
                        onChange={(event) =>
                          updateForm("height", event.target.value)
                        }
                        inputMode="numeric"
                      />
                      <small>سانتی‌متر</small>
                    </span>
                  </label>
                  <label>
                    <span>وزن</span>
                    <span className="input-wrap">
                      <input
                        type="number"
                        min="40"
                        max="250"
                        step="0.1"
                        value={form.weight}
                        onChange={(event) =>
                          updateForm("weight", event.target.value)
                        }
                        inputMode="decimal"
                      />
                      <small>کیلوگرم</small>
                    </span>
                  </label>
                </div>

                <fieldset>
                  <legend>جنسیت در فرمول سوخت‌وساز</legend>
                  <div className="segmented segmented--two">
                    {[
                      { id: "female" as const, label: "زن" },
                      { id: "male" as const, label: "مرد" },
                    ].map((option) => (
                      <button
                        className={form.sex === option.id ? "is-selected" : ""}
                        type="button"
                        aria-pressed={form.sex === option.id}
                        onClick={() => updateForm("sex", option.id)}
                        key={option.id}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>میانگین فعالیت هفتگی</legend>
                  <div className="activity-grid">
                    {activityOptions.map((option) => (
                      <button
                        className={
                          form.activity === option.id
                            ? "activity-card is-selected"
                            : "activity-card"
                        }
                        type="button"
                        aria-pressed={form.activity === option.id}
                        onClick={() => updateForm("activity", option.id)}
                        key={option.id}
                      >
                        <strong>{option.label}</strong>
                        <small>{option.note}</small>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 2 && (
              <>
                <div className="field-grid field-grid--two">
                  <label>
                    <span>وزن هدف</span>
                    <span className="input-wrap">
                      <input
                        type="number"
                        min="40"
                        step="0.1"
                        value={form.targetWeight}
                        onChange={(event) =>
                          updateForm("targetWeight", event.target.value)
                        }
                        inputMode="decimal"
                      />
                      <small>کیلوگرم</small>
                    </span>
                  </label>
                  <label>
                    <span>زمان آشپزی هر وعده</span>
                    <span className="select-wrap">
                      <select
                        value={form.cookingTime}
                        onChange={(event) =>
                          updateForm(
                            "cookingTime",
                            event.target.value as PlannerForm["cookingTime"],
                          )
                        }
                      >
                        <option value="15">تا ۱۵ دقیقه</option>
                        <option value="30">تا ۳۰ دقیقه</option>
                        <option value="45">تا ۴۵ دقیقه</option>
                      </select>
                    </span>
                  </label>
                </div>

                <fieldset>
                  <legend>ریتم کاهش دلخواه</legend>
                  <div className="choice-grid choice-grid--three">
                    {(["0.25", "0.5", "0.75"] as const).map((pace) => (
                      <button
                        className={
                          form.pace === pace ? "choice is-selected" : "choice"
                        }
                        type="button"
                        aria-pressed={form.pace === pace}
                        onClick={() => updateForm("pace", pace)}
                        key={pace}
                      >
                        <strong>{pace.replace(".", "٫")} کیلو</strong>
                        <small>در هفته</small>
                      </button>
                    ))}
                  </div>
                  <p className="field-hint">
                    کسری انرژی به حداکثر ۲۰٪ نیاز روزانه محدود می‌شود.
                  </p>
                </fieldset>

                <fieldset>
                  <legend>تعداد وعده‌های روزانه</legend>
                  <div className="segmented segmented--three">
                    {(["3", "4", "5"] as const).map((count) => (
                      <button
                        className={form.meals === count ? "is-selected" : ""}
                        type="button"
                        aria-pressed={form.meals === count}
                        onClick={() => updateForm("meals", count)}
                        key={count}
                      >
                        {formatNumber(Number(count))} وعده
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 3 && (
              <>
                <fieldset className="no-margin">
                  <legend>سبک غذایی</legend>
                  <div className="diet-style-grid">
                    {dietStyles.map((style) => (
                      <button
                        className={
                          form.dietStyle === style.id
                            ? "diet-style is-selected"
                            : "diet-style"
                        }
                        type="button"
                        aria-pressed={form.dietStyle === style.id}
                        onClick={() => updateForm("dietStyle", style.id)}
                        key={style.id}
                      >
                        <span aria-hidden="true">{style.icon}</span>
                        <strong>{style.title}</strong>
                        <small>{style.note}</small>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>حساسیت یا حذف غذایی</legend>
                  <div className="chip-row">
                    {allergyOptions.map((allergy) => (
                      <label className="check-chip" key={allergy.id}>
                        <input
                          type="checkbox"
                          checked={form.allergies.includes(allergy.id)}
                          onChange={() => toggleAllergy(allergy.id)}
                        />
                        <span>{allergy.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="field-grid field-grid--two preference-fields">
                  <label>
                    <span>حال‌وهوای صبحانه</span>
                    <span className="select-wrap">
                      <select
                        value={form.breakfastTaste}
                        onChange={(event) =>
                          updateForm(
                            "breakfastTaste",
                            event.target
                              .value as PlannerForm["breakfastTaste"],
                          )
                        }
                      >
                        <option value="savory">شور و ایرانی</option>
                        <option value="sweet">شیرین و میوه‌ای</option>
                        <option value="both">هر دو</option>
                      </select>
                    </span>
                  </label>
                  <label>
                    <span>الگوی آماده‌سازی</span>
                    <span className="select-wrap">
                      <select
                        value={form.mealPrep}
                        onChange={(event) =>
                          updateForm(
                            "mealPrep",
                            event.target.value as PlannerForm["mealPrep"],
                          )
                        }
                      >
                        <option value="daily">پخت روزانه</option>
                        <option value="batch">آماده‌سازی جمعی</option>
                        <option value="mixed">ترکیبی</option>
                      </select>
                    </span>
                  </label>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="field-grid field-grid--two">
                  <label>
                    <span>الگوی روز</span>
                    <span className="select-wrap">
                      <select
                        value={form.dayPattern}
                        onChange={(event) =>
                          updateForm(
                            "dayPattern",
                            event.target.value as PlannerForm["dayPattern"],
                          )
                        }
                      >
                        <option value="regular">روز منظم</option>
                        <option value="office">محیط کار</option>
                        <option value="shift">شیفت متغیر</option>
                        <option value="home">بیشتر در خانه</option>
                      </select>
                    </span>
                  </label>
                  <label>
                    <span>اوج گرسنگی</span>
                    <span className="select-wrap">
                      <select
                        value={form.hungerPeak}
                        onChange={(event) =>
                          updateForm(
                            "hungerPeak",
                            event.target.value as PlannerForm["hungerPeak"],
                          )
                        }
                      >
                        <option value="morning">صبح</option>
                        <option value="afternoon">ظهر و عصر</option>
                        <option value="night">شب</option>
                      </select>
                    </span>
                  </label>
                  <label>
                    <span>خواب شبانه</span>
                    <span className="select-wrap">
                      <select
                        value={form.sleep}
                        onChange={(event) =>
                          updateForm(
                            "sleep",
                            event.target.value as PlannerForm["sleep"],
                          )
                        }
                      >
                        <option value="under6">کمتر از ۶ ساعت</option>
                        <option value="6to7">۶ تا ۷ ساعت</option>
                        <option value="7plus">۷ ساعت یا بیشتر</option>
                      </select>
                    </span>
                  </label>
                  <label>
                    <span>نظم نوشیدن آب</span>
                    <span className="select-wrap">
                      <select
                        value={form.water}
                        onChange={(event) =>
                          updateForm(
                            "water",
                            event.target.value as PlannerForm["water"],
                          )
                        }
                      >
                        <option value="low">نامنظم</option>
                        <option value="medium">نسبتاً منظم</option>
                        <option value="good">منظم</option>
                      </select>
                    </span>
                  </label>
                </div>

                <label className="wide-field">
                  <span>غذاهایی که نمی‌پسندی (اختیاری)</span>
                  <input
                    type="text"
                    maxLength={100}
                    value={form.dislikes}
                    onChange={(event) =>
                      updateForm("dislikes", event.target.value)
                    }
                    placeholder="مثلاً قارچ، غذای تند، بادمجان"
                  />
                </label>

                <div className="review-card">
                  <div>
                    <span>نیاز نگهدارنده</span>
                    <strong>{formatNumber(previewMetrics.tdee)}</strong>
                  </div>
                  <div>
                    <span>هدف روزانه</span>
                    <strong>{formatNumber(previewMetrics.targetCalories)}</strong>
                  </div>
                  <div>
                    <span>زمان تخمینی</span>
                    <strong>
                      {previewMetrics.estimatedWeeks
                        ? `${formatNumber(previewMetrics.estimatedWeeks)} هفته`
                        : "—"}
                    </strong>
                  </div>
                </div>

                <p className="form-note">
                  خروجی برای برنامه‌ریزی غذایی بزرگسالان سالم طراحی شده است.
                </p>
              </>
            )}
          </div>

          <p className="form-error" role="alert" aria-live="polite">
            {error}
          </p>

          <div className="form-nav">
            {step > 1 && (
              <button
                className="back-button"
                type="button"
                onClick={() => {
                  setStep((current) => Math.max(1, current - 1));
                  setError("");
                }}
              >
                بازگشت
              </button>
            )}
            <button className="continue-button" type="submit">
              {step === 4 ? "ساخت برنامه هفتگی" : "ادامه"}
              <span aria-hidden="true">←</span>
            </button>
          </div>
        </form>
      </section>

      {metrics && submittedForm && (
        <section
          className="results-section"
          id="results"
          ref={resultsRef}
          aria-labelledby="results-title"
        >
          <div className="section-wrap">
            <div className="result-hero">
              <div>
                <p className="section-kicker">نسخه شخصی شما</p>
                <h2 id="results-title">هفت روز روشن و قابل اجرا</h2>
                <p>
                  برنامه براساس هدف انرژی، سبک غذایی، حساسیت‌ها، زمان آشپزی و
                  ریتم گرسنگی شما چیده شده است.
                </p>
              </div>
              <div className="result-actions">
                <button type="button" onClick={() => window.print()}>
                  چاپ یا ذخیره
                  <span aria-hidden="true">↗</span>
                </button>
                <button type="button" onClick={downloadPlan}>
                  دریافت متن برنامه
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </div>

            <article className="result-block numbers-block">
              <div className="block-heading">
                <span>۰۱</span>
                <div>
                  <p>محاسبه نیاز روزانه</p>
                  <h3>اعداد پایه و قابل توضیح</h3>
                </div>
              </div>

              <div className="metric-grid">
                <div>
                  <span>سوخت‌وساز استراحت</span>
                  <strong>{formatNumber(metrics.bmr)}</strong>
                  <small>کیلوکالری</small>
                </div>
                <div>
                  <span>نیاز نگهدارنده</span>
                  <strong>{formatNumber(metrics.tdee)}</strong>
                  <small>کیلوکالری</small>
                </div>
                <div className="metric-primary">
                  <span>هدف روزانه</span>
                  <strong>{formatNumber(metrics.targetCalories)}</strong>
                  <small>کیلوکالری</small>
                </div>
                <div>
                  <span>BMI فعلی</span>
                  <strong>{formatDecimal(metrics.bmi)}</strong>
                  <small>{metrics.bmiLabel}</small>
                </div>
              </div>

              <div className="equation-strip">
                <span>
                  کسری روزانه <strong>{formatNumber(metrics.deficit)}</strong>
                </span>
                <span>
                  ریتم هفتگی{" "}
                  <strong>{formatDecimal(metrics.weeklyPace)} کیلوگرم</strong>
                </span>
                <span>
                  زمان تخمینی{" "}
                  <strong>{formatNumber(metrics.estimatedWeeks)} هفته</strong>
                </span>
              </div>
            </article>

            <article className="result-block nutrition-block">
              <div className="block-heading">
                <span>۰۲</span>
                <div>
                  <p>هدف‌های تغذیه‌ای</p>
                  <h3>ترکیب روزانه، نه فقط یک عدد</h3>
                </div>
              </div>

              <div className="nutrition-grid">
                <div className="macro-card macro-card--protein">
                  <span>پروتئین</span>
                  <strong>{formatNumber(metrics.protein)} گرم</strong>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.protein * 4 * 100) /
                            metrics.targetCalories,
                        )}%`,
                      }}
                    />
                  </div>
                  <small>پخش‌شده میان وعده‌ها</small>
                </div>
                <div className="macro-card macro-card--carb">
                  <span>کربوهیدرات</span>
                  <strong>{formatNumber(metrics.carbs)} گرم</strong>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.carbs * 4 * 100) / metrics.targetCalories,
                        )}%`,
                      }}
                    />
                  </div>
                  <small>با اولویت غلات کامل</small>
                </div>
                <div className="macro-card macro-card--fat">
                  <span>چربی</span>
                  <strong>{formatNumber(metrics.fat)} گرم</strong>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.fat * 9 * 100) / metrics.targetCalories,
                        )}%`,
                      }}
                    />
                  </div>
                  <small>با اولویت چربی غیراشباع</small>
                </div>
              </div>

              <div className="quality-targets">
                <div>
                  <span aria-hidden="true">◉</span>
                  <strong>{formatNumber(metrics.fiber)} گرم فیبر</strong>
                  <small>حبوبات، سبزی، میوه و غلات کامل</small>
                </div>
                <div>
                  <span aria-hidden="true">✦</span>
                  <strong>{formatNumber(metrics.produceGrams)} گرم گیاه</strong>
                  <small>حداقل پنج سهم میوه و سبزی</small>
                </div>
                <div>
                  <span aria-hidden="true">≈</span>
                  <strong>{formatDecimal(metrics.waterLiters)} لیتر آب کل</strong>
                  <small>مرجع روزانه شامل غذا و نوشیدنی</small>
                </div>
                <div>
                  <span aria-hidden="true">◷</span>
                  <strong>{sleepLabel(submittedForm.sleep)}</strong>
                  <small>ثبت خواب برای دیدن الگوی گرسنگی</small>
                </div>
              </div>
            </article>

            <article className="result-block weekly-block" id="weekly-plan">
              <div className="block-heading block-heading--controls">
                <span>۰۳</span>
                <div>
                  <p>طراحی برنامه هفتگی</p>
                  <h3>هفت روز، با امکان چیدمان تازه</h3>
                </div>
                <button
                  className="shuffle-button"
                  type="button"
                  onClick={() => setVariationSeed((current) => current + 1)}
                >
                  چیدمان تازه
                  <span aria-hidden="true">↻</span>
                </button>
              </div>

              <div className="mode-tabs" aria-label="نوع چیدمان">
                {planModeOptions.map((mode) => (
                  <button
                    className={planMode === mode.id ? "is-selected" : ""}
                    type="button"
                    aria-pressed={planMode === mode.id}
                    onClick={() => setPlanMode(mode.id)}
                    key={mode.id}
                  >
                    <strong>{mode.title}</strong>
                    <small>{mode.note}</small>
                  </button>
                ))}
              </div>

              <div className="weekly-table-wrap">
                <table className="weekly-table">
                  <thead>
                    <tr>
                      <th>روز</th>
                      <th>صبحانه</th>
                      <th>میان‌وعده</th>
                      <th>ناهار</th>
                      <th>شام</th>
                      <th>جمع روز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyPlan.map((day, index) => {
                      const snacks = day.meals.filter(
                        (meal) => meal.slot === "snack",
                      );
                      return (
                        <tr
                          className={activeDay === index ? "is-active" : ""}
                          key={day.id}
                        >
                          <th>
                            <button
                              type="button"
                              onClick={() => setActiveDay(index)}
                              aria-pressed={activeDay === index}
                            >
                              {day.label}
                            </button>
                          </th>
                          <td>{getMeal(day, "breakfast")?.title}</td>
                          <td>
                            {snacks.length > 0
                              ? snacks.map((meal) => meal.title).join(" / ")
                              : "—"}
                          </td>
                          <td>{getMeal(day, "lunch")?.title}</td>
                          <td>{getMeal(day, "dinner")?.title}</td>
                          <td>
                            <strong>{formatNumber(day.calories)}</strong>
                            <small>کیلوکالری</small>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedDay && (
                <div className="day-detail" aria-live="polite">
                  <div className="day-summary">
                    <div>
                      <p>جزئیات {selectedDay.label}</p>
                      <h4>
                        {formatNumber(selectedDay.calories)} کیلوکالری
                      </h4>
                    </div>
                    <span>{formatNumber(selectedDay.protein)} گرم پروتئین</span>
                    <span>{formatNumber(selectedDay.fiber)} گرم فیبر</span>
                  </div>
                  <div className="meal-detail-list">
                    {selectedDay.meals.map((meal, index) => (
                      <article key={`${meal.id}-${meal.displaySlot}`}>
                        <span>{formatNumber(index + 1)}</span>
                        <div>
                          <small>{meal.displaySlot}</small>
                          <h5>{meal.title}</h5>
                          <p>{meal.serving}</p>
                          <em>{meal.portionCue}</em>
                        </div>
                        <dl>
                          <div>
                            <dt>انرژی</dt>
                            <dd>{formatNumber(meal.targetCalories)}</dd>
                          </div>
                          <div>
                            <dt>پروتئین</dt>
                            <dd>{formatNumber(meal.targetProtein)} گرم</dd>
                          </div>
                          <div>
                            <dt>زمان</dt>
                            <dd>{formatNumber(meal.prep)} دقیقه</dd>
                          </div>
                        </dl>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className="result-block exchange-block">
              <div className="block-heading">
                <span>۰۴</span>
                <div>
                  <p>انعطاف بدون گم‌کردن مسیر</p>
                  <h3>جایگزین‌های هم‌گروه</h3>
                </div>
              </div>
              <div className="exchange-grid">
                {exchangeGroups.map((group) => (
                  <div
                    className={`exchange-card exchange-card--${group.color}`}
                    key={group.title}
                  >
                    <h4>{group.title}</h4>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p>{group.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="result-block shopping-block">
              <div className="block-heading block-heading--controls">
                <span>۰۵</span>
                <div>
                  <p>اجرای ساده‌تر برنامه</p>
                  <h3>فهرست خرید و آماده‌سازی</h3>
                </div>
                <button
                  className="copy-button"
                  type="button"
                  onClick={copyShoppingList}
                >
                  {copyState === "done" ? "کپی شد" : "کپی فهرست"}
                </button>
              </div>

              <div className="shopping-layout">
                <div className="shopping-groups">
                  {shoppingGroups.map((group) => (
                    <section
                      className={`shopping-group shopping-group--${group.tone}`}
                      key={group.title}
                    >
                      <h4>{group.title}</h4>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>

                <aside className="prep-panel">
                  <p>نقشه آماده‌سازی</p>
                  <h4>{prepLabel(submittedForm.mealPrep)}</h4>
                  <ol>
                    <li>
                      <span>۱</span>
                      <div>
                        <strong>حبوبات پایه</strong>
                        <small>خیساندن، پخت و تقسیم در ظرف‌های کوچک</small>
                      </div>
                    </li>
                    <li>
                      <span>۲</span>
                      <div>
                        <strong>غلات دو روز</strong>
                        <small>برنج یا بلغور را برای دو وعده آماده کن</small>
                      </div>
                    </li>
                    <li>
                      <span>۳</span>
                      <div>
                        <strong>سبزیجات آماده</strong>
                        <small>شست‌وشو، خشک‌کردن و نگهداری جداگانه</small>
                      </div>
                    </li>
                    <li>
                      <span>۴</span>
                      <div>
                        <strong>میان‌وعده قابل حمل</strong>
                        <small>میوه، نخود برشته یا مغزها را سهم‌بندی کن</small>
                      </div>
                    </li>
                  </ol>
                </aside>
              </div>
            </article>

            <article className="result-block progress-block">
              <div className="block-heading">
                <span>۰۶</span>
                <div>
                  <p>پیگیری بدون وسواس</p>
                  <h3>مسیر تخمینی و ریتم هفتگی</h3>
                </div>
              </div>

              <div className="progress-layout">
                <div className="projection-card">
                  <div>
                    <p>برآورد روند</p>
                    <small>تخمینی است و خط مستقیم تضمین‌شده نیست.</small>
                  </div>
                  <div className="projection-bars">
                    {projection.map((item, index) => (
                      <div key={item.week}>
                        <span
                          style={{
                            height: `${Math.max(
                              24,
                              100 -
                                (index / Math.max(1, projection.length - 1)) *
                                  58,
                            )}%`,
                          }}
                        />
                        <strong>{formatDecimal(item.weight)}</strong>
                        <small>
                          {item.week === 0
                            ? "شروع"
                            : `هفته ${formatNumber(item.week)}`}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rhythm-card">
                  <p>ریتم شخصی شما</p>
                  <dl>
                    <div>
                      <dt>الگوی روز</dt>
                      <dd>{dayPatternLabel(submittedForm.dayPattern)}</dd>
                    </div>
                    <div>
                      <dt>آماده‌سازی</dt>
                      <dd>{prepLabel(submittedForm.mealPrep)}</dd>
                    </div>
                    <div>
                      <dt>خواب ثبت‌شده</dt>
                      <dd>{sleepLabel(submittedForm.sleep)}</dd>
                    </div>
                    <div>
                      <dt>نظم آب</dt>
                      <dd>{waterLabel(submittedForm.water)}</dd>
                    </div>
                  </dl>
                  <ul>
                    <li>وزن‌کشی یک‌بار در هفته، در شرایط مشابه</li>
                    <li>ثبت دور کمر هر چهار هفته</li>
                    <li>میانگین هفتگی مهم‌تر از یک روز منفرد است</li>
                    <li>۱۵۰ دقیقه فعالیت متوسط در هفته را هدف بگیر</li>
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="method-section" id="method">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <p className="section-kicker">مبنای علمی میزانه</p>
              <h2>هر عدد، یک منطق روشن دارد</h2>
            </div>
            <p>
              خروجی از ترکیب فرمول انرژی، کسری محافظه‌کارانه، کیفیت غذا،
              پروتئین کافی و تنوع هفتگی ساخته می‌شود.
            </p>
          </div>

          <div className="method-flow">
            {[
              {
                number: "۱",
                title: "سوخت‌وساز استراحت",
                formula: "۱۰×وزن + ۶٫۲۵×قد − ۵×سن",
                copy: "فرمول Mifflin–St Jeor نقطه شروع برآورد انرژی است.",
              },
              {
                number: "۲",
                title: "نیاز نگهدارنده",
                formula: "سوخت‌وساز × ضریب فعالیت",
                copy: "فعالیت روزانه فاصله میان استراحت و نیاز واقعی را تنظیم می‌کند.",
              },
              {
                number: "۳",
                title: "هدف کاهش",
                formula: "حداکثر ۲۰٪ کسری روزانه",
                copy: "سرعت انتخابی کاربر با یک سقف محافظه‌کارانه محدود می‌شود.",
              },
              {
                number: "۴",
                title: "کیفیت برنامه",
                formula: "پروتئین + فیبر + تنوع",
                copy: "فقط انرژی مهم نیست؛ ترکیب وعده‌ها قابلیت اجرا را می‌سازد.",
              },
            ].map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <strong>{item.formula}</strong>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>

          <div className="source-grid">
            {sourceCards.map((source) => (
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                key={source.title}
              >
                <span>{source.tag}</span>
                <h3>{source.title}</h3>
                <p>{source.copy}</p>
                <strong>مشاهده منبع ↗</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section" id="guide">
        <div className="section-wrap guide-layout">
          <div>
            <p className="section-kicker">راهنمای استفاده</p>
            <h2>برنامه خوب، برنامه قابل تکرار است</h2>
            <p>
              لازم نیست هر روز بی‌نقص باشد. از جدول هفتگی به‌عنوان نقشه استفاده
              کن و با جایگزین‌های هم‌گروه، انعطاف را حفظ کن.
            </p>
          </div>
          <div className="faq-list">
            <details open>
              <summary>آیا انرژی محاسبه‌شده دقیق است؟</summary>
              <p>
                این عدد یک برآورد علمی است، نه اندازه‌گیری آزمایشگاهی. روند وزن
                در چند هفته بهترین بازخورد برای تنظیم بعدی است.
              </p>
            </details>
            <details>
              <summary>می‌توانم روزهای جدول را جابه‌جا کنم؟</summary>
              <p>
                بله. روزها و وعده‌های هم‌رده قابل جابه‌جایی‌اند؛ سهم نوشته‌شده
                و مجموع روزانه را نزدیک به هدف نگه دار.
              </p>
            </details>
            <details>
              <summary>چطور تنوع بیشتری بگیرم؟</summary>
              <p>
                گزینه «چیدمان تازه» ترکیب دیگری از غذاهای سازگار می‌سازد.
                حالت‌های سریع، متنوع، آماده‌سازی جمعی و پروتئین‌محور نیز قابل
                انتخاب‌اند.
              </p>
            </details>
            <details>
              <summary>اگر یک وعده را نپسندیدم چه کنم؟</summary>
              <p>
                از بخش جایگزین‌های هم‌گروه استفاده کن یا نام آن غذا را در فرم
                ترجیحات بنویس و برنامه را دوباره بساز.
              </p>
            </details>
            <details>
              <summary>چه زمانی برنامه را بازبینی کنم؟</summary>
              <p>
                پس از سه تا چهار هفته، میانگین روند، گرسنگی، انرژی روزانه و
                قابلیت اجرای وعده‌ها را با هدف اولیه مقایسه کن.
              </p>
            </details>
          </div>
        </div>
      </section>

      <footer>
        <a className="brand brand--footer" href="#top">
          <BrandMark className="brand-logo" />
          <span>
            <strong>میزانه</strong>
            <small>برنامه غذایی علمی</small>
          </span>
        </a>
        <p>تعادل روشن، ریتم پایدار.</p>
        <span>برای برنامه‌ریزی غذایی بزرگسالان سالم</span>
      </footer>
    </main>
  );
}
