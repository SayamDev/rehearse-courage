import { stageFor, type Stage } from "./companion";
import { allPoints, missionsDone, pointsFor } from "./courage";
import { skyTint } from "./home";
import { highestLevel, nextLevel } from "./ladder";
import { rankFor } from "./rank";
import type { AppEvent, Level, StepRecord } from "./types";

/** The level a step page opens on: a valid ?level=1..6, else the next level for that step. */
export function resolveLevel(param: string | string[] | undefined, records: StepRecord[], situationId: string): Level {
  const n = Number(Array.isArray(param) ? param[0] : param);
  if (Number.isInteger(n) && n >= 1 && n <= 6) return n as Level;
  return nextLevel(records, situationId);
}

/** Seconds spoken the last time this step was done out loud, or null. */
export function lastSpokenSeconds(records: StepRecord[], situationId: string): number | null {
  let latest: StepRecord | null = null;
  for (const r of records) {
    if (r.situationId !== situationId || r.seconds === null) continue;
    if (!latest || Date.parse(r.at) >= Date.parse(latest.at)) latest = r;
  }
  return latest ? latest.seconds : null;
}

/** Everything the step-done view needs, computed from the records before and after this step. */
export type StepResult = {
  situationId: string;
  level: Level;
  seconds: number | null;
  lastSeconds: number | null;
  points: number;
  newBadges: string[];
  stageBefore: Stage;
  stageAfter: Stage;
  /** Night tint before and after, so the sky can warm a step towards dawn. */
  skyBefore: number;
  skyAfter: number;
  /** Where "One more step" goes: the next level of this step (stays at 6 once there). */
  nextLevel: Level;
  /** Courage level before and after, so reaching a new one can be celebrated. */
  levelBefore: number;
  levelAfter: number;
  /** The time saved on the record, so a proud moment can point at this try. */
  at: string;
};

export function stepResult(before: StepRecord[], record: StepRecord, newBadges: string[], events: AppEvent[] = []): StepResult {
  const after = [...before, record];
  const pointsBefore = allPoints({ records: before, events });
  const pointsAfter = allPoints({ records: after, events });
  return {
    situationId: record.situationId,
    level: record.level,
    seconds: record.seconds,
    lastSeconds: lastSpokenSeconds(before, record.situationId),
    points: pointsFor(record, highestLevel(before, record.situationId)),
    newBadges,
    stageBefore: stageFor(pointsBefore, missionsDone(before)),
    stageAfter: stageFor(pointsAfter, missionsDone(after)),
    skyBefore: skyTint(before),
    skyAfter: skyTint(after),
    nextLevel: nextLevel(after, record.situationId),
    levelBefore: rankFor(pointsBefore).level,
    levelAfter: rankFor(pointsAfter).level,
    at: record.at,
  };
}

/**
 * Which new badge names the step-done heading when several arrive at
 * once: the one this step is about (Out in the wild for a real-life
 * mission, then speaking badges), else the first.
 */
const HEADLINE_ORDER = ["out-in-the-wild", "hand-up", "said-anyway", "first-words", "typed-first", "room-explorer", "dawn"];

export function headlineBadge(newBadges: string[]): string | null {
  if (newBadges.length === 0) return null;
  return HEADLINE_ORDER.find((id) => newBadges.includes(id)) ?? newBadges[0];
}
