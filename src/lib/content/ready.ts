import type { Words } from "@/lib/types";

const w = (kid: string, grown: string = kid): Words => ({ kid, grown });

/** Right before: what is said on the last screen, read aloud when lines are on. */
export const READY_LINES = {
  wobbly: w(
    "Feeling wobbly is your body getting ready. It does not mean it will go badly.",
    "Feeling nervous is your body getting ready. It does not mean it will go badly.",
  ),
  go: w("You are ready enough. Go and have a go.", "You are ready enough. Go and give it a try."),
} as const;

/** Rescue phrases that fit most real moments, in order, when none are starred. */
export const READY_PHRASES = ["think-second", "come-back", "say-again", "start-again"];
