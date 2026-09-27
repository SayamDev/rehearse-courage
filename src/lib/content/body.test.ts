import { describe, expect, test } from "vitest";
import { ACCEPTANCE_LINES, BODY_EXPLAINERS, KIT_TOOLS, kitTool, REFRAME_CARDS, SPEECH_TOOLS } from "./body";

const allText = (): string[] => [
  ...KIT_TOOLS.flatMap((t) => [t.title, t.line.kid, t.line.grown, t.helps.kid, t.helps.grown]),
  ...Object.values(BODY_EXPLAINERS).flatMap((ws) => ws.flatMap((w) => [w.kid, w.grown])),
  ...Object.values(REFRAME_CARDS).flatMap((cards) => cards.flatMap((c) => [c.thought.kid, c.thought.grown, c.tryThis.kid, c.tryThis.grown])),
  ...SPEECH_TOOLS.flatMap((t) => [t.title, t.how.kid, t.how.grown]),
  ...ACCEPTANCE_LINES.flatMap((w) => [w.kid, w.grown]),
];

describe("body kit content", () => {
  test("the kit has the seven tools from the plan, with unique ids", () => {
    expect(KIT_TOOLS.map((t) => t.id)).toEqual(["breathing", "grounding", "blushing", "sweating", "rescue", "frames", "speech"]);
    expect(kitTool("rescue")?.title).toBe("Rescue phrases");
    expect(kitTool("nope")).toBeUndefined();
  });

  test("blushing and sweating each have an explainer and at least three reframe cards", () => {
    for (const k of ["blushing", "sweating"] as const) {
      expect(BODY_EXPLAINERS[k].length).toBeGreaterThanOrEqual(2);
      expect(REFRAME_CARDS[k].length).toBeGreaterThanOrEqual(3);
    }
  });

  test("speech tools include easy onset, pausing and light contact, with the stuttering acceptance line", () => {
    expect(SPEECH_TOOLS.map((t) => t.id)).toEqual(["easy-onset", "pausing", "light-contact"]);
    expect(ACCEPTANCE_LINES[0].kid).toBe("Stuttering is a way of talking, not a mistake.");
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

  test("no medical claims or fluency judgement", () => {
    for (const t of allText()) {
      expect(t.toLowerCase()).not.toMatch(/\b(cure\w*|treat\w*|therap\w*|diagnos\w*|fix your|fluen\w*)/);
    }
  });
});
