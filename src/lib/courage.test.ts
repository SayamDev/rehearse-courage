import { describe, expect, it, test } from "vitest";
import {
  allPoints,
  braveDaysThisWeek,
  braveDaysTotal,
  braveWeek,
  eventPoints,
  missionsDone,
  pointsFor,
  questDays,
  QUEST_DAY_BONUS,
  totalPoints,
} from "./courage";
import { dailyQuests } from "./quests";
import type { AppEvent, Level, StepRecord } from "./types";

const rec = (level: Level, at: string, extra: Partial<StepRecord> = {}): StepRecord => ({
  situationId: "class-answer",
  level,
  at,
  seconds: 5,
  typed: false,
  roughDay: false,
  ...extra,
});

describe("courage points", () => {
  test("length of speaking never changes points", () => {
    const short = rec(3, "2026-09-28T10:00:00", { seconds: 5 });
    const long = rec(3, "2026-09-28T10:00:00", { seconds: 60 });
    expect(pointsFor(short, 3)).toBe(pointsFor(long, 3));
  });

  test("base, harder than before, rough day and mission bonuses", () => {
    expect(pointsFor(rec(2, "2026-09-28T10:00:00"), 2)).toBe(10);
    expect(pointsFor(rec(3, "2026-09-28T10:00:00"), 2)).toBe(15);
    expect(pointsFor(rec(2, "2026-09-28T10:00:00", { roughDay: true }), 2)).toBe(15);
    expect(pointsFor(rec(6, "2026-09-28T10:00:00"), 5)).toBe(35);
  });

  test("total walks records in order per situation", () => {
    const records = [rec(1, "2026-09-28T10:00:00"), rec(2, "2026-09-28T11:00:00"), rec(2, "2026-09-28T12:00:00")];
    expect(totalPoints(records)).toBe(15 + 15 + 10);
  });

  test("orders records by real time even with different offsets", () => {
    const later = rec(2, "2026-09-28T20:00:00-05:00");
    const earlier = rec(1, "2026-09-28T23:00:00+05:00");
    expect(totalPoints([later, earlier])).toBe(15 + 15);
  });

  test("each situation tracks its own highest level", () => {
    const records = [
      rec(3, "2026-09-28T10:00:00Z", { situationId: "class-answer" }),
      rec(1, "2026-09-28T11:00:00Z", { situationId: "friends-join" }),
    ];
    expect(totalPoints(records)).toBe(15 + 15);
  });

  test("missions are level 6 records", () => {
    expect(missionsDone([rec(6, "2026-09-28T10:00:00"), rec(5, "2026-09-28T10:00:00")])).toBe(1);
  });
});

describe("brave days", () => {
  test("counts distinct days this week only", () => {
    const now = new Date(2026, 8, 30, 12);
    const records = [
      rec(1, new Date(2026, 8, 28, 9).toISOString()),
      rec(2, new Date(2026, 8, 28, 18).toISOString()),
      rec(3, new Date(2026, 8, 30, 8).toISOString()),
      rec(3, new Date(2026, 8, 25, 8).toISOString()),
    ];
    expect(braveDaysThisWeek(records, now)).toBe(2);
  });

  test("a new week starts at zero without anything being lost", () => {
    const records = [rec(1, new Date(2026, 8, 28, 9).toISOString())];
    expect(braveDaysThisWeek(records, new Date(2026, 9, 5, 9))).toBe(0);
    expect(totalPoints(records)).toBe(15);
  });
});

describe("braveWeek", () => {
  it("marks this week's brave days, Monday first, and knows today and the future", () => {
    const now = new Date(2026, 8, 30, 12); // Wednesday
    const rec = (d: Date) => ({ situationId: "class-answer", level: 1 as const, at: d.toISOString(), seconds: null, typed: false, roughDay: false });
    const week = braveWeek([rec(new Date(2026, 8, 28, 9)), rec(new Date(2026, 8, 30, 8)), rec(new Date(2026, 8, 20, 9))], now);
    expect(week.map((d) => d.label).join("")).toBe("MTWTFSS");
    expect(week.map((d) => d.brave)).toEqual([true, false, true, false, false, false, false]);
    expect(week[2].today).toBe(true);
    expect(week[3].future).toBe(true);
    expect(week[1].future).toBe(false);
  });
});

describe("points outside steps", () => {
  const e = (kind: AppEvent["kind"], at: string): AppEvent => ({ kind, at });

  test("dares, games, Right before and Not yet earn points, calm tools never need to", () => {
    expect(eventPoints([e("dare", "2026-09-28T10:00:00")])).toBe(10);
    expect(eventPoints([e("game", "2026-09-28T10:00:00"), e("ready", "2026-09-28T11:00:00"), e("notYet", "2026-09-28T12:00:00")])).toBe(15);
    expect(eventPoints([e("panic", "2026-09-28T10:00:00"), e("kit", "2026-09-28T10:00:00"), e("thenNow", "2026-09-28T10:00:00")])).toBe(0);
  });

  test("each has a daily limit, so opening a page again does not add up", () => {
    const games = Array.from({ length: 6 }, (_, i) => e("game", `2026-09-28T1${i}:00:00`));
    expect(eventPoints(games)).toBe(15);
    expect(eventPoints([e("dare", "2026-09-28T10:00:00"), e("dare", "2026-09-28T11:00:00"), e("dare", "2026-09-29T10:00:00")])).toBe(20);
  });

  test("a day with all its small ideas done earns a bonus", () => {
    const day = "2026-09-28";
    const events: AppEvent[] = [];
    const records: StepRecord[] = [];
    for (const q of dailyQuests(day)) {
      for (let i = 0; i < q.target; i++) {
        const at = `${day}T1${i}:00:00`;
        if (q.kind === "speak") records.push(rec(3, at));
        else if (q.kind === "type") records.push(rec(2, at, { typed: true, seconds: null }));
        else events.push(e(q.kind, at));
      }
    }
    expect(questDays(records, events)).toEqual([day]);
    expect(allPoints({ records, events })).toBe(totalPoints(records) + eventPoints(events) + QUEST_DAY_BONUS);
    expect(questDays(records.slice(1), events.slice(1)).length).toBeLessThanOrEqual(1);
  });

  test("brave days count steps and brave things, never Need a pause", () => {
    const records = [rec(1, "2026-09-28T10:00:00")];
    const events = [e("dare", "2026-09-29T10:00:00"), e("panic", "2026-09-30T10:00:00"), e("game", "2026-09-28T18:00:00")];
    expect(braveDaysTotal(records, events)).toBe(2);
    expect(braveDaysThisWeek(records, new Date("2026-10-01T12:00:00"), events)).toBe(2);
    expect(braveWeek(records, new Date("2026-10-01T12:00:00"), events).filter((d) => d.brave)).toHaveLength(2);
  });
});
