import { motion } from "motion/react";
import { GoogleG } from "./Button";

export default function GoogleConnectedIcon({
  badgeMode,
  badgeControls,
  iconControls,
  visible,
}) {
  return (
    <span
      className={`pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 ${
        visible ? "visible" : "invisible"
      }`}
      aria-hidden="true"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.72, x: -8 }}
        animate={iconControls}
        className="grid size-8 place-items-center rounded-lg border border-line bg-ink-800 shadow-[0_8px_24px_-16px_rgb(0_0_0/0.55)]"
      >
        <GoogleG className="size-[18px]" />
      </motion.span>
      <motion.span
        initial={{ opacity: 0, scale: 0.6, y: 3 }}
        animate={badgeControls}
        className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full border border-ok bg-ink-850 text-ok shadow-[0_0_10px_-4px_var(--color-ok)]"
      >
        {badgeMode === "loading" ? (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            className="size-2.5 animate-spin motion-reduce:animate-none"
          >
            <circle cx="6" cy="6" r="4.25" stroke="currentColor" opacity="0.3" />
            <path
              d="M6 1.75A4.25 4.25 0 0 1 10.25 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
            <path
              d="m2.2 6.1 2.3 2.3 5.3-5.3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </motion.span>
    </span>
  );
}
