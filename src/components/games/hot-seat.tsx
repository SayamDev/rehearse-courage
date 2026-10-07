"use client";

import { useEffect, useState } from "react";
import { ArrowsClockwise, Check } from "@phosphor-icons/react";
import { words } from "@/lib/age";
import { HOT_SEAT, freshRand } from "@/lib/games";
import { useCourage } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Button } from "@/components/ui/button";
import { SayAndListen } from "@/components/voice/say-and-listen";
import { SpokenLine } from "@/components/voice/spoken-line";

const TICKS = 14;

/** Hot seat: spin through the questions until one lands, then answer it out loud, or in your head. */
export function HotSeat() {
  const { age } = useCourage();
  const reduce = useReducedMotion();
  const [i, setI] = useState<number | null>(null);
  // While spinning: where it will land and how many ticks so far.
  const [wheel, setWheel] = useState<{ land: number; n: number } | null>(null);
  const spinning = wheel !== null;
  const [answered, setAnswered] = useState(0);
  const [done, setDone] = useState(false);
  const [rand] = useState(() => ({ current: freshRand() }));

  // Each tick is its own timeout, driven by state: if React pauses and
  // resumes this page's effects mid-spin, the wheel simply carries on.
  useEffect(() => {
    if (!wheel) return;
    const t = window.setTimeout(
      () => {
        if (wheel.n >= TICKS) {
          setI(wheel.land);
          setWheel(null);
          return;
        }
        setI((prev) => ((prev ?? 0) + 1) % HOT_SEAT.length);
        setWheel({ land: wheel.land, n: wheel.n + 1 });
      },
      wheel.n === 0 ? 0 : 50 + wheel.n * wheel.n * 1.6,
    );
    return () => window.clearTimeout(t);
  }, [wheel]);

  const spin = () => {
    setDone(false);
    const land = Math.floor(rand.current() * HOT_SEAT.length);
    if (reduce) {
      setI(land);
      return;
    }
    // Ticks slow down like a wheel, then land.
    setWheel({ land, n: 0 });
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
          <SpokenLine role="narrator" delivery="game" text={q} autoPlay className="font-display text-[clamp(1.4rem,1.1rem+1.2vw,1.9rem)] font-bold leading-tight text-ink" />
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
