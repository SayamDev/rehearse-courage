"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export const GROUNDING_STEPS: { n: number; sense: string; hint: string }[] = [
  { n: 5, sense: "things you can see", hint: "Look around slowly. Name them in your head or out loud." },
  { n: 4, sense: "things you can touch", hint: "Your sleeve, the chair, the floor under your feet." },
  { n: 3, sense: "things you can hear", hint: "Near sounds and far away sounds both count." },
  { n: 2, sense: "things you can smell", hint: "If nothing comes, think of two smells you like." },
  { n: 1, sense: "thing you can taste", hint: "Or take a sip of water and notice it." },
];

/**
 * 5-4-3-2-1 grounding: five short screens, one sense at a time, with Next.
 * The heading takes focus on each screen so screen readers hear it.
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The screen last focused; starting at 0 when not focusing on mount means screen 1 is skipped (also robust to effects running twice in development).
  const focused = useRef(focusOnMount ? -1 : 0);
  const step = GROUNDING_STEPS[i];
  const last = i === GROUNDING_STEPS.length - 1;

  useEffect(() => {
    if (focused.current === i) return;
    focused.current = i;
    headingRef.current?.focus();
  }, [i]);

  return (
    <div className="text-center">
      <p className="tabular text-muted">
        {i + 1} of {GROUNDING_STEPS.length}
      </p>
      <p aria-hidden className="tabular mt-2 font-display text-7xl font-extrabold text-calm">
        {step.n}
      </p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] text-ink outline-none">
        {step.n} {step.sense}
      </h2>
      <p className="mx-auto mt-2 max-w-[40ch] text-ink">{step.hint}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {i === 0 && firstBackLabel === null ? null : (
          <Button variant="secondary" icon={ArrowLeft} onClick={() => (i === 0 ? onDone() : setI(i - 1))}>
            {i === 0 ? firstBackLabel : "Back"}
          </Button>
        )}
        <Button icon={last ? Check : ArrowRight} onClick={() => (last ? onDone() : setI(i + 1))}>
          {last ? "Done" : "Next"}
        </Button>
      </div>
    </div>
  );
}
