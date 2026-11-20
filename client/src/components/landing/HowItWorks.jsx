import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../lib/cn";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: "01", title: "You ask", body: "Type it or say it, in plain language. No syntax, no forms." },
  { n: "02", title: "Pixel picks the tool", body: "It chooses the right Google action for the request: a task, an event, a draft or a search." },
  { n: "03", title: "It runs as you", body: "The action runs with your connected Google account, server-side. Your token never reaches the browser." },
  { n: "04", title: "You get the truth", body: "Pixel reports what actually happened, including errors. It never claims success without proof." },
];

export default function HowItWorks() {
  const root = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    // Pinned, scrubbed sequence only on desktop with motion allowed.
    // Everywhere else the content is simply stacked and fully visible.
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(root.current);
      const steps = q("[data-step]");
      const layers = q("[data-layer]");

      gsap.set(steps, { opacity: 0.3 });
      gsap.set(layers, { opacity: 0, y: 18 });
      gsap.set(q("[data-bar]"), { scaleX: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=260%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // each step: highlight its row + reveal its layer in the card
      [0, 1, 2, 3].forEach((i) => {
        const at = i * 1;
        tl.to(steps[i], { opacity: 1, duration: 0.4 }, at);
        if (i > 0) tl.to(steps[i - 1], { opacity: 0.3, duration: 0.4 }, at);
        tl.to(layers[i], { opacity: 1, y: 0, duration: 0.5 }, at);
        if (i === 2) tl.to(q("[data-bar]"), { scaleX: 1, duration: 0.8, ease: "none" }, at);
      });
      tl.to({}, { duration: 0.6 }); // hold on the final state

      return () => tl.scrollTrigger?.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="how" ref={root} className="relative scroll-mt-16 overflow-hidden border-y border-line bg-ink-900/60">
      <div className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:py-0">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 className="display mt-5 text-5xl sm:text-7xl">
            From sentence to <em className="text-muted">done</em>.
          </h2>
          <ol className="mt-12 space-y-7">
            {STEPS.map((s) => (
              <li key={s.n} data-step className="flex gap-5">
                <span className="font-mono text-sm text-ember">{s.n}</span>
                <div>
                  <h3 className="text-lg font-medium tracking-tight">{s.title}</h3>
                  <p className="mt-1 max-w-md text-[0.95rem] leading-relaxed text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Illustrative walk-through of one request */}
        <div className="relative">
          <div className="rounded-3xl border border-line-strong bg-ink-850 p-5 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.8)] sm:p-7">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Example request</span>
              <span className="flex gap-1.5" aria-hidden="true">
                <i className="size-2 rounded-full bg-ink-700" />
                <i className="size-2 rounded-full bg-ink-700" />
                <i className="size-2 rounded-full bg-ember" />
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div data-layer className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-paper px-4 py-3 text-[0.95rem] text-ink-950">
                Block 2 to 3 PM on Friday for a project review
              </div>

              <div data-layer className="flex items-center gap-3 rounded-xl border border-line bg-ink-900 px-4 py-3">
                <span className="size-2 rounded-full bg-svc-calendar" />
                <code className="font-mono text-[0.8rem] text-paper/90">create_calendar_event</code>
                <span className="ml-auto font-mono text-[0.7rem] uppercase tracking-wider text-dim">tool</span>
              </div>

              <div data-layer>
                <div className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-wider text-dim">
                  <span>Running with your Google account</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-700">
                  <div data-bar className="h-full origin-left rounded-full bg-ember" />
                </div>
              </div>

              <div data-layer className="max-w-[92%] rounded-2xl rounded-bl-md border border-line bg-ink-900 px-4 py-3 text-[0.95rem] leading-relaxed text-paper">
                Done. "Project review" is on your calendar for Friday, 2:00 to 3:00 PM.
              </div>
            </div>
            <p className={cn("mt-6 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-dim")}>
              Illustration of the flow, not live data
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
