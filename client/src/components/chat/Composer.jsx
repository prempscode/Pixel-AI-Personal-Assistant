import { useEffect } from "react";
import { motion } from "motion/react";
import { useSpeech } from "../../hooks/useSpeech";
import { cn } from "../../lib/cn";

const MAX = 4000; // server rejects anything longer

export default function Composer({ value, onChange, onSubmit, sending, inputRef, onVoiceError }) {
  const speech = useSpeech((text) => onChange((v) => (v ? `${v} ${text}` : text)));

  // auto-grow up to ~8 lines
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value, inputRef]);

  useEffect(() => {
    if (speech.error) onVoiceError?.(speech.error);
  }, [speech.error, onVoiceError]);

  const canSend = value.trim().length > 0 && !sending;

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSubmit();
      }}
      className="rounded-3xl border border-line-strong bg-ink-850 p-2 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)] transition-colors focus-within:border-white/30"
    >
      <label htmlFor="composer" className="sr-only">Message Pixel</label>
      <textarea
        id="composer"
        ref={inputRef}
        rows={1}
        value={value}
        maxLength={MAX}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={speech.listening ? "Listening…" : "Ask Pixel to do something…"}
        className="scroll-thin block max-h-[200px] w-full resize-none bg-transparent px-4 pb-1 pt-3 text-[0.97rem] leading-relaxed text-paper outline-none placeholder:text-dim"
      />
      <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-1">
        <p className="hidden font-mono text-[0.68rem] text-dim sm:block">
          Enter to send · Shift+Enter for a new line
        </p>
        <div className="ml-auto flex items-center gap-2">
          {value.length > MAX * 0.85 && (
            <span className={cn("font-mono text-[0.7rem]", value.length >= MAX ? "text-danger" : "text-muted")}>
              {value.length}/{MAX}
            </span>
          )}
          {speech.supported && (
            <button
              type="button"
              onClick={speech.toggle}
              aria-pressed={speech.listening}
              aria-label={speech.listening ? "Stop voice input" : "Start voice input"}
              className={cn(
                "relative grid size-10 place-items-center rounded-full border transition-colors",
                speech.listening
                  ? "border-ember bg-ember/15 text-ember"
                  : "border-line text-muted hover:border-line-strong hover:text-paper",
              )}
            >
              {speech.listening && (
                <span className="absolute inset-0 animate-ping rounded-full bg-ember/25" aria-hidden="true" />
              )}
              <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="relative" aria-hidden="true">
                <rect x="7.5" y="2.5" width="5" height="9" rx="2.5" />
                <path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" />
              </svg>
            </button>
          )}
          <motion.button
            type="submit"
            disabled={!canSend}
            whileTap={canSend ? { scale: 0.92 } : undefined}
            aria-label="Send message"
            className={cn(
              "grid size-10 place-items-center rounded-full transition-colors",
              canSend ? "bg-ember text-ink-950 hover:bg-ember-soft" : "bg-ink-700 text-dim",
            )}
          >
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 16V4M5 9l5-5 5 5" />
            </svg>
          </motion.button>
        </div>
      </div>
    </form>
  );
}
