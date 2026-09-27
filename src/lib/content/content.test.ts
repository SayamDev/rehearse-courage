import { describe, expect, test } from "vitest";
import { ROOMS, SITUATIONS, situationById } from "./situations";
import { FRAMES, RESCUE_PHRASES } from "./phrases";

const allText = (): string[] => [
  ...ROOMS.flatMap((r) => [r.name.kid, r.name.grown]),
  ...SITUATIONS.flatMap((s) => [s.title, s.scene, s.mission, ...s.ideas].flatMap((w) => [w.kid, w.grown])),
  ...RESCUE_PHRASES.flatMap((p) => [p.text.kid, p.text.grown, p.when.kid, p.when.grown]),
  ...FRAMES.flatMap((f) => [f.text.kid, f.text.grown]),
];

describe("content", () => {
  test("every room has its situations from the spec", () => {
    expect(SITUATIONS.filter((s) => s.room === "class")).toHaveLength(4);
    expect(SITUATIONS.filter((s) => s.room === "friends")).toHaveLength(4);
    expect(SITUATIONS.filter((s) => s.room === "presenting")).toHaveLength(2);
  });

  test("ids are unique and lookup works", () => {
    const ids = SITUATIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(situationById("class-answer")?.room).toBe("class");
    expect(situationById("nope")).toBeUndefined();
  });

  test("each situation has at least two ideas", () => {
    for (const s of SITUATIONS) expect(s.ideas.length).toBeGreaterThanOrEqual(2);
  });

  test("copy rules: no em or en dashes, no Oops, nothing empty", () => {
    for (const t of allText()) {
      expect(t.trim().length).toBeGreaterThan(0);
      expect(t).not.toMatch(/[–—]/);
      expect(t.toLowerCase()).not.toContain("oops");
    }
  });

  test("there are enough rescue phrases and frames", () => {
    expect(RESCUE_PHRASES.length).toBeGreaterThanOrEqual(8);
    expect(FRAMES.length).toBeGreaterThanOrEqual(6);
  });
});
