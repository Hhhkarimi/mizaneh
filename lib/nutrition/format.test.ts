import { describe, expect, it } from "vitest";
import { formatDecimal, formatNumber, roundTo, toNumber } from "@/lib/nutrition/format";

describe("toNumber", () => {
  it("parses plain ASCII digit strings", () => {
    expect(toNumber("42")).toBe(42);
  });

  it("parses Persian digit strings", () => {
    expect(toNumber("۴۲")).toBe(42);
  });

  it("parses mixed Persian/ASCII digits", () => {
    expect(toNumber("1۲3")).toBe(123);
  });

  it("returns NaN for non-numeric input", () => {
    expect(Number.isNaN(toNumber("abc"))).toBe(true);
  });

  it("parses decimal values", () => {
    expect(toNumber("70.5")).toBeCloseTo(70.5);
  });
});

describe("formatNumber", () => {
  it("formats an integer using Persian digits", () => {
    expect(formatNumber(1234)).toBe("۱٬۲۳۴");
  });

  it("rounds non-integers before formatting", () => {
    expect(formatNumber(1234.6)).toBe("۱٬۲۳۵");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("۰");
  });
});

describe("formatDecimal", () => {
  it("formats with at most one fraction digit using Persian digits", () => {
    expect(formatDecimal(70.55)).toBe("۷۰٫۶");
  });

  it("formats whole numbers without a trailing separator", () => {
    expect(formatDecimal(70)).toBe("۷۰");
  });
});

describe("roundTo", () => {
  it("rounds to the nearest increment", () => {
    expect(roundTo(1487, 25)).toBe(1475);
    expect(roundTo(1488, 25)).toBe(1500);
  });

  it("handles an increment of 1 as a no-op rounding", () => {
    expect(roundTo(3.7, 1)).toBe(4);
  });
});
