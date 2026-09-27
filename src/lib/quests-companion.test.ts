import { describe, expect, test } from "vitest";
import { QUEST_POOL, dailyQuests, questProgress } from "./quests";
import { SPECIES, stageFor } from "./companion";
import type { AppEvent, StepRecord } from "./types";

const day = "2026-09-28";
const rec = (extra: Partial<StepRecord>): StepRecord => ({
  situationId: "class-answer",
  level: 3,
  at: new Date(2026, 8, 28, 10).toISOString(),
  seconds: 5,
  typed: false,
  roughDay: false,
  ...extra,
});

describe("quests", () => {
  test("same day gives the same quests, all different", () => {
    const a = dailyQuests(day);
    expect(a).toHaveLength(3);
    expect(dailyQuests(day)).toEqual(a);
    expect(new Set(a.map((q) => q.id)).size).toBe(3);
  });

  test("pool is large enough and dash free", () => {
    expect(QUEST_POOL.length).toBeGreaterThanOrEqual(6);
    for (const q of QUEST_POOL) {
      expect(q.text).not.toMatch(/[–—]/);
      expect(q.text).not.toContain("!");
    }
  });

  test("progress counts only today and the right kind", () => {
    const speak = QUEST_POOL.find((q) => q.kind === "speak")!;
    const type = QUEST_POOL.find((q) => q.kind === "type")!;
    const rescue = QUEST_POOL.find((q) => q.kind === "rescue")!;
    const records = [
      rec({}),
      rec({ typed: true, level: 2 }),
      rec({ at: new Date(2026, 8, 27, 10).toISOString() }),
    ];
    const events: AppEvent[] = [{ kind: "rescue", at: new Date(2026, 8, 28, 11).toISOString() }];
    expect(questProgress(speak, records, events, day)).toBe(1);
    expect(questProgress(type, records, events, day)).toBe(1);
    expect(questProgress(rescue, records, events, day)).toBe(1);
  });
});

describe("companion", () => {
  test("three species", () => {
    expect(SPECIES.map((s) => s.id)).toEqual(["firefly", "hedgehog", "fox"]);
  });

  test("grows with points, speaking up needs a real-life mission", () => {
    expect(stageFor(0, 0)).toBe("hiding");
    expect(stageFor(30, 0)).toBe("peeking");
    expect(stageFor(120, 0)).toBe("waving");
    expect(stageFor(500, 0)).toBe("waving");
    expect(stageFor(300, 1)).toBe("speaking");
  });
});
