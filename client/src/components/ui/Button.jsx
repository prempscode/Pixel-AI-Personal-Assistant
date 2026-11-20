import { motion } from "motion/react";
import { cn } from "../../lib/cn";

const variants = {
  primary:
    "bg-paper text-ink-950 hover:bg-white shadow-[0_0_0_1px_rgb(255_255_255/0.2)_inset]",
  ember:
    "bg-ember text-ink-950 hover:bg-ember-soft shadow-[0_8px_30px_-8px_rgb(255_90_44/0.6)]",
  outline:
    "border border-line-strong text-paper hover:bg-white/5 hover:border-white/30",
  ghost: "text-muted hover:text-paper hover:bg-white/5",
};
const sizes = {
  sm: "h-9 px-3.5 text-[0.82rem] gap-2",
  md: "h-11 px-5 text-sm gap-2.5",
  lg: "h-13 px-7 text-[0.95rem] gap-3",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled,
  children,
  ...props
}) {
  return (
    <motion.button
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full font-medium",
        "transition-colors duration-200 disabled:opacity-60 select-none whitespace-nowrap",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

export function Spinner({ className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "size-4 rounded-full border-2 border-current/30 border-t-current animate-spin",
        className,
      )}
    />
  );
}

export function ArrowIcon({ className }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform duration-300 group-hover:translate-x-0.5", className)}
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function GoogleG({ className }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.4a12 12 0 0 0 0 10.9l4-3z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}
