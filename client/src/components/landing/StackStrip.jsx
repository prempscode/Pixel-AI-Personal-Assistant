import Reveal from "../ui/Reveal";
import ServiceIcon from "../ui/ServiceIcon";

const integrations = [
  {
    name: "Google Calendar",
    detail: "Time blocking & events",
    service: "calendar",
  },
  {
    name: "Gmail",
    detail: "Drafts, search & confirmation",
    service: "gmail",
  },
  {
    name: "Google Tasks",
    detail: "To-dos with context",
    service: "tasks",
  },
  {
    name: "Google Drive",
    detail: "File search & discovery",
    service: "drive",
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
            {integrations.map(({ name, detail, service }) => (
              <div key={name} className="flex items-start gap-2.5">
                <ServiceIcon service={service} size={17} className="mt-0.5" />
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
