import { cn } from "../../lib/cn";

const variants = {
  primary:
    "bg-volt text-ink shadow-[0_14px_44px_-16px_rgba(215,255,62,0.7)] hover:bg-volt-bright hover:shadow-[0_18px_54px_-16px_rgba(215,255,62,0.8)]",
  ink: "bg-ink text-paper shadow-[0_12px_36px_-18px_rgba(10,11,9,0.8)] hover:bg-ink-soft",
  outline:
    "border border-paper/20 bg-transparent text-paper hover:border-paper/40 hover:bg-paper/5",
  soft: "border border-paper/10 bg-paper/[0.07] text-paper hover:bg-paper/[0.12]",
  "outline-dark":
    "border border-ink/15 bg-transparent text-ink hover:border-ink/30 hover:bg-ink/[0.04]",
  "ghost-dark": "text-ink/65 hover:bg-ink/[0.05] hover:text-ink",
  ghost: "text-paper/65 hover:bg-paper/[0.06] hover:text-paper",
};

const sizes = {
  sm: "h-9 gap-2 rounded-full px-4 text-[13px]",
  md: "h-11 gap-2 rounded-full px-5 text-sm",
  lg: "h-13 gap-2.5 rounded-full px-6 text-[15px]",
  icon: "size-10 rounded-full",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
} = {}) {
  return cn(
    "inline-flex select-none items-center justify-center font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
    variants[variant],
    sizes[size],
    className,
  );
}
