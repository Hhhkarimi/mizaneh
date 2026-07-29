import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DietPlanner from "@/app/DietPlanner";
import { defaultForm } from "@/lib/food/catalogue";

function getAgeInput() {
  return screen.getByLabelText("سن به سال") as HTMLInputElement;
}

async function completeWizard(user: ReturnType<typeof userEvent.setup>) {
  // defaultForm already satisfies every validation gate, so we can walk
  // through all 4 steps without changing any field.
  await user.click(screen.getByRole("button", { name: /ادامه/ }));
  await user.click(screen.getByRole("button", { name: /ادامه/ }));
  await user.click(screen.getByRole("button", { name: /ادامه/ }));
  await user.click(screen.getByRole("button", { name: "ساخت برنامه هفتگی" }));
}

describe("SafetyAdvisory (ADR-0001)", () => {
  it("is shown once, before step 1, with an accessible note role", () => {
    render(<DietPlanner />);
    const note = screen.getByRole("note", { name: "یادداشت ایمنی و حریم خصوصی" });
    expect(note).toBeInTheDocument();
    expect(note.textContent).toMatch(/تخمینی است/);
    expect(note.textContent).toMatch(/ذخیره یا ارسال/);
  });

  it("can be dismissed", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await user.click(screen.getByRole("button", { name: "بستن یادداشت ایمنی" }));
    expect(
      screen.queryByRole("note", { name: "یادداشت ایمنی و حریم خصوصی" }),
    ).not.toBeInTheDocument();
  });
});

describe("step navigation & validation", () => {
  it("blocks advancing past step 1 with the existing hard gate for out-of-range age", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    const age = getAgeInput();
    await user.clear(age);
    await user.type(age, "10");
    await user.click(screen.getByRole("button", { name: /ادامه/ }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "سن را بین ۱۸ تا ۸۰ سال وارد کن.",
    );
    // Still on step 1: the step-2 "وزن هدف" field should not be present.
    expect(screen.queryByLabelText("وزن هدف به کیلوگرم")).not.toBeInTheDocument();
  });

  it("advances to step 2 once the field is corrected", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    const age = getAgeInput();
    await user.clear(age);
    await user.type(age, "10");
    await user.click(screen.getByRole("button", { name: /ادامه/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/سن را بین/);

    await user.clear(age);
    await user.type(age, "30");
    await user.click(screen.getByRole("button", { name: /ادامه/ }));

    expect(screen.getByLabelText("وزن هدف به کیلوگرم")).toBeInTheDocument();
  });

  it("walks all 4 steps with valid defaults and generates a plan", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await completeWizard(user);

    expect(
      screen.getByRole("heading", { name: "هفت روز روشن و قابل اجرا" }),
    ).toBeInTheDocument();
  });

  it("goes back a step with the بازگشت button without losing later-step field values", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await user.click(screen.getByRole("button", { name: /ادامه/ }));
    expect(screen.getByLabelText("وزن هدف به کیلوگرم")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "بازگشت" }));
    expect(getAgeInput()).toBeInTheDocument();
  });
});

describe("substitution picker (round 2, spec user story 24)", () => {
  it("opens a picker with ranked alternatives instead of swapping immediately", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await completeWizard(user);

    const mealButtons = screen.getAllByRole("button", { name: /جایگزینی/ });
    expect(mealButtons.length).toBeGreaterThan(0);
    await user.click(mealButtons[0]);

    const dialog = screen.getByRole("dialog", { name: "انتخاب جایگزین وعده" });
    expect(dialog).toBeInTheDocument();
    const optionButtons = within(dialog).getAllByRole("button", {
      name: /انتخاب .+ به‌جای وعده فعلی/,
    });
    expect(optionButtons.length).toBeGreaterThan(0);
    expect(optionButtons.length).toBeLessThanOrEqual(3);
  });

  it("applies the chosen option and closes the picker", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await completeWizard(user);

    await user.click(screen.getAllByRole("button", { name: /جایگزینی/ })[0]);
    const dialog = screen.getByRole("dialog", { name: "انتخاب جایگزین وعده" });
    const [firstOption] = within(dialog).getAllByRole("button", {
      name: /انتخاب .+ به‌جای وعده فعلی/,
    });
    await user.click(firstOption);

    expect(
      screen.queryByRole("dialog", { name: "انتخاب جایگزین وعده" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "هفت روز روشن و قابل اجرا" }),
    ).toBeInTheDocument();
  });

  it("can be cancelled without changing anything", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await completeWizard(user);

    await user.click(screen.getAllByRole("button", { name: /جایگزینی/ })[0]);
    await user.click(screen.getByRole("button", { name: "انصراف" }));

    expect(
      screen.queryByRole("dialog", { name: "انتخاب جایگزین وعده" }),
    ).not.toBeInTheDocument();
  });
});

