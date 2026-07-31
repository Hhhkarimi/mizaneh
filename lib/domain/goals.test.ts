import { describe, expect, it } from "vitest";
import { goalCopy, recommendGoal } from "@/lib/domain/goals";

describe("guided goal recommendation", () => {
  it("recommends weight loss for a user choosing loss", () => {
    expect(recommendGoal({ direction: "lose", resistanceTraining: "none" }).goal).toBe("weight_loss");
  });

  it("recommends muscle gain when gain is paired with resistance training", () => {
    expect(recommendGoal({ direction: "gain", resistanceTraining: "current" }).goal).toBe("muscle_gain");
    expect(recommendGoal({ direction: "gain", resistanceTraining: "starting" }).goal).toBe("muscle_gain");
  });

  it("recommends healthy weight gain when gain is not paired with training", () => {
    expect(recommendGoal({ direction: "gain", resistanceTraining: "none" }).goal).toBe("healthy_weight_gain");
  });

  it("keeps each goal explanation scientifically distinct", () => {
    expect(goalCopy.muscle_gain.warning).toMatch(/تمرین مقاومتی/);
    expect(goalCopy.healthy_weight_gain.warning).toMatch(/عضله/);
    expect(goalCopy.weight_loss.title).toBe("کاهش وزن");
  });
});
