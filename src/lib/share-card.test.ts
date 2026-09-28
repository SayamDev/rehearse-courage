import { describe, expect, test } from "vitest";
import { cardFileName, wrapText } from "./share-card";

const measure = (s: string) => s.length * 10;

describe("share card", () => {
  test("wraps words to the width and never splits a word", () => {
    expect(wrapText(measure, "You did a tiny dare out in the world", 120, 5)).toEqual(["You did a", "tiny dare", "out in the", "world"]);
  });

  test("keeps to the line limit and marks what was cut", () => {
    const lines = wrapText(measure, "one two three four five six seven eight nine ten", 100, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith("...")).toBe(true);
    expect(measure(lines[1])).toBeLessThanOrEqual(100);
  });

  test("a single long word still shows", () => {
    expect(wrapText(measure, "Supercalifragilistic", 50, 2)).toEqual(["Supercalifragilistic"]);
  });

  test("file names are plain and safe", () => {
    expect(cardFileName("Level 4: Lantern")).toBe("rehearse-courage-level-4-lantern.png");
    expect(cardFileName("!!!")).toBe("rehearse-courage-courage.png");
  });
});
