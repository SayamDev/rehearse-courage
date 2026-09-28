"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { rankLabel, type Rank } from "@/lib/rank";
import { pointsLabel } from "./stats-pill";

/** The level number in a teal die-cut sticker. */
export function LevelSticker({ level, size = 56 }: { level: number; size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.44 }}
      className="tabular flex shrink-0 -rotate-6 items-center justify-center rounded-full border-[3px] border-die bg-accent font-display font-bold text-on-accent shadow-sticker"
    >
      {level}
    </span>
  );
}

/**
 * Courage level: the number sticker, "Level 4: Lantern", a bar filling
 * towards the next level, and how many points are left. The bar only ever
 * fills; levels are never lost.
 */
export function LevelMeter({ rank, points, link = false }: { rank: Rank; points: number; link?: boolean }) {
  const pct = Math.round(rank.progress * 100);
  return (
    <div>
      <div className="flex items-center gap-3">
        <LevelSticker level={rank.level} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-muted">Courage level</p>
          <p className="font-display text-xl font-bold leading-tight text-ink">{rankLabel(rank)}</p>
        </div>
      </div>
      <div
        role="progressbar"
        aria-label={`Towards level ${rank.level + 1}: ${rank.nextName}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-4 h-3 overflow-hidden rounded-full bg-surface-2"
      >
        <span className="block h-full rounded-full bg-accent transition-[width] duration-[var(--dur-scene)] ease-[var(--ease-out)]" style={{ width: `${pct}%` }} />
      </div>
      <p className="tabular mt-2 text-sm text-muted">
        {rank.toNext} more to {rank.nextName}. {pointsLabel(points)} so far.
      </p>
      {link ? (
        <Link href="/journey" className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent-text hover:underline">
          See your journey
          <ArrowRight size={18} weight="bold" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
