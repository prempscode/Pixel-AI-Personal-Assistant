import {
  Children,
  isValidElement,
  lazy,
  memo,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LogoMark } from "../ui/Logo";
import Button from "../ui/Button";
import { cn } from "../../lib/cn";
import { copyText } from "../../lib/clipboard";
import { isCodeLanguage } from "../../lib/codeLanguages";
import "../../styles/markdown.css";

const LazyCodeBlock = lazy(() => import("./MarkdownCodeBlock"));

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

const isSafeUrl = (url) => /^https?:\/\//i.test(url);

function LinkCard({ url, text }) {
  if (!isSafeUrl(url)) return null;

  const host = hostOf(url);
  const label =
    typeof text === "string" && text.trim() && !isSafeUrl(text.trim())
      ? text.trim()
      : host;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      aria-label={`${label} — opens ${host} in a new tab`}
      className="group/link inline-flex max-w-full items-center gap-3 rounded-xl border border-line bg-ink-900 px-3.5 py-2.5 align-middle transition-[background-color,border-color,transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-line-strong hover:bg-ink-800 hover:shadow-[0_12px_30px_-22px_rgb(0_0_0/0.55)]"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-ember/15 bg-ember/[0.08] text-ember">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M8.2 11.8 11.8 8.2" />
          <path d="M6.6 13.4h-.8a3.2 3.2 0 0 1 0-6.4h3" />
          <path d="M13.4 6.6h.8a3.2 3.2 0 0 1 0 6.4h-3" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-paper">{label}</span>
        <span className="block truncate font-mono text-[0.7rem] text-dim">
          {label === host ? url : host}
        </span>
      </span>
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-dim transition-colors group-hover/link:text-paper" aria-hidden="true">
        <path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />
      </svg>
    </a>
  );
}

function MarkdownLink({ href, children }) {
  if (!href || !isSafeUrl(href)) return <>{children}</>;

  return (
    <LinkCard
      url={href}
      text={typeof children === "string" ? children : ""}
    />
  );
}

function flattenText(node) {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (isValidElement(node)) return flattenText(node.props.children);
  return "";
}

function CodeBlockFallback({ code, language }) {
  return (
    <div className="md-code-block">
      <div className="md-code-toolbar">
        <span className="font-mono text-[9px] font-semibold tracking-[0.08em] text-[var(--code-muted)] uppercase">
          {language || "Code"}
        </span>
      </div>
      <pre className="md-code-fallback">{code}</pre>
    </div>
  );
}

function MarkdownPre({ children }) {
  const codeElement = Children.toArray(children).find(isValidElement);
  const className = codeElement?.props?.className || "";
  const language = /language-([^\s]+)/.exec(className)?.[1] || "";
  const code = flattenText(codeElement?.props?.children ?? children).replace(/\n$/, "");

  if (!isCodeLanguage(language)) {
    return <pre className="md-plain-block">{code}</pre>;
  }

  return (
    <Suspense fallback={<CodeBlockFallback code={code} language={language} />}>
      <LazyCodeBlock code={code} language={language} />
    </Suspense>
  );
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

function extractTextUrls(text) {
  const matches = String(text || "").match(/https?:\/\/[^\s<>"')\]]+/gi) || [];
  return matches.map((url) => url.replace(/[.,;:!?]+$/g, ""));
}

const markdownComponents = {
  a: MarkdownLink,
  code: ({ className, children }) => (
    <code className={className || "md-inline-code"}>{children}</code>
  ),
  pre: MarkdownPre,
  table: ({ children }) => (
    <div className="markdown-table-wrap">
      <table>{children}</table>
    </div>
  ),
};

function safeUrlTransform(url) {
  return isSafeUrl(url) ? url : "";
}

function Message({ m, onCopy, onRetry, confirmable, onConfirm, onCancel, sending }) {
  const isUser = m.role === "user";
  const [copied, setCopied] = useState(false);
  const extraUrls = useMemo(() => {
    const contentUrls = new Set(
      extractTextUrls(m.text).map(normalizeUrl),
    );
    const seen = new Set();

    return (m.urls || []).filter((url) => {
      if (!isSafeUrl(url)) return false;
      const key = normalizeUrl(url);
      if (seen.has(key) || contentUrls.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [m.text, m.urls]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      const success = await copyText(m.text);
      if (!success) {
        onCopy?.(false);
        return;
      }
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

      <div className={cn("flex min-w-0 max-w-[min(38rem,92%)] flex-col", isUser ? "items-end" : "items-start")}>
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
              "break-words px-3.5 py-2.5 text-sm leading-relaxed",
              isUser
                ? "whitespace-pre-wrap rounded-2xl rounded-br-md bg-paper text-ink-950"
                : "rounded-2xl rounded-tl-md border border-line bg-ink-850 text-paper",
            )}
          >
            {isUser ? (
              m.text
            ) : (
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={safeUrlTransform}
                  components={markdownComponents}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {extraUrls.length > 0 && (
          <div className="mt-2 flex w-full flex-col gap-2">
            {extraUrls.map((u) => (
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
          {!m.error && (
            <motion.button
              type="button"
              onClick={copy}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 opacity-0 transition-[opacity,color,background-color] duration-200 hover:bg-paper/5 hover:text-paper focus-visible:opacity-100 group-hover/msg:opacity-100 max-lg:opacity-100"
              aria-label={copied ? "Copied to clipboard" : isUser ? "Copy message" : "Copy reply"}
            >
              {copied ? (
                <svg viewBox="0 0 16 16" className="size-3 text-ok" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m3.5 8.2 2.8 2.8 6.2-6.2" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
                  <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
                </svg>
              )}
              {copied ? "Copied" : "Copy"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.li>
  );
}

export default memo(Message);
