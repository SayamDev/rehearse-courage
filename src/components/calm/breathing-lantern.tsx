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
  /** "calm" (quiet blue) in Need a pause, so help never looks like the teal of progress. */
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

  // A gentle count inside the circle: seconds left in this breath (never shown under reduced motion).
  const [left, setLeft] = useState(4);
  useEffect(() => {
    if (reduce || phase === "rest") return;
    const total = phase === "in" ? IN_MS / 1000 : OUT_MS / 1000;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeft(total);
    const t = window.setInterval(() => setLeft((n) => Math.max(1, n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [phase, reduce]);

  return (
    <div className="flex flex-col items-center text-center">
      <div aria-hidden className="relative flex size-56 items-center justify-center md:size-64">
        {/* Two still rings mark the full breath; the filled circle grows to meet them. */}
        <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: `color-mix(in srgb, ${colour} 22%, transparent)` }} />
        <div className="absolute inset-[16%] rounded-full border-2" style={{ borderColor: `color-mix(in srgb, ${colour} 34%, transparent)` }} />
        <div
          className="absolute inset-[6%] rounded-full"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, ${colour} 55%, transparent) 0%, color-mix(in srgb, ${colour} 22%, transparent) 60%, transparent 72%)`,
            transform: `scale(${big ? 1 : 0.5})`,
            transition: reduce ? "none" : `transform ${phase === "out" ? OUT_MS : IN_MS}ms cubic-bezier(0.37, 0, 0.63, 1)`,
          }}
        />
        <div
          className={`relative flex size-20 items-center justify-center rounded-full border-4 border-die font-display text-3xl font-bold shadow-sticker md:size-24 ${tone === "calm" ? "text-on-help" : "text-on-accent"}`}
          style={{ background: colour }}
        >
          {reduce || phase === "rest" ? null : <span className="tabular">{left}</span>}
        </div>
      </div>
      <p className="sr-only">Breathe in for 4 seconds as the light grows, then slowly out for 6 as it shrinks.</p>
      <p aria-hidden className="mt-4 font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] font-bold text-ink">
        {reduce ? "Breathe in with the light, and slowly out" : phase === "out" ? "And slowly out" : "Breathe in with the light"}
      </p>
    </div>
  );
}
