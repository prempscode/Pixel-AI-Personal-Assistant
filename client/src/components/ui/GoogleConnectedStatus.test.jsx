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
});
