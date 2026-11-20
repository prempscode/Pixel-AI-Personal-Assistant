import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";

const CONFIRM_RE = /send it\?/i;
const CONFIRM_WINDOW_MS = 5 * 60 * 1000; // the server holds a pending email for 5 minutes

export default function MessageList({ messages, sending, name, onPick, onRetry, onSend, onCopy, scrollerRef }) {
  const endRef = useRef(null);
  const [away, setAway] = useState(false); // user scrolled up, don't yank them down

  useEffect(() => {
    if (!away || sending === false) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, sending, away]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    setAway(el.scrollHeight - el.scrollTop - el.clientHeight > 160);
  };

  const last = messages[messages.length - 1];
  const candidate =
    last && last.role === "assistant" && !last.error && CONFIRM_RE.test(last.text) && !sending
      ? last
      : null;

  // The server drops a pending email after 5 minutes, so stop offering the
  // buttons then. Driven by a timer, not by Date.now() during render.
  const [expiredId, setExpiredId] = useState(null);
  const candidateId = candidate?.id;
  const candidateTs = candidate?.ts;
  useEffect(() => {
    if (!candidateId) return;
    const remaining = CONFIRM_WINDOW_MS - (Date.now() - candidateTs);
    const t = setTimeout(() => setExpiredId(candidateId), Math.max(remaining, 0));
    return () => clearTimeout(t);
  }, [candidateId, candidateTs]);
  const confirmId = candidateId && expiredId !== candidateId ? candidateId : null;

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollerRef} onScroll={onScroll} className="scroll-thin h-full overflow-y-auto px-4 sm:px-8">
        {messages.length === 0 && !sending ? (
          <EmptyState name={name} onPick={onPick} />
        ) : (
          <ol aria-label="Conversation" className="mx-auto flex max-w-3xl flex-col gap-6 py-8">
            {messages.map((m) => (
              <Message
                key={m.id}
                m={m}
                sending={sending}
                onCopy={onCopy}
                onRetry={(msg) => onRetry(msg.id, msg.error.retryText)}
                confirmable={m.id === confirmId}
                onConfirm={() => onSend("Yes, send it")}
                onCancel={() => onSend("Cancel, don't send it")}
              />
            ))}
            <AnimatePresence>{sending && <TypingIndicator key="typing" />}</AnimatePresence>
            <li ref={endRef} aria-hidden="true" className="h-px" />
          </ol>
        )}
      </div>
      {away && messages.length > 0 && (
        <button
          onClick={() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line-strong bg-ink-800 px-3.5 py-1.5 text-xs text-paper shadow-lg hover:bg-ink-700"
        >
          Jump to latest ↓
        </button>
      )}
    </div>
  );
}
