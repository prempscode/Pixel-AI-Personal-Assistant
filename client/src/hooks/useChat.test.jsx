// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { clearConversationHistory, sendMessage } from "../services/api";
import { useChat } from "./useChat";

vi.mock("../services/api", () => ({
  clearConversationHistory: vi.fn(),
  sendMessage: vi.fn(),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

describe("useChat clear", () => {
  it("clears the server history and local transcript after success", async () => {
    localStorage.setItem(
      "pixel:transcript:user-1",
      JSON.stringify([{ id: "message-1", role: "user", text: "Old chat" }]),
    );
    clearConversationHistory.mockResolvedValue({ deleted: true });

    const { result } = renderHook(() => useChat("user-1"));
    await act(async () => {
      await result.current.clear();
    });

    expect(clearConversationHistory).toHaveBeenCalledOnce();
    expect(result.current.messages).toEqual([]);
    expect(JSON.parse(localStorage.getItem("pixel:transcript:user-1"))).toEqual([]);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("keeps the local transcript when server history deletion fails", async () => {
    localStorage.setItem(
      "pixel:transcript:user-1",
      JSON.stringify([{ id: "message-1", role: "user", text: "Old chat" }]),
    );
    clearConversationHistory.mockRejectedValue(new Error("server unavailable"));

    const { result } = renderHook(() => useChat("user-1"));
    await act(async () => {
      await expect(result.current.clear()).rejects.toThrow("server unavailable");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem("pixel:transcript:user-1"))).toHaveLength(1);
  });

  it("blocks sending while server history is being cleared", async () => {
    let finishClear;
    clearConversationHistory.mockReturnValue(
      new Promise((resolve) => {
        finishClear = resolve;
      }),
    );

    const { result } = renderHook(() => useChat("user-1"));
    let clearPromise;
    await act(async () => {
      clearPromise = result.current.clear();
      await Promise.resolve();
    });

    expect(result.current.clearing).toBe(true);
    expect(result.current.send("A new message")).toBe(false);

    await act(async () => {
      finishClear({ deleted: true });
      await clearPromise;
    });
    expect(result.current.clearing).toBe(false);
  });
});
