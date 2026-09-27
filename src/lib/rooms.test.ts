import { describe, expect, test } from "vitest";
import { defaultStepId, furthestInRoom, furthestLine, isRoomId, nextLine, roomSteps } from "./rooms";
import { SITUATIONS } from "./content/situations";
import type { CustomStep, StepRecord } from "./types";

const AT = "2026-09-27T12:00:00.000Z";
const rec = (situationId: string, level: StepRecord["level"]): StepRecord => ({
  situationId,
  level,
  at: AT,
  seconds: null,
  typed: true,
  roughDay: false,
});
const custom = (id: string, room: CustomStep["room"], text: string): CustomStep => ({ id, room, text, createdAt: AT });

describe("isRoomId", () => {
  test("accepts the three rooms only", () => {
    expect(isRoomId("class")).toBe(true);
    expect(isRoomId("friends")).toBe(true);
    expect(isRoomId("presenting")).toBe(true);
    expect(isRoomId("gym")).toBe(false);
    expect(isRoomId("")).toBe(false);
  });
});

describe("furthestInRoom", () => {
  test("is 0 with no records", () => {
    expect(furthestInRoom([], "class")).toBe(0);
  });

  test("takes the highest level across the room's situations only", () => {
    const records = [rec("class-answer", 2), rec("class-ask", 4), rec("class-ask", 1)];
    expect(furthestInRoom(records, "class")).toBe(4);
    expect(furthestInRoom(records, "friends")).toBe(0);
  });

  test("ignores custom step records", () => {
    expect(furthestInRoom([rec("custom-abc", 5)], "class")).toBe(0);
  });
});

describe("lines", () => {
  test("furthestLine", () => {
    expect(furthestLine(0)).toBe("Not started yet");
    expect(furthestLine(3)).toBe("Furthest step: 3 of 6");
  });

  test("nextLine names the next level, or says all done", () => {
    expect(nextLine(0)).toBe("Next: Think it");
    expect(nextLine(2)).toBe("Next: Say it out loud, alone");
    expect(nextLine(5)).toBe("Next: Try it for real");
    expect(nextLine(6)).toBe("All six steps done");
  });
});

describe("roomSteps", () => {
  test("lists the room's situations then its own custom steps, with progress", () => {
    const steps = roomSteps(
      {
        age: "adult",
        records: [rec("class-ask", 2), rec("custom-1", 1)],
        customSteps: [custom("custom-1", "class", "Ask the librarian"), custom("custom-2", "friends", "Say hi")],
      },
      "class",
    );
    const classSituations = SITUATIONS.filter((s) => s.room === "class");
    expect(steps).toHaveLength(classSituations.length + 1);
    expect(steps[0]).toMatchObject({ id: "class-answer", title: "Answer a question in class", highest: 0, next: 1, custom: false });
    expect(steps.find((s) => s.id === "class-ask")).toMatchObject({ highest: 2, next: 3 });
    expect(steps.at(-1)).toMatchObject({ id: "custom-1", title: "Ask the librarian", highest: 1, next: 2, custom: true });
  });

  test("uses the simpler words when age is skipped", () => {
    const steps = roomSteps({ age: null, records: [], customSteps: [] }, "class");
    expect(steps[0].title).toBe("Answer a question");
  });
});

describe("defaultStepId", () => {
  const base = { title: "", custom: false } as const;
  test("prefers a step in progress, then a fresh one, then the first", () => {
    expect(
      defaultStepId([
        { ...base, id: "a", highest: 6, next: 6 },
        { ...base, id: "b", highest: 0, next: 1 },
        { ...base, id: "c", highest: 2, next: 3 },
      ]),
    ).toBe("c");
    expect(
      defaultStepId([
        { ...base, id: "a", highest: 6, next: 6 },
        { ...base, id: "b", highest: 0, next: 1 },
      ]),
    ).toBe("b");
    expect(defaultStepId([{ ...base, id: "a", highest: 6, next: 6 }])).toBe("a");
    expect(defaultStepId([])).toBeNull();
  });
});
