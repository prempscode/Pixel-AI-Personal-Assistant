import { motion } from "motion/react";

// Four pixels that light up in sequence. Used while the session resolves.
export default function ScreenLoader({ label = "Loading Pixel" }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink-950" role="status" aria-label={label}>
      <div className="grid grid-cols-2 gap-1.5">
        {[0, 1, 3, 2].map((order) => (
          <motion.span
            key={order}
            className="size-4 rounded-[3px] bg-paper"
            animate={{ opacity: [0.15, 1, 0.15], backgroundColor: ["#ece8e1", "#ff5a2c", "#ece8e1"] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: order * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
