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
  });

  it("states that pregnancy receives a supportive plan instead of a generic stop", () => {
    renderScreen({ pregnant: true });
    expect(screen.getByText("برنامهٔ حمایتی بارداری ساخته می‌شود")).toBeInTheDocument();
    expect(screen.queryByText("فعلاً متوقف")).not.toBeInTheDocument();
    expect(screen.getByText("جزئیات بارداری")).toBeInTheDocument();
  });

  it("uses compact disclosure buttons for BP", async () => {
    const user = userEvent.setup();
    const { onChange } = renderScreen();
    const toggle = screen.getByRole("button", { name: /فشار خون/ });
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cardiometabolic: expect.objectContaining({ bloodPressure: expect.objectContaining({ enabled: true }) }) }));
  });

  it("shows condition-specific kidney inputs when selected", () => {
    renderScreen({ medicalConditions: ["kidney_disease"] });
    expect(screen.getByText("تنظیمات بیماری کلیه")).toBeInTheDocument();
    expect(screen.getByText("وضعیت پتاسیم آزمایش")).toBeInTheDocument();
  });
});
