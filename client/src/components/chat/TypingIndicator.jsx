import { motion } from "framer-motion";
import { PixelMark } from "../ui/Logo";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 sm:gap-4"
      role="status"
      aria-label="Pixel is working on your request"
    >
      <PixelMark className="mt-2 size-5 shrink-0 text-ink sm:mt-2.5 sm:size-6" />
      <div className="assistant-message-surface flex items-center gap-2.5 rounded-2xl rounded-tl-md px-3.5 py-3">
        <span className="flex items-center gap-1 text-ink">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </span>
        <span className="text-[11px] font-medium text-ink/48">
          Working across your workspace
        </span>
      </div>
    </motion.div>
  );
}
