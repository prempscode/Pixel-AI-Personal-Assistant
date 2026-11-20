import {
  ArrowRight,
  CalendarDays,
  Check,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import GoogleIcon from "../ui/GoogleIcon";
import Reveal from "../ui/Reveal";
import { ButtonLink } from "../ui/Button";

const steps = [
  {
    number: "01",
    title: "Sign in with Google.",
    copy: "Start with the account you already use. Supabase handles your session — Pixel never sees your password.",
    visual: (
      <div className="rounded-xl border border-paper/10 bg-ink/55 p-2.5">
        <div className="flex items-center gap-2.5 rounded-lg border border-paper/10 bg-paper/[0.035] px-3 py-2.5">
          <GoogleIcon className="size-4" />
          <span className="flex-1 text-[10px] font-medium text-paper/62">
            Continue with Google
          </span>
          <span className="rounded-full bg-volt/10 px-2 py-1 text-[8px] font-semibold text-volt">
            Secure
          </span>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Connect your workspace.",
    copy: "One consent screen. Only the scopes Pixel needs. Refresh tokens are encrypted before they reach the database.",
    visual: (
      <div className="flex flex-wrap gap-1.5">
        {["Calendar", "Tasks", "Gmail", "Drive"].map((tool) => (
          <span
            key={tool}
            className="inline-flex items-center gap-1.5 rounded-md border border-paper/10 bg-ink/50 px-2.5 py-1.5 text-[9px] font-medium text-paper/45"
          >
            <Check className="size-2.5 text-volt" strokeWidth={3} />
            {tool}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-paper/10 bg-ink/50 px-2.5 py-1.5 text-[9px] font-medium text-paper/30">
          <LockKeyhole className="size-2.5" />
          Encrypted
        </span>
      </div>
    ),
  },
  {
    number: "03",
    title: "Say it plainly.",
    copy: "No commands to learn. Pixel chooses the right tool, performs the action and reports exactly what changed.",
    visual: (
      <div className="space-y-1.5">
        <div className="ml-auto w-fit max-w-[92%] rounded-lg rounded-br-sm bg-paper/[0.08] px-3 py-2 text-[9.5px] leading-4 text-paper/62">
          Block Friday 2–3 for the design review.
        </div>
        <div className="flex w-fit max-w-[94%] items-start gap-2 rounded-lg rounded-bl-sm border border-volt/15 bg-volt/[0.055] px-3 py-2">
          <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-volt text-ink">
            <Check className="size-2" strokeWidth={3} />
          </span>
          <span className="text-[9.5px] leading-4 text-paper/58">
            Added to your calendar for Friday, 2:00–3:00 PM.
          </span>
        </div>
      </div>
    ),
  },
];

const assurances = [
  { icon: ShieldCheck, label: "No new password" },
  { icon: LockKeyhole, label: "No surprise sends" },
  { icon: Sparkles, label: "No prompt syntax" },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-b border-paper/10 py-24 sm:py-28 lg:py-36"
    >
      <div className="pointer-events-none absolute top-1/3 left-[-10%] size-[430px] rounded-full bg-sky/[0.035] blur-[120px]" />
      <div className="container-pixel relative">
        <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
          <div className="self-start lg:sticky lg:top-32">
            <Reveal>
              <span className="eyebrow">The flow</span>
              <h2 className="mt-6 max-w-[470px] text-[clamp(2.7rem,5vw,4.7rem)] font-semibold leading-[0.97] tracking-[-0.055em]">
                Three steps.
                <br />
                <span className="display text-volt italic">
                  Then it’s conversation.
                </span>
              </h2>
              <p className="mt-6 max-w-[400px] text-[13px] leading-6 text-paper/55">
                Pixel doesn’t ask you to learn a new workflow. It joins the one
                you already have — and quietly takes the repetitive parts off
                your hands.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-9 space-y-3">
              {assurances.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 text-[11px] font-medium text-paper/48"
                >
                  <span className="flex size-6 items-center justify-center rounded-md border border-paper/10 bg-paper/[0.025] text-volt/80">
                    <Icon className="size-3" strokeWidth={1.8} />
                  </span>
                  {label}
                </div>
              ))}
            </Reveal>

            <Reveal delay={0.16} className="mt-10 hidden lg:block">
              <ButtonLink href="#capabilities" variant="outline" size="sm">
                Explore the actions
                <ArrowRight className="size-3.5" />
              </ButtonLink>
            </Reveal>
          </div>

          <div className="relative">
            <div className="absolute top-6 bottom-6 left-[19px] w-px bg-gradient-to-b from-volt/40 via-paper/12 to-transparent" />
            <div className="space-y-3">
              {steps.map((step, index) => (
                <Reveal
                  key={step.number}
                  delay={index * 0.07}
                  className="relative pl-12 sm:pl-16"
                >
                  <span className="absolute top-5 left-0 flex size-10 items-center justify-center rounded-full border border-paper/12 bg-ink text-[9px] font-semibold text-paper/40">
                    {step.number}
                  </span>
                  <div className="group rounded-[22px] border border-paper/10 bg-ink-card/70 p-5 transition-colors duration-500 hover:border-paper/20 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-[330px]">
                        <h3 className="text-[17px] font-semibold tracking-[-0.03em] text-paper/82">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-[11.5px] leading-[1.4rem] text-paper/50">
                          {step.copy}
                        </p>
                      </div>
                      <div className="w-full shrink-0 sm:max-w-[220px]">
                        {step.visual}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal
              delay={0.1}
              className="mt-3 flex flex-col gap-3 rounded-[22px] border border-paper/10 bg-paper/[0.025] p-5 sm:ml-16 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-1.5">
                  {[CalendarDays, Mail, Check].map((Icon, index) => (
                    <span
                      key={index}
                      className="flex size-6 items-center justify-center rounded-full border border-ink bg-ink-elevated text-paper/45"
                    >
                      <Icon className="size-3" />
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-paper/34">
                  Your data stays in your Google account.
                </p>
              </div>
              <span className="text-[9px] font-semibold tracking-[0.1em] text-volt/65 uppercase">
                You’re in control
              </span>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
