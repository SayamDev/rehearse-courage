import { stageFor, type Stage } from "./companion";
import { missionsDone, pointsFor, totalPoints } from "./courage";
import { skyTint } from "./home";
import { highestLevel, nextLevel } from "./ladder";
import type { Level, StepRecord } from "./types";

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
};

export function stepResult(before: StepRecord[], record: StepRecord, newBadges: string[]): StepResult {
  const after = [...before, record];
  return {
    situationId: record.situationId,
    level: record.level,
    seconds: record.seconds,
    lastSeconds: lastSpokenSeconds(before, record.situationId),
    points: pointsFor(record, highestLevel(before, record.situationId)),
    newBadges,
    stageBefore: stageFor(totalPoints(before), missionsDone(before)),
    stageAfter: stageFor(totalPoints(after), missionsDone(after)),
    skyBefore: skyTint(before),
    skyAfter: skyTint(after),
    nextLevel: nextLevel(after, record.situationId),
  };
}
