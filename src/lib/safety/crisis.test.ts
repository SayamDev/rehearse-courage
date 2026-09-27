import { describe, expect, test } from "vitest";
import { checkCrisis, supportLines } from "./crisis";

describe("crisis check", () => {
  test.each([
    "I want to kill myself",
    "i want to die",
    "sometimes I think about ending it all",
    "I keep hurting myself",
    "I cut myself last night",
    "I dont want to be alive",
    "nobody would care if I was gone",
    "someone at home hits me",
    "I am thinking about suicide",
  ])("flags: %s", (text) => {
    expect(checkCrisis(text).crisis).toBe(true);
  });

  test.each([
    "I get so nervous I could die of embarrassment",
    "I killed it in my presentation",
    "my hands shake when I talk",
    "I blush when the teacher looks at me",
    "",
  ])("does not flag everyday nerves: %s", (text) => {
    expect(checkCrisis(text).crisis).toBe(false);
  });
});

describe("support lines", () => {
  test("UK", () => {
    const uk = supportLines("GB");
    expect(uk.emergency).toBe("999");
    expect(uk.lines.map((l) => l.name)).toEqual(["Childline", "Samaritans", "Shout"]);
  });

  test("US uses 988", () => {
    expect(supportLines("US").lines[0].contact).toContain("988");
    expect(supportLines("US").emergency).toBe("911");
  });

  test("unknown country still gets help", () => {
    const x = supportLines(null);
    expect(x.lines[0].contact).toContain("findahelpline.com");
    expect(x.emergency.length).toBeGreaterThan(0);
  });
});
