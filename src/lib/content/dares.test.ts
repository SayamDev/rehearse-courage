import { describe, expect, test } from "vitest";
import { DARES, dailyDare, dareById } from "./dares";

describe("tiny dares", () => {
  test("same dare all day, and Another one walks the whole list before repeating", () => {
    expect(dailyDare("2026-09-28")).toBe(dailyDare("2026-09-28"));
    const seen = new Set(DARES.map((_, i) => dailyDare("2026-09-28", i).id));
    expect(seen.size).toBe(DARES.length);
    expect(dailyDare("2026-09-28", DARES.length)).toBe(dailyDare("2026-09-28"));
  });

  test("the dare changes from day to day", () => {
    const days = Array.from({ length: 14 }, (_, i) => dailyDare(`2026-10-${String(i + 1).padStart(2, "0")}`).id);
    expect(new Set(days).size).toBeGreaterThan(5);
  });

  test("unique ids, plain copy, and kids never approach a stranger alone", () => {
    expect(new Set(DARES.map((d) => d.id)).size).toBe(DARES.length);
    for (const d of DARES) {
      for (const t of [d.text.kid, d.text.grown]) {
        expect(t).not.toMatch(/[–—!]/);
        expect(t.length).toBeLessThan(90);
      }
      if (/shop|directions|the way|stranger/i.test(d.text.kid)) expect(d.text.kid).toMatch(/grown-up/);
    }
    expect(dareById("thank-why")?.text.kid).toContain("thank you");
  });
});
