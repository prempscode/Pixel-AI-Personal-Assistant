import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { cn } from "../../lib/cn";
import GoogleConnectedIcon from "./GoogleConnectedIcon";

const ease = [0.16, 1, 0.3, 1];
const pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

export default function GoogleConnectedStatus({
  children,
  className,
  labelClassName,
  labelTag = "span",
}) {
  const labelControls = useAnimationControls();
  const iconControls = useAnimationControls();
  const badgeControls = useAnimationControls();
  const [badgeMode, setBadgeMode] = useState("check");
  const [iconVisible, setIconVisible] = useState(false);
  const phase = useRef("idle");
  const sequence = useRef(0);
  const pointerInside = useRef(false);
  const focusWithin = useRef(false);
  const leftDuringEntry = useRef(false);
  const exitTimer = useRef(null);
  const runExitRef = useRef(null);

  const clearExitTimer = useCallback(() => {
    if (exitTimer.current !== null) {
      clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
  }, []);

  const isEngaged = useCallback(
    () => pointerInside.current || focusWithin.current,
    [],
  );

  const runEntry = useCallback(async () => {
    if (phase.current === "entering" || phase.current === "active") return;

    const currentSequence = ++sequence.current;
    const isCurrent = () => sequence.current === currentSequence;
    clearExitTimer();
    labelControls.stop();
    iconControls.stop();
    badgeControls.stop();
    phase.current = "entering";
    leftDuringEntry.current = false;

    await Promise.all([
      labelControls.start({ x: 40, transition: { duration: 0.28, ease } }),
      badgeControls.start({
        opacity: 0,
        scale: 0.6,
        y: 3,
        transition: { duration: 0.12, ease },
      }),
    ]);
    if (!isCurrent()) return;

    setIconVisible(true);
    await iconControls.start({
      opacity: [0, 1],
      scale: [0.55, 1.16, 1],
      y: [5, -3, 0],
      transition: { duration: 0.5, ease },
    });
    if (!isCurrent()) return;

    setBadgeMode("loading");
    await badgeControls.start({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.22, ease },
    });
    if (!isCurrent()) return;

    await pause(460);
    if (!isCurrent()) return;

    setBadgeMode("check");
    await badgeControls.start({
      scale: [1, 1.18, 1],
      transition: { duration: 0.32, ease },
    });
    if (!isCurrent()) return;

    phase.current = "active";
    if (leftDuringEntry.current && !isEngaged()) {
      exitTimer.current = setTimeout(() => {
        exitTimer.current = null;
        if (!isEngaged()) runExitRef.current?.();
      }, 700);
    }
  }, [badgeControls, clearExitTimer, iconControls, isEngaged, labelControls]);

  const runExit = useCallback(async () => {
    if (phase.current !== "active") return;

    const currentSequence = ++sequence.current;
    const isCurrent = () => sequence.current === currentSequence;
    phase.current = "exiting";
    setBadgeMode("loading");
    await pause(320);
    if (!isCurrent()) return;

    await badgeControls.start({
      opacity: 0,
      scale: 0.6,
      y: 3,
      transition: { duration: 0.2, ease },
    });
    if (!isCurrent()) return;

    await iconControls.start({
      opacity: 0,
      scale: 0.72,
      y: 5,
      transition: { duration: 0.32, ease },
    });
    if (!isCurrent()) return;

    setIconVisible(false);
    await labelControls.start({ x: 0, transition: { duration: 0.28, ease } });
    if (!isCurrent()) return;

    setBadgeMode("check");
    badgeControls.set({ opacity: 0, scale: 0.6, y: 3 });
    phase.current = "idle";
  }, [badgeControls, iconControls, labelControls]);

  useEffect(() => {
    runExitRef.current = runExit;
  }, [runExit]);

  const scheduleExit = (delay) => {
    clearExitTimer();
    exitTimer.current = setTimeout(() => {
      exitTimer.current = null;
      if (!isEngaged()) void runExit();
    }, delay);
  };

  const handlePointerEnter = () => {
    pointerInside.current = true;
    leftDuringEntry.current = false;
    clearExitTimer();
    void runEntry();
  };

  const handlePointerLeave = () => {
    pointerInside.current = false;
    if (isEngaged()) return;

    if (phase.current === "entering") {
      leftDuringEntry.current = true;
    } else if (phase.current === "active") {
      scheduleExit(180);
    }
  };

  const handleFocus = () => {
    focusWithin.current = true;
    leftDuringEntry.current = false;
    clearExitTimer();
    void runEntry();
  };

  const handleBlur = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    focusWithin.current = false;
    if (isEngaged()) return;

    if (phase.current === "entering") {
      leftDuringEntry.current = true;
    } else if (phase.current === "active") {
      scheduleExit(180);
    }
  };

  useEffect(
    () => () => {
      sequence.current += 1;
      clearExitTimer();
      labelControls.stop();
      iconControls.stop();
      badgeControls.stop();
    },
    [badgeControls, clearExitTimer, iconControls, labelControls],
  );

  const Label = labelTag;

  return (
    <div
      role="status"
      aria-label="Google connected"
      aria-describedby="google-connected-help"
      tabIndex={0}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "group/google-connected relative z-0 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember hover:z-20 focus-within:z-20",
        className,
      )}
    >
      <GoogleConnectedIcon
        badgeMode={badgeMode}
        badgeControls={badgeControls}
        iconControls={iconControls}
        visible={iconVisible}
      />
      <div className="min-w-0">
        <motion.div animate={labelControls} className="min-w-0">
          <Label className={labelClassName}>Google connected</Label>
        </motion.div>
        {children}
      </div>

      <div
        id="google-connected-help"
        role="tooltip"
        className="pointer-events-none absolute top-full left-0 z-30 mt-2 w-full translate-y-1 rounded-xl border border-line-strong bg-ink-850 p-3 text-[0.74rem] leading-relaxed text-muted opacity-0 shadow-2xl transition-[opacity,transform] duration-200 group-hover/google-connected:translate-y-0 group-hover/google-connected:opacity-100 group-focus-within/google-connected:translate-y-0 group-focus-within/google-connected:opacity-100"
      >
        <p>
          Pixel uses the Google permissions you approved to help with Tasks,
          Calendar, Gmail, and Drive.
        </p>
        <p className="mt-2">
          <strong className="font-semibold text-ok">Secure storage:</strong>{" "}
          your refresh token is encrypted on the server and tied to your
          account.{" "}
          <strong className="font-semibold text-ember">Not shared:</strong>{" "}
          your Google access is not shared with other Pixel users.
        </p>
      </div>
    </div>
  );
}
