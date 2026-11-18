import { supabase } from "../lib/supabaseClient";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

export async function sendMessage(message) {
  const token = await getAccessToken();
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/agent/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to get a response.");
  return data;
}

export async function getGoogleStatus() {
  const token = await getAccessToken();
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/google/status`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await response.json();
  return data.connected;
}
