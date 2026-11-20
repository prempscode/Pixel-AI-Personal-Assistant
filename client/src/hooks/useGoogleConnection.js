import { useCallback, useEffect, useRef, useState } from "react";
import { AUTH_INTENT_KEY } from "../lib/constants";
import { getGoogleAuthUrl, getGoogleStatus } from "../services/api";

export function useGoogleConnection() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const activeRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const connected = await getGoogleStatus();
      if (!activeRef.current) return;
      setStatus(connected ? "connected" : "disconnected");
      setError("");
    } catch (err) {
      if (!activeRef.current) return;
      setStatus("error");
      setError(err?.message || "Couldn't check your Google connection.");
    }
  }, []);

  useEffect(() => {
    activeRef.current = true;
    // Safe here: refresh only updates state after its async status request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    return () => {
      activeRef.current = false;
    };
  }, [refresh]);

  const retry = useCallback(() => {
    setStatus("loading");
    setError("");
    return refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError("");
    try {
      localStorage.setItem(AUTH_INTENT_KEY, "chat");
      const url = await getGoogleAuthUrl();
      window.location.assign(url);
    } catch (err) {
      setConnecting(false);
      setError(err?.message || "Couldn't start the Google connection.");
      throw err;
    }
  }, []);

  return {
    status,
    error,
    connecting,
    refresh,
    retry,
    connect,
  };
}
