import { lazy, Suspense, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AUTH_INTENT_KEY } from "./lib/constants";
import PageLoader from "./components/ui/PageLoader";

const LandingPage = lazy(() => import("./components/landing/LandingPage"));
const ChatPage = lazy(() => import("./components/chat/ChatPage"));

function App() {
  const { user, loading } = useAuth();
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(location.search);
    const intent = localStorage.getItem(AUTH_INTENT_KEY);
    const returningFromGoogle = params.has("google");

    if (user && (intent === "chat" || returningFromGoogle)) {
      localStorage.removeItem(AUTH_INTENT_KEY);
      if (location.pathname !== "/chat") {
        navigate(`/chat${location.search}`, { replace: true });
      }
    }
  }, [user, loading, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.pathname, location.hash]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-full bg-volt px-5 py-3 text-sm font-semibold text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>

      {!reduceMotion && (
        <motion.div
          key={`route-sweep-${location.pathname}`}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{
            scaleX: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
            opacity: { delay: 0.58, duration: 0.25 },
          }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-[2px] origin-left bg-gradient-to-r from-volt via-volt/55 to-transparent"
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-svh"
        >
          <Suspense fallback={<PageLoader label="Preparing Pixel" />}>
            <Routes location={location}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default App;
