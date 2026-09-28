import { describe, expect, test } from "vitest";
import { journeyStats, monthCalendar, proudEntries } from "./journey";
import { DEFAULT_STATE } from "./state";
import type { StepRecord } from "./types";

const rec = (situationId: string, level: 1 | 2 | 3 | 4 | 5 | 6, at: string): StepRecord => ({ situationId, level, at, seconds: null, typed: false, roughDay: false });

describe("journey", () => {
  test("stats add up steps, brave days, tries, dares and badges", () => {
    const s = {
      records: [rec("class-answer", 1, "2026-09-27T10:00:00"), rec("out-order", 6, "2026-09-28T10:00:00")],
      events: [{ kind: "dare" as const, at: "2026-09-29T10:00:00" }],
      earned: ["first-words", "tiny-dare", "not-a-badge"],
    };
    const j = journeyStats(s);
    expect(j).toMatchObject({ braveDays: 3, missions: 1, dares: 1, badges: 2 });
    expect(j.points).toBeGreaterThan(0);
    expect(j.rank.level).toBeGreaterThanOrEqual(1);
  });

  test("proud moments: every step 6, newest first, with what the person said", () => {
    const records = [rec("out-order", 6, "2026-09-20T10:00:00"), rec("class-answer", 6, "2026-09-28T10:00:00"), rec("class-answer", 3, "2026-09-28T09:00:00")];
    const proud = [{ situationId: "out-order", at: "2026-09-20T10:00:00", outcome: "tried" as const, feel: "hard" as const, note: "Asked for water" }];
    const list = proudEntries({ ...DEFAULT_STATE, age: "adult", records, proud });
    expect(list.map((p) => p.situationId)).toEqual(["class-answer", "out-order"]);
    expect(list[0]).toMatchObject({ outcome: "did", feel: null, note: null, title: "Answer a question in class" });
    expect(list[1]).toMatchObject({ outcome: "tried", feel: "hard", note: "Asked for water", title: "Order at a counter" });
  });

  test("month calendar starts on Monday and marks brave days", () => {
    // September 2026 starts on a Tuesday.
    const cal = monthCalendar(["2026-09-01", "2026-09-28", "2026-10-01"], 2026, 8, new Date("2026-09-28T12:00:00"));
    expect(cal.weeks[0][0]).toBeNull();
    expect(cal.weeks[0][1]).toMatchObject({ day: 1, brave: true });
    expect(cal.braveCount).toBe(2);
    expect(cal.weeks.every((w) => w.length === 7)).toBe(true);
    const today = cal.weeks.flat().find((d) => d?.today);
    expect(today?.day).toBe(28);
    expect(cal.label).toBe("September 2026");
  });
});
