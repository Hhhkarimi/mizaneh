import "@testing-library/jest-dom/vitest";

// jsdom does not implement scrollIntoView; the app calls it (real browsers
// support it) after generating a plan. Polyfilling avoids unhandled
// exceptions in tests without masking any actual application behavior.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

