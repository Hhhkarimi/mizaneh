import type { Goal, ResistanceTrainingStatus } from "@/lib/types";

export const goalCopy: Record<Goal, {
  title: string;
  short: string;
  suitableFor: string;
  monitors: string;
  warning: string;
}> = {
  weight_loss: {
    title: "کاهش وزن",
    short: "کاهش تدریجی انرژی با حفظ کیفیت غذا",
    suitableFor: "برای بزرگسالانی که کاهش وزن عمدی و ایمن می‌خواهند.",
    monitors: "روند وزن، گرسنگی، انرژی، پایبندی و تحمل گوارشی",
    warning: "تغییر ترازو فقط چربی نیست و نتیجه یا سرعت مشخص تضمین نمی‌شود.",
  },
  muscle_gain: {
    title: "افزایش حجم عضله",
    short: "مازاد کوچک انرژی همراه با تمرین مقاومتی",
    suitableFor: "برای فردی که تمرین مقاومتی منظم دارد یا هم‌زمان آغاز می‌کند.",
    monitors: "روند وزن، عملکرد تمرین، ریکاوری، اشتها، خواب و دور کمر اختیاری",
    warning: "تمرین مقاومتی برای رشد معنادار عضله ضروری است؛ تمام وزن اضافه‌شده عضله نیست.",
  },
  healthy_weight_gain: {
    title: "افزایش وزن",
    short: "افزایش تدریجی انرژی با توجه به اشتها و تحمل",
    suitableFor: "برای افزایش وزن عمدی بدون فرض تمرین عضله‌سازی.",
    monitors: "روند وزن، اشتها، سیری زودرس، تحمل گوارشی، انرژی و پایبندی",
    warning: "این حالت با حجم عضله یکسان نیست و افزایش وزن می‌تواند شامل چربی، آب و گلیکوژن باشد.",
  },
};

export function recommendGoal(input: {
  direction: "lose" | "gain";
  resistanceTraining: ResistanceTrainingStatus;
}): { goal: Goal; reason: string } {
  if (input.direction === "lose") {
    return {
      goal: "weight_loss",
      reason: "چون جهت اصلی مدنظر شما کاهش وزن است.",
    };
  }
  if (input.resistanceTraining === "current" || input.resistanceTraining === "starting") {
    return {
      goal: "muscle_gain",
      reason: "چون افزایش وزن را همراه با تمرین مقاومتی دنبال می‌کنید.",
    };
  }
  return {
    goal: "healthy_weight_gain",
    reason: "چون هدف افزایش وزن است اما تمرین مقاومتی منظم بخشی از برنامه نیست.",
  };
}
