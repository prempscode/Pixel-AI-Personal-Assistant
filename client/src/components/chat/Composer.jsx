import { useEffect } from "react";
import { motion } from "motion/react";
import { useSpeech } from "../../hooks/useSpeech";
import { cn } from "../../lib/cn";

const MAX = 4000; // server rejects anything longer

export default function Composer({ value, onChange, onSubmit, sending, inputRef, onVoiceError }) {
  const speech = useSpeech((text) => onChange((v) => (v ? `${v} ${text}` : text)));

  // Keep the composer compact while allowing a few lines of context.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
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
      className="flex items-end gap-1.5 rounded-2xl border border-line-strong bg-ink-850 p-1.5 shadow-[0_12px_36px_-18px_rgb(0_0_0/0.68)] transition-[border-color,box-shadow] duration-300 focus-within:border-paper/30"
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
        className="scroll-thin block min-h-9 max-h-36 min-w-0 flex-1 resize-none bg-transparent px-2.5 py-1.5 text-[0.9rem] leading-6 text-paper outline-none placeholder:text-dim"
      />
      <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
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
              "relative grid size-9 place-items-center rounded-full border transition-colors",
              speech.listening
                ? "border-ember bg-ember/15 text-ember"
                : "border-line text-muted hover:border-line-strong hover:text-paper",
            )}
          >
            {speech.listening && (
              <span className="absolute inset-0 animate-ping rounded-full bg-ember/25" aria-hidden="true" />
            )}
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="relative" aria-hidden="true">
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
            "grid size-9 place-items-center rounded-full transition-colors",
            canSend ? "bg-ember text-ink-950 hover:bg-ember-soft" : "bg-ink-700 text-dim",
          )}
        >
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 16V4M5 9l5-5 5 5" />
          </svg>
        </motion.button>
      </div>
    </form>
  );
}
