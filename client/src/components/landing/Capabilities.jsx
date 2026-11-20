import { cn } from "../../lib/cn";
import Reveal from "../ui/Reveal";

// Every card maps to a real tool in the backend's toolRegistry.
const CARDS = [
  {
    span: "lg:col-span-3",
    svc: "bg-svc-tasks",
    tag: "Google Tasks",
    title: "Capture it before you forget it",
    body: "Reminders and to-dos land in Google Tasks, with notes written for you when the request needs them.",
    prompt: "Remind me to call John tomorrow at 6 PM",
  },
  {
    span: "lg:col-span-3",
    svc: "bg-svc-calendar",
    tag: "Google Calendar",
    title: "Block the time, not just the idea",
    body: "Anything with a start and an end becomes a real calendar event, checked for a valid time range.",
    prompt: "Block 2 to 3 PM on Friday for a project review",
  },
  {
    span: "lg:col-span-2",
    svc: "bg-svc-gmail",
    tag: "Gmail drafts",
    title: "Drafts, written for you",
    body: "Pixel writes the body and saves it as a draft. Nothing is sent.",
    prompt: "Draft an email to alex@example.com asking to reschedule",
  },
  {
    span: "lg:col-span-2",
    svc: "bg-svc-gmail",
    tag: "Send with confirmation",
    title: "Sends only when you say so",
    body: "Pixel shows the full email first and sends it only after you confirm in a separate message.",
    prompt: "Email priya@example.com the meeting notes",
  },
  {
    span: "lg:col-span-2",
    svc: "bg-svc-gmail",
    tag: "Gmail search",
    title: "Find the thread",
    body: "Search your mail and get subject, sender and date back in the chat.",
    prompt: "Find emails from the bank this month",
  },
  {
    span: "lg:col-span-4",
    svc: "bg-svc-drive",
    tag: "Google Drive",
    title: "Your files, one sentence away",
    body: "List your ten most recently modified files, or search Drive by name or by what's inside the document.",
    prompt: "Find my latest invoice in Drive",
  },
  {
    span: "lg:col-span-2",
    svc: "bg-ember",
    tag: "Time & links",
    title: "Quick answers",
    body: "Current time in any timezone, plus ready-to-open website and search links.",
    prompt: "What time is it in Tokyo?",
  },
];

function Card({ c, i }) {
  // Cursor-follow spotlight via CSS variables: no re-renders.
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <Reveal delay={(i % 3) * 0.07} className={cn("group", c.span)}>
      <article
        onPointerMove={onMove}
        className="relative h-full overflow-hidden rounded-3xl border border-line bg-ink-900 p-6 transition-colors duration-300 hover:border-line-strong sm:p-7"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(360px circle at var(--x,50%) var(--y,0%), rgb(255 90 44 / 0.10), transparent 60%)",
          }}
        />
        <div className="relative flex h-full flex-col">
          <p className="eyebrow flex items-center gap-2">
            <span className={cn("size-1.5 rounded-full", c.svc)} />
            {c.tag}
          </p>
          <h3 className="mt-5 text-xl font-medium leading-snug tracking-tight sm:text-[1.4rem]">
            {c.title}
          </h3>
          <p className="mt-2.5 max-w-md text-[0.95rem] leading-relaxed text-muted">{c.body}</p>
          <p className="mt-auto pt-7">
            <span className="inline-block max-w-full rounded-xl border border-line bg-ink-850 px-3.5 py-2 font-mono text-[0.78rem] leading-snug text-paper/90">
              <span className="mr-2 text-ember">›</span>
              {c.prompt}
            </span>
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative mx-auto max-w-7xl scroll-mt-16 px-5 py-28 sm:px-8 sm:py-36">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">Capabilities</p>
        <h2 className="display mt-5 text-5xl sm:text-7xl">
          One sentence in. <em className="text-muted">Real work out.</em>
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-4 sm:mt-20 lg:grid-cols-6">
        {CARDS.map((c, i) => (
          <Card key={c.tag + i} c={c} i={i} />
        ))}
      </div>
    </section>
  );
}
