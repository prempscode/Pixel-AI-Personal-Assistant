// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Sidebar from "./Sidebar";

vi.mock("../ui/Logo", () => ({ default: () => <div>Logo</div> }));
vi.mock("./GoogleCard", () => ({ default: () => <div /> }));
vi.mock("../ui/ServiceIcon", () => ({ default: () => <span /> }));

afterEach(() => {
  cleanup();
});

function renderSidebar(onClear, messages = []) {
  return render(
    <Sidebar
      user={{ id: "user-1", email: "pixel@example.com", user_metadata: {} }}
      google={{ status: "disconnected" }}
      messages={messages}
      onPick={vi.fn()}
      onJump={vi.fn()}
      onClear={onClear}
      onSignOut={vi.fn()}
      onDeleteData={vi.fn()}
    />,
  );
}

describe("sidebar chat history clearing", () => {
  it("confirms before clearing the saved history", async () => {
    const onClear = vi.fn().mockResolvedValue(undefined);
    renderSidebar(onClear);

    fireEvent.click(screen.getByRole("button", { name: "Clear chat history" }));
    expect(screen.getByRole("alertdialog").textContent).toContain(
      "Your Google connection stays intact.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear history" }));

    await waitFor(() => expect(onClear).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("keeps the confirmation open and offers a retry when clearing fails", async () => {
    const onClear = vi
      .fn()
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce(undefined);
    renderSidebar(onClear);

    fireEvent.click(screen.getByRole("button", { name: "Clear chat history" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear history" }));
    expect(await screen.findByText(/check your connection, then try again/i)).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(onClear).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });
});
