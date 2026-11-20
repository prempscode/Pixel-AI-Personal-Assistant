import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  CheckSquare2,
  FolderSearch,
  Mail,
  Sparkles,
} from "lucide-react";
import { PixelMark } from "../ui/Logo";
import { getGreeting, STARTER_PROMPTS } from "../../lib/constants";
import { cn } from "../../lib/cn";

const promptIcons = {
  Calendar: CalendarDays,
  Tasks: CheckSquare2,
  Gmail: Mail,
  Drive: FolderSearch,
};

const iconStyles = {
  Calendar: "text-coral bg-coral/[0.07] border-coral/15",
  Tasks: "text-volt bg-volt/[0.12] border-volt/25",
  Gmail: "text-sky bg-sky/[0.12] border-sky/25",
  Drive: "text-ink/55 bg-ink/[0.045] border-ink/10",
};

export default function EmptyState({ firstName, onSelect, disabled }) {
  const reduceMotion = useReducedMotion();
  const greeting = `${getGreeting()}, ${firstName || "there"}.`;

  return (
    <div className="flex flex-1 flex-col justify-center py-10 sm:py-14">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-2">
          <PixelMark className="size-4 text-ink" />
          <span className="text-[9px] font-bold tracking-[0.16em] text-ink/35 uppercase">
            Assistant ready
          </span>
          <span className="h-px w-8 bg-ink/10" />
        </div>

        <h1 className="mt-5 max-w-[760px] text-[clamp(2.2rem,5.2vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-ink">
          {greeting}
          <span className="display mt-1 block text-ink/38 italic">
            What can I take off your plate?
          </span>
        </h1>
        <p className="mt-4 max-w-[500px] text-[12.5px] leading-6 text-ink/52 sm:text-[13px]">
          Ask in plain language. Pixel will choose the right Google tool, do the
          work, and show you exactly what changed.
        </p>
      </motion.div>

      <div className="mt-9 grid max-w-[760px] gap-2.5 sm:grid-cols-2">
        {STARTER_PROMPTS.map((prompt, index) => {
          const Icon = promptIcons[prompt.kind] || Sparkles;
          return (
            <motion.button
              key={prompt.id}
              type="button"
              onClick={() => onSelect(prompt.prompt)}
              disabled={disabled}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.12 + index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group flex flex-col rounded-2xl border border-ink/10 bg-[var(--chat-card)] p-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-[400ms] ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-ink/20 hover:bg-[var(--chat-card-hover)] hover:shadow-[0_18px_40px_-30px_rgba(10,11,9,0.45)] disabled:pointer-events-none disabled:opacity-55"
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg border transition-transform duration-[400ms] ease-[var(--ease-out-expo)] group-hover:-rotate-6 group-hover:scale-110",
                    iconStyles[prompt.kind],
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.7} />
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[8px] font-semibold tracking-[0.12em] text-ink/25 uppercase">
                    {prompt.kind}
                  </span>
                  <ArrowUpRight className="size-3 text-ink/20 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink/50" />
                </span>
              </div>
              <span className="mt-4 text-[12.5px] font-semibold tracking-[-0.02em] text-ink/72">
                {prompt.title}
              </span>
              <span className="mt-1.5 text-[10.5px] leading-[1.15rem] text-ink/48">
                “{prompt.prompt}”
              </span>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="mt-7 flex max-w-[760px] flex-col gap-2 text-[9px] text-ink/38 sm:flex-row sm:items-center sm:gap-4"
      >
        <span className="flex items-center gap-1.5">
          <span className="size-1 rounded-[1px] bg-volt" />
          Choose a starting point, or write your own below.
        </span>
        <span className="hidden h-3 w-px bg-ink/10 sm:block" />
        <span>Google access is required for actions.</span>
      </motion.div>
    </div>
  );
}
