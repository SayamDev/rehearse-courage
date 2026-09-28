import type { AgeBand, HardThing } from "./types";
import { HARD_THINGS } from "./types";

/** The four calm screens of first-visit setup (your name, age, hard things, meet and name the firefly). */
export const TOTAL_STEPS = 4;

/** Keeps a step number inside the valid range, so a stray +1/-1 can never wander off the flow. */
export function clampStep(step: number): number {
  return Math.min(TOTAL_STEPS, Math.max(1, step));
}

export function nextStep(step: number): number {
  return clampStep(step + 1);
}

export function prevStep(step: number): number {
  return clampStep(step - 1);
}

export const AGE_OPTIONS: { value: AgeBand; label: string }[] = [
  { value: "under13", label: "Under 13" },
  { value: "teen", label: "13 to 17" },
  { value: "adult", label: "Adult" },
];

/** Chip labels for the "what feels hard" step, in the order HARD_THINGS lists them. */
export const HARD_THING_LABELS: Record<HardThing, string> = {
  class: "Talking in class",
  friends: "With friends",
  presenting: "Presenting",
  out: "Ordering, shops or phone calls",
  panic: "Panic",
  blushing: "Blushing or sweating",
  stuttering: "Stuttering",
  words: "Losing my words",
  focus: "Staying focused",
};

/** Every HARD_THINGS id has a chip label, and nothing else does. */
export function hardThingOptions(): { id: HardThing; label: string }[] {
  return HARD_THINGS.map((id) => ({ id, label: HARD_THING_LABELS[id] }));
}

/** Pure toggle for the multi-select chips: adds the id if missing, removes it if present. */
export function toggleHardThing(selected: HardThing[], id: HardThing): HardThing[] {
  return selected.includes(id) ? selected.filter((h) => h !== id) : [...selected, id];
}
