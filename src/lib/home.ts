import { words } from "./age";
import { SITUATIONS, situationById } from "./content/situations";
import { braveDaysThisWeek, totalPoints } from "./courage";
import { LEVELS, mapLight, suggestNext } from "./ladder";
import type { CourageState } from "./state";
import type { Level } from "./types";

/** Night tint opacity when nothing has been said out loud yet (mapLight 0). Fades to 0 as mapLight reaches 1. */
export const NIGHT_TINT_MAX = 0.6;

export type HomeModel =
  | {
      done: false;
      situationId: string;
      level: Level;
      title: string;
      levelName: string;
      braveDays: number;
      points: number;
      skyTint: number;
    }
  | { done: true; braveDays: number; points: number };

/** Sky warmth overlay opacity: fully night at mapLight 0, clear by mapLight 1. */
export function skyTint(records: CourageState["records"]): number {
  return NIGHT_TINT_MAX * (1 - mapLight(records, SITUATIONS));
}

/**
 * Builds Home's view model from the courage store: the one suggested step
 * (or the all-done state), today's stats, and the sky warmth. Pure so it can
 * be unit tested without rendering anything.
 */
export function homeModel(state: CourageState, now: Date): HomeModel {
  const braveDays = braveDaysThisWeek(state.records, now);
  const points = totalPoints(state.records);
  const next = suggestNext(state.records, SITUATIONS, state.hardThings);

  if (!next) {
    return { done: true, braveDays, points };
  }

  const situation = situationById(next.situationId);
  const title = situation ? words(situation.title, state.age) : "";
  const levelName = LEVELS[next.level - 1].name;

  return {
    done: false,
    situationId: next.situationId,
    level: next.level,
    title,
    levelName,
    braveDays,
    points,
    skyTint: skyTint(state.records),
  };
}
