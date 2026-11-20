import { useState } from "react";
import Logo from "../ui/Logo";
import GoogleCard from "./GoogleCard";
import { PROMPT_GROUPS } from "./prompts";
import { cn } from "../../lib/cn";

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
  const userMessages = messages.filter((m) => m.role === "user");
  const meta = user.user_metadata || {};
  const name = meta.full_name || meta.name || user.email;
  const avatar = meta.avatar_url || meta.picture;

  return (
    <div className="flex h-full w-[300px] max-w-full flex-col border-r border-line bg-ink-900">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Logo />
        {onClose && (
          <button onClick={onClose} aria-label="Close sidebar" className="-mr-2 rounded-lg p-2 text-muted hover:bg-white/5 hover:text-paper">
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
            {PROMPT_GROUPS.map((g) => (
              <div key={g.id}>
                <p className="mb-1.5 flex items-center gap-2 px-1 text-[0.78rem] font-medium text-muted">
                  <span className={cn("size-1.5 rounded-full", g.dot)} />
                  {g.label}
                </p>
                <ul className="space-y-0.5">
                  {g.prompts.map((p) => (
                    <li key={p}>
                      <button
                        onClick={() => onPick(p)}
                        title={p}
                        className="w-full rounded-lg px-2.5 py-2 text-left text-[0.84rem] leading-snug text-paper/85 transition-colors hover:bg-white/5 hover:text-paper"
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
                    className="flex w-full items-baseline gap-2.5 rounded-lg px-2.5 py-2 text-left text-[0.84rem] leading-snug text-paper/85 transition-colors hover:bg-white/5 hover:text-paper"
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
            <p className="text-sm font-medium">Clear this device's transcript?</p>
            <p className="mt-1 text-[0.75rem] leading-snug text-muted">
              This only clears what's shown here. Pixel still remembers your recent conversation on the server.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => { onClear(); setConfirmClear(false); }}
                className="rounded-full bg-paper px-3.5 py-1.5 text-[0.8rem] font-medium text-ink-950 hover:bg-white"
              >
                Clear
              </button>
              <button onClick={() => setConfirmClear(false)} className="rounded-full px-3.5 py-1.5 text-[0.8rem] text-muted hover:text-paper">
                Keep
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {avatar ? (
                <img src={avatar} alt="" referrerPolicy="no-referrer" className="size-9 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink-700 text-sm font-medium uppercase">
                  {(name || "?").slice(0, 1)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                {name !== user.email && <p className="truncate text-[0.72rem] text-dim">{user.email}</p>}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <button onClick={onSignOut} className="rounded-lg px-2.5 py-1.5 text-[0.8rem] text-muted transition-colors hover:bg-white/5 hover:text-paper">
                Sign out
              </button>
              <button
                onClick={() => setConfirmClear(true)}
                disabled={messages.length === 0}
                className="rounded-lg px-2.5 py-1.5 text-[0.8rem] text-muted transition-colors hover:bg-white/5 hover:text-paper disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
              >
                Clear transcript
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
