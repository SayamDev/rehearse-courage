"use client";

import { useEffect, useRef, useState } from "react";
import { BREATH_CUES, BREATH_INTRO } from "@/lib/content/body";
import { stopSpeaking } from "@/lib/voice/speak";
import { Button } from "@/components/ui/button";
import { useReadAloud } from "@/components/voice/spoken-line";

const IN_MS = 4000;
const OUT_MS = 6000;

/**
 * The breathing lantern: a warm light that grows over 4 seconds (breathe
 * in) and shrinks over 6 (breathe out), and nothing else moves. The
 * visible cue follows the light; screen readers get one steady
 * instruction instead of a cue every few seconds. Under reduced motion
 * the light stays still while the words guide each breath.
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
  // Wait for a tap and finish the introduction before the first breath.
  const [phase, setPhase] = useState<"rest" | "in" | "out">("rest");

  const [running, setRunning] = useState(false);
  const [introducing, setIntroducing] = useState(false);
  const session = useRef(0);
  const read = useReadAloud("calm");
  const guided = useRef(0);

  useEffect(() => () => { session.current++; stopSpeaking(); }, []);
  useEffect(() => {
    if (!running || phase === "rest") return;
    const t = window.setTimeout(() => setPhase((p) => (p === "in" ? "out" : "in")), phase === "in" ? IN_MS : OUT_MS);
    return () => window.clearTimeout(t);
  }, [phase, running]);

  const toggle = async () => {
    if (running || introducing) {
      session.current++;
      stopSpeaking();
      setRunning(false);
      setIntroducing(false);
      setPhase("rest");
      return;
    }
    const token = ++session.current;
    guided.current = 0;
    setIntroducing(true);
    await read(BREATH_INTRO);
    if (token !== session.current) return;
    setIntroducing(false);
    setRunning(true);
    setPhase("in");
  };

  const big = reduce || (running && phase === "in");

  // Three guided breaths, then quiet space. Starting on a tap avoids blocked autoplay.
  useEffect(() => {
    if (!running || phase === "rest" || guided.current >= 6) return;
    guided.current++;
    void read(phase === "in" ? BREATH_CUES.in : BREATH_CUES.out);
    // Settings update the next cue without restarting the current breath.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, running]);

  // A gentle count inside the circle: seconds left in this breath (never shown under reduced motion).
  const [left, setLeft] = useState(4);
  useEffect(() => {
    if (!running || phase === "rest") return;
    const total = phase === "in" ? IN_MS / 1000 : OUT_MS / 1000;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeft(total);
    const t = window.setInterval(() => setLeft((n) => Math.max(1, n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [phase, running]);

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
      <p className="sr-only">Follow the light if it feels comfortable: in for 4 seconds and out for 6. You can breathe at your own pace and pause at any time.</p>
      <p aria-hidden className="mt-4 font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] font-bold text-ink">
        {introducing ? "Let your shoulders relax" : phase === "rest" ? "Take a moment to get comfortable" : phase === "out" ? "And breathe out" : "Breathe in slowly"}
      </p>
      <Button variant="secondary" onClick={() => void toggle()} className="mt-5">
        {running || introducing ? "Pause breathing" : "Start breathing"}
      </Button>
    </div>
  );
}
