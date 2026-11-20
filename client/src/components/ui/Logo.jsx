import { cn } from "../../lib/cn";

// 3x3 pixel mark; the ember cell is the "action" Pixel takes for you.
const CELLS = [1, 1, 1, 1, 0, 1, 1, 0, 2];

export function LogoMark({ size = 22, className }) {
  const cell = size / 3;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {CELLS.map((v, i) =>
        v ? (
          <rect
            key={i}
            x={(i % 3) * cell + 0.5}
            y={Math.floor(i / 3) * cell + 0.5}
            width={cell - 1}
            height={cell - 1}
            rx={1}
            fill={v === 2 ? "var(--color-ember)" : "var(--color-paper)"}
          />
        ) : null,
      )}
    </svg>
  );
}

export default function Logo({ className }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[1.65rem] leading-none tracking-tight">
        Pixel
      </span>
    </span>
  );
}
