import { words } from "./age";
import { BADGES } from "./achievements";
import { situationById } from "./content/situations";
import { allPoints, braveDayKeys, missionsDone } from "./courage";
import { dayKey } from "./dates";
import { rankFor, type Rank } from "./rank";
import type { CourageState } from "./state";
import type { Feeling, StepRecord } from "./types";

export type JourneyStats = {
  points: number;
  rank: Rank;
  braveDays: number;
  missions: number;
  dares: number;
  badges: number;
  badgesTotal: number;
};

export function journeyStats(s: Pick<CourageState, "records" | "events" | "earned">): JourneyStats {
  const points = allPoints(s);
  return {
    points,
    rank: rankFor(points),
    braveDays: braveDayKeys(s.records, s.events).length,
    missions: missionsDone(s.records),
    dares: s.events.filter((e) => e.kind === "dare").length,
    badges: s.earned.filter((id) => BADGES.some((b) => b.id === id)).length,
    badgesTotal: BADGES.length,
  };
}

export type ProudEntry = {
  situationId: string;
  at: string;
  title: string;
  outcome: "did" | "tried";
  feel: Feeling | null;
  note: string | null;
};

export const FEEL_LABEL: Record<Feeling, string> = {
  easier: "Easier than I thought",
  expected: "About what I expected",
  hard: "Hard, but I went for it",
};

/**
 * Every real-life try, newest first: each step 6 record, with how it went
 * and felt when the person said. Tries from before proud moments existed
 * still show, as "did it".
 */
export function proudEntries(s: Pick<CourageState, "records" | "proud" | "customSteps" | "age">): ProudEntry[] {
  const said = new Map(s.proud.map((p) => [`${p.situationId}|${p.at}`, p]));
  const titleOf = (r: StepRecord) => {
    const sit = situationById(r.situationId);
    if (sit) return words(sit.title, s.age);
    return s.customSteps.find((c) => c.id === r.situationId)?.text ?? "A step of your own";
  };
  return s.records
    .filter((r) => r.level === 6)
    .map((r) => {
      const p = said.get(`${r.situationId}|${r.at}`);
      return { situationId: r.situationId, at: r.at, title: titleOf(r), outcome: p?.outcome ?? "did", feel: p?.feel ?? null, note: p?.note ?? null };
    })
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export type CalendarDay = { key: string; day: number; brave: boolean; today: boolean; future: boolean } | null;

/**
 * One month as weeks (Monday first), each day marked brave or not. Blank
 * cells pad the first and last weeks. Missed days are just days.
 */
export function monthCalendar(braveKeys: string[], year: number, month: number, now: Date): { label: string; weeks: CalendarDay[][]; braveCount: number } {
  const brave = new Set(braveKeys);
  const today = dayKey(now);
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells: CalendarDay[] = Array.from({ length: lead }, () => null);
  let braveCount = 0;
  for (let d = 1; d <= days; d++) {
    const key = dayKey(new Date(year, month, d));
    if (brave.has(key)) braveCount++;
    cells.push({ key, day: d, brave: brave.has(key), today: key === today, future: key > today });
  }
  while (cells.length % 7) cells.push(null);
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const label = first.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return { label, weeks, braveCount };
}

/** "Tuesday 28 September". */
export function niceDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
