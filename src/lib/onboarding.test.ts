import { describe, expect, test } from "vitest";
import { HARD_THINGS } from "./types";
import {
  AGE_OPTIONS,
  HARD_THING_LABELS,
  TOTAL_STEPS,
  clampStep,
  hardThingOptions,
  nextStep,
  prevStep,
  toggleHardThing,
} from "./onboarding";

describe("clampStep / nextStep / prevStep", () => {
  test("clamps below 1 up to 1", () => {
    expect(clampStep(0)).toBe(1);
    expect(clampStep(-5)).toBe(1);
  });

  test("clamps above TOTAL_STEPS down to TOTAL_STEPS", () => {
    expect(clampStep(5)).toBe(TOTAL_STEPS);
    expect(clampStep(99)).toBe(TOTAL_STEPS);
  });

  test("nextStep advances by one and stops at the last step", () => {
    expect(nextStep(1)).toBe(2);
    expect(nextStep(3)).toBe(4);
    expect(nextStep(4)).toBe(4);
  });

  test("prevStep goes back by one and stops at the first step", () => {
    expect(prevStep(4)).toBe(3);
    expect(prevStep(2)).toBe(1);
    expect(prevStep(1)).toBe(1);
  });
});

describe("AGE_OPTIONS", () => {
  test("has the three age bands in order", () => {
    expect(AGE_OPTIONS.map((o) => o.value)).toEqual(["under13", "teen", "adult"]);
    expect(AGE_OPTIONS.map((o) => o.label)).toEqual(["Under 13", "13 to 17", "Adult"]);
  });
});

describe("HARD_THING_LABELS / hardThingOptions", () => {
  test("has exactly one label for every HardThing id, in HARD_THINGS order", () => {
    expect(Object.keys(HARD_THING_LABELS).sort()).toEqual([...HARD_THINGS].sort());
    expect(hardThingOptions().map((o) => o.id)).toEqual(HARD_THINGS);
  });

  test("labels match the brief exactly", () => {
    expect(HARD_THING_LABELS).toEqual({
      class: "Talking in class",
      friends: "With friends",
      presenting: "Presenting",
      panic: "Panic",
      blushing: "Blushing or sweating",
      stuttering: "Stuttering",
      words: "Losing my words",
      focus: "Staying focused",
    });
  });
});

describe("toggleHardThing", () => {
  test("adds an id that is not selected", () => {
    expect(toggleHardThing([], "panic")).toEqual(["panic"]);
    expect(toggleHardThing(["class"], "panic")).toEqual(["class", "panic"]);
  });

  test("removes an id that is already selected", () => {
    expect(toggleHardThing(["class", "panic"], "panic")).toEqual(["class"]);
  });

  test("never mutates the input array", () => {
    const selected: ("class" | "panic")[] = ["class"];
    toggleHardThing(selected, "panic");
    expect(selected).toEqual(["class"]);
  });
});
