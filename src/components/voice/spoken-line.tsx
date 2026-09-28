"use client";

import { useEffect, type ElementType, type ReactNode } from "react";
import { SpeakerHigh, Stop } from "@phosphor-icons/react";
import { effectiveAge } from "@/lib/age";
import { useCourage } from "@/lib/store";
import type { Role, VoiceSet } from "@/lib/voice/lines";
import { lineKey, speak, stopSpeaking, usePlaying } from "@/lib/voice/speak";

/** Kids (and a skipped age) get the kids voice set: kid wording, a child-sounding friend, a little slower. */
export function useVoiceSet(): VoiceSet {
  const { age } = useCourage();
  return effectiveAge(age) === "under13" ? "kids" : "grown";
}

/**
 * A line that can be read aloud: the text itself (always on screen, so it is
 * the caption) and a small "Hear it" button. While it plays, the text is
 * softly highlighted and the button becomes Stop. With `autoPlay`, the line
 * plays once when it first appears, unless the person turned off "Play the
 * coach's lines automatically" in Me.
 */
export function SpokenLine({
  role,
  text,
  as: Tag = "p",
  className = "",
  autoPlay = false,
  children,
}: {
  role: Role;
  text: string;
  as?: ElementType;
  className?: string;
  autoPlay?: boolean;
  /** What to show, when it differs from the spoken text (for example with a speaker label). */
  children?: ReactNode;
}) {
  const store = useCourage();
  const set = useVoiceSet();
  const playing = usePlaying();
  const accent = store.settings.accent;
  const key = lineKey(role, set, text, accent);
  const active = playing?.key === key;
  const slower = store.settings.slowerVoice;
  const auto = autoPlay && store.hydrated && store.settings.playCoach;

  useEffect(() => {
    if (auto) void speak({ role, set, text, slower, accent });
    // Once per line: re-running on every setting change would restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, key]);

  return (
    <div className="flex items-start gap-2">
      <Tag
        className={`min-w-0 flex-1 rounded-lg transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] ${
          active ? "bg-[color-mix(in_srgb,var(--help)_16%,transparent)]" : ""
        } ${className}`}
      >
        {children ?? text}
      </Tag>
      <button
        type="button"
        onClick={() => (active ? stopSpeaking() : void speak({ role, set, text, slower, accent }))}
        aria-label={active ? "Stop" : "Hear it"}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-ink transition-colors duration-[var(--dur-ui)] ease-[var(--ease-out)] hover:bg-line/50 active:bg-line/70 focus-visible:outline-3 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-3"
      >
        {active ? (
          <Stop size={20} weight="regular" aria-hidden />
        ) : (
          <SpeakerHigh size={20} weight="regular" aria-hidden />
        )}
      </button>
    </div>
  );
}

/**
 * Reads a line aloud from code (breathing cues, the balloon, a finished
 * step), in the person's voices, only when "Read lines out automatically"
 * is on. Returns a function; calling it interrupts whatever was playing.
 */
export function useReadAloud(): (text: string, role?: Role) => void {
  const store = useCourage();
  const set = useVoiceSet();
  const { playCoach, slowerVoice, accent } = store.settings;
  const on = store.hydrated && playCoach;
  return (text, role = "narrator") => {
    if (on) void speak({ role, set, text, slower: slowerVoice, accent });
  };
}
