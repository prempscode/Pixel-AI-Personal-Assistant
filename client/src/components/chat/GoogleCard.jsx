import Button, { GoogleG } from "../ui/Button";
import GoogleConnectedStatus from "../ui/GoogleConnectedStatus";
import { cn } from "../../lib/cn";

/** Connection state for the user's Google account (GET /api/google/status). */
export default function GoogleCard({ google, compact = false }) {
  const { status, connect, connecting, connectError, refresh } = google;

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-line bg-ink-850 p-3.5" aria-busy="true">
        <div className="h-3 w-24 animate-shimmer rounded bg-[linear-gradient(90deg,var(--color-ink-700),var(--color-ink-800),var(--color-ink-700))] bg-[length:200%_100%]" />
        <div className="mt-2.5 h-3 w-36 animate-shimmer rounded bg-[linear-gradient(90deg,var(--color-ink-700),var(--color-ink-800),var(--color-ink-700))] bg-[length:200%_100%]" />
      </div>
    );
  }

  if (status === "connected") {
    return (
      <GoogleConnectedStatus
        labelTag="p"
        labelClassName="text-sm font-medium"
        className="rounded-2xl border border-line bg-ink-850 p-3.5"
      >
        {!compact && <p className="text-[0.75rem] text-muted">Tasks, Calendar, Gmail, Drive</p>}
        {!compact && (
          <button
            type="button"
            onClick={google.disconnect}
            disabled={google.disconnecting}
            className="mt-3 block box-border min-h-9 w-full min-w-0 max-w-full rounded-lg px-2.5 py-2 text-left text-[0.75rem] text-muted transition-colors hover:bg-paper/5 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:opacity-50"
          >
            {google.disconnecting ? "Disconnecting…" : "Disconnect Google"}
          </button>
        )}
      </GoogleConnectedStatus>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/[0.06] p-3.5">
        <p className="text-sm font-medium text-danger">Couldn't check Google</p>
        <p className="mt-0.5 text-[0.75rem] text-muted">The server didn't respond.</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-ember/30 bg-ember/[0.06] p-3.5")}>
      <p className="text-sm font-medium">Connect your Google account</p>
      <p className="mt-0.5 text-[0.78rem] leading-snug text-muted">
        Pixel needs access before it can use Tasks, Calendar, Gmail and Drive.
      </p>
      <Button size="sm" variant="ember" className="mt-3" onClick={connect} loading={connecting}>
        {!connecting && <GoogleG />}
        Connect Google
      </Button>
      {connectError && <p role="alert" className="mt-2 text-[0.75rem] text-danger">{connectError}</p>}
    </div>
  );
}
