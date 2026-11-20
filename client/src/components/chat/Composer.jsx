import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";
import VoiceInput from "./VoiceInput";

const MAX_LENGTH = 4000;

export default function Composer({
  value,
  onChange,
  onSubmit,
  isSending,
  inputRef,
}) {
  const [listening, setListening] = useState(false);
  const localRef = useRef(null);
  const textareaRef = inputRef || localRef;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`;
  }, [value, textareaRef]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!value.trim() || isSending) return;
    onSubmit();
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      if (!value.trim() || isSending) return;
      onSubmit();
    }
  }

  function handleVoiceTranscript(transcript) {
    const separator = value && !value.endsWith(" ") ? " " : "";
    onChange(`${value}${separator}${transcript}`.slice(0, MAX_LENGTH));
    textareaRef.current?.focus();
  }

  const count = value.length;
  const isNearLimit = count > 3200;

  return (
    <div className="relative z-20 border-t border-ink/[0.07] bg-paper/92 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:px-5 sm:pt-4 sm:pb-4">
      <div className="mx-auto w-full max-w-[860px]">
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "rounded-[24px] border border-ink/12 bg-[var(--chat-input-bg)] p-1.5 shadow-[0_18px_50px_-30px_rgba(10,11,9,0.35)] backdrop-blur-md transition-[border-color,box-shadow] duration-300",
              "focus-within:border-ink/20 focus-within:shadow-[0_20px_60px_-28px_rgba(10,11,9,0.4)]",
            )}
          >
            <div className="flex items-end gap-1">
              <label htmlFor="pixel-composer" className="sr-only">
                Message Pixel
              </label>
              <textarea
                id="pixel-composer"
                ref={textareaRef}
                rows={1}
                value={value}
                onChange={(event) => onChange(event.target.value.slice(0, MAX_LENGTH))}
                onKeyDown={handleKeyDown}
                placeholder={
                  listening
                    ? "Listening…"
                    : "Ask Pixel to block time, draft an email, add a task…"
                }
                maxLength={MAX_LENGTH}
                aria-describedby="composer-help"
                className="max-h-[168px] min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] leading-6 text-ink placeholder:text-ink/48 focus:outline-none sm:text-[15px]"
              />
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                onListeningChange={setListening}
              />
              <button
                type="submit"
                disabled={!value.trim() || isSending}
                aria-label="Send message"
                title={isSending ? "Pixel is still working" : "Send message"}
                className={cn(
                  "group flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-all duration-300",
                  "hover:bg-volt hover:text-[#0a0b09] disabled:pointer-events-none disabled:bg-ink/12 disabled:text-ink/25",
                )}
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                ) : (
                  <ArrowUp
                    className="size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5"
                    strokeWidth={2.1}
                  />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 px-3 pt-0.5 pb-1">
              <p
                id="composer-help"
                className="hidden text-[9px] font-medium tracking-[0.02em] text-ink/38 sm:block"
              >
                Enter to send · Shift + Enter for a new line
              </p>
              <p className="text-[9px] font-medium text-ink/38 sm:hidden">
                Plain language works best
              </p>
              <span
                className={cn(
                  "text-[9px] tabular-nums transition-colors",
                  isNearLimit ? "text-coral" : "text-ink/35",
                )}
              >
                {isNearLimit ? `${count.toLocaleString()} / 4,000` : "4,000 max"}
              </span>
            </div>
          </div>
        </form>

        <p className="mt-2 hidden text-center text-[9px] leading-4 text-ink/38 sm:block">
          Pixel acts only inside the Google access you grant. Emails wait for
          your explicit confirmation.
        </p>
      </div>
    </div>
  );
}
