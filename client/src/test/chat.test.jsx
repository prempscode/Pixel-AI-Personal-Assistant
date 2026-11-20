import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const auth = {
  user: { id: "u1", email: "asha@example.com", user_metadata: { full_name: "Asha Patel" } },
  loading: false,
};
vi.mock("../context/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("../lib/supabaseClient", () => ({ supabase: {} }));
vi.mock("../services/authService", () => ({ signOut: vi.fn().mockResolvedValue() }));
vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal()),
  sendMessage: vi.fn(),
  getGoogleStatus: vi.fn(),
  startGoogleConnect: vi.fn(),
}));

import Chat from "../pages/Chat";
import { ApiError, sendMessage, getGoogleStatus, startGoogleConnect } from "../services/api";
import { signOut } from "../services/authService";
import { ToastProvider } from "../components/ui/Toast";

// Desktop layout so the sidebar is mounted.
window.matchMedia = (q) => ({
  matches: true, media: q, addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {},
});

const setup = (url = "/app") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <ToastProvider>
        <Chat />
      </ToastProvider>
    </MemoryRouter>,
  );

const box = () => screen.getByRole("textbox", { name: /message pixel/i });

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  getGoogleStatus.mockResolvedValue(true);
});

describe("Chat: empty state & composer", () => {
  it("greets by first name and example prompts fill the box WITHOUT sending", async () => {
    setup();
    expect(screen.getByRole("heading", { level: 2, name: /asha/i })).toBeInTheDocument();
    const chip = screen.getAllByRole("button", { name: /block 2 to 3 pm on friday/i })[0];
    await userEvent.click(chip);
    expect(box()).toHaveValue("Block 2 to 3 PM on Friday for a project review");
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("Enter sends, Shift+Enter inserts a newline", async () => {
    sendMessage.mockResolvedValue({ type: "text", reply: "Hello!", urls: [] });
    setup();
    await userEvent.type(box(), "line one{Shift>}{Enter}{/Shift}line two");
    expect(box()).toHaveValue("line one\nline two");
    expect(sendMessage).not.toHaveBeenCalled();
    await userEvent.type(box(), "{Enter}");
    await waitFor(() => expect(sendMessage).toHaveBeenCalledWith("line one\nline two"));
    expect(box()).toHaveValue("");
  });

  it("send button is disabled for empty/whitespace input", async () => {
    setup();
    const send = screen.getByRole("button", { name: /send message/i });
    expect(send).toBeDisabled();
    await userEvent.type(box(), "   ");
    expect(send).toBeDisabled();
  });
});

describe("Chat: replies, links, errors", () => {
  it("shows the working state, then the reply, and only renders http(s) links", async () => {
    let resolve;
    sendMessage.mockReturnValue(new Promise((r) => (resolve = r)));
    setup();
    await userEvent.type(box(), "open example{Enter}");
    expect(await screen.findByText(/pixel is working on it/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();

    resolve({
      type: "text",
      reply: "Here is the link.",
      urls: ["https://example.com/page", "javascript:alert(1)"],
    });
    expect(await screen.findByText("Here is the link.")).toBeInTheDocument();
    // indicator fades out via AnimatePresence, so wait for it to leave
    await waitFor(() => expect(screen.queryByText(/pixel is working on it/i)).not.toBeInTheDocument());
    const link = screen.getByRole("link", { name: /example\.com/i });
    expect(link).toHaveAttribute("href", "https://example.com/page");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(document.querySelector('a[href^="javascript"]')).toBeNull();
  });

  it("network failure -> error card -> Try again re-sends without duplicating the user message", async () => {
    sendMessage
      .mockRejectedValueOnce(new ApiError("Can't reach the Pixel server.", "network"))
      .mockResolvedValueOnce({ type: "text", reply: "Done now.", urls: [] });
    setup();
    await userEvent.type(box(), "add a task{Enter}");
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/can't reach pixel/i)).toBeInTheDocument();

    await userEvent.click(within(alert).getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("Done now.")).toBeInTheDocument();
    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage).toHaveBeenLastCalledWith("add a task");
    expect(screen.getAllByText("add a task").filter((n) => n.closest("li[id^=msg-]"))).toHaveLength(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("rate limit shows its own copy; validation errors offer no retry", async () => {
    sendMessage.mockRejectedValueOnce(new ApiError("Too many requests. Please slow down and try again soon.", "rate_limit", 429));
    setup();
    await userEvent.type(box(), "hi{Enter}");
    const a1 = await screen.findByRole("alert");
    expect(within(a1).getByText(/slow down a moment/i)).toBeInTheDocument();
    expect(within(a1).getByText(/too many requests/i)).toBeInTheDocument();

    sendMessage.mockRejectedValueOnce(new ApiError("Message is too long", "validation", 400));
    await userEvent.type(box(), "again{Enter}");
    const alerts = await screen.findAllByRole("alert");
    const last = alerts[alerts.length - 1];
    expect(within(last).getByText(/message not accepted/i)).toBeInTheDocument();
    expect(within(last).queryByRole("button", { name: /try again/i })).toBeNull();
  });

  it("an expired session signs the user out", async () => {
    sendMessage.mockRejectedValueOnce(new ApiError("Invalid or expired token", "auth", 401));
    setup();
    await userEvent.type(box(), "hello{Enter}");
    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(await screen.findByText(/your session expired/i)).toBeInTheDocument();
  });
});

describe("Chat: email confirmation flow", () => {
  it("offers Yes/Cancel on a 'Send it?' reply and sends the matching message", async () => {
    sendMessage
      .mockResolvedValueOnce({ type: "text", reply: "To: a@b.com\nSubject: Hi\n\nBody\n\nSend it?", urls: [] })
      .mockResolvedValueOnce({ type: "text", reply: "Email sent to a@b.com.", urls: [] });
    setup();
    await userEvent.type(box(), "email a@b.com hi{Enter}");
    const group = await screen.findByRole("group", { name: /confirm sending/i });
    await userEvent.click(within(group).getByRole("button", { name: /yes, send it/i }));
    await waitFor(() => expect(sendMessage).toHaveBeenLastCalledWith("Yes, send it"));
    expect(await screen.findByText(/email sent to a@b\.com/i)).toBeInTheDocument();
    // buttons are gone once the conversation moved on
    expect(screen.queryByRole("group", { name: /confirm sending/i })).not.toBeInTheDocument();
  });

  it("Cancel sends text the server's cancel matcher recognises", async () => {
    sendMessage
      .mockResolvedValueOnce({ type: "text", reply: "Send it?", urls: [] })
      .mockResolvedValueOnce({ type: "text", reply: "Cancelled.", urls: [] });
    setup();
    await userEvent.type(box(), "email x{Enter}");
    await userEvent.click(await screen.findByRole("button", { name: /^cancel$/i }));
    await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(2));
    expect(sendMessage.mock.calls[1][0]).toMatch(/^\s*(no|n|nope|cancel|stop|don't send|do not send|never mind|dont send)\b/i);
  });
});

describe("Chat: Google connection", () => {
  it("connected -> shows status, no connect button", async () => {
    setup();
    expect((await screen.findAllByText(/google connected/i)).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /connect google/i })).toBeNull();
  });

  it("disconnected -> Connect Google starts the OAuth flow", async () => {
    getGoogleStatus.mockResolvedValue(false);
    startGoogleConnect.mockResolvedValue();
    setup();
    await userEvent.click(await screen.findByRole("button", { name: /connect google/i }));
    expect(startGoogleConnect).toHaveBeenCalledTimes(1);
  });

  it("failed connect start shows an inline error and re-enables the button", async () => {
    getGoogleStatus.mockResolvedValue(false);
    startGoogleConnect.mockRejectedValue(new ApiError("Login required", "auth", 401));
    setup();
    await userEvent.click(await screen.findByRole("button", { name: /connect google/i }));
    expect(await screen.findByText(/login required/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /connect google/i })).toBeEnabled();
  });

  it("status check failure is distinct from 'not connected' and can be retried", async () => {
    getGoogleStatus.mockRejectedValueOnce(new ApiError("down", "server", 500)).mockResolvedValueOnce(true);
    setup();
    expect(await screen.findByText(/couldn't check google/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /^retry$/i }));
    expect((await screen.findAllByText(/google connected/i)).length).toBeGreaterThan(0);
  });

  it("?google=connected shows a success toast", async () => {
    setup("/app?google=connected");
    expect(await screen.findByText(/pixel can now use your tasks/i)).toBeInTheDocument();
  });

  it("?google=no_refresh_token shows an error toast", async () => {
    setup("/app?google=no_refresh_token");
    expect(await screen.findByText(/didn't grant lasting access/i)).toBeInTheDocument();
  });
});

describe("Chat: sidebar & transcript", () => {
  it("lists this conversation's requests and persists them per user", async () => {
    sendMessage.mockResolvedValue({ type: "text", reply: "ok", urls: [] });
    const { unmount } = setup();
    await userEvent.type(box(), "first request{Enter}");
    await screen.findByText("ok");
    const nav = screen.getByRole("navigation", { name: /sidebar/i });
    expect(within(nav).getByRole("button", { name: /first request/i })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("pixel:transcript:u1"))).toHaveLength(2);
    unmount();

    setup(); // refresh: transcript restored
    expect(await screen.findByText("first request", { selector: "div" })).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  it("errors are not persisted", async () => {
    sendMessage.mockRejectedValue(new ApiError("boom", "server", 500));
    setup();
    await userEvent.type(box(), "x{Enter}");
    await screen.findByRole("alert");
    const stored = JSON.parse(localStorage.getItem("pixel:transcript:u1"));
    expect(stored.some((m) => m.error)).toBe(false);
  });

  it("Clear transcript asks first, explains it is local only, then clears", async () => {
    sendMessage.mockResolvedValue({ type: "text", reply: "ok", urls: [] });
    setup();
    await userEvent.type(box(), "hello{Enter}");
    await screen.findByText("ok");
    await userEvent.click(screen.getByRole("button", { name: /clear transcript/i }));
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText(/still remembers your recent conversation on the server/i)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: /^clear$/i }));
    await waitFor(() => expect(screen.queryByText("ok")).not.toBeInTheDocument());
    expect(await screen.findByRole("heading", { level: 2, name: /asha/i })).toBeInTheDocument();
  });

  it("Sign out calls the existing auth service", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(signOut).toHaveBeenCalled();
  });
});
