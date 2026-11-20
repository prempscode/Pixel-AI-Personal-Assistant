import { memo, useEffect, useState } from "react";
import { motion } from "motion/react";
import { LogoMark } from "../ui/Logo";
import Button from "../ui/Button";
import { cn } from "../../lib/cn";

const time = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const ERROR_COPY = {
  network: "Can't reach Pixel",
  rate_limit: "Slow down a moment",
  auth: "Session expired",
  validation: "Message not accepted",
  server: "Something went wrong",
};

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function LinkCard({ url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/link flex items-center gap-3 rounded-xl border border-line bg-ink-900 px-3.5 py-2.5 transition-colors hover:border-line-strong hover:bg-ink-800"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-700 font-mono text-xs uppercase text-muted">
        {hostOf(url).slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-paper">{hostOf(url)}</span>
        <span className="block truncate font-mono text-[0.7rem] text-dim">{url}</span>
      </span>
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-dim transition-colors group-hover/link:text-paper" aria-hidden="true">
        <path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />
      </svg>
    </a>
  );
}

function Message({ m, onCopy, onRetry, confirmable, onConfirm, onCancel, sending }) {
  const isUser = m.role === "user";
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(m.text);
      setCopied(true);
      onCopy?.(true);
    } catch {
      onCopy?.(false);
    }
  };

  return (
    <motion.li
      id={`msg-${m.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group/msg flex gap-3 scroll-mt-4", isUser && "justify-end")}
    >
      {!isUser && (
        <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl border border-line bg-ink-850">
          <LogoMark size={16} />
        </span>
      )}

      <div className={cn("flex min-w-0 max-w-[min(42rem,88%)] flex-col", isUser ? "items-end" : "items-start")}>
        {m.error ? (
          <div role="alert" className="rounded-2xl rounded-tl-md border border-danger/30 bg-danger/[0.06] px-4 py-3.5">
            <p className="flex items-center gap-2 text-sm font-medium text-danger">
              <span className="size-1.5 rounded-full bg-danger" />
              {ERROR_COPY[m.error.kind] || ERROR_COPY.server}
            </p>
            <p className="mt-1 text-[0.92rem] leading-relaxed text-paper/85">{m.text}</p>
            {m.error.kind !== "auth" && m.error.kind !== "validation" && (
              <Button size="sm" variant="outline" className="mt-3" disabled={sending} onClick={() => onRetry(m)}>
                Try again
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "whitespace-pre-wrap break-words px-4 py-3 text-[0.95rem] leading-relaxed",
              isUser
                ? "rounded-2xl rounded-br-md bg-paper text-ink-950"
                : "rounded-2xl rounded-tl-md border border-line bg-ink-850 text-paper",
            )}
          >
            {m.text}
          </div>
        )}

        {m.urls?.length > 0 && (
          <div className="mt-2 flex w-full flex-col gap-2">
            {m.urls.map((u) => (
              <LinkCard key={u} url={u} />
            ))}
          </div>
        )}

        {confirmable && (
          <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Confirm sending this email">
            <Button size="sm" variant="ember" disabled={sending} onClick={onConfirm}>
              Yes, send it
            </Button>
            <Button size="sm" variant="outline" disabled={sending} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}

        <div className={cn("mt-1.5 flex items-center gap-3 px-1 font-mono text-[0.68rem] text-dim", isUser && "flex-row-reverse")}>
          <time dateTime={new Date(m.ts).toISOString()}>{time(m.ts)}</time>
          {!isUser && !m.error && (
            <button
              onClick={copy}
              className="opacity-0 transition-opacity hover:text-paper focus-visible:opacity-100 group-hover/msg:opacity-100 max-lg:opacity-100"
              aria-label="Copy reply"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </motion.li>
  );
}

export default memo(Message);
