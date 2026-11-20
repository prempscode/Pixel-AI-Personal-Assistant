import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

// jsdom lacks these; components use them.
window.matchMedia ??= (q) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, dispatchEvent() { return false; },
});
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
class IO { observe() {} unobserve() {} disconnect() {} }
window.IntersectionObserver ??= IO;
window.ResizeObserver ??= IO;
