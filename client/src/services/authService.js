import { supabase } from "../lib/supabaseClient";

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
      scopes: [
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/tasks",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/documents",
      ].join(" "),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data.session?.access_token;
}

export async function saveGoogleTokens(session) {
  const refreshToken = session?.provider_refresh_token;

  if (!refreshToken) {
    console.log("No new Google refresh token received.");
    return;
  }

  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/google/connect`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        refreshToken,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to connect Google account.");
  }
}
