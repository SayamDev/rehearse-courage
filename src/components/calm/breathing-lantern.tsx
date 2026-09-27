"use client";

import { useEffect, useState } from "react";

const IN_MS = 4000;
const OUT_MS = 6000;

/**
 * The breathing lantern: a warm light that grows over 4 seconds (breathe
 * in) and shrinks over 6 (breathe out), and nothing else moves. The
 * visible cue follows the light; screen readers get one steady
 * instruction instead of a cue every few seconds. Under reduced motion
 * the light rests at full size and both cues show together.
 */
export function BreathingLantern({ reduce }: { reduce: boolean }) {
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setPhase((p) => (p === "in" ? "out" : "in")), phase === "in" ? IN_MS : OUT_MS);
    return () => window.clearTimeout(t);
  }, [phase, reduce]);

  const big = reduce || phase === "in";

  return (
    <div className="flex flex-col items-center text-center">
      <div aria-hidden className="relative flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--amber) 85%, transparent) 0%, color-mix(in srgb, var(--amber) 35%, transparent) 45%, transparent 70%)",
            transform: `scale(${big ? 1 : 0.55})`,
            transition: `transform ${phase === "in" ? IN_MS : OUT_MS}ms cubic-bezier(0.37, 0, 0.63, 1)`,
          }}
        />
        <div className="relative h-16 w-16 rounded-full bg-amber shadow-glow md:h-20 md:w-20" />
      </div>
      <p className="sr-only">Breathe in for 4 seconds as the light grows, then slowly out for 6 as it shrinks.</p>
      <p aria-hidden className="mt-4 font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] font-bold text-ink">
        {reduce ? "Breathe in with the light, and slowly out" : phase === "in" ? "Breathe in with the light" : "And slowly out"}
      </p>
    </div>
  );
}
