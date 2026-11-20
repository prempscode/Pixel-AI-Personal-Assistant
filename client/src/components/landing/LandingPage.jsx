import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import Toast from "../ui/Toast";
import Capabilities from "./Capabilities";
import FinalCta from "./FinalCta";
import Footer from "./Footer";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import LandingNav from "./LandingNav";
import Manifesto from "./Manifesto";
import SecuritySection from "./SecuritySection";
import StackStrip from "./StackStrip";

export default function LandingPage() {
  useDocumentTitle("Pixel — Consider it handled.");
  const { authError, clearAuthError } = useAuth();

  const toast = useMemo(
    () =>
      authError
        ? {
            id: "landing-auth-error",
            type: "error",
            message: authError,
          }
        : null,
    [authError],
  );

  return (
    <div
      id="top"
      className="landing-shell min-h-svh overflow-hidden bg-ink text-paper"
    >
      <LandingNav />
      <main id="main-content">
        <Hero />
        <StackStrip />
        <Manifesto />
        <Capabilities />
        <SecuritySection />
        <HowItWorks />
        <FinalCta />
      </main>
      <Footer />
      <Toast toast={toast} onClose={clearAuthError} />
    </div>
  );
}
