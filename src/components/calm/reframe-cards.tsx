"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { REFRAME_CARDS } from "@/lib/content/body";
import type { AgeBand } from "@/lib/types";
import { Button } from "@/components/ui/button";

/** Blushing or sweating reframe cards, one at a time: a kinder thought, then one small thing to try. */
export function ReframeCards({ kind, age }: { kind: "blushing" | "sweating"; age: AgeBand | null }) {
  const cards = REFRAME_CARDS[kind];
  const [i, setI] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const card = cards[i];

  const go = (next: number) => {
    setI(next);
    cardRef.current?.focus();
  };

  return (
    <section aria-labelledby="reframe-heading">
      <h2 id="reframe-heading" className="text-2xl text-ink">
        Cards to try
      </h2>
      <div ref={cardRef} tabIndex={-1} aria-live="polite" className="mt-3 rounded-card bg-surface-2 p-5 outline-none">
        <p className="tabular text-muted">
          Card {i + 1} of {cards.length}
        </p>
        <p className="mt-2 font-display text-xl font-bold text-ink">{words(card.thought, age)}</p>
        <p className="mt-3 text-ink">
          <span className="font-semibold">Try this: </span>
          {words(card.tryThis, age)}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="secondary" size="md" icon={ArrowLeft} onClick={() => go(i - 1)} disabled={i === 0}>
          Back
        </Button>
        <Button variant="secondary" size="md" icon={ArrowRight} onClick={() => go((i + 1) % cards.length)}>
          {i === cards.length - 1 ? "Start again" : "Next card"}
        </Button>
      </div>
    </section>
  );
}
