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
export function BreathingLantern({
  reduce,
  tone = "lantern",
}: {
  reduce: boolean;
  /** "calm" (soft teal) in Panic now, so help never looks like the amber of rewards and progress. */
  tone?: "lantern" | "calm";
}) {
  const colour = tone === "calm" ? "var(--calm)" : "var(--accent)";
  // Starts small ("rest") and switches to "in" on the next frame, so the
  // very first breath visibly grows.
  const [phase, setPhase] = useState<"rest" | "in" | "out">("rest");

  useEffect(() => {
    if (reduce) return;
    if (phase === "rest") {
      const id = window.requestAnimationFrame(() => setPhase("in"));
      return () => window.cancelAnimationFrame(id);
    }
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
              `radial-gradient(circle, color-mix(in srgb, ${colour} 85%, transparent) 0%, color-mix(in srgb, ${colour} 35%, transparent) 45%, transparent 70%)`,
            transform: `scale(${big ? 1 : 0.55})`,
            transition: reduce ? "none" : `transform ${phase === "out" ? OUT_MS : IN_MS}ms cubic-bezier(0.37, 0, 0.63, 1)`,
          }}
        />
        <div className={`relative h-16 w-16 rounded-full md:h-20 md:w-20 ${tone === "calm" ? "bg-calm" : "bg-accent shadow-glow"}`} />
      </div>
      <p className="sr-only">Breathe in for 4 seconds as the light grows, then slowly out for 6 as it shrinks.</p>
      <p aria-hidden className="mt-4 font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] font-bold text-ink">
        {reduce ? "Breathe in with the light, and slowly out" : phase === "out" ? "And slowly out" : "Breathe in with the light"}
      </p>
    </div>
  );
}
