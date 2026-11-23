import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";

export default function LegalLayout({
  title,
  effectiveDate,
  description,
  sections,
}) {
  return (
    <div className="min-h-dvh bg-ink-950 text-paper">
      <header className="border-b border-paper/10 bg-ink-950/95">
        <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" aria-label="Pixel home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle
              size="sm"
              className="border-paper/15 bg-paper/[0.035] text-paper/60"
            />
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-paper/12 px-3 py-2 text-xs font-semibold text-paper/65 transition hover:border-paper/25 hover:text-paper"
            >
              <span aria-hidden="true">←</span>
              <span className="hidden sm:inline">Back to Pixel</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,760px)] lg:justify-center">
          <nav
            aria-label="On this page"
            className="hidden lg:block"
          >
            <div className="sticky top-8 border-l border-paper/10 pl-5">
              <p className="eyebrow text-[9px]">On this page</p>
              <ol className="mt-5 space-y-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-[12px] leading-5 text-paper/45 transition-colors hover:text-paper"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article>
            <header>
              <p className="eyebrow">{description}</p>
              <h1 className="display mt-5 text-[clamp(3rem,9vw,5.25rem)]">
                {title}
              </h1>
              <p className="mt-5 text-sm text-muted">
                Effective date: {effectiveDate}
              </p>
            </header>

            <div className="mt-12 border-t border-paper/10 pt-8">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-8 border-b border-paper/8 py-8 first:pt-0"
                >
                  <h2 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
                    {section.heading}
                  </h2>
                  <div className="legal-copy mt-5 space-y-4 text-[15px] leading-7 text-paper/65">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-[11px] text-paper/38 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Pixel</p>
          <nav aria-label="Legal" className="flex gap-5">
            <Link className="transition hover:text-paper" to="/privacy">Privacy Policy</Link>
            <Link className="transition hover:text-paper" to="/terms">Terms of Service</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
