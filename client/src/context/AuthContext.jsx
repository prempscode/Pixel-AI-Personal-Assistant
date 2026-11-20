/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import {
  signInWithGoogle as startGoogleOAuth,
  signOut as endSession,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [action, setAction] = useState("idle");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setAuthError("We couldn't restore your session. Please sign in again.");
        }
        setUser(data?.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setAuthError("We couldn't restore your session. Please sign in again.");
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    setAuthError("");
    setAction("signin");
    try {
      await startGoogleOAuth();
      return true;
    } catch (error) {
      setAuthError(error?.message || "Google sign-in failed. Please try again.");
      setAction("idle");
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError("");
    setAction("signout");
    try {
      await endSession();
      setUser(null);
      return true;
    } catch (error) {
      setAuthError(error?.message || "Couldn't sign out. Please try again.");
      return false;
    } finally {
      setAction("idle");
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(""), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      action,
      authError,
      clearAuthError,
      signIn,
      signOut,
      configured: isSupabaseConfigured,
    }),
    [user, loading, action, authError, clearAuthError, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }
  return context;
}
