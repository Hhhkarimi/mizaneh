// Shopping-list aggregation. Extracted verbatim from the original
// DietPlanner.tsx (same category keyword lists, same grouping/dedup
// logic). ADR-0002 in docs/adr/ documents why this stays a grouped,
// qualitative list rather than a quantity-summed one in this pass — the
// `shoppingListNote` export exists so the UI can say so explicitly.

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
    { title: "سبزی و میوه", tone: "lime", items: [...buckets.produce].sort() },
    { title: "منابع پروتئین", tone: "navy", items: [...buckets.protein].sort() },
    { title: "حبوبات", tone: "coral", items: [...buckets.legume].sort() },
    { title: "غلات و نشاسته", tone: "sand", items: [...buckets.grain].sort() },
    { title: "چربی‌های مفید", tone: "mint", items: [...buckets.fat].sort() },
    { title: "چاشنی‌های پایه", tone: "sky", items: [...buckets.pantry].sort() },
  ].filter((group) => group.items.length > 0);
}

export const shoppingListNote =
  "این فهرست، مواد اولیه‌ی تکراری در هفته را گروه‌بندی می‌کند؛ مقدار دقیق خرید را نشان نمی‌دهد.";

export function buildShoppingList(weeklyPlan: DayPlan[]): {
  groups: ShoppingGroup[];
  note: string;
} {
  return { groups: buildShoppingGroups(weeklyPlan), note: shoppingListNote };
}
