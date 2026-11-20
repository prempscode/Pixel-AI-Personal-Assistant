import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/cn";
import Button, { ButtonLink } from "../ui/Button";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";

const links = [
  { label: "Product", href: "#product" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
];

export default function LandingNav() {
  const { user, signIn, action } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const signingIn = action === "signin";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || menuOpen
          ? "border-b border-paper/10 bg-ink/78 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-volt/60"
        style={{ scaleX: progress }}
      />
      <div className="container-pixel flex h-[74px] items-center justify-between">
        <Link to="/" aria-label="Pixel home" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="link-underline text-[13px] font-medium text-paper/55 transition-colors duration-300 hover:text-paper"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <ButtonLink to="/chat" size="sm" variant="primary">
                Open Pixel
                <ArrowUpRight className="size-3.5" />
              </ButtonLink>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={signIn}
                  disabled={signingIn}
                  className="hidden md:inline-flex"
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={signIn}
                  loading={signingIn}
                >
                  Get started
                  {!signingIn && <ArrowUpRight className="size-3.5" />}
                </Button>
              </>
            )}
          </div>

          <ThemeToggle
            size="sm"
            className="border-paper/15 bg-paper/[0.035] text-paper/60 hover:border-paper/30 hover:bg-paper/[0.06] hover:text-paper"
          />

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-full border border-paper/15 text-paper lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-paper/10 bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <nav
              className="container-pixel flex flex-col py-4"
              aria-label="Mobile navigation"
            >
              {links.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-paper/8 py-4 text-[15px] font-medium text-paper/75 transition hover:text-paper"
                >
                  {link.label}
                  <span className="font-mono text-[10px] text-paper/30">
                    0{index + 1}
                  </span>
                </a>
              ))}
              <div className="flex flex-col gap-2.5 pt-5">
                {user ? (
                  <ButtonLink to="/chat" size="md" variant="primary">
                    Open Pixel
                    <ArrowUpRight className="size-4" />
                  </ButtonLink>
                ) : (
                  <Button
                    size="md"
                    variant="primary"
                    onClick={signIn}
                    loading={signingIn}
                  >
                    Continue with Google
                    {!signingIn && <ArrowUpRight className="size-4" />}
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
