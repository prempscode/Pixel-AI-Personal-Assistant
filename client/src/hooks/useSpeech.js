import { useCallback, useEffect, useRef, useState } from "react";

/** Browser Web Speech API (same engine and en-IN locale the app already used). */
export function useSpeech(onResult) {
  const Recognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined;
  const supported = Boolean(Recognition);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef(null);
  const cbRef = useRef(onResult);

  useEffect(() => {
    cbRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (!Recognition) return;
    const rec = new Recognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => cbRef.current?.(e.results[0][0].transcript);
    rec.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Microphone access is blocked. Allow it in your browser to use voice.");
      } else if (e.error !== "aborted" && e.error !== "no-speech") {
        setError("Voice input failed. Please try again.");
      }
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => rec.abort();
  }, [Recognition]);

  const toggle = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    setError("");
    if (listening) {
      rec.stop();
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        /* already started */
      }
    }
  }, [listening]);

  return { supported, listening, error, toggle };
}
