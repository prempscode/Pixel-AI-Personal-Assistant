// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import GoogleConnectedStatus from "./GoogleConnectedStatus";

afterEach(cleanup);

describe("Google connection status", () => {
  it("keeps the Google icon hidden before hover", () => {
    render(<GoogleConnectedStatus />);

    const icon = screen.getByRole("status").querySelector('[aria-hidden="true"]');
    expect(icon.classList.contains("invisible")).toBe(true);
  });

  it("animates the detail with the heading while keeping actions separate", () => {
    render(
      <GoogleConnectedStatus detail="Tasks, Calendar, Gmail, Drive">
        <button type="button">Disconnect Google</button>
      </GoogleConnectedStatus>,
    );

    const heading = screen.getByText("Google connected").parentElement;
    const detail = screen.getByText("Tasks, Calendar, Gmail, Drive");
    const action = screen.getByRole("button", { name: "Disconnect Google" });

    expect(heading.contains(detail)).toBe(true);
    expect(heading.contains(action)).toBe(false);
    expect(action.parentElement.classList.contains("min-w-0")).toBe(true);
    expect(action.parentElement.firstElementChild).not.toBe(action);
  });
});
