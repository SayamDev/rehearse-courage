import { describe, expect, test } from "vitest";
import { braveDaysThisWeek, missionsDone, pointsFor, totalPoints } from "./courage";
import type { Level, StepRecord } from "./types";

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
