import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/supabaseClient", () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { access_token: "jwt-123" } } }) } },
}));

import { sendMessage, getGoogleStatus, startGoogleConnect, ApiError } from "../services/api";

const reply = (status, body) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body });

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  import.meta.env.VITE_BACKEND_URL = "http://api.test";
});

describe("api service", () => {
  it("POSTs the message to /api/agent/chat with the Supabase JWT", async () => {
    fetch.mockReturnValue(reply(200, { type: "text", reply: "hi", urls: [] }));
    const out = await sendMessage("hello");
    const [url, init] = fetch.mock.calls[0];
    expect(url).toMatch(/\/api\/agent\/chat$/);
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer jwt-123");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ message: "hello" });
    expect(out.reply).toBe("hi");
  });

  it.each([
    [401, "auth"],
    [429, "rate_limit"],
    [400, "validation"],
    [500, "server"],
  ])("maps HTTP %i to kind '%s' and keeps the server's message", async (status, kind) => {
    fetch.mockReturnValue(reply(status, { error: "server said so" }));
    await expect(sendMessage("x")).rejects.toMatchObject({ kind, status, message: "server said so" });
  });

  it("maps a fetch failure to a network error", async () => {
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    const err = await sendMessage("x").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.kind).toBe("network");
  });

  it("tolerates a non-JSON error body", async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: false, status: 502, json: async () => { throw new Error("html"); } }));
    await expect(sendMessage("x")).rejects.toMatchObject({ kind: "server", message: "Something went wrong." });
  });

  it("getGoogleStatus returns a boolean from /api/google/status", async () => {
    fetch.mockReturnValue(reply(200, { connected: true }));
    expect(await getGoogleStatus()).toBe(true);
    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/google\/status$/);
    fetch.mockReturnValue(reply(200, { connected: false }));
    expect(await getGoogleStatus()).toBe(false);
  });

  it("startGoogleConnect fetches the consent URL from /api/google/auth and navigates to it", async () => {
    fetch.mockReturnValue(reply(200, { url: "https://accounts.google.com/o/oauth2/auth?x=1" }));
    const loc = { href: "" };
    vi.stubGlobal("location", loc);
    await startGoogleConnect();
    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/google\/auth$/);
    expect(loc.href).toBe("https://accounts.google.com/o/oauth2/auth?x=1");
    vi.unstubAllGlobals();
  });
});
