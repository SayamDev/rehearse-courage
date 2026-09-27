import { describe, expect, test } from "vitest";
import { SCENES, stoneStates } from "./scenes";
import { ROOM_IDS, type Level, type StepRecord } from "./types";

const rec = (situationId: string, level: Level): StepRecord => ({
  situationId,
  level,
  at: "2026-09-28T10:00:00",
  seconds: 5,
  typed: false,
  roughDay: false,
});

describe("stoneStates", () => {
  test("no records: step 1 is current, the rest are dim, always 6 entries", () => {
    const states = stoneStates([], "class-answer");
    expect(states).toHaveLength(6);
    expect(states).toEqual(["current", "dim", "dim", "dim", "dim", "dim"]);
  });

  test("highest 3: steps 1 to 3 lit, step 4 current, 5 and 6 dim", () => {
    const states = stoneStates([rec("class-answer", 3)], "class-answer");
    expect(states).toHaveLength(6);
    expect(states).toEqual(["lit", "lit", "lit", "current", "dim", "dim"]);
  });

  test("highest 6: every step lit, none current, still 6 entries", () => {
    const states = stoneStates([rec("class-answer", 6)], "class-answer");
    expect(states).toHaveLength(6);
    expect(states).toEqual(["lit", "lit", "lit", "lit", "lit", "lit"]);
  });

  test("records for other situations do not affect this one", () => {
    const states = stoneStates([rec("friends-join", 5)], "class-answer");
    expect(states).toEqual(["current", "dim", "dim", "dim", "dim", "dim"]);
  });
});

describe("SCENES", () => {
  test("every room has a scene with exactly 5 stones", () => {
    for (const room of ROOM_IDS) {
      expect(SCENES[room].stones).toHaveLength(5);
    }
  });

  test("every coordinate (stones and destination) is within 0 to 100", () => {
    for (const room of ROOM_IDS) {
      const scene = SCENES[room];
      for (const stone of scene.stones) {
        expect(stone.x).toBeGreaterThanOrEqual(0);
        expect(stone.x).toBeLessThanOrEqual(100);
        expect(stone.y).toBeGreaterThanOrEqual(0);
        expect(stone.y).toBeLessThanOrEqual(100);
      }
      const d = scene.destination;
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.x).toBeLessThanOrEqual(100);
      expect(d.y).toBeGreaterThanOrEqual(0);
      expect(d.y).toBeLessThanOrEqual(100);
      expect(d.x + d.w).toBeLessThanOrEqual(100);
      expect(d.y + d.h).toBeLessThanOrEqual(100);
    }
  });

  test("every scene has a positive width and height and a non-empty destination label", () => {
    for (const room of ROOM_IDS) {
      const scene = SCENES[room];
      expect(scene.width).toBeGreaterThan(0);
      expect(scene.height).toBeGreaterThan(0);
      expect(scene.destination.label.length).toBeGreaterThan(0);
    }
  });
});
