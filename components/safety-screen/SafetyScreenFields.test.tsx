import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { defaultForm } from "@/lib/food/catalogue";
import { screenSafety } from "@/lib/safety/screen";
import { SafetyScreenFields } from "@/components/safety-screen/SafetyScreenFields";

function renderScreen(overrides = {}) {
  const form = { ...structuredClone(defaultForm), ...overrides };
  const onChange = vi.fn();
  render(<SafetyScreenFields form={form} result={screenSafety(form)} onChange={onChange} />);
  return { form, onChange };
}

describe("SafetyScreenFields", () => {
  it("explains an ordinary result in plain Persian", () => {
    renderScreen();
    expect(screen.getByText("بر اساس پاسخ‌های فعلی، برنامهٔ عمومی قابل ساخت است")).toBeInTheDocument();
    expect(screen.getByText("قابل برنامه‌ریزی")).toBeInTheDocument();
  });

  it("shows the reason and a concrete next step when planning is blocked", () => {
    renderScreen({ pregnant: true });
    expect(screen.getByText("فعلاً برنامهٔ خودکار ساخته نمی‌شود")).toBeInTheDocument();
    expect(screen.getByText("بارداری یا شیردهی به برنامهٔ اختصاصی نیاز دارد")).toBeInTheDocument();
    expect(screen.getByText(/اقدام بعدی:/)).toBeInTheDocument();
  });

  it("uses compact disclosure buttons instead of a large native checkbox for health cards", async () => {
    const user = userEvent.setup();
    const { onChange } = renderScreen();
    const toggle = screen.getByRole("button", { name: /فشار خون/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      cardiometabolic: expect.objectContaining({
        bloodPressure: expect.objectContaining({ enabled: true }),
      }),
    }));
  });
});
