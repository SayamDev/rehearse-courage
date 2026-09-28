"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { BALLOON_CUES, BREATHS, deflate, FULL_ENOUGH, inflate } from "@/lib/games";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Button } from "@/components/ui/button";
import { useReadAloud } from "@/components/voice/spoken-line";

/**
 * Breath balloon: hold the button while you breathe in and the balloon
 * fills (about 4 seconds to full); let go and breathe out slowly while it
 * shrinks (about 6). Five slow breaths and it floats away. Works with a
 * pointer, touch, or Space and Enter held down.
 */
export function BreathBalloon() {
  const reduce = useReducedMotion();
  const [fill, setFill] = useState(0);
  const [holding, setHolding] = useState(false);
  const [breaths, setBreaths] = useState(0);
  const fillRef = useRef(0);
  const peak = useRef(0);
  const frame = useRef<number | null>(null);
  const done = breaths >= BREATHS;

  useEffect(() => {
    if (done) return;
    let last = performance.now();
    const tick = (now: number) => {
      const ms = now - last;
      last = now;
      const next = holding ? inflate(fillRef.current, ms) : deflate(fillRef.current, ms);
      if (next !== fillRef.current) {
        fillRef.current = next;
        setFill(next);
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [holding, done]);

  const start = () => {
    if (done || holding) return;
    peak.current = fillRef.current;
    setHolding(true);
  };
  const stop = () => {
    if (!holding) return;
    setHolding(false);
    if (fillRef.current >= FULL_ENOUGH && fillRef.current > peak.current) setBreaths((b) => b + 1);
  };

  const again = () => {
    fillRef.current = 0;
    setFill(0);
    setBreaths(0);
  };

  const scale = 0.35 + fill * 0.65;
  const cueKey: keyof typeof BALLOON_CUES = done ? "done" : holding ? (fill >= 1 ? "full" : "in") : fill > 0.02 ? "out" : "start";
  const cue = BALLOON_CUES[cueKey];
  const read = useReadAloud();
  // Say each new cue once (not the resting one), as the breath changes.
  const lastCue = useRef(cueKey);
  useEffect(() => {
    if (cueKey === lastCue.current) return;
    lastCue.current = cueKey;
    if (cueKey !== "start") read(BALLOON_CUES[cueKey]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cueKey]);

  return (
    <div className="flex flex-col items-center text-center">
      <div aria-hidden className="relative flex h-72 w-full items-end justify-center overflow-hidden">
        <svg
          viewBox="0 0 200 260"
          className="h-full"
          style={{
            transform: done && !reduce ? "translateY(-120%)" : `scale(${scale})`,
            transformOrigin: "50% 92%",
            transition: done && !reduce ? "transform 2.4s cubic-bezier(0.45, 0, 0.55, 1)" : "none",
          }}
        >
          <path d="M100 196 C 96 214, 108 226, 100 258" fill="none" stroke="var(--stone-dim)" strokeWidth="3" strokeLinecap="round" />
          <path d="M92 196 L108 196 L100 186 Z" fill="var(--coral)" stroke="var(--die)" strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="100" cy="100" rx="78" ry="92" fill="var(--coral)" stroke="var(--die)" strokeWidth="8" />
          <ellipse cx="72" cy="66" rx="14" ry="24" fill="#ffffff" opacity="0.55" transform="rotate(-24 72 66)" />
        </svg>
      </div>

      <p role="status" className="mt-2 min-h-[1.6em] font-display text-xl font-bold text-ink">
        {cue}
      </p>
      <ol aria-label={`${breaths} of ${BREATHS} breaths`} className="mt-3 flex list-none gap-2 p-0">
        {Array.from({ length: BREATHS }, (_, k) => (
          <li key={k} aria-hidden className={`size-4 rounded-full border-2 ${k < breaths ? "border-die bg-accent shadow-sticker" : "border-line bg-surface-2"}`} />
        ))}
      </ol>

      {done ? (
        <Button icon={ArrowCounterClockwise} onClick={again} className="mt-6">
          Another balloon
        </Button>
      ) : (
        <button
          type="button"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            start();
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !e.repeat) {
              e.preventDefault();
              start();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") stop();
          }}
          onContextMenu={(e) => e.preventDefault()}
          aria-pressed={holding}
          className={`mt-6 min-h-16 w-full max-w-sm touch-none select-none rounded-[var(--radius-control)] border-[3px] border-die font-display text-lg font-bold shadow-sticker transition-transform duration-[var(--dur-feedback)] ${
            holding ? "scale-[0.98] bg-calm text-on-help" : "bg-accent text-on-accent"
          }`}
        >
          {holding ? "Breathing in... let go to breathe out" : "Hold to breathe in"}
        </button>
      )}
    </div>
  );
}
