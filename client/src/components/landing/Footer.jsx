import { ArrowUp, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../ui/Logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Capabilities", href: "#capabilities" },
      { label: "How it works", href: "#how" },
      { label: "Safety", href: "#safety" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Google Calendar", href: "#capabilities" },
      { label: "Gmail", href: "#capabilities" },
      { label: "Tasks & Drive", href: "#capabilities" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
];

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-paper/10 bg-ink">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto] lg:gap-8">
          <div className="col-span-2 min-w-0 sm:col-span-2 lg:col-span-1">
            <Link to="/" aria-label="Pixel home">
              <Logo />
            </Link>
            <p className="mt-5 max-w-[260px] text-[11.5px] leading-5 text-paper/42">
              A personal AI assistant with hands. Built for the Google tools
              that already run your day.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-[1px] bg-volt opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-[1px] bg-volt" />
              </span>
              <span className="text-[9px] font-semibold tracking-[0.16em] text-paper/28 uppercase">
                Ready when you are
              </span>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="min-w-0">
              <h3 className="text-[9px] font-bold tracking-[0.16em] text-paper/28 uppercase">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="link-underline text-[11.5px] text-paper/55 transition-colors duration-300 hover:text-paper"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="link-underline text-[11.5px] text-paper/55 transition-colors duration-300 hover:text-paper"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 flex min-w-0 flex-col items-start gap-3 sm:col-span-2 lg:col-span-1 lg:items-end">
            <Link
              to="/app"
              className="group inline-flex items-center gap-2 text-[11.5px] font-semibold text-paper/65 transition-colors hover:text-paper"
            >
              {user ? "Open the assistant" : "Sign in"}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href="#top"
              className="group mt-2 inline-flex items-center gap-2 text-[10px] text-paper/25 transition-colors hover:text-paper/60"
            >
              Back to top
              <ArrowUp className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col flex-wrap gap-3 border-t border-paper/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9.5px] text-paper/32">
            © {year} Pixel. Built for Google Workspace.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[9px] text-paper/32">
            <span className="size-1 rounded-[1px] bg-paper/25" />
            Thoughtfully quiet software
            <span className="size-1 rounded-[1px] bg-volt/55" />
          </div>
        </div>
      </div>
    </footer>
  );
}
