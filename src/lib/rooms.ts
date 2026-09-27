import { words } from "./age";
import { SITUATIONS } from "./content/situations";
import { highestLevel, LEVELS, nextLevel } from "./ladder";
import type { CourageState } from "./state";
import { ROOM_IDS, type Level, type RoomId, type StepRecord } from "./types";

/** Short island labels used on the map and as the room page title. */
export const ROOM_LABEL: Record<RoomId, string> = {
  class: "Class",
  friends: "Friends",
  presenting: "Presenting",
};

export function isRoomId(id: string): id is RoomId {
  return (ROOM_IDS as string[]).includes(id);
}

/** Highest step reached across a room's pre-written situations (0 when none started). */
export function furthestInRoom(records: StepRecord[], room: RoomId): Level | 0 {
  let best = 0;
  for (const s of SITUATIONS) {
    if (s.room === room) best = Math.max(best, highestLevel(records, s.id));
  }
  return best as Level | 0;
}

/** "Not started yet" or "Furthest step: 3 of 6". */
export function furthestLine(n: Level | 0): string {
  return n === 0 ? "Not started yet" : `Furthest step: ${n} of 6`;
}

/** "Next: Say it out loud, alone", or "All six steps done" once step 6 is reached. */
export function nextLine(highest: Level | 0): string {
  if (highest === 6) return "All six steps done";
  return `Next: ${LEVELS[highest].name}`;
}

export type RoomStep = {
  id: string;
  title: string;
  highest: Level | 0;
  next: Level;
  custom: boolean;
};

/** Every step in a room, pre-written situations first, then the person's own steps in the order they were added. */
export function roomSteps(state: Pick<CourageState, "records" | "customSteps" | "age">, room: RoomId): RoomStep[] {
  const row = (id: string, title: string, custom: boolean): RoomStep => ({
    id,
    title,
    highest: highestLevel(state.records, id),
    next: nextLevel(state.records, id),
    custom,
  });
  return [
    ...SITUATIONS.filter((s) => s.room === room).map((s) => row(s.id, words(s.title, state.age), false)),
    ...state.customSteps.filter((c) => c.room === room).map((c) => row(c.id, c.text, true)),
  ];
}

/**
 * Which step a room opens on: the first one still in progress (started, not
 * finished), else the first not started, else the first step. Keeps a
 * person on the thing they were doing instead of jumping around.
 */
export function defaultStepId(steps: RoomStep[]): string | null {
  const inProgress = steps.find((s) => s.highest > 0 && s.highest < 6);
  const fresh = steps.find((s) => s.highest === 0);
  return (inProgress ?? fresh ?? steps[0])?.id ?? null;
}
