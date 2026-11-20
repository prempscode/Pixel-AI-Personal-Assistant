import { useCallback, useEffect, useRef, useState } from "react";
import { sendMessage } from "../services/api";

// Only http/https links are ever rendered as clickable.
const isSafeUrl = (url) => /^https?:\/\//i.test(url);
const MAX_STORED = 50; // mirrors the server, which keeps the last 50 messages
const uid = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());

function load(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Chat state for one signed-in user.
 *
 * The backend remembers the last 50 messages server-side but exposes no
 * endpoint to read them back. So this hook keeps a local copy of what this
 * browser has shown, purely so a refresh doesn't blank the screen. It is a
 * display cache; the server remains the source of truth for what Pixel
 * remembers.
 */
export function useChat(userId, { onAuthError } = {}) {
  const storageKey = `pixel:transcript:${userId}`;
  const [messages, setMessages] = useState(() => load(storageKey));
  const [sending, setSending] = useState(false);
  const inflight = useRef(false);

  useEffect(() => {
    const persistable = messages
      .filter((m) => !m.error)
      .slice(-MAX_STORED);
    try {
      localStorage.setItem(storageKey, JSON.stringify(persistable));
    } catch {
      /* storage full or blocked: display cache only, safe to ignore */
    }
  }, [messages, storageKey]);

  const run = useCallback(
    async (text) => {
      inflight.current = true;
      setSending(true);
      try {
        const result = await sendMessage(text);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: result.reply || "(Pixel returned an empty reply.)",
            urls: (result.urls || []).filter(isSafeUrl),
            ts: Date.now(),
          },
        ]);
      } catch (err) {
        if (err.kind === "auth") onAuthError?.();
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: err.message,
            error: { kind: err.kind || "server", retryText: text },
            ts: Date.now(),
          },
        ]);
      } finally {
        inflight.current = false;
        setSending(false);
      }
    },
    [onAuthError],
  );

  const send = useCallback(
    (raw) => {
      const text = raw.trim();
      if (!text || inflight.current) return false;
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", text, ts: Date.now() },
      ]);
      run(text);
      return true;
    },
    [run],
  );

  const retry = useCallback(
    (errorMessageId, text) => {
      if (inflight.current || !text) return;
      setMessages((prev) => prev.filter((m) => m.id !== errorMessageId));
      run(text);
    },
    [run],
  );

  const clear = useCallback(() => setMessages([]), []);

  return { messages, sending, send, retry, clear };
}
