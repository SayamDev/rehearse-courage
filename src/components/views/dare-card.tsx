"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowsClockwise, Check, Lightning } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { BADGES } from "@/lib/achievements";
import { EVENT_POINTS } from "@/lib/courage";
import { dailyDare, dareById } from "@/lib/content/dares";
import { dayKey } from "@/lib/dates";
import { logEvent } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { ShareButton } from "@/components/share/share-button";
import { Button } from "@/components/ui/button";
import { SpokenLine } from "@/components/voice/spoken-line";

const DISC = "flex shrink-0 items-center justify-center rounded-full border-[3px] border-die text-[#13262b] shadow-sticker";

/**
 * Today's tiny dare (Home): one small, real speaking moment for today, the
 * same all day. "Another one" swaps it; "I did it" counts it (a brave day,
 * and points). Skipping it changes nothing, and it is never carried over.
 */
export function DareCard() {
  const store = useCourage();
  const today = dayKey(new Date());
  const [swap, setSwap] = useState(0);
  const [news, setNews] = useState("");
  const doneRef = useRef<HTMLParagraphElement>(null);
  const justDone = useRef(false);

  const doneEvent = store.events.find((e) => e.kind === "dare" && dayKey(new Date(e.at)) === today);
  const dare = (doneEvent?.detail && dareById(doneEvent.detail)) || dailyDare(today, swap);
  const text = words(dare.text, store.age);

  // The buttons go when it is done: move focus to the news, so nobody is left on nothing.
  useEffect(() => {
    if (doneEvent && justDone.current) {
      justDone.current = false;
      doneRef.current?.focus();
    }
  }, [doneEvent]);

  const did = () => {
    justDone.current = true;
    const earned = act((s) => logEvent(s, "dare", new Date(), dare.id));
    const badge = earned.map((id) => BADGES.find((b) => b.id === id)?.title).filter(Boolean);
    setNews(`+${EVENT_POINTS.dare?.points ?? 10} courage points.${badge.length ? ` New badge: ${badge.join(", ")}.` : ""}`);
  };

  return (
    <section aria-labelledby="dare-heading" className="rounded-card border-[1.5px] border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`${DISC} size-11 -rotate-6 bg-sun`}>
          <Lightning size={22} weight="bold" />
        </span>
        <h2 id="dare-heading" className="text-xl text-ink">
          Today&apos;s tiny dare
        </h2>
      </div>
      <div className="mt-3">
        <SpokenLine role="narrator" text={text} className="text-lg font-semibold text-ink" />
      </div>

      {doneEvent ? (
        <div className="mt-4">
          <p ref={doneRef} tabIndex={-1} className="flex items-center gap-2 font-semibold text-ink outline-none">
            <span aria-hidden className={`${DISC} size-8 bg-accent`}>
              <Check size={16} weight="bold" />
            </span>
            Done today. That was real courage.
          </p>
          {news ? (
            <p role="status" className="tabular mt-1 text-muted">
              {news}
            </p>
          ) : null}
          <ShareButton
            className="mt-3"
            card={{ kicker: "I did a tiny dare", title: text, line: "Small steps. Real courage.", art: { type: "icon", icon: Lightning, ink: "bg-sun" } }}
          />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" icon={Check} onClick={did}>
              I did it
            </Button>
            <Button variant="secondary" size="md" icon={ArrowsClockwise} onClick={() => setSwap((n) => n + 1)} className="!min-h-[52px]">
              Another one
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted">Only if it feels okay. Skipping it changes nothing.</p>
        </>
      )}
    </section>
  );
}
