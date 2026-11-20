import { AlertCircle, ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export default function GoogleStatusPill({
  status,
  connecting,
  onConnect,
}) {
  if (status === "loading" || connecting) {
    return (
      <span className="inline-flex h-8 items-center gap-2 rounded-full border border-ink/10 bg-[var(--chat-pill)] px-3 text-[9.5px] font-semibold text-ink/48">
        <Loader2 className="size-3 animate-spin" />
        <span className="hidden sm:inline">
          {connecting ? "Connecting…" : "Checking…"}
        </span>
        <span className="sm:hidden">Google</span>
      </span>
    );
  }

  if (status === "connected") {
    return (
      <span
        className="inline-flex h-8 items-center gap-2 rounded-full border border-ink/10 bg-[var(--chat-pill)] px-3 text-[9.5px] font-semibold text-ink/50"
        title="Google Workspace connected"
        aria-label="Google Workspace connected"
      >
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#6e9851] opacity-40" />
          <span className="relative inline-flex size-1.5 rounded-full bg-[#6e9851]" />
        </span>
        <span className="sm:hidden">Google</span>
        <span className="hidden sm:inline">Google connected</span>
      </span>
    );
  }

  const isError = status === "error";

  return (
    <button
      type="button"
      onClick={onConnect}
      title={
        isError
          ? "Couldn't verify the connection. Click to reconnect."
          : "Connect your Google workspace"
      }
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[9.5px] font-semibold transition duration-300",
        isError
          ? "border-coral/25 bg-coral/10 text-coral hover:bg-coral/15"
          : "border-ink bg-ink text-paper hover:bg-ink-soft",
      )}
    >
      {isError ? (
        <AlertCircle className="size-3" />
      ) : (
        <span className="size-1.5 rounded-full bg-volt" />
      )}
      <span className="sm:hidden">{isError ? "Reconnect" : "Connect"}</span>
      <span className="hidden sm:inline">
        {isError ? "Reconnect Google" : "Connect Google"}
      </span>
      <ArrowUpRight className="size-3" />
    </button>
  );
}
