import { cn } from "../../lib/cn";

export function PixelMark({ className, accent = "var(--color-volt)" }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <rect x="2" y="2" width="15" height="15" rx="3.5" fill="currentColor" />
      <rect
        x="23"
        y="2"
        width="15"
        height="15"
        rx="3.5"
        fill="currentColor"
        opacity="0.32"
      />
      <rect
        x="2"
        y="23"
        width="15"
        height="15"
        rx="3.5"
        fill="currentColor"
        opacity="0.32"
      />
      <rect x="23" y="23" width="15" height="15" rx="3.5" fill={accent} />
    </svg>
  );
}

function Logo({ className, markClassName, wordmark = true, size = "md" }) {
  const wordSize =
    size === "sm"
      ? "text-[17px]"
      : size === "lg"
        ? "text-[24px]"
        : "text-[20px]";

  return (
    <span
      className={cn("group/logo inline-flex items-center gap-2.5", className)}
      aria-label="Pixel"
    >
      <PixelMark
        className={cn(
          "transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/logo:rotate-6",
          size === "sm" ? "size-7" : size === "lg" ? "size-9" : "size-8",
          markClassName,
        )}
      />
      {wordmark && (
        <span
          className={cn(
            "font-sans font-semibold leading-none tracking-[-0.045em]",
            wordSize,
          )}
        >
          Pixel
        </span>
      )}
    </span>
  );
}

export default Logo;
