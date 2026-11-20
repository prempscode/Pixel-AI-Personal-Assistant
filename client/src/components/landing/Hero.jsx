import { lazy, Suspense, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Button, { ArrowIcon, GoogleG } from "../ui/Button";

// three.js + R3F are heavy; load them after first paint.
const PixelField = lazy(() => import("./PixelField"));

const SERVICES = [
  { name: "Google Tasks", color: "bg-svc-tasks" },
  { name: "Calendar", color: "bg-svc-calendar" },
  { name: "Gmail", color: "bg-svc-gmail" },
  { name: "Drive", color: "bg-svc-drive" },
];

const line = {
  hidden: { y: "110%" },
  show: (i) => ({
    y: 0,
    transition: { duration: 1, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};
const fade = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
});

export default function Hero({ isAuthed, onStart, onOpen, loading }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const fieldY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
    >
      <motion.div style={{ y: fieldY }} className="absolute inset-0 -z-10" aria-hidden="true">
        <Suspense fallback={null}>
          <PixelField eventSource={ref} animated={!reduce} />
        </Suspense>
      </motion.div>
      {/* keep copy legible over the field */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_45%,rgb(8_8_10/0.9),rgb(8_8_10/0.35)_55%,rgb(8_8_10/0.9))]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink-950 to-transparent"
      />

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="mx-auto w-full max-w-7xl px-5 pb-20 pt-32 sm:px-8"
      >
        <motion.p {...fade(0)} className="eyebrow flex items-center gap-3">
          <span className="inline-block size-2 rounded-[2px] bg-ember" />
          AI assistant for your Google account
        </motion.p>

        <h1 className="display mt-7 text-[clamp(3.4rem,10.5vw,9.5rem)]">
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span className="block" variants={line} custom={0} initial="hidden" animate="show">
              Say it once.
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.12em]">
            <motion.span className="block text-muted" variants={line} custom={1} initial="hidden" animate="show">
              Pixel <em className="text-paper">does it.</em>
            </motion.span>
          </span>
        </h1>

        <motion.p {...fade(0.55)} className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          Type or speak a request in plain language. Pixel adds the to-do, blocks
          the time, drafts the email or finds the file, then tells you exactly
          what happened.
        </motion.p>

        <motion.div {...fade(0.7)} className="mt-10 flex flex-wrap items-center gap-3">
          {isAuthed ? (
            <Button size="lg" variant="ember" onClick={onOpen}>
              Open Pixel <ArrowIcon />
            </Button>
          ) : (
            <Button size="lg" variant="primary" onClick={onStart} loading={loading}>
              {!loading && <GoogleG />}
              Continue with Google
            </Button>
          )}
          <a href="#capabilities">
            <Button size="lg" variant="ghost">
              See what it can do
            </Button>
          </a>
        </motion.div>

        <motion.ul
          {...fade(0.9)}
          aria-label="Works with"
          className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          {SERVICES.map((s) => (
            <li key={s.name} className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              <span className={`size-1.5 rounded-full ${s.color}`} />
              {s.name}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
