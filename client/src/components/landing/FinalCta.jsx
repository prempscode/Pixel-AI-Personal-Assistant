import { ArrowUpRight, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button, { ButtonLink } from "../ui/Button";
import GoogleIcon from "../ui/GoogleIcon";
import Reveal from "../ui/Reveal";

const promises = ["Calendar", "Gmail", "Tasks", "Drive"];

export default function FinalCta() {
  const { user, signIn, action } = useAuth();
  const signingIn = action === "signin";

  return (
    <section className="container-pixel pt-8 pb-16 sm:pt-12 sm:pb-20">
      <Reveal
        className="accent-panel relative overflow-hidden rounded-[28px] bg-volt text-[#0a0b09] sm:rounded-[36px]"
        y={30}
      >
        <div className="pointer-events-none absolute top-0 right-0 grid grid-cols-4 gap-1.5 p-5 opacity-[0.13] sm:gap-2 sm:p-8">
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={index}
              className="size-5 rounded-[2px] bg-[#0a0b09] sm:size-8"
              style={{ opacity: 1 - index * 0.045 }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute -right-24 -bottom-56 size-[440px] rounded-full border border-[#0a0b09]/15" />
        <div className="pointer-events-none absolute -right-16 -bottom-44 size-[300px] rounded-full border border-[#0a0b09]/10" />

        <div className="relative grid gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16 lg:px-14 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.18em] text-[#0a0b09]/55 uppercase">
              <span className="size-1.5 rounded-[1px] bg-[#0a0b09]" />
              Ready when you are
            </span>
            <h2 className="mt-5 max-w-[820px] text-[clamp(2.8rem,6.2vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.06em]">
              What would you
              <br />
              <span className="display italic">hand off first?</span>
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-[350px] text-[13px] leading-6 text-[#0a0b09]/70">
              One sentence. One less thing on your mind. Pixel is ready inside
              the Google tools you already use.
            </p>

            <div className="mt-7">
              {user ? (
                <ButtonLink
                  to="/chat"
                  size="lg"
                  variant="ink"
                  className="group min-w-[190px] justify-between pr-5"
                >
                  Open Pixel
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </ButtonLink>
              ) : (
                <Button
                  size="lg"
                  variant="ink"
                  onClick={signIn}
                  loading={signingIn}
                  className="group min-w-[210px] justify-between pr-5"
                >
                  <span className="flex items-center gap-2.5">
                    {!signingIn && <GoogleIcon className="size-[18px]" />}
                    {signingIn ? "Taking you to Google…" : "Start with Google"}
                  </span>
                  {!signingIn && (
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </Button>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] font-semibold text-[#0a0b09]/60">
              {promises.map((promise) => (
                <span key={promise} className="flex items-center gap-1.5">
                  <Check className="size-3" strokeWidth={2.8} />
                  {promise}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
