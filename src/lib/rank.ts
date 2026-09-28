/**
 * Courage levels: a name and a number that grow with courage points and
 * never go down. Early levels come quickly; later ones take a little longer,
 * so there is always a next one to look forward to.
 */
export const RANKS: { name: string; from: number }[] = [
  { name: "Spark", from: 0 },
  { name: "Flicker", from: 40 },
  { name: "Ember", from: 100 },
  { name: "Lantern", from: 180 },
  { name: "Torch", from: 280 },
  { name: "Campfire", from: 400 },
  { name: "Beacon", from: 550 },
  { name: "Lighthouse", from: 750 },
  { name: "Sunrise", from: 1000 },
  { name: "Daybreak", from: 1300 },
];

/** After Daybreak, every this many points is another Star level. */
export const STAR_EVERY = 400;

export type Rank = {
  level: number;
  name: string;
  /** Points where this level started. */
  from: number;
  /** Points where the next level starts. */
  to: number;
  nextName: string;
  /** How far through this level, 0 to 1. */
  progress: number;
  /** Points still to go to the next level. */
  toNext: number;
};

function levelAt(level: number): { name: string; from: number } {
  if (level <= RANKS.length) return RANKS[level - 1];
  const last = RANKS[RANKS.length - 1];
  return { name: "Star", from: last.from + (level - RANKS.length) * STAR_EVERY };
}

export function rankFor(points: number): Rank {
  const p = Math.max(0, Math.floor(points));
  let level = 1;
  while (levelAt(level + 1).from <= p) level++;
  const here = levelAt(level);
  const next = levelAt(level + 1);
  return {
    level,
    name: here.name,
    from: here.from,
    to: next.from,
    nextName: next.name,
    progress: (p - here.from) / (next.from - here.from),
    toNext: next.from - p,
  };
}

/** "Level 4: Lantern". */
export function rankLabel(r: Pick<Rank, "level" | "name">): string {
  return `Level ${r.level}: ${r.name}`;
}
