"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { REFRAME_CARDS } from "@/lib/content/body";
import type { AgeBand } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SpokenLine } from "@/components/voice/spoken-line";

/** Blushing or sweating reframe cards, one at a time: a kinder thought, then one small thing to try. */
export function ReframeCards({ kind, age }: { kind: "blushing" | "sweating"; age: AgeBand | null }) {
  const cards = REFRAME_CARDS[kind];
  const [i, setI] = useState(0);
  const card = cards[i];
  // The card is a polite live region, so focus stays on the button pressed.
  const go = (next: number) => setI((next + cards.length) % cards.length);

  return (
    <section aria-labelledby="reframe-heading">
      <h2 id="reframe-heading" className="text-2xl text-ink">
        Cards to try
      </h2>
      <div aria-live="polite" className="mt-3 rounded-card bg-surface-2 p-5">
        <p className="tabular text-muted">
          Card {i + 1} of {cards.length}
        </p>
        <div className="mt-2">
          <SpokenLine role="narrator" delivery="calm" text={words(card.thought, age)} className="font-display text-xl font-bold text-ink" />
        </div>
        <p className="mt-3 font-semibold text-ink">Try this:</p>
        <SpokenLine role="narrator" delivery="calm" text={words(card.tryThis, age)} className="text-ink" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="secondary" size="md" icon={ArrowLeft} onClick={() => go(i - 1)}>
          Back
        </Button>
        <Button variant="secondary" size="md" icon={ArrowRight} onClick={() => go(i + 1)}>
          {i === cards.length - 1 ? "Start again" : "Next card"}
        </Button>
      </div>
    </section>
  );
}
