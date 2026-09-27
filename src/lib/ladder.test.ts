import { describe, expect, test } from "vitest";
import { dayKey, daysBetween, weekStartKey } from "./dates";
import { highestLevel, makeCustomStep, mapLight, nextLevel, suggestNext } from "./ladder";
import { SITUATIONS } from "./content/situations";
import type { Level, StepRecord } from "./types";

const rec = (situationId: string, level: Level, at = "2026-09-28T10:00:00"): StepRecord => ({
  situationId,
  level,
  at,
  seconds: 5,
  typed: false,
  roughDay: false,
});

describe("dates", () => {
  test("day and week keys are local", () => {
    const wed = new Date(2026, 8, 30, 23, 30);
    expect(dayKey(wed)).toBe("2026-09-30");
    expect(weekStartKey(wed)).toBe("2026-09-28");
    expect(weekStartKey(new Date(2026, 9, 4))).toBe("2026-09-28");
    expect(daysBetween(new Date(2026, 8, 1), new Date(2026, 8, 8, 1))).toBe(7);
  });
});

describe("ladder", () => {
  test("highest level is 0 when untried and the best level otherwise", () => {
    expect(highestLevel([], "class-answer")).toBe(0);
    const r = [rec("class-answer", 2), rec("class-answer", 4), rec("class-answer", 3)];
    expect(highestLevel(r, "class-answer")).toBe(4);
  });

  test("next level goes up by one and stops at 6", () => {
    expect(nextLevel([], "class-answer")).toBe(1);
    expect(nextLevel([rec("class-answer", 3)], "class-answer")).toBe(4);
    expect(nextLevel([rec("class-answer", 6)], "class-answer")).toBe(6);
  });

  test("suggestion prefers rooms from what feels hard", () => {
    expect(suggestNext([], SITUATIONS, ["friends"])).toEqual({ situationId: "friends-join", level: 1 });
  });

  test("suggestion falls back to class when nothing picked", () => {
    expect(suggestNext([], SITUATIONS, [])).toEqual({ situationId: "class-answer", level: 1 });
  });

  test("suggestion continues the least advanced situation in the preferred room", () => {
    const r = [rec("friends-join", 3), rec("friends-opinion", 1)];
    expect(suggestNext(r, SITUATIONS, ["friends"])).toEqual({ situationId: "friends-disagree", level: 1 });
  });

  test("suggestion is null when everything is finished", () => {
    const all = SITUATIONS.map((s) => rec(s.id, 6));
    expect(suggestNext(all, SITUATIONS, [])).toBeNull();
  });

  test("map light is the share of situations reaching step 3", () => {
    expect(mapLight([], SITUATIONS)).toBe(0);
    expect(mapLight([rec("class-answer", 3), rec("class-ask", 2)], SITUATIONS)).toBeCloseTo(1 / SITUATIONS.length);
    expect(mapLight(SITUATIONS.map((s) => rec(s.id, 3)), SITUATIONS)).toBe(1);
  });

  test("custom steps trim text and get an id", () => {
    const step = makeCustomStep("class", "  Ask the librarian for a book  ", new Date("2026-09-28T10:00:00Z"));
    expect(step.text).toBe("Ask the librarian for a book");
    expect(step.room).toBe("class");
    expect(step.id).toMatch(/^custom-/);
  });

  test("custom step text cannot be empty or huge", () => {
    expect(() => makeCustomStep("class", "   ", new Date())).toThrow();
    expect(makeCustomStep("class", "x".repeat(500), new Date()).text).toHaveLength(140);
  });
});
