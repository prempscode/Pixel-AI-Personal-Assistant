import Reveal from "../ui/Reveal";
import Button, { ArrowIcon, GoogleG } from "../ui/Button";
import Logo from "../ui/Logo";
import {
  LetterSwapForward,
  LetterSwapPingPong,
} from "../fancy/text/LetterSwapText";

export default function FinalCta({ isAuthed, onStart, onOpen, loading }) {
  return (
    <>
      <section className="relative isolate overflow-hidden border-t border-line">
        <div aria-hidden="true" className="grid-faint absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <Reveal className="cta-hover mx-auto max-w-4xl px-5 py-32 text-center sm:px-8 sm:py-44">
          <h2 className="display text-6xl sm:text-8xl">
            <LetterSwapForward label="Hand it off." reverse className="inline-block" />{" "}
            <em className="text-muted">
              <LetterSwapPingPong
                label="Get on with your day."
                staggerFrom="center"
              />
            </em>
          </h2>
          <div className="mt-12 flex justify-center">
            {isAuthed ? (
              <Button size="lg" variant="ember" onClick={onOpen}>
                Open Pixel <ArrowIcon />
              </Button>
            ) : (
              <Button size="lg" variant="primary" onClick={onStart} loading={loading}>
                {!loading && <GoogleG />}
                Continue with Google
              </Button>
            )}
          </div>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-dim">
            Sign in, connect Google once, start asking
          </p>
        </Reveal>
      </section>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
          <Logo />
          <p className="text-sm text-dim">
            Built with React, Express, Groq and the Google APIs.
          </p>
        </div>
      </footer>
    </>
  );
}
