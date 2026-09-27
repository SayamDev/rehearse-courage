import { describe, expect, test } from "vitest";
import { coachSystem, coachUser, tidySystem } from "./prompts";

describe("prompts", () => {
  test("coach plays the room's role and keeps the rules", () => {
    const s = coachSystem("teen", "class");
    expect(s).toContain("the teacher in a school class");
    expect(s).toContain("At most 25 words");
    expect(s).toMatch(/Never mention how they spoke/);
    expect(s).toMatch(/Never diagnose/);
    expect(s).toContain('{"reply"');
  });

  test("adults get a slightly longer reply", () => {
    expect(coachSystem("adult", "friends")).toContain("At most 40 words");
  });

  test("tidy never adds ideas and answers in JSON", () => {
    const s = tidySystem("adult");
    expect(s).toContain("Do not add new ideas");
    expect(s).toContain('{"tidy"');
  });

  test("the user message carries only the moment, the question and the answer", () => {
    expect(coachUser("A scene.", "A question?", "My answer.")).toBe(
      "The moment: A scene.\nWhat you said to them: A question?\nWhat they answered: My answer.",
    );
  });
});
