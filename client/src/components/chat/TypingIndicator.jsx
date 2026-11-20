import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LogoMark } from "../ui/Logo";

// One request can trigger several model/tool rounds, so set expectations
// honestly instead of showing a bare spinner forever.
export default function TypingIndicator() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 7000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
      role="status"
      aria-live="polite"
    >
      <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl border border-line bg-ink-850">
        <LogoMark size={16} />
      </span>
      <div className="rounded-2xl rounded-tl-md border border-line bg-ink-850 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-dot rounded-[2px] bg-ember" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
          <span className="text-sm text-muted">
            {slow ? "Still working. Multi-step requests can take a little longer." : "Pixel is working on it"}
          </span>
        </div>
      </div>
    </motion.li>
  );
}
