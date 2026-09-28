"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Coffee, Ear, Eye, Flower, HandPalm, type Icon } from "@phosphor-icons/react";
import { GROUNDING_STEPS } from "@/lib/content/body";
import { SpokenLine } from "@/components/voice/spoken-line";
import { Button } from "@/components/ui/button";

const SENSE_ICON: Icon[] = [Eye, HandPalm, Ear, Flower, Coffee];

export { GROUNDING_STEPS };

/**
 * 5-4-3-2-1 grounding, one sense at a time. A row of sense stickers shows
 * where you are; tap a circle for each thing you notice (optional, Next
 * always works). The heading takes focus on each screen so screen readers
 * hear it.
 */
export function Grounding({
  onDone,
  firstBackLabel = "Back to breathing",
  focusOnMount = true,
}: {
  onDone: () => void;
  /** Label for Back on the first screen (it calls onDone there); null hides it. */
  firstBackLabel?: string | null;
  /** Move focus to the heading when first shown (true inside Panic now; false on a page that has its own h1). */
  focusOnMount?: boolean;
}) {
  const [i, setI] = useState(0);
  const [found, setFound] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The screen last focused; starting at 0 when not focusing on mount means screen 1 is skipped (also robust to effects running twice in development).
  const focused = useRef(focusOnMount ? -1 : 0);
  const step = GROUNDING_STEPS[i];
  const last = i === GROUNDING_STEPS.length - 1;
  const SenseIcon = SENSE_ICON[i];

  useEffect(() => {
    if (focused.current === i) return;
    focused.current = i;
    headingRef.current?.focus();
  }, [i]);

  const go = (to: number) => {
    setFound(0);
    setI(to);
  };

  return (
    <div className="text-center">
      <ol aria-label={`Sense ${i + 1} of ${GROUNDING_STEPS.length}`} className="mx-auto flex w-fit list-none gap-2 p-0">
        {GROUNDING_STEPS.map((g, j) => {
          const Ic = SENSE_ICON[j];
          return (
            <li
              key={g.sense}
              aria-hidden
              className={`flex size-9 items-center justify-center rounded-full border-[3px] transition-colors duration-[var(--dur-ui)] ${
                j < i ? "border-die bg-accent text-on-accent" : j === i ? "border-die bg-calm text-on-help shadow-sticker" : "border-line bg-surface-2 text-muted"
              }`}
            >
              {j < i ? <Check size={16} weight="bold" /> : <Ic size={18} weight="bold" />}
            </li>
          );
        })}
      </ol>

      <span aria-hidden className="mx-auto mt-6 flex size-20 -rotate-6 items-center justify-center rounded-full border-4 border-die bg-calm text-on-help shadow-sticker">
        <SenseIcon size={40} weight="bold" />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink outline-none">
        {step.n} {step.sense}
      </h2>
      <div className="mx-auto mt-2 max-w-[40ch] text-left">
        <SpokenLine role="narrator" text={step.hint} autoPlay className="text-ink" />
      </div>

      <p className="mt-5 text-sm text-muted">Tap a circle for each one you notice.</p>
      <ul role="list" className="mx-auto mt-2 flex w-fit list-none flex-wrap justify-center gap-2 p-0">
        {Array.from({ length: step.n }, (_, k) => (
          <li key={k}>
            <button
              type="button"
              aria-pressed={k < found}
              aria-label={`Noticed ${k + 1} of ${step.n}`}
              onClick={() => setFound(k < found ? k : k + 1)}
              className={`flex size-12 items-center justify-center rounded-full border-[3px] transition-[background-color,transform] duration-[var(--dur-feedback)] active:scale-95 ${
                k < found ? "border-die bg-accent text-on-accent shadow-sticker" : "border-dashed border-stone-dim bg-surface text-muted"
              }`}
            >
              {k < found ? <Check size={20} weight="bold" aria-hidden /> : <span className="tabular font-display font-bold">{k + 1}</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {i === 0 && firstBackLabel === null ? null : (
          <Button variant="secondary" icon={ArrowLeft} onClick={() => (i === 0 ? onDone() : go(i - 1))}>
            {i === 0 ? firstBackLabel : "Back"}
          </Button>
        )}
        <Button icon={last ? Check : ArrowRight} onClick={() => (last ? onDone() : go(i + 1))} className={i === 0 && firstBackLabel === null ? "sm:col-span-2" : ""}>
          {last ? "Done" : "Next"}
        </Button>
      </div>
    </div>
  );
}
