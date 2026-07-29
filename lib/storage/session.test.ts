import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSession,
  hasSavedSession,
  loadSession,
  saveSession,
} from "@/lib/storage/session";
import { defaultForm } from "@/lib/food/catalogue";
import type { PlannerForm } from "@/lib/types";

function baseSession() {
  return {
    form: { ...defaultForm } as PlannerForm,
    planMode: "variety" as const,
    variationSeed: 3,
    substitutions: {},
  };
}

describe("session storage — explicit opt-in only", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("has nothing saved by default", () => {
    expect(hasSavedSession()).toBe(false);
    expect(loadSession()).toBeNull();
  });

  it("saves and loads back exactly what was saved", () => {
    const ok = saveSession(baseSession());
    expect(ok).toBe(true);
    expect(hasSavedSession()).toBe(true);

    const loaded = loadSession();
    expect(loaded).not.toBeNull();
    expect(loaded?.form).toEqual(defaultForm);
    expect(loaded?.planMode).toBe("variety");
    expect(loaded?.variationSeed).toBe(3);
    expect(loaded?.version).toBe(1);
    expect(typeof loaded?.savedAt).toBe("string");
  });

  it("clears a saved session completely", () => {
    saveSession(baseSession());
    expect(hasSavedSession()).toBe(true);
    const ok = clearSession();
    expect(ok).toBe(true);
    expect(hasSavedSession()).toBe(false);
    expect(loadSession()).toBeNull();
  });

  it("discards and clears data with a mismatched version instead of applying it", () => {
    window.localStorage.setItem(
      "mizaneh:session:v1",
      JSON.stringify({ version: 99, form: {}, variationSeed: 1 }),
    );
    expect(loadSession()).toBeNull();
    // Discarding also removes the bad entry so it doesn't linger.
    expect(window.localStorage.getItem("mizaneh:session:v1")).toBeNull();
  });

  it("discards corrupted JSON instead of throwing", () => {
    window.localStorage.setItem("mizaneh:session:v1", "{not json");
    expect(() => loadSession()).not.toThrow();
    expect(loadSession()).toBeNull();
  });

  it("degrades to no-op (not a throw) if localStorage.setItem throws", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    expect(() => saveSession(baseSession())).not.toThrow();
    expect(saveSession(baseSession())).toBe(false);
    spy.mockRestore();
  });

  it("stores substitutions alongside the rest of the session", () => {
    const session = baseSession();
    saveSession({
      ...session,
      substitutions: {
        0: {
          id: "shanbe",
          label: "شنبه",
          shortLabel: "ش",
          meals: [],
          calories: 0,
          protein: 0,
          fiber: 0,
        },
      },
    });
    const loaded = loadSession();
    expect(loaded?.substitutions[0]?.id).toBe("shanbe");
  });
});
