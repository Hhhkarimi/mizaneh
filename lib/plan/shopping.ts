// Shopping-list aggregation.
//
// Round 1 kept this as a grouped, qualitative list (ADR-0002) rather than
// a quantity-summed one, because the meal catalogue has no per-ingredient
// weight data to sum. Round 2 (CONTEXT.md §9.1) upgrades this from a bare
// alphabetical dedup list to a frequency count — how many meals *this
// week* use each ingredient — which is a real, exactly-derivable number,
// rather than inventing gram weights the catalogue doesn't have.

import type { DayPlan, ShoppingGroup } from "@/lib/types";

export function categoryForIngredient(ingredient: string) {
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
  const grains = ["برنج", "نان", "جو", "بلغور", "سیب‌زمینی", "ذرت"];
  const legumes = ["عدس", "نخود", "لوبیا"];
  const fats = ["گردو", "بادام", "پسته", "ارده", "روغن زیتون", "تخم کتان"];
  const pantry = ["دارچین", "پاپریکا", "زعفران", "زردچوبه", "لیمو عمانی"];

  if (proteins.some((item) => ingredient.includes(item))) return "protein";
  if (grains.some((item) => ingredient.includes(item))) return "grain";
  if (legumes.some((item) => ingredient.includes(item))) return "legume";
  if (fats.some((item) => ingredient.includes(item))) return "fat";
  if (pantry.some((item) => ingredient.includes(item))) return "pantry";
  return "produce";
}

export function buildShoppingGroups(weeklyPlan: DayPlan[]): ShoppingGroup[] {
  const buckets: Record<string, Map<string, number>> = {
    produce: new Map(),
    protein: new Map(),
    legume: new Map(),
    grain: new Map(),
    fat: new Map(),
    pantry: new Map(),
  };

  weeklyPlan
    .flatMap((day) => day.meals)
    .flatMap((meal) => meal.ingredients)
    .forEach((ingredient) => {
      const bucket = buckets[categoryForIngredient(ingredient)];
      bucket.set(ingredient, (bucket.get(ingredient) ?? 0) + 1);
    });

  function toGroup(title: string, tone: string, bucket: Map<string, number>): ShoppingGroup {
    const entries = [...bucket.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    return { title, tone, items: entries.map((e) => e.name), entries };
  }

  return [
    toGroup("سبزی و میوه", "lime", buckets.produce),
    toGroup("منابع پروتئین", "navy", buckets.protein),
    toGroup("حبوبات", "coral", buckets.legume),
    toGroup("غلات و نشاسته", "sand", buckets.grain),
    toGroup("چربی‌های مفید", "mint", buckets.fat),
    toGroup("چاشنی‌های پایه", "sky", buckets.pantry),
  ].filter((group) => group.items.length > 0);
}

export const shoppingListNote =
  "عدد کنار هر مورد یعنی در چند وعده‌ی این هفته استفاده می‌شود؛ مقدار دقیق خرید (وزن یا حجم) را نشان نمی‌دهد.";

export function buildShoppingList(weeklyPlan: DayPlan[]): {
  groups: ShoppingGroup[];
  note: string;
} {
  return { groups: buildShoppingGroups(weeklyPlan), note: shoppingListNote };
}
