import { highestLevel, nextLevel } from "./ladder";
import type { StepRecord } from "./types";

/** Where one of the six steps of a situation stands. */
export type StoneState = "lit" | "current" | "dim";

/**
 * States for all 6 steps of one situation (step 6 is trying it for real):
 * levels at or below the highest reached are lit, the next level is
 * current, the rest are dim. Always returns exactly 6 entries.
 */
export function stoneStates(records: StepRecord[], situationId: string): StoneState[] {
  const highest = highestLevel(records, situationId);
  const next = nextLevel(records, situationId);
  const states: StoneState[] = [];
  for (let level = 1; level <= 6; level++) {
    if (level <= highest) states.push("lit");
    else if (level === next) states.push("current");
    else states.push("dim");
  }
  return states;
}
