import type { Situation } from "./content/situations";
import type { CustomStep, HardThing, Level, RoomId, StepRecord } from "./types";

export const LEVELS: { level: Level; name: string; speaking: boolean }[] = [
  { level: 1, name: "Think it", speaking: false },
  { level: 2, name: "Type or whisper it", speaking: false },
  { level: 3, name: "Say it out loud, alone", speaking: true },
  { level: 4, name: "Say it to the coach", speaking: true },
  { level: 5, name: "Say it with a little pressure", speaking: true },
  { level: 6, name: "Try it for real", speaking: false },
];

const ROOM_ORDER: RoomId[] = ["class", "friends", "presenting"];

/** Which rooms each "what feels hard" choice points to first. */
const HARD_TO_ROOM: Partial<Record<HardThing, RoomId>> = {
  class: "class",
  friends: "friends",
  presenting: "presenting",
};

export function highestLevel(records: StepRecord[], situationId: string): Level | 0 {
  let best = 0;
  for (const r of records) if (r.situationId === situationId && r.level > best) best = r.level;
  return best as Level | 0;
}

export function nextLevel(records: StepRecord[], situationId: string): Level {
  return Math.min(highestLevel(records, situationId) + 1, 6) as Level;
}

/** One step to suggest on Home: least advanced unfinished situation, preferred rooms first. */
export function suggestNext(
  records: StepRecord[],
  situations: Situation[],
  hard: HardThing[],
): { situationId: string; level: Level } | null {
  const preferred = hard.map((h) => HARD_TO_ROOM[h]).filter((r): r is RoomId => Boolean(r));
  const order = [...new Set([...preferred, ...ROOM_ORDER])];
  for (const room of order) {
    const open = situations
      .filter((s) => s.room === room)
      .map((s) => ({ s, h: highestLevel(records, s.id) }))
      .filter(({ h }) => h < 6);
    if (open.length === 0) continue;
    const least = open.reduce((a, b) => (b.h < a.h ? b : a));
    return { situationId: least.s.id, level: nextLevel(records, least.s.id) };
  }
  return null;
}

/** How lit the courage map is: share of situations that reached step 3 (said out loud). */
export function mapLight(records: StepRecord[], situations: Situation[]): number {
  if (situations.length === 0) return 0;
  const lit = situations.filter((s) => highestLevel(records, s.id) >= 3).length;
  return lit / situations.length;
}

const MAX_CUSTOM = 140;

export function makeCustomStep(room: RoomId, text: string, now: Date): CustomStep {
  const clean = text.trim().slice(0, MAX_CUSTOM);
  if (!clean) throw new Error("A custom step needs some words.");
  const id = `custom-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return { id, room, text: clean, createdAt: now.toISOString() };
}
