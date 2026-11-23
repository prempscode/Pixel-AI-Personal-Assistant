import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  FolderSearch,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import Button from "../ui/Button";
import GoogleIcon from "../ui/GoogleIcon";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";

const abilities = [
  { icon: CalendarDays, label: "Blocks time in Google Calendar" },
  { icon: Check, label: "Creates to-dos in Google Tasks" },
  { icon: Mail, label: "Drafts and searches Gmail" },
  { icon: FolderSearch, label: "Finds files in Google Drive" },
];

export default function AuthGate() {
  useDocumentTitle("Sign in — Pixel");
  const reduceMotion = useReducedMotion();
  const {
    signIn,
    action,
    authError,
    clearAuthError,
    configured,
  } = useAuth();
  const signingIn = action === "signin";

  return (
    <div className="auth-shell grain relative min-h-svh overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute -top-40 -right-24 size-[520px] rounded-full bg-volt/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 size-[380px] rounded-full bg-sky/[0.05] blur-[110px]" />
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-50" />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-[1400px] flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Pixel home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2.5">
            <ThemeToggle
              size="sm"
              className="border-paper/15 bg-paper/[0.035] text-paper/60 hover:border-paper/30 hover:bg-paper/[0.06] hover:text-paper"
            />
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-paper/55 transition hover:text-paper"
            >
              <ArrowLeft className="size-3.5" />
              Back to home
            </Link>
          </div>
        </div>

        <main
          id="main-content"
          className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1fr_440px] lg:gap-24 lg:py-20"
        >
          <div className="max-w-2xl">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="eyebrow">Your work, with a little help</span>
              <h1 className="display mt-7 text-[clamp(3.5rem,8vw,6.4rem)]">
                One sentence.
                <br />
                <span className="text-volt italic">Real progress.</span>
              </h1>
              <p className="mt-7 max-w-lg text-[0.98rem] leading-7 text-paper/55 sm:text-base">
                Sign in with Google to put Pixel to work across your calendar,
                inbox, tasks and files. You keep control of every action.
              </p>

              <div className="mt-7 lg:hidden">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full justify-between px-5 text-[15px]"
                  onClick={signIn}
                  loading={signingIn}
                  disabled={!configured}
                >
                  <span className="flex items-center gap-3">
                    {!signingIn && <GoogleIcon className="size-5" />}
                    {signingIn
                      ? "Taking you to Google…"
                      : "Continue with Google"}
                  </span>
                  {!signingIn && <ArrowUpRight className="size-4" />}
                </Button>

                {!configured && (
                  <p className="mt-4 rounded-xl border border-coral/20 bg-coral/[0.08] px-3.5 py-3 text-xs leading-5 text-coral">
                    Authentication is not configured yet. Add{" "}
                    <code className="rounded bg-ink px-1.5 py-0.5 text-[11px] text-paper/80">
                      VITE_SUPABASE_URL
                    </code>{" "}
                    and the publishable key to the client environment.
                  </p>
                )}

                {authError && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-coral/20 bg-coral/[0.08] px-3.5 py-3">
                    <p className="flex-1 text-xs leading-5 text-coral">
                      {authError}
                    </p>
                    <button
                      type="button"
                      onClick={clearAuthError}
                      className="text-[11px] font-semibold text-coral/70 transition hover:text-coral"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <p className="mt-3 flex items-center gap-2 text-[9px] leading-4 text-paper/35">
                  <ShieldCheck className="size-3.5 shrink-0 text-volt/70" />
                  Supabase Auth handles the session. Your password never touches
                  Pixel.
                </p>
              </div>

              <div className="mt-8 grid max-w-lg gap-px overflow-hidden rounded-2xl border border-paper/10 bg-paper/10 sm:grid-cols-2 lg:mt-10">
                {abilities.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-ink/95 px-4 py-4"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-paper/10 bg-paper/[0.04] text-volt">
                      <Icon className="size-4" strokeWidth={1.7} />
                    </span>
                    <span className="text-[13px] font-medium text-paper/72">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2.5 text-xs text-paper/50">
                <ShieldCheck className="size-4 text-volt/75" />
                Emails are never sent without your explicit confirmation.
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative mx-auto hidden w-full max-w-[440px] lg:mx-0 lg:block"
          >
            <div className="glass-card rounded-[28px] p-6 sm:p-8">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-sage uppercase">
                    Welcome to Pixel
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                    Pick up where you left off.
                  </h2>
                </div>
                <span className="mt-1 flex size-9 items-center justify-center rounded-xl border border-paper/10 bg-paper/[0.04]">
                  <ShieldCheck className="size-4 text-volt" />
                </span>
              </div>

              <Button
                size="lg"
                variant="primary"
                className="w-full justify-between px-5 text-[15px]"
                onClick={signIn}
                loading={signingIn}
                disabled={!configured}
              >
                <span className="flex items-center gap-3">
                  {!signingIn && <GoogleIcon className="size-5" />}
                  {signingIn ? "Taking you to Google…" : "Continue with Google"}
                </span>
                {!signingIn && <ArrowUpRight className="size-4" />}
              </Button>

              {!configured && (
                <p className="mt-4 rounded-xl border border-coral/20 bg-coral/[0.08] px-3.5 py-3 text-xs leading-5 text-coral">
                  Authentication is not configured yet. Add
                  <code className="mx-1 rounded bg-ink px-1.5 py-0.5 text-[11px] text-paper/80">
                    VITE_SUPABASE_URL
                  </code>
                  and the publishable key to the client environment.
                </p>
              )}

              {authError && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-coral/20 bg-coral/[0.08] px-3.5 py-3">
                  <p className="flex-1 text-xs leading-5 text-coral">{authError}</p>
                  <button
                    type="button"
                    onClick={clearAuthError}
                    className="text-[11px] font-semibold text-coral/70 transition hover:text-coral"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="my-6 h-px bg-paper/10" />

              <p className="text-xs leading-5 text-paper/48">
                Pixel uses Supabase Auth. Your Google password never touches our
                servers. Google access is requested only after you connect your
                workspace.
              </p>
              <p className="mt-4 text-center text-[11px] text-paper/38">
                By continuing, you agree to the{" "}
                <Link className="underline underline-offset-4 hover:text-paper" to="/terms">
                  Terms
                </Link>{" "}
                and{" "}
                <Link className="underline underline-offset-4 hover:text-paper" to="/privacy">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-paper/30">
              <span className="size-1 rounded-[1px] bg-volt" />
              Built for Google Workspace
              <span className="size-1 rounded-[1px] bg-volt/40" />
              Private by design
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
