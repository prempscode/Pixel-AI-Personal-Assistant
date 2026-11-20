import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

const icons = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: "bg-volt text-ink border-ink/10",
  error: "bg-[#ffdcd1] text-[#4b1606] border-[#4b1606]/10",
  info: "bg-ink text-paper border-paper/10",
};

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border p-4 shadow-panel",
              styles[toast.type] || styles.info,
            )}
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-current/10">
              {(() => {
                const Icon = icons[toast.type] || Info;
                return <Icon className="size-3.5" strokeWidth={2.4} />;
              })()}
            </span>
            <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
            <button
              type="button"
              onClick={onClose}
              className="-m-1 rounded-full p-1 opacity-55 transition hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
