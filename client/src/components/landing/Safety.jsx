import Reveal from "../ui/Reveal";

// Each claim is taken from the backend's actual behaviour (README + code).
const ITEMS = [
  {
    title: "Never sent in one step",
    body: "Pixel prepares an email and shows it to you first. It is sent only after you confirm in a later message.",
  },
  {
    title: "Your token stays on the server",
    body: "Your Google refresh token is encrypted with AES-256-GCM and is never exposed to the browser.",
  },
  {
    title: "Least-privilege access",
    body: "Calendar events, Tasks, Gmail compose and read, and read-only Drive. Nothing more.",
  },
  {
    title: "Proof, not promises",
    body: "A task is reported done only when Google confirms it. If access has expired, Pixel says so and asks you to reconnect.",
  },
];

export default function Safety() {
  return (
    <section id="safety" className="mx-auto max-w-7xl scroll-mt-16 px-5 py-28 sm:px-8 sm:py-36">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow">Safety</p>
          <h2 className="display mt-5 text-5xl sm:text-7xl">
            Built to act, <em className="text-muted">and to ask first.</em>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            An assistant with access to your inbox has to earn it. These guardrails are enforced by the server, not just promised in a prompt.
          </p>
        </Reveal>
        <dl className="divide-y divide-line border-y border-line">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.06} className="grid gap-2 py-7 sm:grid-cols-[3rem_1fr] sm:gap-6">
              <span className="font-mono text-sm text-ember">0{i + 1}</span>
              <div>
                <dt className="text-lg font-medium tracking-tight">{it.title}</dt>
                <dd className="mt-1.5 max-w-lg text-[0.95rem] leading-relaxed text-muted">{it.body}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
