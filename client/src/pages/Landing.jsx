import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signInWithGoogle } from "../services/authService";
import { clearAuthReturn, hasAuthReturn } from "../lib/authMarker";
import { useToast } from "../components/ui/Toast";
import Nav from "../components/landing/Nav";
import Hero from "../components/landing/Hero";
import Capabilities from "../components/landing/Capabilities";
import Safety from "../components/landing/Safety";
import FinalCta from "../components/landing/FinalCta";

// GSAP + ScrollTrigger are only needed for this one section.
const HowItWorks = lazy(() => import("../components/landing/HowItWorks"));

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);

  // Returning from Supabase sign-in or the Google connect flow: go straight
  // into the app (once), carrying the `?google=` result along.
  useEffect(() => {
    if (user && hasAuthReturn()) {
      clearAuthReturn();
      const google = new URLSearchParams(window.location.search).get("google");
      navigate(google ? `/app?google=${encodeURIComponent(google)}` : "/app", { replace: true });
    }
  }, [user, navigate]);

  const onStart = useCallback(async () => {
    setLoading(true);
    try {
      await signInWithGoogle(); // redirects away on success
    } catch (err) {
      setLoading(false);
      push({
        tone: "error",
        title: "Couldn't start Google sign-in",
        body: err.message || "Please try again.",
      });
    }
  }, [push]);

  const onOpen = useCallback(() => navigate("/app"), [navigate]);
  const shared = { isAuthed: Boolean(user), onStart, onOpen, loading };

  return (
    <div className="relative">
      <Nav {...shared} />
      <main>
        <Hero {...shared} />
        <Capabilities />
        <Suspense
          fallback={<section id="how" className="min-h-[100svh] border-y border-line bg-ink-900/60" />}
        >
          <HowItWorks />
        </Suspense>
        <Safety />
        <FinalCta {...shared} />
      </main>
    </div>
  );
}
