import { lazy, Suspense } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ScreenLoader from "./components/ui/ScreenLoader";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// The chat page is only needed after sign-in, so it ships as its own chunk.
const Chat = lazy(() => import("./pages/Chat"));

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <ScreenLoader />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function Page({ children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const { loading } = useAuth();

  if (loading) return <ScreenLoader />;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Landing /></Page>} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <Suspense fallback={<ScreenLoader label="Opening chat" />}>
                <Page><Chat /></Page>
              </Suspense>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Page><NotFound /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}
