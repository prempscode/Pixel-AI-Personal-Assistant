import { lazy, Suspense, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  CornerDownLeft,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button, { ButtonLink } from "../ui/Button";
import GoogleIcon from "../ui/GoogleIcon";

const PixelScene = lazy(() => import("./PixelScene"));

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  const { user, signIn, action } = useAuth();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const visualOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.55]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 26]);
  const signingIn = action === "signin";

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-[138px] pb-20 sm:pt-[162px] lg:min-h-svh lg:pt-[150px] lg:pb-24"
    >
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-80" />
      <div className="pointer-events-none absolute top-[-18%] right-[-6%] h-[650px] w-[650px] rounded-full bg-volt/[0.065] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-25%] left-[-12%] h-[520px] w-[520px] rounded-full bg-sky/[0.035] blur-[120px]" />

      <div className="container-pixel relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-2">
          <motion.div
            variants={container}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            className="relative z-20 max-w-[670px]"
            style={reduceMotion ? undefined : { y: textY }}
          >
            <motion.div variants={item} className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-paper/12 bg-paper/[0.035] py-1.5 pr-3.5 pl-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-volt text-ink">
                  <Sparkles className="size-3" strokeWidth={2.4} />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.16em] text-paper/60 uppercase">
                  Personal AI. Real actions.
                </span>
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 text-[clamp(3.7rem,9vw,8rem)] font-semibold leading-[0.88] tracking-[-0.065em]"
            >
              Consider it
              <span className="display mt-1 block pl-1 text-volt italic">
                handled.
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-7 max-w-[540px] text-[1.02rem] leading-7 text-paper/55 sm:text-[1.08rem] sm:leading-8"
            >
              Pixel turns one sentence into real work — tasks added, time
              blocked, emails drafted, files found. Right inside the Google
              tools you already live in.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              {user ? (
                <ButtonLink to="/chat" size="lg" variant="primary">
                  Open Pixel
                  <ArrowUpRight className="size-4" />
                </ButtonLink>
              ) : (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={signIn}
                  loading={signingIn}
                  className="group min-w-[190px]"
                >
                  {!signingIn && <GoogleIcon className="size-[18px]" />}
                  {signingIn ? "Taking you to Google…" : "Start with Google"}
                  {!signingIn && (
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </Button>
              )}

              <a
                href="#capabilities"
                className="inline-flex h-13 items-center justify-center gap-2.5 rounded-full border border-paper/14 px-6 text-[15px] font-semibold text-paper/70 transition duration-300 hover:border-paper/30 hover:bg-paper/[0.04] hover:text-paper"
              >
                See what it can do
                <ArrowDown className="size-4" />
              </a>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-9 flex flex-col gap-3 text-[12px] text-paper/48 sm:flex-row sm:items-center sm:gap-5"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-volt/70" />
                Nothing sends without your confirmation
              </span>
              <span className="hidden h-3 w-px bg-paper/15 sm:block" />
              <span className="flex items-center gap-2">
                <Check className="size-4 text-volt/70" />
                One tap to connect your workspace
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[430px] w-full sm:h-[510px] lg:h-[650px]"
          >
            <motion.div
              className="absolute inset-0"
              style={
                reduceMotion
                  ? undefined
                  : { y: visualY, opacity: visualOpacity }
              }
            >
              <div className="pointer-events-none absolute inset-x-[10%] top-[12%] bottom-[12%]">
                <div className="absolute inset-0 rounded-full border border-paper/[0.06]" />
                <div className="absolute inset-[11%] rounded-full border border-dashed border-paper/[0.07]" />
                <span className="absolute top-[7%] left-[15%] size-1 rounded-[1px] bg-volt/60" />
                <span className="absolute right-[12%] bottom-[18%] size-1.5 rounded-[1px] bg-paper/30" />
                <span className="absolute top-[35%] right-[4%] size-1 rounded-[1px] bg-volt/40" />
              </div>

              <div className="absolute inset-0">
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center">
                      <div className="relative size-[min(64vw,340px)] rounded-full border border-paper/[0.07]">
                        <div className="absolute inset-[12%] rounded-full border border-dashed border-paper/[0.08]" />
                        <div className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-volt shadow-[0_0_30px_rgba(215,255,62,.55)]" />
                      </div>
                    </div>
                  }
                >
                  <PixelScene />
                </Suspense>
              </div>

              <motion.div
                animate={
                  reduceMotion ? undefined : { y: [0, -7, 0], rotate: [0, 0.4, 0] }
                }
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="glass-card pointer-events-none absolute top-5 left-0 w-[min(88%,318px)] rounded-2xl p-3.5 sm:top-12 sm:-left-2"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.16em] text-paper/35 uppercase">
                    <span className="size-1 rounded-[1px] bg-volt" />
                    Example request
                  </span>
                  <span className="font-mono text-[9px] text-paper/25">
                    01 / 04
                  </span>
                </div>
                <p className="mt-3 text-[13px] leading-5 font-medium text-paper/82">
                  Block 2–3 PM tomorrow for deep work.
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-paper/10 pt-2.5">
                  <span className="text-[10px] text-paper/30">Ask Pixel</span>
                  <span className="flex size-6 items-center justify-center rounded-lg bg-volt text-ink">
                    <CornerDownLeft className="size-3" strokeWidth={2.4} />
                  </span>
                </div>
              </motion.div>

              <motion.div
                animate={
                  reduceMotion ? undefined : { y: [0, 8, 0], rotate: [0, -0.5, 0] }
                }
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
                className="glass-card pointer-events-none absolute right-0 bottom-4 w-[min(90%,310px)] rounded-2xl p-4 sm:bottom-14"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-volt/12 text-volt">
                    <CalendarDays className="size-4" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-paper/72">
                        Calendar updated
                      </p>
                      <span className="flex size-4 items-center justify-center rounded-full bg-volt text-ink">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-paper/30">
                      Example result
                    </p>
                  </div>
                </div>
                <div className="mt-3.5 rounded-xl border border-paper/10 bg-ink/40 p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-[2px] rounded-full bg-volt" />
                    <div>
                      <p className="text-[12px] font-medium text-paper/82">
                        Deep work
                      </p>
                      <p className="mt-0.5 text-[10px] text-paper/35">
                        Tomorrow · 2:00 – 3:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.4,
                }}
                className="pointer-events-none absolute top-[43%] right-[4%] hidden rounded-xl border border-paper/10 bg-ink/75 p-2.5 backdrop-blur-md md:block"
              >
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-sky" />
                  <span className="text-[10px] font-medium text-paper/55">
                    Draft saved to Gmail
                  </span>
                  <span className="size-1.5 rounded-full bg-volt" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-14 flex flex-col gap-4 border-t border-paper/10 pt-5 text-[10px] font-semibold tracking-[0.16em] text-paper/28 uppercase sm:flex-row sm:items-center sm:justify-between"
        >
          <span>Built for Google Workspace</span>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
            <span>Calendar</span>
            <span>Gmail</span>
            <span>Tasks</span>
            <span>Drive</span>
            <span className="hidden text-paper/18 sm:inline">/</span>
            <span className="text-paper/45">Powered by Groq</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
