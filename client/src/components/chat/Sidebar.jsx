import { useEffect, useRef, useState } from "react";
import Logo from "../ui/Logo";
import GoogleCard from "./GoogleCard";
import { PROMPT_GROUPS } from "./prompts";
import ServiceIcon from "../ui/ServiceIcon";

const clip = (s, n = 46) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);

function Section({ title, children }) {
  return (
    <section className="px-4 py-4">
      <h2 className="eyebrow mb-3 px-1">{title}</h2>
      {children}
    </section>
  );
}

export default function Sidebar({ user, google, messages, onPick, onJump, onClear, onSignOut, onClose }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const userMessages = messages.filter((m) => m.role === "user");
  const meta = user.user_metadata || {};
  const name = meta.full_name || meta.name || user.email;
  const avatar = meta.avatar_url || meta.picture;

  useEffect(() => {
    if (!settingsOpen) return;

    const handlePointerDown = (event) => {
      if (!settingsRef.current?.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  return (
    <div className="flex h-full w-[300px] max-w-full flex-col border-r border-line bg-ink-900">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Logo />
        {onClose && (
          <button onClick={onClose} aria-label="Close sidebar" className="-mr-2 rounded-lg p-2 text-muted hover:bg-paper/5 hover:text-paper">
            <svg viewBox="0 0 16 16" width="16" height="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </button>
        )}
      </div>

      <nav aria-label="Sidebar" className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        <div className="px-4 pt-1">
          <GoogleCard google={google} />
        </div>

        <Section title="Try asking">
          <div className="space-y-4">
            <button
              onClick={() => onPick("Write a Hello World program in Python")}
              title="Write a Hello World program in Python"
              className="group/example flex w-full items-center gap-3 rounded-xl border border-ember/20 bg-ember/[0.05] p-3 text-left transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-ember/40 hover:bg-ember/[0.09] hover:shadow-[0_12px_28px_-20px_rgb(255_90_44/0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-ember/15 bg-ember/[0.08] text-ember transition-transform duration-300 group-hover/example:scale-110">
                <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6.5 5-4 5 4 5M13.5 5l4 5-4 5M11.5 3l-3 14" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.82rem] font-medium text-paper">
                  Write Hello World code
                </span>
                <span className="block text-[0.68rem] text-muted">
                  Try a Python example
                </span>
              </span>
              <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-ember/70 transition-transform duration-300 group-hover/example:translate-x-1 group-hover/example:text-ember" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
            {PROMPT_GROUPS.map((g) => (
              <div key={g.id}>
                <p className="mb-1.5 flex items-center gap-2 px-1 text-[0.78rem] font-medium text-muted">
                  <ServiceIcon service={g.icon} size={14} />
                  {g.label}
                </p>
                <ul className="space-y-0.5">
                  {g.prompts.map((p) => (
                    <li key={p}>
                      <button
                        onClick={() => onPick(p)}
                        title={p}
                        className="w-full rounded-lg px-2.5 py-2 text-left text-[0.84rem] leading-snug text-paper/85 transition-colors hover:bg-paper/5 hover:text-paper"
                      >
                        {clip(p, 64)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="This conversation">
          {userMessages.length === 0 ? (
            <p className="px-1 text-[0.82rem] leading-relaxed text-dim">
              Your requests will appear here so you can jump back to them.
            </p>
          ) : (
            <ol className="space-y-0.5">
              {userMessages.map((m, i) => (
                <li key={m.id}>
                  <button
                    onClick={() => onJump(m.id)}
                    title={m.text}
                    className="flex w-full items-baseline gap-2.5 rounded-lg px-2.5 py-2 text-left text-[0.84rem] leading-snug text-paper/85 transition-colors hover:bg-paper/5 hover:text-paper"
                  >
                    <span className="font-mono text-[0.68rem] text-dim">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 truncate">{clip(m.text)}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Section>
      </nav>

      <div className="shrink-0 border-t border-line p-4">
        {confirmClear ? (
          <div role="alertdialog" aria-label="Clear transcript" className="rounded-2xl border border-line-strong bg-ink-850 p-3.5">
            <p className="text-sm font-medium">Start a new chat view?</p>
            <p className="mt-1 text-[0.75rem] leading-snug text-muted">
              This clears the visible transcript. Pixel may still use the last 20 messages as context.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => { onClear(); setConfirmClear(false); }}
                className="rounded-full bg-ember px-3.5 py-1.5 text-[0.8rem] font-medium text-ink-950 transition-colors hover:bg-ember/90"
              >
                Clear transcript
              </button>
              <button onClick={() => setConfirmClear(false)} className="rounded-full px-3.5 py-1.5 text-[0.8rem] text-muted hover:text-paper">
                Keep
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="group/clear relative min-w-0 flex-1">
              <button
                onClick={() => setConfirmClear(true)}
                disabled={messages.length === 0}
                aria-describedby="clear-transcript-help"
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-ember px-3 text-[0.8rem] font-semibold text-ink-950 transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-ember/90 hover:shadow-[0_10px_26px_-16px_rgb(255_90_44/0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-ember disabled:hover:shadow-none"
              >
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2.5 4.5h11M6 4.5V3h4v1.5m2.5 0-.6 8.2H4.1l-.6-8.2M6.5 7v3.5M9.5 7v3.5" />
                </svg>
                Clear transcript
              </button>
              <div
                id="clear-transcript-help"
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-0 z-30 mb-3 w-64 translate-y-1 rounded-xl border border-line-strong bg-ink-850 p-3 text-[0.75rem] leading-relaxed text-muted opacity-0 shadow-2xl transition-[opacity,transform] duration-200 group-hover/clear:translate-y-0 group-hover/clear:opacity-100 group-focus-within/clear:translate-y-0 group-focus-within/clear:opacity-100"
              >
                Starts a <strong className="font-semibold text-paper">new chat</strong> view by clearing this transcript. It does not{" "}
                <strong className="font-semibold text-ember">clear context</strong>: Pixel can still use the last 20 messages.
              </div>
            </div>

            <div ref={settingsRef} className="relative">
              <button
                type="button"
                onClick={() => setSettingsOpen((open) => !open)}
                aria-label="Account settings"
                aria-haspopup="dialog"
                aria-expanded={settingsOpen}
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-ink-850 text-muted transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-ink-700 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="10" cy="10" r="2.6" />
                  <path d="m16.1 11.6 1.1.9-1.2 2-1.4-.5a6.4 6.4 0 0 1-1.5.9l-.3 1.5h-2.4l-.3-1.5a6.4 6.4 0 0 1-1.5-.9l-1.4.5-1.2-2 1.1-.9a6 6 0 0 1 0-1.8l-1.1-.9 1.2-2 1.4.5a6.4 6.4 0 0 1 1.5-.9l.3-1.5h2.4l.3 1.5a6.4 6.4 0 0 1 1.5.9l1.4-.5 1.2 2-1.1.9a6 6 0 0 1 0 1.8Z" />
                </svg>
              </button>

              {settingsOpen && (
                <div
                  role="dialog"
                  aria-label="Account settings"
                  className="absolute bottom-full right-0 z-30 mb-3 w-64 rounded-2xl border border-line-strong bg-ink-850 p-3.5 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    {avatar ? (
                      <img src={avatar} alt="" referrerPolicy="no-referrer" className="size-9 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink-700 text-sm font-medium uppercase">
                        {(name || "?").slice(0, 1)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-paper">{name}</p>
                      {name !== user.email && (
                        <p className="truncate text-[0.72rem] text-dim">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsOpen(false);
                      onSignOut();
                    }}
                    className="mt-3 w-full rounded-lg px-2.5 py-2 text-left text-[0.8rem] text-muted transition-colors hover:bg-paper/5 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
