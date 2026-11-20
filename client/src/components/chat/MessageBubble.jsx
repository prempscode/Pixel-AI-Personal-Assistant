import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  RefreshCw,
} from "lucide-react";
import {
  formatMessageTime,
  isSafeUrl,
} from "../../lib/constants";
import {
  extractUrls,
  normalizeUrlKey,
} from "../../lib/linkServices";
import { copyText } from "../../lib/clipboard";
import { cn } from "../../lib/cn";
import { PixelMark } from "../ui/Logo";
import LinkCard from "./LinkCard";
import MarkdownRenderer from "./MarkdownRenderer";

export default function MessageBubble({ message, isSending, onRetry }) {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef(null);

  useEffect(
    () => () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  async function copyMessage() {
    const wasCopied = await copyText(message.text);
    setCopied(wasCopied);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    if (wasCopied) {
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1800);
    }
  }

  const entrance = reduceMotion
    ? false
    : { opacity: 0, y: 10 };
  const animate = { opacity: 1, y: 0 };
  const transition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };

  const extraUrls = useMemo(() => {
    const contentKeys = new Set(
      extractUrls(message.text || "").map(normalizeUrlKey),
    );
    const seen = new Set();

    return [...new Set((message.urls || []).filter(isSafeUrl))].filter(
      (url) => {
        const key = normalizeUrlKey(url);
        if (seen.has(key) || contentKeys.has(key)) return false;
        seen.add(key);
        return true;
      },
    );
  }, [message.text, message.urls]);

  if (message.role === "user") {
    return (
      <motion.article
        initial={entrance}
        animate={animate}
        transition={transition}
        aria-label="Your message"
        className="flex justify-end"
      >
        <div className="flex max-w-[86%] flex-col items-end sm:max-w-[76%]">
          <div className="rounded-[20px] rounded-br-[6px] bg-ink px-4 py-3 text-paper shadow-[0_12px_32px_-22px_rgba(10,11,9,0.75)]">
            <p className="message-copy text-[13.5px] text-paper/92">
              {message.text}
            </p>
          </div>
          <time
            dateTime={new Date(message.createdAt).toISOString()}
            className="mt-1.5 pr-1 text-[8.5px] font-medium text-ink/25"
          >
            {formatMessageTime(new Date(message.createdAt))}
          </time>
        </div>
      </motion.article>
    );
  }

  if (message.role === "error") {
    return (
      <motion.article
        initial={entrance}
        animate={animate}
        transition={transition}
        role="alert"
        className="chat-error-card rounded-2xl border p-4 sm:ml-11"
      >
        <div className="flex items-start gap-3">
          <span className="chat-error-icon flex size-7 shrink-0 items-center justify-center rounded-full">
            <AlertTriangle className="size-3.5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold">
              That didn’t go through.
            </p>
            <p className="chat-error-muted mt-1 text-[11px] leading-5">
              {message.text}
            </p>
            {message.retryText && (
              <button
                type="button"
                onClick={() => onRetry?.(message)}
                disabled={isSending}
                className="chat-error-action mt-3 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[9px] font-semibold transition disabled:pointer-events-none disabled:opacity-45"
              >
                <RefreshCw className="size-3" />
                Try again
              </button>
            )}
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={entrance}
      animate={animate}
      transition={transition}
      aria-label="Message from Pixel"
      className="group flex items-start gap-3 sm:gap-3.5"
    >
      <PixelMark className="mt-2 size-5 shrink-0 text-ink sm:mt-2.5 sm:size-6" />

      <div className="min-w-0 flex-1">
        <div className="assistant-message-surface max-w-[760px] rounded-2xl rounded-tl-md p-3.5 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[-0.01em] text-ink/72">
              Pixel
            </span>
            <span className="size-0.5 rounded-full bg-ink/20" />
            <time
              dateTime={new Date(message.createdAt).toISOString()}
              className="text-[8.5px] font-medium text-ink/25"
            >
              {formatMessageTime(new Date(message.createdAt))}
            </time>
            <button
              type="button"
              onClick={copyMessage}
              aria-label={copied ? "Message copied" : "Copy message"}
              title={copied ? "Copied" : "Copy message"}
              className={cn(
                "ml-1 flex size-6 items-center justify-center rounded-md text-ink/25 transition hover:bg-ink/5 hover:text-ink/60",
                "opacity-60 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
              )}
            >
              {copied ? (
                <Check className="size-3 text-volt" strokeWidth={2.4} />
              ) : (
                <Copy className="size-3" strokeWidth={1.8} />
              )}
            </button>
          </div>

          <div className="mt-2">
            <MarkdownRenderer
              content={message.text || "I finished that request."}
            />
          </div>

          {extraUrls.length > 0 && (
            <div className="mt-4 border-t border-ink/[0.08] pt-3">
              <p className="text-[8px] font-bold tracking-[0.14em] text-ink/25 uppercase">
                Links from Pixel
              </p>
              <div className="mt-2 flex flex-col items-start gap-1.5">
                {extraUrls.map((url) => (
                  <LinkCard
                    key={url}
                    href={url}
                    className="w-full max-w-[460px]"
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
