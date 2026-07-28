// Single source of truth for Persian number formatting, digit parsing, and
// rounding. Extracted verbatim from the original DietPlanner.tsx — no
// formatting behavior was changed.

const numberFormatter = new Intl.NumberFormat("fa-IR");
const decimalFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 1,
});

/** Parses a string that may contain Persian digits (۰-۹) into a Number. */
export function toNumber(value: string) {
  return Number(
    value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))),
  );
}

/** Formats a number as a rounded, Persian-locale integer string. */
export function formatNumber(value: number) {
  return numberFormatter.format(Math.round(value));
}

/** Formats a number as a Persian-locale decimal (max 1 fraction digit). */
export function formatDecimal(value: number) {
  return decimalFormatter.format(value);
}

/** Rounds `value` to the nearest multiple of `increment`. */
export function roundTo(value: number, increment: number) {
  return Math.round(value / increment) * increment;
}
