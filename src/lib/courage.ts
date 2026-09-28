import { dayKey, weekStartKey } from "./dates";
import type { StepRecord } from "./types";

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

/** Days this week (Monday start, local time) with at least one step. Never shown as a broken streak. */
export function braveDaysThisWeek(records: StepRecord[], now: Date): number {
  const week = weekStartKey(now);
  const days = new Set<string>();
  for (const r of records) {
    const d = new Date(r.at);
    if (weekStartKey(d) === week) days.add(dayKey(d));
  }
  return days.size;
}

export type BraveDay = { key: string; label: string; brave: boolean; today: boolean; future: boolean };

/** This week, Monday to Sunday, marking the days with at least one step. Missed days are simply blank, never "broken". */
export function braveWeek(records: StepRecord[], now: Date): BraveDay[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const brave = new Set(records.map((r) => dayKey(new Date(r.at))));
  const today = dayKey(now);
  return ["M", "T", "W", "T", "F", "S", "S"].map((label, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    return { key, label, brave: brave.has(key), today: key === today, future: key > today };
  });
}
