import { dayKey, weekStartKey } from "./dates";
import { dailyQuests, questProgress } from "./quests";
import type { AppEvent, EventKind, StepRecord } from "./types";

/** Points reward trying, never quality or length. */
export const POINTS = { base: 10, harder: 5, rough: 5, mission: 20 } as const;

export function pointsFor(record: StepRecord, previousHighest: number): number {
  let points = POINTS.base;
  if (record.level > previousHighest) points += POINTS.harder;
  if (record.roughDay) points += POINTS.rough;
  if (record.level === 6) points += POINTS.mission;
  return points;
}

export function totalPoints(records: StepRecord[]): number {
  const sorted = [...records].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const highest = new Map<string, number>();
  let total = 0;
  for (const r of sorted) {
    const before = highest.get(r.situationId) ?? 0;
    total += pointsFor(r, before);
    if (r.level > before) highest.set(r.situationId, r.level);
  }
  return total;
}

export function missionsDone(records: StepRecord[]): number {
  return records.filter((r) => r.level === 6).length;
}

/**
 * Points for brave things outside a step, each with a daily limit so
 * opening the same page again and again does not add up. Calm tools
 * (Need a pause, the Body kit) never need to earn anything.
 */
export const EVENT_POINTS: Partial<Record<EventKind, { points: number; perDay: number }>> = {
  dare: { points: 10, perDay: 1 },
  game: { points: 5, perDay: 3 },
  ready: { points: 5, perDay: 2 },
  notYet: { points: 5, perDay: 2 },
};

/** All three of a day's small ideas done. */
export const QUEST_DAY_BONUS = 10;

export function eventPoints(events: AppEvent[]): number {
  const used = new Map<string, number>();
  let total = 0;
  for (const e of events) {
    const rule = EVENT_POINTS[e.kind];
    if (!rule) continue;
    const key = `${e.kind}:${dayKey(new Date(e.at))}`;
    const n = used.get(key) ?? 0;
    if (n >= rule.perDay) continue;
    used.set(key, n + 1);
    total += rule.points;
  }
  return total;
}

/** Days on which all of that day's small ideas were done. */
export function questDays(records: StepRecord[], events: AppEvent[]): string[] {
  const days = new Set([...records.map((r) => dayKey(new Date(r.at))), ...events.map((e) => dayKey(new Date(e.at)))]);
  return [...days].filter((day) => dailyQuests(day).every((q) => questProgress(q, records, events, day) >= q.target)).sort();
}

/** Every courage point: steps, brave things outside steps, and days with all the small ideas done. Never goes down. */
export function allPoints({ records, events }: { records: StepRecord[]; events: AppEvent[] }): number {
  return totalPoints(records) + eventPoints(events) + questDays(records, events).length * QUEST_DAY_BONUS;
}

/** What makes a brave day: any step, or any of these. (Need a pause and listening back are never a test.) */
const BRAVE_KINDS = new Set<EventKind>(["kit", "rescue", "game", "dare", "ready", "notYet"]);

/** Every day (local) with something brave in it, oldest first. */
export function braveDayKeys(records: StepRecord[], events: AppEvent[] = []): string[] {
  const days = new Set<string>(records.map((r) => dayKey(new Date(r.at))));
  for (const e of events) if (BRAVE_KINDS.has(e.kind)) days.add(dayKey(new Date(e.at)));
  return [...days].sort();
}

/** Brave days ever. They add up and never reset, so a missed day costs nothing. */
export function braveDaysTotal(records: StepRecord[], events: AppEvent[] = []): number {
  return braveDayKeys(records, events).length;
}

/** Days this week (Monday start, local time) with something brave in them. Never shown as a broken streak. */
export function braveDaysThisWeek(records: StepRecord[], now: Date, events: AppEvent[] = []): number {
  const week = weekStartKey(now);
  return braveDayKeys(records, events).filter((k) => weekStartKey(new Date(`${k}T12:00:00`)) === week).length;
}

export type BraveDay = { key: string; label: string; brave: boolean; today: boolean; future: boolean };

/** This week, Monday to Sunday, marking the brave days. Missed days are simply blank, never "broken". */
export function braveWeek(records: StepRecord[], now: Date, events: AppEvent[] = []): BraveDay[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const brave = new Set(braveDayKeys(records, events));
  const today = dayKey(now);
  return ["M", "T", "W", "T", "F", "S", "S"].map((label, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    return { key, label, brave: brave.has(key), today: key === today, future: key > today };
  });
}
