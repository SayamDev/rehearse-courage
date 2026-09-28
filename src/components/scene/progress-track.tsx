"use client";

import { Flag } from "@phosphor-icons/react";
import { LEVELS } from "@/lib/ladder";
import { stoneStates, type StoneState } from "@/lib/progress";
import { useCourage } from "@/lib/store";
import type { Level } from "@/lib/types";

const STATE_WORD: Record<StoneState, string> = { lit: "done", current: "current", dim: "not yet" };

const DOT: Record<StoneState, string> = {
  lit: "border-die bg-accent text-on-accent shadow-sticker",
  current: "border-accent bg-surface text-ink ring-4 ring-accent/25",
  dim: "border-line bg-surface-2 text-muted",
};

/**
 * The six steps of one situation as a clean numbered track: five practice
 * steps and the flag for trying it for real. Done steps are teal stickers,
 * the current one has a teal ring, the rest wait in grey. The word under the
 * track names the current step, so state is never shown by colour alone.
 *
 * With `onPick` every dot is a button (the room screen uses it to choose a
 * step); without it the track is one image with a text summary (Home).
 */
export function ProgressTrack({
  situationId,
  onPick,
  selected,
  className = "",
}: {
  situationId: string;
  onPick?: (level: Level) => void;
  /** The step the card is showing (room screen), outlined so the choice is visible. */
  selected?: Level;
  className?: string;
}) {
  const store = useCourage();
  const states = stoneStates(store.records, situationId);
  const summary = states.map((s, i) => `step ${i + 1} ${STATE_WORD[s]}`).join(", ");

  const dots = states.map((state, i) => {
    const level = (i + 1) as Level;
    const label = `Step ${level}, ${LEVELS[i].name}, ${STATE_WORD[state]}`;
    const face = level === 6 ? <Flag size={18} weight={state === "lit" ? "fill" : "bold"} aria-hidden /> : level;
    const dot = (
      <span
        className={`flex size-10 items-center justify-center rounded-full border-[3px] font-display text-base font-bold transition-colors duration-[var(--dur-ui)] ${DOT[state]} ${
          selected === level ? "outline outline-2 outline-offset-2 outline-ink" : ""
        }`}
      >
        {face}
      </span>
    );
    return (
      <li key={level} className="relative flex flex-1 justify-center">
        {/* The line to the previous dot: teal once that step is done. */}
        {i > 0 ? (
          <span
            aria-hidden
            className={`absolute right-1/2 top-1/2 h-1 w-full -translate-y-1/2 rounded-full ${states[i - 1] === "lit" ? "bg-accent" : "bg-line"}`}
          />
        ) : null}
        <span className="relative z-10">
          {onPick ? (
            <button
              type="button"
              onClick={() => onPick(level)}
              aria-label={label}
              aria-pressed={selected === level}
              className="flex size-11 items-center justify-center rounded-full"
            >
              {dot}
            </button>
          ) : (
            dot
          )}
        </span>
      </li>
    );
  });

  return onPick ? (
    <ul role="list" className={`m-0 flex list-none p-0 ${className}`}>
      {dots}
    </ul>
  ) : (
    <div role="img" aria-label={`Path: ${summary}.`} className={className}>
      <ul aria-hidden className="m-0 flex list-none p-0">
        {dots}
      </ul>
    </div>
  );
}
