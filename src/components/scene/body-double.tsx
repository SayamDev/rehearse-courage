"use client";

import { useEffect, useState } from "react";
import { UserFocus, X } from "@phosphor-icons/react";
import { updateSettings } from "@/lib/state";
import { act, useCourage } from "@/lib/store";
import { Lottie } from "@/components/ui/lottie";

const LINES = [
  "is practising too.",
  "is saying their words quietly.",
  "is right here with you.",
  "is taking a slow breath.",
  "is in no rush. Neither are you.",
];

/**
 * Body double: the companion sits beside you and practises too while you
 * do a step, which helps some people (especially with ADHD) start and
 * stay with a task. A quiet line changes every 20 seconds (never while
 * reduced motion is on). Off by default; switched here or in Me.
 */
export function BodyDouble({ part }: { part: "invite" | "companion" }) {
  const { settings, companion, hydrated } = useCourage();
  const name = companion?.name ?? "Your firefly";
  const [i, setI] = useState(0);
  const on = hydrated && settings.bodyDouble;

  useEffect(() => {
    if (!on || settings.reduceMotion) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % LINES.length), 20000);
    return () => window.clearInterval(t);
  }, [on, settings.reduceMotion]);

  if (!hydrated) return null;
  const set = (v: boolean) => act((s) => updateSettings(s, { bodyDouble: v }));

  if (!on) {
    if (part !== "invite") return null;
    return (
      <button
        type="button"
        onClick={() => set(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-dashed border-line px-4 font-semibold text-ink transition-colors duration-[var(--dur-feedback)] hover:border-stone-dim"
      >
        <UserFocus size={20} weight="bold" aria-hidden />
        Practise with {name} beside you
      </button>
    );
  }

  if (part !== "companion") return null;
  return (
    <div className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-[color-mix(in_srgb,var(--sun)_16%,var(--surface))] py-2 pl-2 pr-3">
      <Lottie src="/lottie/firefly.json" loop className="size-16 shrink-0" />
      <p className="flex-1 text-ink" aria-live="off">
        <span className="font-display font-bold">{name}</span> {LINES[i]}
      </p>
      <button
        type="button"
        onClick={() => set(false)}
        aria-label={`Stop practising with ${name}`}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
      >
        <X size={18} weight="bold" aria-hidden />
      </button>
    </div>
  );
}
