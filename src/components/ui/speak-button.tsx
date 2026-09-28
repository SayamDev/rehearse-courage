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
  asking: "Allow the microphone to start",
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
  variant = "primary",
  className = "",
  level = 0,
  seconds = 0,
  ref,
}: {
  ref?: React.Ref<HTMLButtonElement>;
  state: SpeakState;
  /** Secondary where another button is the screen's one amber action. */
  variant?: "primary" | "secondary";
  /** The resting label, e.g. "Say it" in the rescue deck. */
  label?: string;
  onStart: () => void;
  onStop: () => void;
  className?: string;
  /** Live loudness 0 to 1 while recording, for the moving bars. */
  level?: number;
  /** Seconds of voice so far, shown while recording. */
  seconds?: number;
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
  const recording = state === "listening";

  return (
    <button
      ref={ref}
      type="button"
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onClick={click}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={recording ? `Recording, ${seconds} seconds. Let go or tap to stop` : undefined}
      className={`${
        recording
          ? "inline-flex min-h-[64px] items-center justify-center gap-3 rounded-[var(--radius-control)] border-[3px] border-die bg-coral px-5 font-display font-bold text-[#13262b] shadow-sticker rec-ring"
          : buttonClass(variant, "lg")
      } touch-none select-none ${className}`}
    >
      {recording ? (
        <>
          {/* A red dot that pulses, and bars that move with your voice: it is plainly recording. */}
          <span aria-hidden className="rec-dot size-3 shrink-0 rounded-full bg-[#c81e1e]" />
          <span aria-hidden className="flex h-7 items-center gap-[3px]">
            {BARS.map((k, i) => (
              <span
                key={i}
                className="w-[4px] rounded-full bg-[#13262b] transition-[height] duration-100 ease-out"
                style={{ height: `${Math.round(18 + Math.min(1, level * k) * 82)}%` }}
              />
            ))}
          </span>
          <span aria-hidden>
            Recording <span className="tabular">{seconds}s</span>
            <span className="block text-sm font-semibold">Let go or tap to stop</span>
          </span>
        </>
      ) : (
        <>
          <IconCmp size={22} weight="regular" aria-hidden />
          {state === "asking" ? LABEL.asking : label}
        </>
      )}
    </button>
  );
}

/** How much each bar reacts, centre strongest, so the row looks like a voice. */
const BARS = [0.55, 0.85, 1.2, 0.95, 0.6, 0.8, 0.5];
