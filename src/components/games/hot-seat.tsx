"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowsClockwise, Check } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { HOT_SEAT, freshRand } from "@/lib/games";
import { useCourage } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";

/** Hot seat: spin through the questions until one lands, then answer it out loud, or in your head. */
export function HotSeat() {
  const { age } = useCourage();
  const reduce = useReducedMotion();
  const [i, setI] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);
  const [rand] = useState(() => ({ current: freshRand() }));
  useEffect(() => () => void (timer.current && window.clearTimeout(timer.current)), []);

  const spin = () => {
    setDone(false);
    const land = Math.floor(rand.current() * HOT_SEAT.length);
    if (reduce) {
      setI(land);
      return;
    }
    setSpinning(true);
    // Ticks slow down like a wheel, then land.
    let n = 0;
    const ticks = 14;
    const step = () => {
      n++;
      setI((prev) => ((prev ?? 0) + 1) % HOT_SEAT.length);
      if (n < ticks) timer.current = window.setTimeout(step, 50 + n * n * 1.6);
      else {
        setI(land);
        setSpinning(false);
      }
    };
    step();
  };

  const q = i === null ? null : words(HOT_SEAT[i], age);
  const finish = () => {
    setAnswered((a) => a + 1);
    setDone(true);
  };

  return (
    <div>
      <div
        className={`flex min-h-40 items-center justify-center rounded-card border-[1.5px] p-6 text-center transition-colors duration-[var(--dur-ui)] ${
          spinning ? "border-dashed border-accent bg-surface-2" : "border-line bg-surface-2"
        }`}
        aria-live="polite"
        aria-busy={spinning}
      >
        {q === null ? (
          <p className="text-muted">Press Spin to get a question.</p>
        ) : spinning ? (
          <p aria-hidden className="font-display text-xl font-bold text-muted">
            {q}
          </p>
        ) : (
          <SpokenLine role="narrator" text={q} autoPlay className="font-display text-[clamp(1.4rem,1.1rem+1.2vw,1.9rem)] font-bold leading-tight text-ink" />
        )}
      </div>

      <Button icon={ArrowsClockwise} onClick={spin} disabled={spinning} variant={q && !done ? "secondary" : "primary"} className="mt-4 w-full">
        {q === null ? "Spin" : "Spin again"}
      </Button>

      {q !== null && !spinning && !done ? (
        <div className="mt-5 border-t border-line pt-5">
          <p className="mb-2 font-semibold text-ink">Take your time. Answer out loud, or in your head.</p>
          <SayAndListen label="Answer out loud" onSpoke={finish} variant="primary" />
          <Button variant="secondary" icon={Check} onClick={finish} className="mt-3 w-full">
            I answered in my head
          </Button>
        </div>
      ) : null}

      {done ? (
        <p role="status" className="mt-4 text-center font-semibold text-ink">
          Nice. {answered === 1 ? "That is one question answered." : `That is ${answered} questions answered.`}
        </p>
      ) : null}
    </div>
  );
}
