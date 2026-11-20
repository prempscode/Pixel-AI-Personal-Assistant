import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Loader2,
  X,
} from "lucide-react";

export default function GoogleBanner({
  status,
  error,
  connecting,
  onConnect,
  onRetry,
  onDismiss,
}) {
  const isError = status === "error";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="google-banner overflow-hidden border-b"
    >
      <div className="mx-auto flex w-full max-w-[900px] items-center gap-3 px-4 py-2.5 sm:px-8">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
          {isError ? (
            <AlertCircle className="size-3.5 text-coral" />
          ) : (
            <span className="grid grid-cols-2 gap-[1.5px]">
              <span className="size-[3px] bg-paper" />
              <span className="size-[3px] bg-paper/40" />
              <span className="size-[3px] bg-paper/40" />
              <span className="size-[3px] bg-volt" />
            </span>
          )}
        </span>
        <p className="min-w-0 flex-1 text-[10.5px] leading-4">
          {isError ? (
            <>
              <strong className="font-semibold">
                We couldn’t verify Google.
              </strong>{" "}
              {error || "Reconnect to keep making changes."}
            </>
          ) : (
            <>
              <strong className="font-semibold">
                Connect Google to get things done.
              </strong>{" "}
              <span className="hidden sm:inline">
                Pixel needs your permission before it can act in Calendar, Gmail,
                Tasks or Drive.
              </span>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={isError ? onRetry : onConnect}
          disabled={connecting}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 text-[9px] font-semibold text-paper transition hover:bg-ink-soft disabled:opacity-55"
        >
          {connecting && <Loader2 className="size-2.5 animate-spin" />}
          {isError ? "Retry" : "Connect"}
          {!connecting && <ArrowUpRight className="size-2.5" />}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink/30 transition hover:bg-ink/5 hover:text-ink/60"
          aria-label="Dismiss Google connection notice"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
