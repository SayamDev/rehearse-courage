import { describe, expect, test } from "vitest";
import { RANKS, rankFor, rankLabel, STAR_EVERY } from "./rank";

describe("courage levels", () => {
  test("start at Spark and climb with points", () => {
    expect(rankFor(0)).toMatchObject({ level: 1, name: "Spark", toNext: 40, nextName: "Flicker" });
    expect(rankFor(39).level).toBe(1);
    expect(rankFor(40)).toMatchObject({ level: 2, name: "Flicker" });
    expect(rankFor(1300)).toMatchObject({ level: 10, name: "Daybreak", nextName: "Star" });
  });

  test("progress runs from 0 to just under 1 within a level", () => {
    const r = rankFor(140);
    expect(r.level).toBe(3);
    expect(r.progress).toBeCloseTo(0.5);
    expect(r.toNext).toBe(40);
  });

  test("keep going after Daybreak, never capped", () => {
    const last = RANKS[RANKS.length - 1].from;
    expect(rankFor(last + STAR_EVERY)).toMatchObject({ level: 11, name: "Star" });
    expect(rankFor(last + 5 * STAR_EVERY + 1)).toMatchObject({ level: 15, name: "Star" });
  });

  test("never below level 1, and each level is further than the last", () => {
    expect(rankFor(-20).level).toBe(1);
    const gaps = RANKS.slice(1).map((r, i) => r.from - RANKS[i].from);
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeGreaterThanOrEqual(gaps[i - 1]);
    expect(rankLabel(rankFor(200))).toBe("Level 4: Lantern");
  });
});
