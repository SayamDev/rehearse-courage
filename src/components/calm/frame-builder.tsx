"use client";

import { Fragment, useId, useState } from "react";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { FRAMES } from "@/lib/content/phrases";
import { checkCrisis } from "@/lib/safety/crisis";
import type { AgeBand } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";

const GAP = "___";

/**
 * Sentence frames: pick a shape, fill each gap right inside the sentence,
 * then hear it read back or say it yourself and listen back. Nothing is
 * saved; typed words are checked for crisis words on the device.
 */
export function FrameBuilder({ age, onCrisis, heading = false }: { age: AgeBand | null; onCrisis: () => void; heading?: boolean }) {
  const frames = FRAMES.map((f) => ({ id: f.id, text: words(f.text, age) }));
  const [frameId, setFrameId] = useState(frames[0].id);
  const [gaps, setGaps] = useState<string[]>([]);
  const id = useId();
  const frame = frames.find((f) => f.id === frameId)!;
  const parts = frame.text.split(GAP);
  const filled = parts.map((p, k) => p + (k < parts.length - 1 ? gaps[k]?.trim() || "..." : "")).join("");
  const complete = parts.length - 1 === gaps.filter((g) => g?.trim()).length;

  const pick = (fid: string) => {
    setFrameId(fid);
    setGaps([]);
  };

  return (
    <>
      {heading ? <h2 className="mb-1 text-2xl text-ink">Or use a frame</h2> : null}
      <p className="text-ink">Pick a shape, then fill in the gaps.</p>

      <fieldset className="mt-4">
        <legend className="sr-only">Sentence frames</legend>
        <div className="flex flex-wrap gap-2">
          {frames.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={f.id === frameId}
              onClick={() => pick(f.id)}
              className={`min-h-11 rounded-full border-2 px-4 text-left font-semibold transition-colors duration-[var(--dur-feedback)] ${
                f.id === frameId ? "border-die bg-accent text-on-accent shadow-sticker" : "border-line bg-surface text-ink hover:border-stone-dim"
              }`}
            >
              {f.text.replaceAll(GAP, "…")}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 rounded-card border-[1.5px] border-line bg-surface-2 p-5">
        <p id={`${id}-label`} className="text-sm font-semibold text-muted">
          Your sentence
        </p>
        <p className="mt-2 font-display text-[clamp(1.25rem,1rem+1vw,1.6rem)] font-bold leading-[2.2] text-ink">
          {parts.map((p, k) => (
            <Fragment key={`${frameId}-${k}`}>
              {p}
              {k < parts.length - 1 ? (
                <input
                  aria-label={`Gap ${k + 1} of ${parts.length - 1}`}
                  aria-describedby={`${id}-label`}
                  value={gaps[k] ?? ""}
                  maxLength={80}
                  size={Math.max(6, (gaps[k] ?? "").length + 1)}
                  onChange={(e) => setGaps((g) => Object.assign([...g], { [k]: e.target.value }))}
                  onBlur={() => {
                    const all = gaps.join(" ");
                    if (all.trim() && checkCrisis(all).crisis) onCrisis();
                  }}
                  className="mx-1 inline-block max-w-full rounded-[10px] border-b-[3px] border-accent bg-surface px-2 py-0.5 align-baseline font-body text-[0.9em] font-semibold text-ink focus-visible:border-ink"
                />
              ) : null}
            </Fragment>
          ))}
        </p>
      </div>

      <div className="mt-5" aria-live="polite">
        {complete ? (
          <>
            <p className="text-sm font-semibold text-muted">Hear it read back</p>
            <div className="mt-1">
              <SpokenLine role="narrator" text={filled} className="text-lg text-ink" />
            </div>
          </>
        ) : (
          <p className="text-muted">Fill every gap to hear it read back. Only you can see it, and it is not saved.</p>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <SayAndListen label="Say your sentence" />
        <Button variant="secondary" icon={ArrowCounterClockwise} onClick={() => setGaps([])}>
          Clear
        </Button>
      </div>
    </>
  );
}
