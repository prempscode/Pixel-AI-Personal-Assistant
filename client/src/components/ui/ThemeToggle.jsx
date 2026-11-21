import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Moon01Icon from "@hugeicons/core-free-icons/Moon01Icon";
import Sun01Icon from "@hugeicons/core-free-icons/Sun01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/cn";

export default function ThemeToggle({ className, size = "md" }) {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = theme === "dark";
  const icon = isDark ? Sun01Icon : Moon01Icon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={!isDark}
      aria-label={
        isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border transition-[background-color,border-color,color,transform] duration-300 active:scale-95",
        size === "sm" ? "size-8" : "size-9",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={
            reduceMotion ? false : { opacity: 0, rotate: -55, scale: 0.55 }
          }
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={
            reduceMotion ? undefined : { opacity: 0, rotate: 55, scale: 0.55 }
          }
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
