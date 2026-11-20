/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";

const ToastContext = createContext(null);

const tones = {
  success: { dot: "bg-ok", label: "Success" },
  error: { dot: "bg-danger", label: "Error" },
  info: { dot: "bg-ember", label: "Notice" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback(
    (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    [],
  );

  const push = useCallback(
    ({ tone = "info", title, body, duration = 5000 }) => {
      const id = ++counter.current;
      setToasts((t) => [...t.slice(-2), { id, tone, title, body }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              role={t.tone === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line-strong bg-ink-800/95 p-4 shadow-2xl backdrop-blur-md"
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", tones[t.tone].dot)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-paper">{t.title}</p>
                {t.body && <p className="mt-0.5 text-[0.82rem] leading-snug text-muted">{t.body}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="-m-1 rounded-md p-1 text-dim hover:text-paper"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
