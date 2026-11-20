import { ArrowUpRight } from "lucide-react";
import { getLinkMeta } from "../../lib/linkServices";
import { cn } from "../../lib/cn";

export default function LinkCard({ href, text = "", className, compact = false }) {
  const meta = getLinkMeta(href, text);
  if (!meta) return null;

  const Icon = meta.Icon;

  return (
    <a
      href={meta.url}
      target="_blank"
      rel="noopener noreferrer"
      title={meta.url}
      aria-label={`${meta.label} — ${meta.sublabel} (opens in a new tab)`}
      className={cn(
        "group/link inline-flex max-w-full items-center gap-2.5 rounded-xl border border-ink/10 bg-[var(--chat-card)] align-middle transition-[background-color,border-color,transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-ink/20 hover:bg-[var(--chat-card-hover)] hover:shadow-[0_12px_30px_-22px_rgba(10,11,9,0.5)]",
        compact ? "min-w-[180px] px-2.5 py-2" : "min-w-[200px] px-3 py-2.5",
        className,
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg border",
          compact ? "size-7" : "size-8",
          meta.toneClass,
        )}
      >
        <Icon className={compact ? "size-3.5" : "size-4"} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold text-ink/78">
          {meta.label}
        </span>
        <span className="mt-0.5 block truncate text-[8.5px] font-medium tracking-[0.02em] text-ink/40">
          {meta.sublabel}
        </span>
      </span>

      <ArrowUpRight
        className="size-3.5 shrink-0 text-ink/25 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-ink/55"
        strokeWidth={1.8}
      />
    </a>
  );
}
