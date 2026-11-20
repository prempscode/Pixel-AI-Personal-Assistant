import { CalendarDays, CheckSquare2, FolderOpen, Mail } from "lucide-react";
import Reveal from "../ui/Reveal";

const integrations = [
  {
    name: "Google Calendar",
    detail: "Time blocking & events",
    icon: CalendarDays,
    accent: "text-coral",
  },
  {
    name: "Gmail",
    detail: "Drafts, search & confirmation",
    icon: Mail,
    accent: "text-sky",
  },
  {
    name: "Google Tasks",
    detail: "To-dos with context",
    icon: CheckSquare2,
    accent: "text-volt",
  },
  {
    name: "Google Drive",
    detail: "File search & discovery",
    icon: FolderOpen,
    accent: "text-paper",
  },
];

export default function StackStrip() {
  return (
    <section
      aria-label="Google Workspace integrations"
      className="border-y border-paper/10 bg-ink-soft/55"
    >
      <div className="container-pixel py-8">
        <Reveal className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center lg:grid-cols-[220px_1fr]">
          <p className="text-[10px] leading-5 font-semibold tracking-[0.17em] text-paper/30 uppercase">
            It plugs into
            <br className="hidden md:block" /> your actual day
          </p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4">
            {integrations.map(({ name, detail, icon: Icon, accent }) => (
              <div key={name} className="flex items-start gap-2.5">
                <Icon
                  className={`mt-0.5 size-[17px] shrink-0 ${accent}`}
                  strokeWidth={1.6}
                />
                <div>
                  <p className="text-[12px] font-semibold text-paper/72">{name}</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-paper/42">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
