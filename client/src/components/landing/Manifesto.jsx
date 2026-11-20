import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "../ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

const lineOne = ["The", "best", "interface"];
const lineTwo = ["is", "a", "sentence."];

const stats = [
  { value: "04", label: "Google apps in reach" },
  { value: "10", label: "Built-in actions" },
  { value: "01", label: "Sentence to start" },
];

function Words({ words, accentLast = false, reduceMotion }) {
  return words.map((word, index) => (
    <span
      key={word}
      data-word
      style={reduceMotion ? undefined : { opacity: 0.18 }}
      className={
        accentLast && index === words.length - 1
          ? "inline-block text-volt italic"
          : "inline-block"
      }
    >
      {word}
      {index < words.length - 1 ? "\u00A0" : ""}
    </span>
  ));
}

export default function Manifesto() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reduceMotion) return undefined;

    const section = sectionRef.current;
    const heading = headingRef.current;
    if (!section || !heading) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        heading.querySelectorAll("[data-word]"),
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: {
            trigger: heading,
            start: "top 82%",
            end: "bottom 58%",
            scrub: 0.65,
          },
        },
      );

      gsap.to(".manifesto-orb", {
        yPercent: 22,
        rotate: 12,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".manifesto-rule", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          end: "bottom 50%",
          scrub: 0.5,
        },
      });
    }, section);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => context.revert();
  }, [reduceMotion]);

  return (
    <section
      id="product"
      ref={sectionRef}
      className="relative overflow-hidden border-b border-paper/10 py-28 md:py-40"
    >
      <div className="manifesto-orb pointer-events-none absolute -top-12 right-[-170px] size-[620px] rounded-full border border-paper/[0.055]">
        <div className="absolute inset-[14%] rounded-full border border-dashed border-volt/[0.13]" />
        <div className="absolute inset-[32%] rounded-full bg-volt/[0.025] blur-2xl" />
        <div className="absolute top-[18%] left-[10%] size-2 rounded-[1px] bg-volt/45" />
        <div className="absolute right-[15%] bottom-[22%] size-1.5 rounded-[1px] bg-paper/25" />
      </div>

      <div className="container-pixel relative z-10">
        <div className="grid gap-10 lg:grid-cols-[180px_1fr] lg:gap-16">
          <Reveal className="flex flex-col justify-between gap-12">
            <div>
              <span className="eyebrow">The shift</span>
              <p className="mt-5 max-w-[150px] text-[11px] leading-5 text-paper/28">
                From opening apps to finishing thoughts.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="h-24 w-px bg-paper/10">
                <div className="manifesto-rule h-full w-px origin-top scale-y-0 bg-volt/70" />
              </div>
              <p className="mt-4 text-[9px] font-semibold tracking-[0.18em] text-paper/25 uppercase">
                Keep scrolling
              </p>
            </div>
          </Reveal>

          <div>
            <h2
              ref={headingRef}
              className="display text-[clamp(3.3rem,7.3vw,7rem)] leading-[0.96] tracking-[-0.045em]"
            >
              <span className="block">
                <Words words={lineOne} reduceMotion={reduceMotion} />
              </span>
              <span className="block">
                <Words words={lineTwo} accentLast reduceMotion={reduceMotion} />
              </span>
            </h2>

            <div className="mt-12 grid gap-9 border-t border-paper/10 pt-9 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
              <Reveal>
                <p className="max-w-[530px] text-[0.96rem] leading-7 text-paper/58">
                  No new dashboard to learn. No workflow to rebuild. Pixel sits
                  on top of the tools you already trust, turning plain language
                  into precise actions — with a clear result every time.
                </p>
              </Reveal>
              <Reveal delay={0.08} className="flex flex-wrap content-start gap-2">
                {["Calendar", "Inbox", "Tasks", "Drive"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-paper/10 bg-paper/[0.025] px-3 py-1.5 text-[10px] font-medium tracking-wide text-paper/40"
                  >
                    {label}
                  </span>
                ))}
                <span className="flex w-full items-center gap-2 pt-3 text-[10px] font-semibold tracking-[0.14em] text-volt/70 uppercase">
                  <span className="h-px w-6 bg-volt/50" />
                  One conversation, four tools
                </span>
              </Reveal>
            </div>

            <div className="mt-14 grid grid-cols-3 divide-x divide-paper/10 border-y border-paper/10">
              {stats.map((stat, index) => (
                <Reveal
                  key={stat.label}
                  delay={index * 0.08}
                  className="px-4 py-6 first:pl-0 sm:px-6"
                >
                  <p className="display text-[2.4rem] leading-none text-paper/88 sm:text-[3.1rem]">
                    {stat.value}
                  </p>
                  <p className="mt-2.5 text-[10px] font-medium leading-4 tracking-[0.08em] text-paper/42 uppercase">
                    {stat.label}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
