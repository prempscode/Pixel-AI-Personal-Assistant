import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  CheckSquare2,
  FolderSearch,
  Home,
  Loader2,
  LogOut,
  Mail,
  Plus,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getFirstName, STARTER_PROMPTS } from "../../lib/constants";
import { cn } from "../../lib/cn";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";
import GoogleConnectionCard from "./GoogleConnectionCard";
import UserAvatar from "./UserAvatar";

const promptIcons = {
  Calendar: CalendarDays,
  Tasks: CheckSquare2,
  Gmail: Mail,
  Drive: FolderSearch,
};

export default function Sidebar({
  user,
  open,
  onClose,
  onNewChat,
  onPickPrompt,
  google,
  onConnectGoogle,
  onRetryGoogle,
  isSending,
}) {
  const { signOut, action } = useAuth();
  const closeRef = useRef(null);
  const signingOut = action === "signout";
  const displayName =
    user?.user_metadata?.full_name || getFirstName(user) || user?.email;

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-label="Dismiss sidebar overlay"
            className="fixed inset-0 z-[65] bg-ink/45 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        id="chat-sidebar"
        aria-label="Chat sidebar"
        className={cn(
          "chat-sidebar fixed inset-y-0 left-0 z-[70] flex w-[286px] shrink-0 flex-col border-r border-paper/10 bg-ink text-paper transition-[transform,visibility] duration-500 ease-[var(--ease-out-expo)] lg:static lg:z-auto lg:visible lg:translate-x-0",
          open ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <div className="pointer-events-none absolute top-0 left-0 h-64 w-full bg-[radial-gradient(ellipse_at_top_left,rgba(215,255,62,0.06),transparent_65%)]" />

        <div className="relative flex h-[72px] shrink-0 items-center justify-between px-4">
          <Link
            to="/"
            aria-label="Pixel home"
            className="rounded-md"
            onClick={onClose}
          >
            <Logo size="sm" />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex size-8 items-center justify-center rounded-full text-paper/45 transition hover:bg-paper/[0.06] hover:text-paper lg:hidden"
          >
            <X className="size-4" />
          </button>
          <span className="hidden text-[8px] font-semibold tracking-[0.16em] text-paper/32 uppercase lg:block">
            Workspace
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 dark-scrollbar">
          <button
            type="button"
            onClick={onNewChat}
            disabled={isSending}
            title={
              isSending
                ? "Wait for Pixel to finish this request"
                : "Clears this chat screen"
            }
            className="group flex h-10 w-full shrink-0 items-center gap-2 rounded-xl bg-volt px-3.5 text-[11.5px] font-semibold text-ink transition hover:bg-volt-bright disabled:pointer-events-none disabled:opacity-45"
          >
            <Plus
              className="size-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-90"
              strokeWidth={2.4}
            />
            New chat
          </button>

          <div className="mt-6">
            <div className="flex items-center justify-between px-1">
              <p className="text-[8.5px] font-bold tracking-[0.16em] text-paper/34 uppercase">
                Try asking
              </p>
              <span className="text-[8px] text-paper/28">4 shortcuts</span>
            </div>
            <div className="mt-2 space-y-0.5">
              {STARTER_PROMPTS.map((prompt) => {
                const Icon = promptIcons[prompt.kind] || Plus;
                return (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => onPickPrompt(prompt.prompt)}
                    className="group flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition duration-200 hover:bg-paper/[0.055]"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-paper/10 bg-paper/[0.025] text-paper/35 transition group-hover:border-paper/20 group-hover:text-volt/75">
                      <Icon className="size-3" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10.5px] font-semibold text-paper/58 transition group-hover:text-paper/82">
                        {prompt.title}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-[8.5px] text-paper/34">
                        {prompt.prompt}
                      </span>
                    </span>
                    <ArrowUpRight className="mt-1 size-2.5 shrink-0 text-paper/12 transition-[color,transform] duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-paper/35" />
                  </button>
                );
              })}
            </div>
            <p className="mt-2 px-2.5 text-[8px] leading-[0.85rem] text-paper/30">
              Pick one to add it to the composer. Nothing sends until you do.
            </p>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-[8.5px] font-bold tracking-[0.16em] text-paper/34 uppercase">
                Connection
              </p>
              <span className="size-1 rounded-[1px] bg-volt/45" />
            </div>
            <GoogleConnectionCard
              status={google.status}
              error={google.error}
              connecting={google.connecting}
              onConnect={onConnectGoogle}
              onRetry={onRetryGoogle}
            />
          </div>

          <div className="mt-5 mb-3 border-t border-paper/10 pt-3">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[9px] font-medium text-paper/38 transition hover:bg-paper/[0.045] hover:text-paper/65"
            >
              <Home className="size-3" />
              Back to the site
              <ArrowUpRight className="ml-auto size-2.5 text-paper/15" />
            </Link>
          </div>
        </div>

        <div className="shrink-0 border-t border-paper/10 p-3">
          <div className="flex items-center gap-2.5 rounded-xl p-1.5">
            <UserAvatar user={user} className="size-8" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10.5px] font-semibold text-paper/68">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-[8.5px] text-paper/35">
                {user?.email}
              </p>
            </div>
            <ThemeToggle
              size="sm"
              className="border-paper/10 text-paper/40 hover:border-paper/20 hover:bg-paper/[0.06] hover:text-paper"
            />
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              aria-label="Sign out"
              title="Sign out"
              className="flex size-8 items-center justify-center rounded-lg text-paper/28 transition hover:bg-paper/[0.06] hover:text-paper/65 disabled:opacity-40"
            >
              {signingOut ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <LogOut className="size-3.5" />
              )}
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 px-1.5 text-[8px] text-paper/26">
            <span className="size-1 rounded-[1px] bg-volt/35" />
            Private by design · Pixel 1.0
          </p>
        </div>
      </aside>
    </>
  );
}
