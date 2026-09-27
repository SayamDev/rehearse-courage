import { describe, expect, test } from "vitest";
import {
  DEFAULT_STATE,
  addCustomStep,
  logEvent,
  normalize,
  recordStep,
  setAge,
  setCompanion,
  updateSettings,
  visit,
} from "./state";
import { exportBackup, importBackup } from "./backup";
import type { StepRecord } from "./types";

const step: StepRecord = {
  situationId: "class-answer",
  level: 3,
  at: "2026-09-28T10:00:00.000Z",
  seconds: 6,
  typed: false,
  roughDay: false,
};

describe("state", () => {
  test("defaults are safe: no age, timers off, sounds and confetti on", () => {
    expect(DEFAULT_STATE.age).toBeNull();
    expect(DEFAULT_STATE.settings.timers).toBe(false);
    expect(DEFAULT_STATE.settings.keepRecordings).toBe(false);
  });

  test("normalize fills gaps and survives junk", () => {
    expect(normalize(null)).toEqual(DEFAULT_STATE);
    expect(normalize("nonsense")).toEqual(DEFAULT_STATE);
    const partial = normalize({ age: "teen", settings: { sounds: false } });
    expect(partial.age).toBe("teen");
    expect(partial.settings.sounds).toBe(false);
    expect(partial.settings.confetti).toBe(true);
    expect(normalize({ age: "wizard" }).age).toBeNull();
  });

  test("recording a step stores it and returns new badges once", () => {
    const first = recordStep(DEFAULT_STATE, step);
    expect(first.state.records).toHaveLength(1);
    expect(first.newlyEarned).toContain("first-words");
    expect(first.state.earned).toContain("first-words");
    const second = recordStep(first.state, { ...step, at: "2026-09-28T11:00:00.000Z" });
    expect(second.newlyEarned).not.toContain("first-words");
  });

  test("actions never mutate the input", () => {
    const before = JSON.stringify(DEFAULT_STATE);
    recordStep(DEFAULT_STATE, step);
    setAge(DEFAULT_STATE, "adult");
    setCompanion(DEFAULT_STATE, "fox", "Pip");
    updateSettings(DEFAULT_STATE, { sounds: false });
    expect(JSON.stringify(DEFAULT_STATE)).toBe(before);
  });

  test("companion name is trimmed and has a fallback", () => {
    expect(setCompanion(DEFAULT_STATE, "firefly", "  Glow  ").companion).toEqual({ species: "firefly", name: "Glow" });
    expect(setCompanion(DEFAULT_STATE, "hedgehog", "   ").companion?.name).toBe("Hedgehog");
  });

  test("custom steps and events can earn badges", () => {
    const custom = addCustomStep(DEFAULT_STATE, "class", "Ask the librarian", new Date());
    expect(custom.newlyEarned).toContain("my-own-step");
    let s = DEFAULT_STATE;
    let earned: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = logEvent(s, "kit", new Date());
      s = r.state;
      earned = earned.concat(r.newlyEarned);
    }
    expect(earned).toContain("calm-captain");
  });

  test("coming back after 7 days earns Back again, a short gap does not", () => {
    const seen = visit(DEFAULT_STATE, new Date(2026, 8, 1)).state;
    expect(visit(seen, new Date(2026, 8, 3)).state.cameBack).toBe(false);
    const back = visit(seen, new Date(2026, 8, 8, 9));
    expect(back.state.cameBack).toBe(true);
    expect(back.newlyEarned).toContain("back-again");
  });

  test("backup round trip and bad input", () => {
    const s = recordStep(setAge(DEFAULT_STATE, "teen"), step).state;
    expect(importBackup(exportBackup(s))).toEqual(s);
    expect(() => importBackup("{}")).toThrow("not-a-backup");
    expect(() => importBackup("not json")).toThrow("not-a-backup");
  });
});