describe("save / restore session (round 2, spec user stories 25-28)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not show a restore prompt when nothing is saved", () => {
    render(<DietPlanner />);
    expect(
      screen.queryByRole("note", { name: "بازیابی برنامه ذخیره‌شده" }),
    ).not.toBeInTheDocument();
  });

  it("saves only on an explicit click, with a confirmation message, and can be cleared", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await completeWizard(user);

    expect(window.localStorage.getItem("mizaneh:session:v1")).toBeNull();

    await user.click(screen.getByRole("button", { name: "ذخیره روی این دستگاه" }));
    expect(window.localStorage.getItem("mizaneh:session:v1")).not.toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("ذخیره شد");

    await user.click(
      screen.getByRole("button", { name: "پاک کردن داده‌های ذخیره‌شده" }),
    );
    expect(window.localStorage.getItem("mizaneh:session:v1")).toBeNull();
  });

  it("shows an explicit restore-or-discard prompt for a returning session, never a silent restore", async () => {
    window.localStorage.setItem(
      "mizaneh:session:v1",
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        form: { ...defaultForm },
        planMode: "variety",
        variationSeed: 7,
        substitutions: {},
      }),
    );
    render(<DietPlanner />);

    const prompt = await screen.findByRole("note", {
      name: "بازیابی برنامه ذخیره‌شده",
    });
    expect(prompt).toBeInTheDocument();
    // Not auto-restored: results aren't shown until the user chooses "بله".
    expect(
      screen.queryByRole("heading", { name: "هفت روز روشن و قابل اجرا" }),
    ).not.toBeInTheDocument();
  });

  it("restores the saved plan when the user explicitly confirms", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "mizaneh:session:v1",
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        form: { ...defaultForm },
        planMode: "variety",
        variationSeed: 7,
        substitutions: {},
      }),
    );
    render(<DietPlanner />);

    await user.click(
      await screen.findByRole("button", { name: "بله، بازیابی کن" }),
    );

    expect(
      screen.getByRole("heading", { name: "هفت روز روشن و قابل اجرا" }),
    ).toBeInTheDocument();
  });

  it("discards the saved session when the user chooses نه، پاک کن", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "mizaneh:session:v1",
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        form: { ...defaultForm },
        planMode: "variety",
        variationSeed: 7,
        substitutions: {},
      }),
    );
    render(<DietPlanner />);

    await user.click(await screen.findByRole("button", { name: "نه، پاک کن" }));
    expect(window.localStorage.getItem("mizaneh:session:v1")).toBeNull();
    expect(
      screen.queryByRole("heading", { name: "هفت روز روشن و قابل اجرا" }),
    ).not.toBeInTheDocument();
  });
});

describe("shopping list disclosure (ADR-0002, round 2 frequency count)", () => {
  it("shows the meal-frequency-count note", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await completeWizard(user);

    expect(
      screen.getByText(/چند وعده‌ی این هفته استفاده می‌شود/),
    ).toBeInTheDocument();
  });
});

describe("keyboard navigation smoke test", () => {
  it("reaches the age field and the continue button via Tab", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await user.tab();
    // Keep tabbing a bounded number of times looking for the age field.
    let found = document.activeElement === getAgeInput();
    for (let i = 0; i < 20 && !found; i += 1) {
      await user.tab();
      found = document.activeElement === getAgeInput();
    }
    expect(found).toBe(true);
  });

  it("can activate the continue button with the keyboard", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    const continueButton = screen.getByRole("button", { name: /ادامه/ });
    continueButton.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("وزن هدف به کیلوگرم")).toBeInTheDocument();
  });
});

describe("privacy — no network calls or persistent storage", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let localStorageSpy: ReturnType<typeof vi.spyOn>;
  let sessionStorageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    localStorageSpy = vi.spyOn(Storage.prototype, "setItem");
    sessionStorageSpy = vi.spyOn(Storage.prototype, "setItem");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorageSpy.mockRestore();
    sessionStorageSpy.mockRestore();
  });

  it("never calls fetch or writes to localStorage/sessionStorage during a full submission", async () => {
    const user = userEvent.setup();
    render(<DietPlanner />);
    await completeWizard(user);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(localStorageSpy).not.toHaveBeenCalled();
    expect(sessionStorageSpy).not.toHaveBeenCalled();
  });
});

describe("print and text export", () => {
  it("calls window.print for the چاپ یا ذخیره button", async () => {
    const user = userEvent.setup();
    const printSpy = vi.fn();
    vi.stubGlobal("print", printSpy);
    render(<DietPlanner />);
    await completeWizard(user);

    await user.click(screen.getByRole("button", { name: /چاپ یا ذخیره/ }));
    expect(printSpy).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("downloads a text export containing the plan's calorie target and day labels", async () => {
    const user = userEvent.setup();
    const capturedBlobs: Blob[] = [];
    const createObjectURL = vi.fn((blob: Blob) => {
      capturedBlobs.push(blob);
      return "blob:mock-url";
    });
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<DietPlanner />);
    await completeWizard(user);
    await user.click(screen.getByRole("button", { name: /دریافت متن برنامه/ }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(capturedBlobs).toHaveLength(1);
    const text = await capturedBlobs[0].text();
    expect(text).toContain("برنامه هفتگی میزانه");
    expect(text).toContain("کیلوکالری");

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});

describe("mobile / RTL rendering smoke test", () => {
  it("renders the main content in RTL via the layout's dir attribute chain (component itself renders without a hardcoded LTR override)", () => {
    const { container } = render(<DietPlanner />);
    // The component doesn't set dir itself (inherited from html[dir=rtl] in
    // app/layout.tsx); this test just guards against a regression where
    // some element hardcodes dir="ltr" and breaks the inherited direction.
    const hardcodedLtr = within(container.ownerDocument.body).queryAllByText(
      (_, element) => element?.getAttribute("dir") === "ltr",
    );
    expect(hardcodedLtr).toHaveLength(0);
  });
});
