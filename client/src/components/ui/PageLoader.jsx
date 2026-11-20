import { motion, useReducedMotion } from "framer-motion";
import Logo from "./Logo";

export default function PageLoader({ label = "Opening Pixel" }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className="page-loader flex min-h-svh flex-col items-center justify-center gap-6 bg-ink text-paper"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-5"
      >
        <Logo size="lg" />
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <motion.span
              key={index}
              className="size-1.5 rounded-[1px] bg-volt"
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.22, 1, 0.22], y: [0, -3, 0] }
              }
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.14,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <span className="text-xs font-medium tracking-[0.18em] text-sage uppercase">
          {label}
        </span>
      </motion.div>
    </div>
  );
}
