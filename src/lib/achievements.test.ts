import { describe, expect, test } from "vitest";
import { BADGES, earnedBadges, newBadges, type BadgeInput } from "./achievements";
import { BADGE_HINTS } from "./content/badge-hints";
import { SITUATIONS } from "./content/situations";
import { GAMES } from "./games";
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
  test("22 badges with unique ids, a hint each, and no dashes in copy", () => {
    expect(BADGES).toHaveLength(22);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(22);
    for (const b of BADGES) expect(BADGE_HINTS[b.id]).toBeTruthy();
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
    expect(earnedBadges({ ...empty, records: rooms })).not.toContain("room-explorer");
    expect(earnedBadges({ ...empty, records: [...rooms, rec("out-order", 1)] })).toContain("room-explorer");
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

  test("brave days add up over any days, never in a row", () => {
    const days = (n: number) => Array.from({ length: n }, (_, i) => rec("class-answer", 1, { at: `2026-0${1 + Math.floor(i / 28)}-${String((i % 28) + 1).padStart(2, "0")}T10:00:00` }));
    expect(earnedBadges({ ...empty, records: days(2) })).not.toContain("brave-3");
    expect(earnedBadges({ ...empty, records: days(3) })).toContain("brave-3");
    expect(earnedBadges({ ...empty, records: days(7) })).toContain("brave-7");
    // A dare on a day with no step counts as a brave day too.
    const withDare = { ...empty, records: days(2), events: [{ kind: "dare" as const, at: "2026-05-01T10:00:00" }] };
    expect(earnedBadges(withDare)).toEqual(expect.arrayContaining(["brave-3", "tiny-dare"]));
    // Need a pause is never a test.
    expect(earnedBadges({ ...empty, records: days(2), events: [{ kind: "panic", at: "2026-05-01T10:00:00" }] })).not.toContain("brave-3");
  });

  test("dares, Right before, Not yet and proud moments", () => {
    expect(earnedBadges({ ...empty, events: ev("dare", 9) })).not.toContain("dare-collector");
    expect(earnedBadges({ ...empty, events: ev("dare", 10) })).toContain("dare-collector");
    expect(earnedBadges({ ...empty, events: ev("ready", 1) })).toContain("ready-steady");
    expect(earnedBadges({ ...empty, events: ev("notYet", 1) })).toContain("not-yet");
    const proud = [{ situationId: "class-answer", at, outcome: "tried" as const, feel: null, note: null }];
    expect(earnedBadges({ ...empty, proud })).toContain("proud-moment");
  });

  test("game explorer needs every game, told apart by the game played", () => {
    const played = GAMES.map((g) => ({ kind: "game" as const, at, detail: g.id }));
    expect(earnedBadges({ ...empty, events: played.slice(1) })).not.toContain("game-explorer");
    expect(earnedBadges({ ...empty, events: ev("game", 20) })).not.toContain("game-explorer");
    expect(earnedBadges({ ...empty, events: played })).toContain("game-explorer");
  });
});
