import { describe, expect, test } from "vitest";
import { homeModel, NIGHT_TINT_MAX, skyTint } from "./home";
import { DEFAULT_STATE, type CourageState } from "./state";
import { SITUATIONS } from "./content/situations";
import type { StepRecord } from "./types";

const NOW = new Date("2026-09-27T12:00:00.000Z");

function record(situationId: string, level: StepRecord["level"], at = NOW.toISOString()): StepRecord {
  return { situationId, level, at, seconds: null, typed: true, roughDay: false };
}

function state(patch: Partial<CourageState> = {}): CourageState {
  return { ...DEFAULT_STATE, ...patch };
}

describe("homeModel", () => {
  test("new user with no hard things defaults to class-answer at level 1", () => {
    const model = homeModel(state(), NOW);
    expect(model.done).toBe(false);
    if (model.done) throw new Error("unreachable");
    expect(model.situationId).toBe("class-answer");
    expect(model.level).toBe(1);
    expect(model.levelName).toBe("Think it");
    expect(model.title).toBe("Answer a question");
  });

  test("new user whose hard thing is friends starts in the friends room", () => {
    const model = homeModel(state({ hardThings: ["friends"] }), NOW);
    expect(model.done).toBe(false);
    if (model.done) throw new Error("unreachable");
    expect(model.situationId).toBe("friends-join");
    expect(model.level).toBe(1);
  });

  test("suggests the next level once every class situation is tied", () => {
    // suggestNext prefers the least-advanced situation in the room, so
    // tie every other class situation at level 2 first: class-answer,
    // being first in array order, then stays the tie-break winner and
    // moves on to level 3.
    const records = ["class-answer", "class-ask", "class-read", "class-group"].map((id) => record(id, 2));
    const model = homeModel(state({ records }), NOW);
    expect(model.done).toBe(false);
    if (model.done) throw new Error("unreachable");
    expect(model.situationId).toBe("class-answer");
    expect(model.level).toBe(3);
    expect(model.levelName).toBe("Say it out loud, alone");
  });

  test("all situations at level 6 reports done", () => {
    const records = SITUATIONS.map((s) => record(s.id, 6));
    const model = homeModel(state({ records }), NOW);
    expect(model.done).toBe(true);
  });

  test("stats always reflect braveDaysThisWeek and totalPoints", () => {
    const records = [record("class-answer", 1)];
    const model = homeModel(state({ records }), NOW);
    expect(model.braveDays).toBe(1);
    expect(model.points).toBeGreaterThan(0);
  });
});

describe("skyTint", () => {
  test("is fully night with no progress", () => {
    expect(skyTint([])).toBe(NIGHT_TINT_MAX);
  });

  test("clears to zero once every situation has reached step 3", () => {
    const records = SITUATIONS.map((s) => record(s.id, 3));
    expect(skyTint(records)).toBe(0);
  });

  test("stays within bounds partway through", () => {
    const records = [record("class-answer", 3)];
    const tint = skyTint(records);
    expect(tint).toBeGreaterThan(0);
    expect(tint).toBeLessThan(NIGHT_TINT_MAX);
  });
});
