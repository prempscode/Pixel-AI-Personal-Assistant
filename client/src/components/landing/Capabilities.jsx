import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckSquare2,
  Clock3,
  FileText,
  FolderSearch,
  Globe2,
  Mail,
  Search,
} from "lucide-react";
import { cn } from "../../lib/cn";
import Parallax from "../ui/Parallax";
import Reveal from "../ui/Reveal";

function CapabilityCard({
  index,
  label,
  icon: Icon,
  title,
  accent,
  accentClass,
  copy,
  className,
  children,
  glowClass,
}) {
  return (
    <Reveal
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[26px] border border-paper/10 bg-ink-card p-5 transition-[border-color,box-shadow,background-color] duration-500 hover:border-paper/22 hover:shadow-[0_28px_70px_-42px_rgba(0,0,0,0.55)] sm:p-7 lg:p-8",
        className,
      )}
      y={28}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-24 -right-16 size-56 rounded-full opacity-[0.09] blur-[70px] transition-opacity duration-700 group-hover:opacity-[0.16]",
          glowClass,
        )}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[9px] font-bold tracking-[0.17em] text-paper/28 uppercase">
          {String(index).padStart(2, "0")} / {label}
        </span>
        <span className="flex size-9 items-center justify-center rounded-xl border border-paper/10 bg-paper/[0.035] text-paper/45 transition-[color,border-color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-6 group-hover:scale-105 group-hover:border-paper/20 group-hover:text-paper/80">
          <Icon className="size-[17px]" strokeWidth={1.6} />
        </span>
      </div>

      <h3 className="relative mt-7 max-w-[430px] text-[clamp(1.65rem,2.5vw,2.2rem)] font-semibold leading-[1.08] tracking-[-0.045em]">
        {title}{" "}
        <span className={cn("display italic", accentClass)}>{accent}</span>
      </h3>
      <p className="relative mt-3.5 max-w-[430px] text-[12.5px] leading-6 text-paper/55 sm:text-[13px]">
        {copy}
      </p>

      <Parallax speed={9} className="relative mt-auto pt-7">
        {children}
      </Parallax>
    </Reveal>
  );
}

function CalendarPreview() {
  const selected = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="rounded-2xl border border-paper/10 bg-ink/55 p-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
      <div className="flex items-center justify-between px-0.5">
        <p className="text-[10px] font-semibold text-paper/45">This week</p>
        <span className="font-mono text-[9px] text-paper/22">OCT 12—18</span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {selected.map((day, index) => (
          <div key={`${day}-${index}`} className="text-center">
            <span className="text-[8px] font-semibold tracking-wider text-paper/22">
              {day}
            </span>
            <div
              className={cn(
                "mt-1.5 flex h-8 items-center justify-center rounded-md border text-[10px]",
                index === 3
                  ? "border-volt/35 bg-volt/[0.12] text-volt"
                  : "border-transparent bg-paper/[0.025] text-paper/32",
              )}
            >
              {12 + index}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-volt/15 bg-volt/[0.055] px-3 py-2.5">
        <span className="h-6 w-[2px] rounded-full bg-volt" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10.5px] font-semibold text-paper/72">
            Deep work
          </p>
          <p className="mt-0.5 text-[9px] text-paper/30">Wed · 2:00 – 3:00 PM</p>
        </div>
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-volt text-ink">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      </div>
    </div>
  );
}

function TasksPreview() {
  const reduceMotion = useReducedMotion();
  const tasks = [
    { label: "Follow up with design", meta: "Monday", done: true },
    { label: "Send Q3 project notes", meta: "Tuesday", done: false },
    { label: "Book dentist appointment", meta: "This week", done: false },
  ];

  return (
    <div className="rounded-2xl border border-paper/10 bg-ink/55 p-2.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
      {tasks.map((task, index) => (
        <div
          key={task.label}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2.5",
            index !== tasks.length - 1 && "border-b border-paper/[0.06]",
          )}
        >
          <span
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
              task.done
                ? "border-volt bg-volt text-ink"
                : "border-paper/18 bg-transparent",
            )}
          >
            {task.done && (
              <motion.svg
                viewBox="0 0 10 10"
                className="size-2.5"
                fill="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M1.5 5.2 4 7.4l4.5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: 0.4 }}
                />
              </motion.svg>
            )}
          </span>
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[10.5px]",
              task.done ? "text-paper/42 line-through" : "text-paper/65",
            )}
          >
            {task.label}
          </span>
          <span className="font-mono text-[8px] text-paper/22">{task.meta}</span>
        </div>
      ))}
    </div>
  );
}

function GmailPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-paper/10 bg-ink/55 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
      <div className="flex items-center justify-between border-b border-paper/[0.07] px-3.5 py-2.5">
        <span className="flex items-center gap-1.5 text-[9px] font-semibold text-paper/38">
          <span className="size-1.5 rounded-full bg-sky" />
          New message
        </span>
        <span className="rounded-full border border-paper/10 px-2 py-0.5 text-[8px] text-paper/28">
          Draft
        </span>
      </div>
      <div className="space-y-2.5 p-3.5">
        <div className="flex gap-2 text-[9px]">
          <span className="w-9 text-paper/25">To</span>
          <span className="text-paper/52">Alex Rivera</span>
        </div>
        <div className="flex gap-2 text-[9px]">
          <span className="w-9 text-paper/25">Subject</span>
          <span className="font-medium text-paper/65">A small change to Friday</span>
        </div>
        <div className="space-y-1.5 pt-1.5">
          <span className="block h-[3px] w-[88%] rounded-full bg-paper/[0.08]" />
          <span className="block h-[3px] w-[74%] rounded-full bg-paper/[0.08]" />
          <span className="block h-[3px] w-[61%] rounded-full bg-paper/[0.08]" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-paper/[0.07] px-3.5 py-2.5">
        <span className="text-[8.5px] text-paper/26">Ready for your review</span>
        <span className="rounded-full bg-sky/10 px-2 py-1 text-[8px] font-semibold text-sky">
          Not sent
        </span>
      </div>
    </div>
  );
}

