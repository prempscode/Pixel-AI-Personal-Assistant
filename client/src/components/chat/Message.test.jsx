// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Message from "./Message";

afterEach(cleanup);

describe("assistant message formatting", () => {
  it("renders Markdown and avoids repeating links already in the reply", () => {
    render(
      <Message
        m={{
          id: "assistant-1",
          role: "assistant",
          text: "## Summary\n\n- First item\n- Second item\n\n[Open docs](https://example.com/guide)",
          urls: ["https://example.com/guide", "https://other.example/"],
          ts: 1_700_000_000_000,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Summary", level: 2 })).toBeTruthy();
    expect(screen.getByText("First item")).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Open docs — opens example.com in a new tab" }).getAttribute("href"),
    ).toBe("https://example.com/guide");
  });

  it("does not render unsafe URLs as links", () => {
    render(
      <Message
        m={{
          id: "assistant-2",
          role: "assistant",
          text: "[unsafe](javascript:alert(1))",
          urls: ["javascript:alert(1)"],
          ts: 1_700_000_000_000,
        }}
      />,
    );

    expect(screen.queryByRole("link")).toBeNull();
  });

  it("offers a copy action on the user's message", () => {
    render(
      <Message
        m={{
          id: "user-1",
          role: "user",
          text: "Please write a short example",
          ts: 1_700_000_000_000,
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Copy message" })).toBeTruthy();
  });

  it("renders a copyable, syntax-highlighted code block", async () => {
    render(
      <Message
        m={{
          id: "assistant-code",
          role: "assistant",
          text: '```python\nprint("Hello, world!")\n```',
          ts: 1_700_000_000_000,
        }}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Copy code" }, { timeout: 10000 }),
    ).toBeTruthy();
    expect(screen.getByText("Python")).toBeTruthy();
  });

  it("does not render fenced email text with terminal styling", () => {
    const { container } = render(
      <Message
        m={{
          id: "assistant-email",
          role: "assistant",
          text: "```text\nDear Alex,\nCan we reschedule our meeting?\n```",
          ts: 1_700_000_000_000,
        }}
      />,
    );

    expect(container.querySelector(".md-plain-block")).toBeTruthy();
    expect(container.querySelector(".md-code-block")).toBeNull();
    expect(screen.queryByRole("button", { name: "Copy code" })).toBeNull();
  });
});
