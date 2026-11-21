import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import Logo from "../ui/Logo";
import Button, { ArrowIcon } from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import { cn } from "../../lib/cn";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#how", label: "How it works" },
  { href: "#safety", label: "Safety" },
];

export default function Nav({ isAuthed, onStart, onOpen, loading }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-line bg-ink-950/75 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <a href="#top" aria-label="Pixel home">
          <Logo />
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-paper"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle
            size="sm"
            className="border-line text-muted hover:bg-paper/5 hover:text-paper"
          />
          {isAuthed ? (
            <Button size="sm" onClick={onOpen}>
              Open Pixel <ArrowIcon />
            </Button>
          ) : (
            <Button size="sm" onClick={onStart} loading={loading}>
              Sign in
            </Button>
          )}
        </div>
      </nav>
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-ember"
      />
    </header>
  );
}