function DrivePreview() {
  const files = [
    { name: "Invoice — March.pdf", meta: "PDF · 1.2 MB", accent: "text-coral" },
    { name: "Q3 financial model", meta: "Sheets · edited today", accent: "text-volt" },
    { name: "Brand guidelines", meta: "Folder · 14 files", accent: "text-sky" },
  ];

  return (
    <div className="rounded-2xl border border-paper/10 bg-ink/55 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
      <div className="flex items-center gap-2 border-b border-paper/[0.07] px-3.5 py-3">
        <Search className="size-3.5 shrink-0 text-paper/28" />
        <span className="text-[10px] text-paper/48">
          latest invoice
          <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-volt align-middle" />
        </span>
        <span className="ml-auto rounded-md border border-paper/10 px-1.5 py-0.5 font-mono text-[8px] text-paper/24">
          ⌘ K
        </span>
      </div>
      <div className="divide-y divide-paper/[0.06]">
        {files.map((file, index) => (
          <div
            key={file.name}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-2.5 transition-colors duration-300 hover:bg-paper/[0.025]",
              index === 0 && "bg-paper/[0.025]",
            )}
          >
            <FileText className="size-3.5 shrink-0 text-paper/25" strokeWidth={1.6} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-medium text-paper/58">
                {file.name}
              </p>
              <p className={cn("mt-0.5 text-[8px] text-paper/22", file.accent)}>
                {file.meta}
              </p>
            </div>
            <ArrowUpRight className="size-3 shrink-0 text-paper/18" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Capabilities() {
  return (
    <section
      id="capabilities"
      className="relative border-b border-paper/10 py-24 sm:py-28 lg:py-36"
    >
      <div className="container-pixel">
        <div className="grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow">The toolkit</span>
            <p className="mt-5 max-w-[160px] text-[11px] leading-5 text-paper/40">
              Four tools. A growing set of small, useful actions.
            </p>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="max-w-[900px] text-[clamp(2.6rem,5.7vw,5.3rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
                Small requests.{" "}
                <span className="display text-paper/45 italic">
                  Real consequences.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="mt-7 flex flex-wrap gap-2">
              {["Google Calendar", "Gmail", "Google Tasks", "Google Drive"].map(
                (tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-paper/10 bg-paper/[0.025] px-3 py-1.5 text-[10px] font-medium text-paper/50"
                  >
                    {tool}
                  </span>
                ),
              )}
              <span className="flex items-center gap-1.5 px-2 text-[10px] text-paper/22">
                <span className="size-1 rounded-[1px] bg-volt" />
                with your permission
              </span>
            </Reveal>
          </div>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:mt-16 lg:grid-cols-12">
          <CapabilityCard
            index={1}
            label="Calendar"
            icon={CalendarDays}
            title="Own your time."
            accent="without the busywork."
            accentClass="text-coral"
            copy="From “block two hours for focus” to “move the review to Friday”, Pixel finds the opening and writes it to your calendar."
            className="lg:col-span-7"
            glowClass="bg-coral"
          >
            <CalendarPreview />
          </CapabilityCard>

          <CapabilityCard
            index={2}
            label="Tasks"
            icon={CheckSquare2}
            title="Remember it."
            accent="Then forget it."
            accentClass="text-volt"
            copy="Thoughts become real Google Tasks in seconds — with enough context that future-you knows exactly what to do."
            className="lg:col-span-5"
            glowClass="bg-volt"
          >
            <TasksPreview />
          </CapabilityCard>

          <CapabilityCard
            index={3}
            label="Gmail"
            icon={Mail}
            title="Write less."
            accent="Say more."
            accentClass="text-sky"
            copy="Ask for a draft in your own voice. Pixel composes it, shows it back to you and waits for your go-ahead."
            className="lg:col-span-5"
            glowClass="bg-sky"
          >
            <GmailPreview />
          </CapabilityCard>

          <CapabilityCard
            index={4}
            label="Drive"
            icon={FolderSearch}
            title="Find the file."
            accent="Not the folder."
            accentClass="text-paper"
            copy="Search by name or content, without remembering where anything lives. The right file, surfaced in one request."
            className="lg:col-span-7"
            glowClass="bg-paper"
          >
            <DrivePreview />
          </CapabilityCard>
        </div>

        <Reveal className="mt-4 flex flex-col gap-4 rounded-2xl border border-paper/10 bg-paper/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-paper/32">
            <span className="flex items-center gap-1.5 text-paper/50">
              <span className="size-1 rounded-[1px] bg-volt" />
              And more
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-3" /> Current time
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="size-3" /> Open links
            </span>
            <span className="flex items-center gap-1.5">
              <Search className="size-3" /> Google search
            </span>
          </div>
          <span className="text-[10px] font-medium text-paper/24">
            Ten focused tools, not a hundred half-actions.
          </span>
        </Reveal>
      </div>
    </section>
  );
}
