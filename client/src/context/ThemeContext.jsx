/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";

const ThemeContext = createContext(null);
const STORAGE_KEY = "pixel-theme";

function readInitialTheme() {
  if (typeof document === "undefined") return "dark";
  const initial = document.documentElement.dataset.theme;
  if (initial === "light" || initial === "dark") return initial;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private browsing can block storage; the in-memory theme still works.
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0a0b09" : "#f4f0e6");
    }
  }, [theme]);

  const toggleTheme = useCallback(
    (event) => {
      const next = theme === "dark" ? "light" : "dark";
      const root = document.documentElement;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (event?.clientX !== undefined) {
        root.style.setProperty("--theme-origin-x", `${event.clientX}px`);
        root.style.setProperty("--theme-origin-y", `${event.clientY}px`);
      } else {
        root.style.setProperty("--theme-origin-x", "50%");
        root.style.setProperty("--theme-origin-y", "0%");
      }

      const applyTheme = () => {
        root.dataset.theme = next;
        root.style.colorScheme = next;
        flushSync(() => setTheme(next));
      };

      if (!reduceMotion && typeof document.startViewTransition === "function") {
        document.startViewTransition(applyTheme);
      } else {
        applyTheme();
      }
    },
    [theme],
  );

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme,
    }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider.");
  }
  return context;
}
