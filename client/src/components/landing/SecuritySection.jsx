import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import Parallax from "../ui/Parallax";
import Reveal from "../ui/Reveal";
import { ButtonLink } from "../ui/Button";

const safeguards = [
  {
    icon: ShieldCheck,
    title: "Nothing sends itself.",
    body: "Sending an email is a separate, explicitly confirmed step. The first ask only creates a preview.",
  },
  {
    icon: LockKeyhole,
    title: "Tokens stay encrypted.",
    body: "Google refresh tokens are encrypted with AES-256-GCM at rest and never touch the browser.",
  },
  {
    icon: KeyRound,
    title: "Least-privilege by default.",
    body: "Pixel asks only for the specific Calendar, Tasks, Gmail and Drive scopes its actions need.",
  },
];

const scopes = [
  { label: "Calendar", detail: "Create events", tone: "text-coral" },
  { label: "Tasks", detail: "Create to-dos", tone: "text-volt" },
  { label: "Gmail", detail: "Draft, search & send", tone: "text-sky" },
  { label: "Drive", detail: "Read files", tone: "text-paper" },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-24 sm:py-28 lg:py-36">
      <div className="container-pixel">
        <Reveal
          className="relative overflow-hidden rounded-[30px] border border-paper/10 bg-ink-soft transition-[border-color,box-shadow] duration-500 hover:border-paper/20 hover:shadow-[0_30px_90px_-50px_rgba(0,0,0,0.45)]"
          whileHover={{ y: -3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 landing-grid opacity-40" />
          <div className="pointer-events-none absolute top-[-40%] right-[-10%] size-[500px] rounded-full bg-volt/[0.055] blur-[110px]" />

          <div className="relative grid gap-12 p-6 sm:p-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20 lg:p-14">
            <div>
              <span className="eyebrow">The trust layer</span>
              <h2 className="mt-6 max-w-[540px] text-[clamp(2.4rem,4.3vw,4.1rem)] font-semibold leading-[0.99] tracking-[-0.05em]">
                Fast doesn’t mean{" "}
                <span className="display text-volt italic">reckless.</span>
              </h2>
              <p className="mt-5 max-w-[470px] text-[13px] leading-6 text-paper/55">
                Pixel only does what you could do yourself — with fewer tabs.
                Every action is scoped, visible and reversible from your Google
                account.
              </p>

              <div className="mt-9 space-y-6">
                {safeguards.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-3.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-paper/10 bg-paper/[0.035] text-volt">
                      <Icon className="size-4" strokeWidth={1.7} />
                    </span>
                    <div>
                      <h3 className="text-[12.5px] font-semibold text-paper/75">
                        {title}
                      </h3>
                      <p className="mt-1 max-w-[380px] text-[11px] leading-5 text-paper/45">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <ButtonLink
                  href="#how-it-works"
                  variant="outline"
                  size="sm"
                  className="group"
                >
                  See the full flow
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </ButtonLink>
              </div>
            </div>

            <Parallax speed={14} className="flex items-center">
              <div className="w-full rounded-[24px] border border-paper/12 bg-ink/70 p-4 shadow-panel backdrop-blur-sm sm:p-5">
                <div className="flex items-center justify-between border-b border-paper/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-volt text-ink">
                      <LockKeyhole className="size-4" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-paper/75">
                        Access requested
                      </p>
                      <p className="mt-0.5 text-[9px] text-paper/28">
                        You stay in control
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-volt/20 bg-volt/[0.07] px-2 py-1 text-[8px] font-semibold tracking-[0.12em] text-volt uppercase">
                    Scoped
                  </span>
                </div>

                <div className="divide-y divide-paper/[0.07]">
                  {scopes.map((scope) => (
                    <div
                      key={scope.label}
                      className="flex items-center gap-3 py-3.5"
                    >
                      <span className="size-1.5 rounded-[1px] bg-volt/70" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-paper/65">
                          {scope.label}
                        </p>
                        <p className="mt-0.5 text-[9px] text-paper/26">
                          {scope.detail}
                        </p>
                      </div>
                      <span
                        className={`text-[8px] font-semibold tracking-[0.08em] uppercase ${scope.tone}`}
                      >
                        Allowed
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-start gap-2 rounded-xl border border-paper/10 bg-paper/[0.025] p-3">
                  <ShieldCheck className="mt-px size-3.5 shrink-0 text-paper/35" />
                  <p className="text-[9px] leading-4 text-paper/30">
                    Revoke access at any time in your Google Account. Pixel
                    cannot read anything outside these permissions.
                  </p>
                </div>
              </div>
            </Parallax>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
