import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "../../lib/cn";

export default function VoiceInput({
  onTranscript,
  onListeningChange,
  disabled = false,
}) {
  const [supported] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const callbackRef = useRef(onTranscript);
  const listeningCallbackRef = useRef(onListeningChange);

  useEffect(() => {
    callbackRef.current = onTranscript;
    listeningCallbackRef.current = onListeningChange;
  }, [onTranscript, onListeningChange]);

  useEffect(() => {
    if (!supported) return undefined;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError("");
      listeningCallbackRef.current?.(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript?.trim()) {
        callbackRef.current?.(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access was blocked by the browser.");
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        setError("Voice input didn't work. Try again.");
      }
      setListening(false);
      listeningCallbackRef.current?.(false);
    };

    recognition.onend = () => {
      setListening(false);
      listeningCallbackRef.current?.(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // Ignore cleanup failures from browsers without an active session.
      }
    };
  }, [supported]);

  function toggle() {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      return;
    }

    try {
      setError("");
      recognition.start();
    } catch {
      setError("Voice input is already starting.");
    }
  }

  if (!supported) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        aria-pressed={listening}
        title={error || (listening ? "Stop listening" : "Ask with your voice")}
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
          listening
            ? "voice-ring border-coral/30 bg-coral/10 text-coral"
            : "border-ink/10 bg-[var(--chat-pill)] text-ink/45 hover:border-ink/20 hover:bg-[var(--chat-card-hover)] hover:text-ink",
          "disabled:pointer-events-none disabled:opacity-35",
        )}
      >
        {listening ? (
          <Square className="size-3.5 fill-current" strokeWidth={1.8} />
        ) : (
          <Mic className="size-4" strokeWidth={1.8} />
        )}
      </button>
      {error && (
        <span
          role="status"
          className="absolute right-0 bottom-full z-30 mb-2 w-max max-w-[230px] rounded-lg border border-ink/10 bg-ink px-2.5 py-1.5 text-[9px] leading-4 text-paper/80 shadow-panel"
        >
          {error}
        </span>
      )}
      {listening && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2 py-0.5 text-[8px] font-semibold tracking-wide text-paper">
          Listening
        </span>
      )}
    </div>
  );
}
