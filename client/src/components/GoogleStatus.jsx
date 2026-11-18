import { useEffect, useState } from "react";
import { getGoogleStatus } from "../services/api";
import { supabase } from "../lib/supabaseClient";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

function GoogleStatus() {
  const [connected, setConnected] = useState(null);

  useEffect(() => {
    async function refresh() {
      try {
        setConnected(await getGoogleStatus());
      } catch {
        setConnected(false);
      }
    }
    refresh();

    // Google redirected back with ?google=connected
    const params = new URLSearchParams(window.location.search);
    if (params.get("google")) {
      window.history.replaceState({}, "", window.location.pathname);
      refresh();
    }
  }, []);

  async function handleConnect() {
    const token = await getAccessToken();

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/google/auth`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const { url } = await res.json();

    window.location.href = url;
  }

  if (connected) {
    return <span className="status ok">● Google connected</span>;
  }

  return (
    <button className="connect-btn" onClick={handleConnect}>
      {connected === null ? "Checking…" : "Connect Google"}
    </button>
  );
}

export default GoogleStatus;
