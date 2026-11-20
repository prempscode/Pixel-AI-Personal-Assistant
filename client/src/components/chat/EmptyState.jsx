import { motion } from "motion/react";
import { LogoMark } from "../ui/Logo";
import { FEATURED_PROMPTS } from "./prompts";

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Burning the midnight oil" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function EmptyState({ name, onPick }) {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-2 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <LogoMark size={40} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="display mt-7 text-5xl sm:text-6xl"
      >
        {greeting()}
        {name ? <>, <em className="text-muted">{name}.</em></> : "."}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-3 text-lg text-muted"
      >
        What should Pixel take care of?
      </motion.p>

      <ul className="mt-9 grid gap-2.5 sm:grid-cols-2">
        {FEATURED_PROMPTS.map((p, i) => (
          <motion.li
            key={p}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => onPick(p)}
              className="group h-full w-full rounded-2xl border border-line bg-ink-900 px-4 py-3.5 text-left text-[0.92rem] leading-snug text-paper/90 transition-colors hover:border-line-strong hover:bg-ink-850"
            >
              <span className="mr-2 font-mono text-ember transition-transform duration-300 group-hover:translate-x-0.5 inline-block">›</span>
              {p}
            </button>
          </motion.li>
        ))}
      </ul>
      <p className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-dim">
        Examples fill the box. Nothing is sent until you press send.
      </p>
    </div>
  );
}
