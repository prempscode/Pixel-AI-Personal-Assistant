import { lazy, Suspense, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Button, { ArrowIcon, GoogleG } from "../ui/Button";
import ServiceIcon from "../ui/ServiceIcon";
import TextRotate from "../fancy/text/text-rotate";
import { useTheme } from "../../context/ThemeContext";

// three.js + R3F are heavy; load them after first paint.
const PixelField = lazy(() => import("./PixelField"));

const SERVICES = [
  { name: "Google Tasks", service: "tasks" },
  { name: "Calendar", service: "calendar" },
  { name: "Gmail", service: "gmail" },
  { name: "Drive", service: "drive" },
];

const line = {
  hidden: { y: "110%" },
  show: (i) => ({
    y: 0,
    transition: {
      duration: 1,
      delay: 0.15 + i * 0.12,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};
const fade = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
});

export default function Hero({ isAuthed, onStart, onOpen, loading }) {
  const ref = useRef(null);
  const { isDark } = useTheme();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const copyOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.9],
    [1, 1, 0],
  );
  const fieldY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
    >
      <motion.div
        style={{ y: fieldY }}
        className="absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <PixelField eventSource={ref} animated={!reduce} isDark={isDark} />
        </Suspense>
      </motion.div>
      {/* keep copy legible over the field */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 ${
          isDark
            ? "bg-[radial-gradient(ellipse_at_30%_45%,rgb(8_8_10/0.9),rgb(8_8_10/0.35)_55%,rgb(8_8_10/0.9))]"
            : "bg-[radial-gradient(ellipse_at_30%_45%,rgb(247_245_239/0.84),rgb(247_245_239/0.28)_55%,rgb(247_245_239/0.9))]"
        }`}
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
            <motion.span
              className="block"
              variants={line}
              custom={0}
              initial="hidden"
              animate="show"
            >
              Pixel
            </motion.span>
          </span>

          <span className="block overflow-hidden pb-[0.12em]">
            <motion.span
              variants={line}
              custom={1}
              initial="hidden"
              animate="show"
            >
              <TextRotate
                texts={[
                  "turns requests",
                  "manages tasks",
                  "organizes time",
                  "sends emails",
                  "finds files",
                  "takes action",
                  "gets things done",
                ]}
                mainClassName="inline-block text-white px-2 sm:px-2 md:px-3 bg-[#ff5941] overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg max-[400px]:text-[0.8em]"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
              <em className="text-paper block">with purpose.</em>
            </motion.span>
          </span>
        </h1>

        <motion.p
          {...fade(0.55)}
          data-pixel-field-ignore
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
        >
          Type or speak a request in plain language. Pixel adds the to-do,
          blocks the time, drafts the email or finds the file, then tells you
          exactly what happened.
        </motion.p>
        <motion.div
          {...fade(0.7)}
          data-pixel-field-ignore
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          {isAuthed ? (
            <Button size="lg" variant="ember" onClick={onOpen}>
              Open Pixel <ArrowIcon />
            </Button>
          ) : (
            <Button
              size="lg"
              variant="primary"
              onClick={onStart}
              loading={loading}
            >
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
          {SERVICES.map(({ name, service }) => (
            <li
              key={name}
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted"
            >
              <ServiceIcon service={service} />
              {name}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
