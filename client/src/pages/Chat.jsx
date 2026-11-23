import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../services/authService";
import { useChat } from "../hooks/useChat";
import { useGoogleStatus } from "../hooks/useGoogleStatus";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useToast } from "../components/ui/Toast";
import Sidebar from "../components/chat/Sidebar";
import MessageList from "../components/chat/MessageList";
import Composer from "../components/chat/Composer";
import GoogleCard from "../components/chat/GoogleCard";
import ThemeToggle from "../components/ui/ThemeToggle";
import { cn } from "../lib/cn";
import { deletePixelData } from "../services/api";

const GOOGLE_RESULTS = {
  connected: { tone: "success", title: "Google connected", body: "Pixel can now use your Tasks, Calendar, Gmail and Drive." },
  error: { tone: "error", title: "Google connection failed", body: "Something went wrong while connecting. Please try again." },
  no_refresh_token: {
    tone: "error",
    title: "Google didn't grant lasting access",
    body: "Try connecting again and accept every permission on the consent screen.",
  },
};

export default function Chat() {
  const { user } = useAuth();
  const { push } = useToast();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useReducedMotion();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  const scrollerRef = useRef(null);
  const google = useGoogleStatus();
  const [params, setParams] = useSearchParams();

  const onAuthError = useCallback(() => {
    push({ tone: "error", title: "Your session expired", body: "Please sign in again to continue." });
    signOut().catch(() => {});
  }, [push]);

  const { messages, sending, clearing, send, retry, clear } = useChat(user.id, { onAuthError });

  // Result of the server-side Google connect flow (?google=...), shown once.
  useEffect(() => {
    const result = params.get("google");
    if (!result) return;
    push(GOOGLE_RESULTS[result] || GOOGLE_RESULTS.error);
    const next = new URLSearchParams(params);
    next.delete("google");
    setParams(next, { replace: true });
  }, [params, setParams, push]);

  const submit = useCallback(() => {
    if (send(draft)) setDraft("");
  }, [send, draft]);

  const pick = useCallback((text) => {
    setDraft(text);
    setDrawerOpen(false);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      el?.focus();
      el?.setSelectionRange(text.length, text.length);
    });
  }, []);

  const jump = useCallback((id) => {
    setDrawerOpen(false);
    window.requestAnimationFrame(() => {
      const scroller = scrollerRef.current;
      const target = document.getElementById(`msg-${id}`);
      if (!scroller || !target) return;

      const top =
        scroller.scrollTop +
        target.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top -
        16;

      scroller.scrollTo({
        top: Math.max(0, top),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, [reduceMotion]);

  const firstName = (user.user_metadata?.full_name || user.user_metadata?.name || "").split(" ")[0];

  const sidebar = (
    <Sidebar
      user={user}
      google={google}
      messages={messages}
      onPick={pick}
      onJump={jump}
      onClear={clear}
      isSending={sending || clearing}
      onSignOut={() => signOut().catch(() => push({ tone: "error", title: "Couldn't sign out", body: "Please try again." }))}
      onDeleteData={async () => {
        await deletePixelData();
        await signOut();
      }}
      onClose={isDesktop ? undefined : () => setDrawerOpen(false)}
    />
  );

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const on = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [drawerOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-ink-950">
      {/* Desktop: collapsible column. Mobile/tablet: slide-over drawer. */}
      {isDesktop ? (
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 300 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 overflow-hidden"
          aria-hidden={!sidebarOpen}
          inert={!sidebarOpen}
        >
          {sidebar}
        </motion.aside>
      ) : (
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                key="scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                aria-hidden="true"
              />
              <motion.aside
                key="drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 420, damping: 40 }}
                className="fixed inset-y-0 left-0 z-50 w-[300px] max-w-[88vw]"
              >
                {sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4 sm:px-6">
          <button
            onClick={() => (isDesktop ? setSidebarOpen((o) => !o) : setDrawerOpen(true))}
            aria-label={isDesktop ? (sidebarOpen ? "Collapse sidebar" : "Expand sidebar") : "Open menu"}
            aria-expanded={isDesktop ? sidebarOpen : drawerOpen}
            className="-ml-1 grid size-9 place-items-center rounded-xl text-muted transition-colors hover:bg-paper/5 hover:text-paper"
          >
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <rect x="2.5" y="3.5" width="15" height="13" rx="3" />
              <path d="M8 3.5v13" />
            </svg>
          </button>
          <Link
            to="/"
            aria-label="Back to Pixel home"
            title="Back to home"
            className="-ml-1 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-1.5 text-sm font-medium text-muted transition-colors hover:text-paper"
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H17" />
            </svg>
            <span>Back</span>
          </Link>
          {google.status !== "connected" && (
            <div className="ml-auto flex items-center gap-2 text-xs text-muted" aria-live="polite">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  google.status === "loading" ? "bg-dim" : "bg-ember",
                )}
              />
              <span className="hidden sm:inline">
                {google.status === "loading"
                  ? "Checking Google…"
                  : google.status === "error"
                    ? "Google status unavailable"
                    : "Google not connected"}
              </span>
            </div>
          )}
          <ThemeToggle
            size="sm"
            className={cn(
              "border-line text-muted hover:bg-paper/5 hover:text-paper",
              google.status === "connected" && "ml-auto",
            )}
          />
        </header>

        <MessageList
          messages={messages}
          sending={sending || clearing}
          name={firstName}
          scrollerRef={scrollerRef}
          onPick={pick}
          onRetry={retry}
          onSend={send}
          onCopy={(ok) => !ok && push({ tone: "error", title: "Couldn't copy", body: "Your browser blocked clipboard access." })}
        />

        <div className="shrink-0 px-4 pb-2 pt-2 sm:px-8 sm:pb-3">
          <div className="mx-auto w-full max-w-3xl space-y-2">
            {google.status === "disconnected" && !isDesktop && <GoogleCard google={google} compact />}
            <Composer
              value={draft}
              onChange={setDraft}
              onSubmit={submit}
              sending={sending}
              inputRef={inputRef}
              onVoiceError={(msg) => push({ tone: "error", title: "Voice input", body: msg })}
            />
            <footer className="flex flex-col items-center justify-between gap-1 pt-1 text-center sm:flex-row sm:gap-3 sm:text-left">
              <p className="font-mono text-[0.62rem] leading-relaxed text-dim sm:text-[0.66rem]">
                Enter to send · Shift+Enter for a new line
              </p>
              <p className="text-[0.66rem] leading-relaxed text-dim">
                AI can make mistakes. Please verify important information.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
