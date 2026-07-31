"use client";

import { useState } from "react";
import type { CustomRecipeIngredient, DayPlan, FoodState, MealSlot, PlannedMeal } from "@/lib/types";
import {
  addCustomMeal,
  addCustomRecipe,
  changeMealPortion,
  changeMealTime,
  duplicateMeal,
  lockDay,
  lockMeal,
  moveMeal,
  moveMealToSlot,
  removeMeal,
  renameDay,
  renameMeal,
} from "@/lib/plan/editor";
import { formatNumber } from "@/lib/nutrition/format";

type Props = {
  day: DayPlan;
  canUndo: boolean;
  canRedo: boolean;
  favourites: string[];
  hiddenFoods: string[];
  onChange: (next: DayPlan, announcement: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onResetMeal: (instanceId: string) => void;
  onResetDay: () => void;
  onResetPlan: () => void;
  onDuplicateDay: () => void;
  onCopyDay: (targetDayId: string) => void;
  otherDays: Array<{ id: string; label: string }>;
  onToggleFavourite: (foodId: string) => void;
  onHideFood: (foodId: string) => void;
};

const slotOptions: Array<{ id: MealSlot; label: string }> = [
  { id: "breakfast", label: "صبحانه" },
  { id: "snack", label: "میان‌وعده" },
  { id: "lunch", label: "ناهار" },
  { id: "dinner", label: "شام" },
];

export function MealEditor(props: Props) {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customKind, setCustomKind] = useState<"food" | "recipe">("food");
  const [copyTarget, setCopyTarget] = useState(props.otherDays[0]?.id ?? "");
  const [custom, setCustom] = useState({
    title: "",
    displaySlot: "میان‌وعده",
    slot: "snack" as MealSlot,
    servingAmount: "1",
    servingUnit: "سهم",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    saturatedFat: "",
    sodiumMg: "",
    addedSugar: "",
    fiber: "",
    ingredients: "",
    sourceNote: "",
  });
  const [recipe, setRecipe] = useState({
    title: "",
    displaySlot: "ناهار",
    slot: "lunch" as MealSlot,
    serving: "یک سهم",
    totalYield: "",
    yieldUnit: "گرم",
    servings: "4",
    sourceNote: "",
  });
  const [recipeIngredients, setRecipeIngredients] = useState<CustomRecipeIngredient[]>([
    { id: "ingredient-1", name: "", quantity: 0, unit: "گرم", state: "raw", calories: 0, protein: 0, carbs: undefined, fat: undefined, fiber: 0 },
  ]);

  function update(next: DayPlan, announcement: string) {
    props.onChange(next, announcement);
  }

  function addCustom() {
    const calories = Number(custom.calories);
    const protein = Number(custom.protein);
    const fiber = Number(custom.fiber);
    const servingAmount = Number(custom.servingAmount);
    if (!custom.title.trim() || !Number.isFinite(calories) || calories < 0 || !Number.isFinite(servingAmount) || servingAmount <= 0 || !custom.servingUnit.trim()) return;
    update(
      addCustomMeal(props.day, {
        title: custom.title,
        displaySlot: custom.displaySlot,
        slot: custom.slot,
        servingAmount,
        servingUnit: custom.servingUnit,
        calories,
        protein: Number.isFinite(protein) ? protein : 0,
        fiber: Number.isFinite(fiber) ? fiber : 0,
        carbs: custom.carbs.trim() && Number.isFinite(Number(custom.carbs)) ? Number(custom.carbs) : undefined,
        fat: custom.fat.trim() && Number.isFinite(Number(custom.fat)) ? Number(custom.fat) : undefined,
        saturatedFat: custom.saturatedFat.trim() && Number.isFinite(Number(custom.saturatedFat)) ? Number(custom.saturatedFat) : undefined,
        sodiumMg: custom.sodiumMg.trim() && Number.isFinite(Number(custom.sodiumMg)) ? Number(custom.sodiumMg) : undefined,
        addedSugar: custom.addedSugar.trim() && Number.isFinite(Number(custom.addedSugar)) ? Number(custom.addedSugar) : undefined,
        ingredients: custom.ingredients.split(/[،,\n]+/).map((item) => item.trim()).filter(Boolean),
        sourceNote: custom.sourceNote,
      }),
      "غذای سفارشی افزوده شد و جمع روز دوباره محاسبه شد.",
    );
    setCustomOpen(false);
    setCustom({ title: "", displaySlot: "میان‌وعده", slot: "snack", servingAmount: "1", servingUnit: "سهم", calories: "", protein: "", carbs: "", fat: "", saturatedFat: "", sodiumMg: "", addedSugar: "", fiber: "", ingredients: "", sourceNote: "" });
  }

  function updateRecipeIngredient(id: string, patch: Partial<CustomRecipeIngredient>) {
    setRecipeIngredients((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function addRecipe() {
    const servings = Number(recipe.servings);
    const totalYield = Number(recipe.totalYield);
    if (!recipe.title.trim() || !Number.isFinite(servings) || servings < 1 || !recipeIngredients.some((item) => item.name.trim())) return;
    update(
      addCustomRecipe(props.day, {
        title: recipe.title,
        displaySlot: recipe.displaySlot,
        slot: recipe.slot,
        serving: recipe.serving,
        totalYield: Number.isFinite(totalYield) ? totalYield : 0,
        yieldUnit: recipe.yieldUnit,
        servings,
        sourceNote: recipe.sourceNote,
        ingredients: recipeIngredients,
      }),
      "دستور غذای سفارشی افزوده شد و تغذیهٔ هر سهم دوباره محاسبه شد.",
    );
    setCustomOpen(false);
    setRecipe({ title: "", displaySlot: "ناهار", slot: "lunch", serving: "یک سهم", totalYield: "", yieldUnit: "گرم", servings: "4", sourceNote: "" });
    setRecipeIngredients([{ id: `ingredient-${Date.now()}`, name: "", quantity: 0, unit: "گرم", state: "raw", calories: 0, protein: 0, carbs: undefined, fat: undefined, fiber: 0 }]);
  }

  return (
    <section className="meal-editor" aria-labelledby="meal-editor-title">
      <div className="meal-editor__toolbar">
        <div>
          <span className="step-label">ویرایش پیشرفته</span>
          <h4 id="meal-editor-title">شخصی‌سازی {props.day.label}</h4>
        </div>
        <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? "بستن ابزارهای ویرایش" : "ویرایش برنامه"}
        </button>
      </div>

      {open && (
        <div className="meal-editor__panel">
          <div className="editor-global-actions" role="group" aria-label="تاریخچه و بازنشانی">
            <button type="button" disabled={!props.canUndo} onClick={props.onUndo}>واگرد</button>
            <button type="button" disabled={!props.canRedo} onClick={props.onRedo}>ازنو</button>
            <button type="button" onClick={props.onResetDay}>بازنشانی این روز</button>
            <button type="button" onClick={props.onResetPlan}>بازنشانی کل برنامه</button>
          </div>

          <div className="day-edit-controls">
            <label>
              <span>نام روز</span>
              <input value={props.day.label} maxLength={60} onChange={(event) => update(renameDay(props.day, event.target.value), "نام روز تغییر کرد.")} />
            </label>
            <button type="button" aria-pressed={Boolean(props.day.locked)} onClick={() => update(lockDay(props.day, !props.day.locked), props.day.locked ? "قفل روز باز شد." : "روز قفل شد.")}>{props.day.locked ? "باز کردن قفل روز" : "قفل کردن روز"}</button>
            <button type="button" onClick={props.onDuplicateDay}>کپی این روز</button>
            {props.otherDays.length > 0 && <div className="copy-day-control"><select aria-label="روز مقصد" value={copyTarget} onChange={(event) => setCopyTarget(event.target.value)}>{props.otherDays.map((day) => <option key={day.id} value={day.id}>{day.label}</option>)}</select><button type="button" onClick={() => copyTarget && props.onCopyDay(copyTarget)}>کپی به روز انتخابی</button></div>}
          </div>

          <div className="editable-meal-list">
            {props.day.meals.map((meal, index) => (
              <EditableMeal
                key={meal.instanceId ?? `${meal.id}-${index}`}
                meal={meal}
                index={index}
                count={props.day.meals.length}
                favourite={props.favourites.includes(meal.id)}
                hidden={props.hiddenFoods.includes(meal.id)}
                onPortion={(multiplier) => update(changeMealPortion(props.day, meal.instanceId!, multiplier), "مقدار وعده و جمع روز دوباره محاسبه شد.")}
                onRename={(title) => update(renameMeal(props.day, meal.instanceId!, title), "نام وعده تغییر کرد.")}
                onTime={(time) => update(changeMealTime(props.day, meal.instanceId!, time), "زمان وعده تغییر کرد.")}
                onMove={(destination) => update(moveMeal(props.day, meal.instanceId!, destination), "ترتیب وعده‌ها تغییر کرد.")}
                onSlot={(slot) => update(moveMealToSlot(props.day, meal.instanceId!, slot, slotOptions.find((option) => option.id === slot)?.label ?? meal.displaySlot), "وعده به بخش دیگری منتقل شد.")}
                onDuplicate={() => update(duplicateMeal(props.day, meal.instanceId!), "وعده کپی شد و جمع روز دوباره محاسبه شد.")}
                onRemove={() => update(removeMeal(props.day, meal.instanceId!), "وعده حذف شد و جمع روز دوباره محاسبه شد.")}
                onLock={() => update(lockMeal(props.day, meal.instanceId!, !meal.locked), meal.locked ? "قفل وعده باز شد." : "وعده قفل شد.")}
                onReset={() => props.onResetMeal(meal.instanceId!)}
                onFavourite={() => props.onToggleFavourite(meal.id)}
                onHide={() => props.onHideFood(meal.id)}
              />
            ))}
          </div>

          <button type="button" className="add-custom-food" aria-expanded={customOpen} onClick={() => setCustomOpen((value) => !value)}>افزودن غذای یا دستور سفارشی</button>
          {customOpen && (
            <div className="custom-food-form">
              <div className="custom-kind-tabs" role="group" aria-label="نوع دادهٔ سفارشی">
                <button type="button" aria-pressed={customKind === "food"} onClick={() => setCustomKind("food")}>غذای سفارشی</button>
                <button type="button" aria-pressed={customKind === "recipe"} onClick={() => setCustomKind("recipe")}>دستور غذای سفارشی</button>
              </div>
              {customKind === "food" ? <>
              <div className="field-grid field-grid--three">
                <label><span>نام</span><input value={custom.title} maxLength={80} onChange={(event) => setCustom((value) => ({ ...value, title: event.target.value }))} /></label>
                <label><span>نوع وعده</span><select value={custom.slot} onChange={(event) => setCustom((value) => ({ ...value, slot: event.target.value as MealSlot, displaySlot: slotOptions.find((option) => option.id === event.target.value)?.label ?? value.displaySlot }))}>{slotOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
                <label><span>مقدار هر سهم</span><input type="number" min="0.01" max="100000" step="any" value={custom.servingAmount} onChange={(event) => setCustom((value) => ({ ...value, servingAmount: event.target.value }))} /></label>
                <label><span>واحد سهم</span><input value={custom.servingUnit} maxLength={30} onChange={(event) => setCustom((value) => ({ ...value, servingUnit: event.target.value }))} /></label>
                <label><span>انرژی</span><input type="number" min="0" max="5000" value={custom.calories} onChange={(event) => setCustom((value) => ({ ...value, calories: event.target.value }))} /></label>
                <label><span>پروتئین</span><input type="number" min="0" max="500" value={custom.protein} onChange={(event) => setCustom((value) => ({ ...value, protein: event.target.value }))} /></label>
                <label><span>کربوهیدرات</span><input type="number" min="0" max="1000" value={custom.carbs} onChange={(event) => setCustom((value) => ({ ...value, carbs: event.target.value }))} /></label>
                <label><span>چربی</span><input type="number" min="0" max="500" value={custom.fat} onChange={(event) => setCustom((value) => ({ ...value, fat: event.target.value }))} /></label>
                <label><span>چربی اشباع</span><input type="number" min="0" max="200" step="0.1" value={custom.saturatedFat} onChange={(event) => setCustom((value) => ({ ...value, saturatedFat: event.target.value }))} /></label>
                <label><span>سدیم</span><input type="number" min="0" max="20000" value={custom.sodiumMg} onChange={(event) => setCustom((value) => ({ ...value, sodiumMg: event.target.value }))} /></label>
                <label><span>قند افزوده</span><input type="number" min="0" max="500" step="0.1" value={custom.addedSugar} onChange={(event) => setCustom((value) => ({ ...value, addedSugar: event.target.value }))} /></label>
                <label><span>فیبر</span><input type="number" min="0" max="100" value={custom.fiber} onChange={(event) => setCustom((value) => ({ ...value, fiber: event.target.value }))} /></label>
              </div>
              <label className="wide-field"><span>مواد تشکیل‌دهنده</span><textarea value={custom.ingredients} maxLength={1000} onChange={(event) => setCustom((value) => ({ ...value, ingredients: event.target.value }))} /></label>
              <label className="wide-field"><span>یادداشت منبع اختیاری</span><input value={custom.sourceNote} maxLength={300} onChange={(event) => setCustom((value) => ({ ...value, sourceNote: event.target.value }))} /></label>
              <p className="form-note">داده‌های واردشده با برچسب «کاربر وارد کرده» نگه‌داری می‌شوند و با دادهٔ تأییدشده مخلوط نمی‌شوند.</p>
              <button type="button" onClick={addCustom}>افزودن و محاسبهٔ مجدد</button>
              </> : <>
                <div className="field-grid field-grid--three">
                  <label><span>نام دستور</span><input value={recipe.title} maxLength={80} onChange={(event) => setRecipe((value) => ({ ...value, title: event.target.value }))} /></label>
                  <label><span>نوع وعده</span><select value={recipe.slot} onChange={(event) => setRecipe((value) => ({ ...value, slot: event.target.value as MealSlot, displaySlot: slotOptions.find((option) => option.id === event.target.value)?.label ?? value.displaySlot }))}>{slotOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
                  <label><span>تعداد سهم</span><input type="number" min="1" max="100" value={recipe.servings} onChange={(event) => setRecipe((value) => ({ ...value, servings: event.target.value }))} /></label>
                  <label><span>بازده کل</span><input type="number" min="0" max="100000" value={recipe.totalYield} onChange={(event) => setRecipe((value) => ({ ...value, totalYield: event.target.value }))} /></label>
                  <label><span>واحد بازده</span><input value={recipe.yieldUnit} maxLength={30} onChange={(event) => setRecipe((value) => ({ ...value, yieldUnit: event.target.value }))} /></label>
                  <label><span>شرح هر سهم</span><input value={recipe.serving} maxLength={120} onChange={(event) => setRecipe((value) => ({ ...value, serving: event.target.value }))} /></label>
                </div>
                <div className="recipe-ingredients" aria-label="مواد دستور">
                  {recipeIngredients.map((ingredient, index) => <fieldset key={ingredient.id} className="recipe-ingredient"><legend>مادهٔ {formatNumber(index + 1)}</legend>
                    <div className="field-grid field-grid--three">
                      <label><span>نام</span><input value={ingredient.name} maxLength={80} onChange={(event) => updateRecipeIngredient(ingredient.id, { name: event.target.value })} /></label>
                      <label><span>مقدار</span><input type="number" min="0" max="100000" value={ingredient.quantity || ""} onChange={(event) => updateRecipeIngredient(ingredient.id, { quantity: Number(event.target.value) })} /></label>
                      <label><span>واحد</span><input value={ingredient.unit} maxLength={30} onChange={(event) => updateRecipeIngredient(ingredient.id, { unit: event.target.value })} /></label>
                      <label><span>حالت</span><select value={ingredient.state} onChange={(event) => updateRecipeIngredient(ingredient.id, { state: event.target.value as FoodState })}><option value="raw">خام</option><option value="cooked">پخته</option><option value="not_applicable">نامرتبط</option></select></label>
                      <label><span>انرژی کل ماده</span><input type="number" min="0" max="20000" value={ingredient.calories || ""} onChange={(event) => updateRecipeIngredient(ingredient.id, { calories: Number(event.target.value) })} /></label>
                      <label><span>پروتئین</span><input type="number" min="0" max="2000" value={ingredient.protein || ""} onChange={(event) => updateRecipeIngredient(ingredient.id, { protein: Number(event.target.value) })} /></label>
                      <label><span>کربوهیدرات</span><input type="number" min="0" max="5000" value={ingredient.carbs ?? ""} onChange={(event) => updateRecipeIngredient(ingredient.id, { carbs: event.target.value ? Number(event.target.value) : undefined })} /></label>
                      <label><span>چربی</span><input type="number" min="0" max="2000" value={ingredient.fat ?? ""} onChange={(event) => updateRecipeIngredient(ingredient.id, { fat: event.target.value ? Number(event.target.value) : undefined })} /></label>
                      <label><span>فیبر</span><input type="number" min="0" max="1000" value={ingredient.fiber || ""} onChange={(event) => updateRecipeIngredient(ingredient.id, { fiber: Number(event.target.value) })} /></label>
                      <label><span>چربی اشباع</span><input type="number" min="0" max="1000" step="0.1" value={ingredient.saturatedFat ?? ""} onChange={(event) => updateRecipeIngredient(ingredient.id, { saturatedFat: event.target.value ? Number(event.target.value) : undefined })} /></label>
                      <label><span>سدیم</span><input type="number" min="0" max="100000" value={ingredient.sodiumMg ?? ""} onChange={(event) => updateRecipeIngredient(ingredient.id, { sodiumMg: event.target.value ? Number(event.target.value) : undefined })} /></label>
                      <label><span>قند افزوده</span><input type="number" min="0" max="5000" step="0.1" value={ingredient.addedSugar ?? ""} onChange={(event) => updateRecipeIngredient(ingredient.id, { addedSugar: event.target.value ? Number(event.target.value) : undefined })} /></label>
                    </div>
                    <button type="button" disabled={recipeIngredients.length === 1} onClick={() => setRecipeIngredients((items) => items.filter((item) => item.id !== ingredient.id))}>حذف ماده</button>
                  </fieldset>)}
                  <button type="button" onClick={() => setRecipeIngredients((items) => [...items, { id: `ingredient-${Date.now()}-${items.length}`, name: "", quantity: 0, unit: "گرم", state: "raw", calories: 0, protein: 0, carbs: undefined, fat: undefined, fiber: 0 }])}>افزودن ماده</button>
                </div>
                <label className="wide-field"><span>یادداشت منبع اختیاری</span><input value={recipe.sourceNote} maxLength={300} onChange={(event) => setRecipe((value) => ({ ...value, sourceNote: event.target.value }))} /></label>
                <p className="form-note">مجموع دستور از مواد واردشده محاسبه و بر تعداد سهم تقسیم می‌شود. حالت خام یا پخته برای هر ماده حفظ می‌شود.</p>
                <button type="button" onClick={addRecipe}>افزودن دستور و محاسبهٔ هر سهم</button>
              </>}
            </div>
          )}

          <div className="nutrition-completeness-note" role="note">
            <strong>{props.day.nutritionCompleteness === "user_entered" ? "اطلاعات تغذیه‌ای شامل دادهٔ کاربر است" : props.day.nutritionCompleteness === "estimated" ? "اطلاعات تغذیه‌ای برآوردی و کامل‌تر است" : props.day.nutritionCompleteness === "complete" ? "اطلاعات تغذیه‌ای کامل است" : "بخشی از اطلاعات تغذیه‌ای ناقص است"}</strong>
            <span>کربوهیدرات، چربی، چربی اشباع، سدیم و قند افزوده برای غذاهای کاتالوگ نمایش داده می‌شوند. مقادیر کاتالوگ برآوردی‌اند و برند، نمک، روغن و روش پخت می‌تواند نتیجه را تغییر دهد.</span>
          </div>
        </div>
      )}
    </section>
  );
}

function EditableMeal(props: {
  meal: PlannedMeal;
  index: number;
  count: number;
  favourite: boolean;
  hidden: boolean;
  onPortion: (value: number) => void;
  onRename: (value: string) => void;
  onTime: (value: string) => void;
  onMove: (index: number) => void;
  onSlot: (slot: MealSlot) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onLock: () => void;
  onReset: () => void;
  onFavourite: () => void;
  onHide: () => void;
}) {
  const { meal } = props;
  return (
    <article className={meal.locked ? "editable-meal is-locked" : "editable-meal"}>
      <header><strong>{meal.displaySlot}</strong><span>{formatNumber(meal.targetCalories)} کیلوکالری</span>{meal.userEntered && <em>کاربر وارد کرده</em>}</header>
      <div className="meal-nutrient-chips" aria-label={`اطلاعات تغذیه‌ای ${meal.title}`}>
        <span>پروتئین <b>{formatNumber(meal.targetProtein)} گرم</b></span>
        {typeof meal.targetCarbs === "number" && <span>کربوهیدرات <b>{formatNumber(meal.targetCarbs)} گرم</b></span>}
        {typeof meal.targetFat === "number" && <span>چربی <b>{formatNumber(meal.targetFat)} گرم</b></span>}
        <span>فیبر <b>{formatNumber(meal.targetFiber)} گرم</b></span>
        {typeof meal.targetSaturatedFat === "number" && <span>چربی اشباع <b>{formatNumber(meal.targetSaturatedFat)} گرم</b></span>}
        {typeof meal.targetSodiumMg === "number" && <span>سدیم <b>{formatNumber(meal.targetSodiumMg)} میلی‌گرم</b></span>}
        {typeof meal.targetAddedSugar === "number" && <span>قند افزوده <b>{formatNumber(meal.targetAddedSugar)} گرم</b></span>}
      </div>
      <div className="field-grid field-grid--three">
        <label><span>نام وعده</span><input value={meal.title} maxLength={80} disabled={meal.locked} onChange={(event) => props.onRename(event.target.value)} /></label>
        <label><span>زمان</span><input type="time" value={meal.mealTime ?? ""} disabled={meal.locked} onChange={(event) => props.onTime(event.target.value)} /></label>
        <label><span>مقدار</span><select value={meal.portionMultiplier ?? 1} disabled={meal.locked} onChange={(event) => props.onPortion(Number(event.target.value))}><option value="0.5">۵۰٪</option><option value="0.75">۷۵٪</option><option value="1">۱۰۰٪</option><option value="1.25">۱۲۵٪</option><option value="1.5">۱۵۰٪</option><option value="2">۲۰۰٪</option></select></label>
        <label><span>انتقال به</span><select value={meal.slot} disabled={meal.locked} onChange={(event) => props.onSlot(event.target.value as MealSlot)}>{slotOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
      </div>
      <div className="editable-meal__actions">
        <button type="button" disabled={meal.locked || props.index === 0} onClick={() => props.onMove(props.index - 1)}>بالاتر</button>
        <button type="button" disabled={meal.locked || props.index === props.count - 1} onClick={() => props.onMove(props.index + 1)}>پایین‌تر</button>
        <button type="button" disabled={meal.locked} onClick={props.onDuplicate}>کپی وعده</button>
        <button type="button" disabled={meal.locked} onClick={props.onRemove}>حذف</button>
        <button type="button" onClick={props.onLock}>{meal.locked ? "بازکردن قفل" : "قفل"}</button>
        <button type="button" disabled={meal.locked} onClick={props.onReset}>بازنشانی وعده</button>
        <button type="button" aria-pressed={props.favourite} onClick={props.onFavourite}>{props.favourite ? "محبوب است" : "محبوب"}</button>
        <button type="button" aria-pressed={props.hidden} onClick={props.onHide}>{props.hidden ? "پنهان شده" : "دیگر پیشنهاد نشود"}</button>
      </div>
    </article>
  );
}
