// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import HoldButton from "./HoldButton";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("hold button", () => {
  it("clears only after the hold completes", () => {
    vi.useFakeTimers();
    const onHold = vi.fn();
    const onTap = vi.fn();
    render(
      <HoldButton holdTime={1000} onHold={onHold} onTap={onTap}>
        Hold to clear
      </HoldButton>,
    );

    const button = screen.getByRole("button", { name: "Hold to clear" });
    fireEvent.keyDown(button, { key: " " });
    act(() => vi.advanceTimersByTime(1000));

    expect(onHold).toHaveBeenCalledOnce();
    fireEvent.keyUp(button, { key: " " });
    expect(onTap).not.toHaveBeenCalled();
  });

  it("uses a short activation for the confirmation fallback", () => {
    vi.useFakeTimers();
    const onHold = vi.fn();
    const onTap = vi.fn();
    render(
      <HoldButton onHold={onHold} onTap={onTap}>
        Hold to clear
      </HoldButton>,
    );

    const button = screen.getByRole("button", { name: "Hold to clear" });
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyUp(button, { key: "Enter" });
    fireEvent.click(button);

    expect(onTap).toHaveBeenCalledOnce();
    expect(onHold).not.toHaveBeenCalled();
  });
});
