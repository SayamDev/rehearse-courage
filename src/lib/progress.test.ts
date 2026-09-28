import { describe, expect, test } from "vitest";
import { stoneStates } from "./progress";
import type { Level, StepRecord } from "./types";

const rec = (situationId: string, level: Level): StepRecord => ({
  situationId,
  level,
  at: "2026-09-28T10:00:00",
  seconds: 5,
  typed: false,
  roughDay: false,
});

describe("stoneStates", () => {
  test("no records: step 1 is current, the rest are dim, always 6 entries", () => {
    const states = stoneStates([], "class-answer");
    expect(states).toHaveLength(6);
    expect(states).toEqual(["current", "dim", "dim", "dim", "dim", "dim"]);
  });

  test("highest 3: steps 1 to 3 lit, step 4 current, 5 and 6 dim", () => {
    const states = stoneStates([rec("class-answer", 3)], "class-answer");
    expect(states).toHaveLength(6);
    expect(states).toEqual(["lit", "lit", "lit", "current", "dim", "dim"]);
  });

  test("highest 6: every step lit, none current, still 6 entries", () => {
    const states = stoneStates([rec("class-answer", 6)], "class-answer");
    expect(states).toHaveLength(6);
    expect(states).toEqual(["lit", "lit", "lit", "lit", "lit", "lit"]);
  });

  test("records for other situations do not affect this one", () => {
    const states = stoneStates([rec("friends-join", 5)], "class-answer");
    expect(states).toEqual(["current", "dim", "dim", "dim", "dim", "dim"]);
  });
});
