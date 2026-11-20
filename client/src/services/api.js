import { isSafeUrl } from "../lib/constants";
import { getAccessToken } from "./authService";

const configuredBase = import.meta.env.VITE_BACKEND_URL?.trim();
export const API_BASE_URL = (configuredBase || "http://localhost:5000").replace(
  /\/+$/,
  "",
);

export class ApiError extends Error {
  constructor(message, { status = 0, retryAfter = null, cause } = {}) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function request(path, { method = "GET", body, signal } = {}) {
  let token;
  try {
    token = await getAccessToken();
  } catch (error) {
    throw new ApiError("Your session could not be verified. Please sign in again.", {
      status: 401,
      cause: error,
    });
  }

  if (!token) {
    throw new ApiError("Your session has expired. Please sign in again.", {
      status: 401,
    });
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError(
      "Pixel can't reach the server right now. Check that the API is running and try again.",
      { status: 0, cause: error },
    );
  }

  const data = await readJson(response);

  if (!response.ok) {
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter = retryAfterHeader
      ? Number(retryAfterHeader)
      : null;
    const message =
      data?.error ||
      (response.status === 429
        ? "You've made a lot of requests. Give Pixel a minute and try again."
        : "Pixel couldn't complete that request. Please try again.");
    throw new ApiError(message, {
      status: response.status,
      retryAfter: Number.isFinite(retryAfter) ? retryAfter : null,
    });
  }

  return data;
}

export async function sendMessage(message) {
  if (typeof message !== "string" || !message.trim()) {
    throw new ApiError("Write a message before sending.");
  }

  if (message.length > 4000) {
    throw new ApiError("That message is too long. Keep it under 4,000 characters.");
  }

  const data = await request("/api/agent/chat", {
    method: "POST",
    body: { message },
  });

  if (typeof data?.reply !== "string") {
    throw new ApiError("Pixel returned an unexpected response. Please try again.");
  }

  return {
    type: data.type || "text",
    reply: data.reply,
    urls: Array.isArray(data.urls) ? data.urls.filter(isSafeUrl) : [],
  };
}

export async function getGoogleStatus() {
  const data = await request("/api/google/status");
  return Boolean(data?.connected);
}

export async function getGoogleAuthUrl() {
  const data = await request("/api/google/auth");
  if (!data?.url || !isSafeUrl(data.url)) {
    throw new ApiError("Google connection is unavailable right now.");
  }
  return data.url;
}
