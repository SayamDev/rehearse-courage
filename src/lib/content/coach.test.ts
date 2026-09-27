import { describe, expect, test } from "vitest";
import { COACH_FALLBACK, COACH_LINES, COACH_NAME, coachLine, PRESSURE_LINES } from "./coach";
import { SITUATIONS } from "./situations";
import { ROOM_IDS } from "@/lib/types";

const allText = (): string[] => [
  COACH_NAME,
  ...[...Object.values(COACH_LINES), COACH_FALLBACK, ...Object.values(PRESSURE_LINES)].flatMap((w) => [w.kid, w.grown]),
];

describe("coach content", () => {
  test("every situation has its own coach line", () => {
    for (const s of SITUATIONS) expect(COACH_LINES[s.id]).toBeDefined();
  });

  test("unknown and custom steps fall back to a gentle line", () => {
    expect(coachLine("custom-abc")).toBe(COACH_FALLBACK);
    expect(coachLine("class-answer")).toBe(COACH_LINES["class-answer"]);
  });

  test("every room has a pressure line", () => {
    for (const room of ROOM_IDS) expect(PRESSURE_LINES[room].kid.length).toBeGreaterThan(0);
  });

  test("copy rules: no em or en dashes, no Oops, no exclamation marks, never calm down", () => {
    for (const t of allText()) {
      expect(t.trim().length).toBeGreaterThan(0);
      expect(t).not.toMatch(/[–—]/);
      expect(t.toLowerCase()).not.toContain("oops");
      expect(t.toLowerCase()).not.toContain("calm down");
      expect(t.toLowerCase()).not.toContain("you've got this");
      expect(t).not.toContain("!");
    }
  });
});
