import { describe, expect, test } from "vitest";
import { BADGES } from "@/lib/achievements";
import { BADGE_HINTS } from "./badge-hints";

describe("badge hints", () => {
  test("every badge has a hint, and no hint is left over", () => {
    expect(Object.keys(BADGE_HINTS).sort()).toEqual(BADGES.map((b) => b.id).sort());
  });

  test("copy rules: no dashes, no exclamation marks, never locked", () => {
    for (const t of Object.values(BADGE_HINTS)) {
      expect(t).not.toMatch(/[–—!]/);
      expect(t.toLowerCase()).not.toMatch(/lock|unlock/);
    }
  });
});
