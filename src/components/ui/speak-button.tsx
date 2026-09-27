"use client";

import { useRef, type MouseEvent, type PointerEvent } from "react";
import { Microphone, MicrophoneSlash } from "@phosphor-icons/react";
import type { SpeakState } from "@/lib/speak";
import { buttonClass } from "./button";

/** Pressing longer than this and letting go stops; a shorter press is a tap that toggles. */
const HOLD_MS = 450;

const LABEL: Record<SpeakState, string> = {
  idle: "Hold to speak",
  done: "Hold to speak",
  blocked: "Hold to speak",
  asking: "Opening the microphone",
  listening: "Listening. Let go or tap to stop",
};

/**
 * The big speak button. Works three ways, for different hands and needs:
 * hold it down and let go to stop; tap once to start and again to stop;
 * or use Enter or Space (and screen reader activation) to toggle.
 */
export function SpeakButton({
  state,
  onStart,
  onStop,
  label = "Hold to speak",
  className = "",
}: {
  state: SpeakState;
  /** The resting label, e.g. "Say it" in the rescue deck. */
  label?: string;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}) {
  const downAt = useRef<number | null>(null);
  const live = state === "listening" || state === "asking";

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (live) {
      downAt.current = null;
      onStop();
    } else {
      downAt.current = Date.now();
      onStart();
    }
  };

  // A long press ends when let go, but only once actually listening: a
  // release while the permission prompt is still up turns it into a tap,
  // so the first ever hold does not cancel itself.
  const up = () => {
    if (downAt.current !== null && state === "listening" && Date.now() - downAt.current >= HOLD_MS) onStop();
    downAt.current = null;
  };

  // Pointer presses are handled above; a click with detail 0 comes from the
  // keyboard or assistive tech, so it toggles.
  const click = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail !== 0) return;
    if (live) onStop();
    else onStart();
  };

  const IconCmp = state === "blocked" ? MicrophoneSlash : Microphone;

  return (
    <button
      type="button"
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onClick={click}
      onContextMenu={(e) => e.preventDefault()}
      className={`${buttonClass("primary", "lg")} touch-none select-none ${live ? "stone-pulse" : ""} ${className}`}
    >
      <IconCmp size={22} weight="regular" aria-hidden />
      {state === "asking" || state === "listening" ? LABEL[state] : label}
    </button>
  );
}
