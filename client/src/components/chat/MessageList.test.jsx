// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import MessageList from "./MessageList";

const scrollIntoView = vi.fn();

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoView,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  scrollIntoView.mockReset();
});

describe("message list scrolling", () => {
  it("does not pull the reader back to the bottom after scrolling up", () => {
    const { container } = render(
      <MessageList
        messages={[
          {
            id: "message-1",
            role: "user",
            text: "First request",
            ts: 1_700_000_000_000,
          },
        ]}
        sending={false}
      />,
    );

    const scroller = container.querySelector(".scroll-thin");
    Object.defineProperties(scroller, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 500 },
      scrollTop: { configurable: true, value: 0 },
    });
    scrollIntoView.mockClear();

    fireEvent.scroll(scroller);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
