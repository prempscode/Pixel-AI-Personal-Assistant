import { useCallback, useEffect, useState } from "react";
import {
  disconnectGoogle,
  getGoogleStatus,
  startGoogleConnect,
} from "../services/api";

/** status: "loading" | "connected" | "disconnected" | "error" */
export function useGoogleStatus() {
  const [status, setStatus] = useState("loading");
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);

  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    getGoogleStatus()
      .then((ok) => !cancelled && setStatus(ok ? "connected" : "disconnected"))
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setConnectError("");
    try {
      await startGoogleConnect(); // navigates away on success
    } catch (err) {
      setConnectError(err.message || "Could not start the Google connection.");
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setDisconnecting(true);
    setConnectError("");
    try {
      await disconnectGoogle();
      setStatus("disconnected");
    } catch (err) {
      setConnectError(err.message || "Could not disconnect Google.");
      throw err;
    } finally {
      setDisconnecting(false);
    }
  }, []);

  return {
    status,
    refresh,
    connect,
    connecting,
    disconnect,
    disconnecting,
    connectError,
  };
}
