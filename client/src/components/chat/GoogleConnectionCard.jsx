import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

function ScopePill({ label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-paper/10 bg-paper/[0.025] px-1.5 py-1 text-[8px] font-medium text-paper/38">
      <Check className="size-2 text-volt/75" strokeWidth={3} />
      {label}
    </span>
  );
}

export default function GoogleConnectionCard({
  status,
  error,
  connecting,
  onConnect,
  onRetry,
}) {
  return (
    <div className="rounded-2xl border border-paper/10 bg-paper/[0.03] p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[8.5px] font-bold tracking-[0.16em] text-paper/28 uppercase">
          Google workspace
        </p>
        <span
          className={cn(
            "size-1.5 rounded-full",
            status === "connected"
              ? "bg-[#8fbd67]"
              : status === "error"
                ? "bg-coral"
                : "bg-paper/20",
          )}
        />
      </div>

      {status === "loading" && (
        <div className="mt-3 space-y-2" aria-label="Checking Google connection">
          <div className="h-2.5 w-28 rounded-full shimmer" />
          <div className="h-2 w-full rounded-full shimmer" />
          <div className="h-2 w-2/3 rounded-full shimmer" />
        </div>
      )}

      {status === "connected" && (
        <>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-volt text-ink">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-paper/74">Connected</p>
              <p className="mt-0.5 text-[8.5px] text-paper/28">
                Pixel can act in your workspace
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            <ScopePill label="Calendar" />
            <ScopePill label="Tasks" />
            <ScopePill label="Gmail" />
            <ScopePill label="Drive" />
          </div>
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[8.5px] font-medium text-paper/28 transition hover:text-paper/60"
          >
            Manage access
            <ArrowUpRight className="size-2.5" />
          </a>
        </>
      )}

      {status === "disconnected" && (
        <>
          <p className="mt-3 text-[10px] leading-4 text-paper/50">
            Connect once to let Pixel create tasks, block time, draft email and
            find files.
          </p>
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting}
            className="mt-3 inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-volt text-[10px] font-semibold text-ink transition hover:bg-volt-bright disabled:opacity-60"
          >
            {connecting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <ArrowUpRight className="size-3" />
            )}
            {connecting ? "Connecting…" : "Connect Google"}
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mt-3 flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-coral" />
            <p className="text-[10px] leading-4 text-paper/50">
              {error || "We couldn't verify your Google connection."}
            </p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-paper/12 text-[10px] font-semibold text-paper/55 transition hover:bg-paper/[0.05] hover:text-paper"
          >
            <RefreshCw className="size-3" />
            Try again
          </button>
        </>
      )}
      <div className="mt-3 flex gap-3 text-[8.5px] text-paper/28">
        <Link className="transition hover:text-paper/60" to="/privacy">Privacy</Link>
        <Link className="transition hover:text-paper/60" to="/terms">Terms</Link>
      </div>
    </div>
  );
}
