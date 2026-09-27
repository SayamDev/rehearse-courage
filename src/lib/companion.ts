import type { Species } from "./types";

export const SPECIES: { id: Species; name: string }[] = [
  { id: "firefly", name: "Firefly" },
  { id: "hedgehog", name: "Hedgehog" },
  { id: "fox", name: "Paper fox" },
];

export type Stage = "hiding" | "peeking" | "waving" | "speaking";

export const STAGE_POINTS = { peeking: 30, waving: 120, speaking: 300 } as const;

/** The companion grows with courage points. Speaking up also needs one real-life mission. It never shrinks. */
export function stageFor(points: number, missions: number): Stage {
  if (points >= STAGE_POINTS.speaking && missions >= 1) return "speaking";
  if (points >= STAGE_POINTS.waving) return "waving";
  if (points >= STAGE_POINTS.peeking) return "peeking";
  return "hiding";
}
