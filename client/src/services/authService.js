import { AUTH_INTENT_KEY } from "../lib/constants";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

export async function signInWithGoogle() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "Sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the client environment.",
    );
  }

  localStorage.setItem(AUTH_INTENT_KEY, "chat");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Keep the existing backend/Supabase redirect contract. The app moves
      // the user into the chat once the session comes back.
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    localStorage.removeItem(AUTH_INTENT_KEY);
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getAccessToken() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.access_token || null;
}
