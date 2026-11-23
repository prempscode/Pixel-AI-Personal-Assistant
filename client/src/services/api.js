import { supabase } from "../lib/supabaseClient";

const BASE = import.meta.env.VITE_BACKEND_URL;

/**
 * kind: "auth" | "rate_limit" | "validation" | "network" | "server"
 * Lets the UI show the right state instead of one generic error.
 */
export class ApiError extends Error {
  constructor(message, kind, status) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

async function request(path, options = {}) {
  const token = await getAccessToken();
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Can't reach the Pixel server. Check your connection and try again.",
      "network",
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON body */
  }

  if (!response.ok) {
    const message = data?.error || "Something went wrong.";
    const kind =
      response.status === 401
        ? "auth"
        : response.status === 429
          ? "rate_limit"
          : response.status === 400
            ? "validation"
            : "server";
    throw new ApiError(message, kind, response.status);
  }
  return data;
}

/** POST /api/agent/chat -> { type: "text", reply: string, urls: string[] } */
export function sendMessage(message) {
  return request("/api/agent/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

/** GET /api/google/status -> boolean */
export async function getGoogleStatus() {
  const data = await request("/api/google/status");
  return Boolean(data?.connected);
}

/** GET /api/google/auth -> redirects the browser to Google's consent screen. */
export async function startGoogleConnect() {
  const { url } = await request("/api/google/auth");
  window.location.href = url;
}

export function disconnectGoogle() {
  return request("/api/google/disconnect", { method: "DELETE" });
}

export function deletePixelData() {
  return request("/api/account/data", { method: "DELETE" });
}
