import { describe, expect, test } from "vitest";
import { BADGES, earnedBadges, newBadges, type BadgeInput } from "./achievements";
import { SITUATIONS } from "./content/situations";
import type { AppEvent, Level, StepRecord } from "./types";

const at = "2026-09-28T10:00:00";
const rec = (situationId: string, level: Level, extra: Partial<StepRecord> = {}): StepRecord => ({
  situationId,
  level,
  at,
  seconds: 5,
  typed: false,
  roughDay: false,
  ...extra,
});
const ev = (kind: AppEvent["kind"], n: number): AppEvent[] => Array.from({ length: n }, () => ({ kind, at }));
const empty: BadgeInput = { records: [], customSteps: [], events: [], cameBack: false };

describe("achievements", () => {
  test("twelve badges with unique ids and no dashes in copy", () => {
    expect(BADGES).toHaveLength(12);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(12);
    for (const b of BADGES) {
      expect(`${b.title}${b.description}`).not.toMatch(/[–—]/);
      expect(`${b.title}${b.description}`).not.toContain("!");
    }
  });

  test("nothing earned at the start", () => {
    expect(earnedBadges(empty)).toEqual([]);
  });

  test("speaking and typing badges", () => {
    expect(earnedBadges({ ...empty, records: [rec("class-answer", 3)] })).toContain("first-words");
    expect(earnedBadges({ ...empty, records: [rec("class-answer", 2, { typed: true })] })).toContain("typed-first");
    expect(earnedBadges({ ...empty, records: [rec("class-answer", 3, { roughDay: true })] })).toContain("said-anyway");
  });

  test("class step 5, missions and rooms", () => {
    expect(earnedBadges({ ...empty, records: [rec("class-read", 5)] })).toContain("hand-up");
    expect(earnedBadges({ ...empty, records: [rec("friends-join", 5)] })).not.toContain("hand-up");
    expect(earnedBadges({ ...empty, records: [rec("friends-join", 6)] })).toContain("out-in-the-wild");
    const rooms = [rec("class-answer", 1), rec("friends-join", 1), rec("present-intro", 1)];
    expect(earnedBadges({ ...empty, records: rooms })).toContain("room-explorer");
  });

  test("event-based badges", () => {
    expect(earnedBadges({ ...empty, events: ev("kit", 9) })).not.toContain("calm-captain");
    expect(earnedBadges({ ...empty, events: ev("kit", 10) })).toContain("calm-captain");
    expect(earnedBadges({ ...empty, events: ev("rescue", 5) })).toContain("rescue-ready");
    expect(earnedBadges({ ...empty, events: ev("thenNow", 1) })).toContain("then-and-now");
  });

  test("custom step, came back and dawn", () => {
    const custom = [{ id: "custom-1", room: "class" as const, text: "Ask the librarian", createdAt: at }];
    expect(earnedBadges({ ...empty, customSteps: custom })).toContain("my-own-step");
    expect(earnedBadges({ ...empty, cameBack: true })).toContain("back-again");
    const all = SITUATIONS.map((s) => rec(s.id, 3));
    expect(earnedBadges({ ...empty, records: all })).toContain("dawn");
  });

  test("new badges are only the ones not already held", () => {
    const input = { ...empty, records: [rec("class-answer", 3)] };
    expect(newBadges([], input)).toEqual(["first-words"]);
    expect(newBadges(["first-words"], input)).toEqual([]);
  });
});
