import { describe, expect, test } from "vitest";
import { lastSpokenSeconds, resolveLevel, stepResult } from "./step";
import { POINTS } from "./courage";
import type { StepRecord } from "./types";

const rec = (level: StepRecord["level"], at: string, seconds: number | null = null, id = "class-answer"): StepRecord => ({
  situationId: id,
  level,
  at,
  seconds,
  typed: seconds === null,
  roughDay: false,
});

describe("resolveLevel", () => {
  test("uses a valid level param", () => {
    expect(resolveLevel("3", [], "class-answer")).toBe(3);
    expect(resolveLevel(["6", "1"], [], "class-answer")).toBe(6);
  });

  test("falls back to the next level for anything else", () => {
    const records = [rec(1, "2026-09-20T10:00:00Z"), rec(2, "2026-09-21T10:00:00Z")];
    for (const bad of [undefined, "", "0", "7", "2.5", "abc"]) {
      expect(resolveLevel(bad, records, "class-answer")).toBe(3);
    }
  });
});

describe("lastSpokenSeconds", () => {
  test("is null when never spoken", () => {
    expect(lastSpokenSeconds([rec(1, "2026-09-20T10:00:00Z")], "class-answer")).toBeNull();
  });

  test("takes the most recent spoken record for that step only", () => {
    const records = [
      rec(3, "2026-09-20T10:00:00Z", 6),
      rec(3, "2026-09-22T10:00:00Z", 9),
      rec(2, "2026-09-23T10:00:00Z"),
      rec(3, "2026-09-24T10:00:00Z", 30, "class-ask"),
    ];
    expect(lastSpokenSeconds(records, "class-answer")).toBe(9);
  });
});

describe("stepResult", () => {
  test("first try at a new level earns base plus harder, and remembers last time", () => {
    const before = [rec(3, "2026-09-20T10:00:00Z", 6)];
    const record = rec(4, "2026-09-27T10:00:00Z", 14);
    const result = stepResult(before, record, ["first-words"]);
    expect(result).toMatchObject({
      situationId: "class-answer",
      level: 4,
      seconds: 14,
      lastSeconds: 6,
      points: POINTS.base + POINTS.harder,
      newBadges: ["first-words"],
      nextLevel: 5,
    });
    expect(result.skyAfter).toBeLessThanOrEqual(result.skyBefore);
  });

  test("the sky warms when a situation is first said out loud", () => {
    const result = stepResult([rec(2, "2026-09-20T10:00:00Z")], rec(3, "2026-09-27T10:00:00Z", 5), []);
    expect(result.skyAfter).toBeLessThan(result.skyBefore);
  });

  test("reports a companion stage change", () => {
    // Enough earlier points to sit just under the peeking threshold.
    const before = [rec(1, "2026-09-20T10:00:00Z"), rec(1, "2026-09-20T11:00:00Z")];
    const result = stepResult(before, rec(2, "2026-09-27T10:00:00Z"), []);
    expect(result.stageBefore).toBe("hiding");
    expect(result.stageAfter).toBe("peeking");
  });
});
