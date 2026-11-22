import { useEffect, useRef, useState } from "react";
import "./hold-button.css";

const TAP_MS = 250;

export default function HoldButton({
  children,
  doneLabel = "Done",
  holdTime = 1500,
  resetAfter = 1200,
  disabled = false,
  onHold,
  onTap,
  describedBy,
}) {
  const [phase, setPhase] = useState("idle");
  const phaseRef = useRef("idle");
  const buttonRef = useRef(null);
  const pointerIdRef = useRef(null);
  const startTimeRef = useRef(0);
  const lastInteractionRef = useRef(null);
  const holdTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const onHoldRef = useRef(onHold);
  const onTapRef = useRef(onTap);

  useEffect(() => {
    onHoldRef.current = onHold;
    onTapRef.current = onTap;
  }, [onHold, onTap]);

  const changePhase = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const complete = () => {
    if (phaseRef.current !== "holding") return;
    clearTimeout(holdTimerRef.current);
    changePhase("done");
    onHoldRef.current?.();

    if (resetAfter > 0) {
      resetTimerRef.current = window.setTimeout(() => {
        changePhase("idle");
      }, resetAfter);
    }
  };

  const begin = () => {
    if (disabled || phaseRef.current !== "idle") return false;
    startTimeRef.current = Date.now();
    changePhase("holding");
    holdTimerRef.current = window.setTimeout(complete, holdTime);
    return true;
  };

  const release = (cancelled = false) => {
    if (phaseRef.current !== "holding") return;
    const heldFor = Date.now() - startTimeRef.current;
    clearTimeout(holdTimerRef.current);

    if (!cancelled && heldFor >= holdTime) {
      complete();
      return;
    }

    changePhase("idle");
    if (!cancelled && heldFor < TAP_MS) onTapRef.current?.();
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    if (!begin()) return;
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const finishPointer = (event, cancelled = false) => {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
    lastInteractionRef.current = Date.now();
    release(cancelled);
  };

  const handlePointerMove = (event) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (
      rect &&
      (event.clientX < rect.left - 10 ||
        event.clientX > rect.right + 10 ||
        event.clientY < rect.top - 10 ||
        event.clientY > rect.bottom + 10)
    ) {
      pointerIdRef.current = null;
      lastInteractionRef.current = Date.now();
      release(true);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape" && phaseRef.current === "holding") {
      event.preventDefault();
      clearTimeout(holdTimerRef.current);
      changePhase("idle");
      return;
    }
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (!event.repeat) begin();
  };

  const handleKeyUp = (event) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    lastInteractionRef.current = Date.now();
    release();
  };

  const handleClick = () => {
    if (
      lastInteractionRef.current !== null &&
      Date.now() - lastInteractionRef.current < 500
    ) {
      return;
    }
    onTapRef.current?.();
  };

  useEffect(
    () => () => {
      clearTimeout(holdTimerRef.current);
      clearTimeout(resetTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (phase !== "holding") return undefined;
    const cancel = () => {
      if (phaseRef.current !== "holding") return;
      pointerIdRef.current = null;
      clearTimeout(holdTimerRef.current);
      phaseRef.current = "idle";
      setPhase("idle");
    };
    const onVisibilityChange = () => {
      if (document.hidden) cancel();
    };

    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [phase]);

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      aria-describedby={describedBy}
      data-phase={phase}
      style={{ "--hold-time": `${holdTime}ms` }}
      className="hold-button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={(event) => finishPointer(event, true)}
      onLostPointerCapture={(event) => finishPointer(event, true)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={() => {
        if (phaseRef.current === "holding") release(true);
      }}
      onClick={handleClick}
    >
      <span className="hold-button__label">
        <span className="hold-button__idle" aria-hidden={phase === "done"}>
          {children}
        </span>
        <span className="hold-button__done" aria-hidden={phase !== "done"}>
          {doneLabel}
        </span>
      </span>
      <span className="hold-button__fill" aria-hidden="true">
        <span className="hold-button__label">
          <span className="hold-button__idle">{children}</span>
          <span className="hold-button__done">{doneLabel}</span>
        </span>
      </span>
    </button>
  );
}
