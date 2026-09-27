import { describe, expect, test } from "vitest";
import {
  DEFAULT_STATE,
  addCustomStep,
  logEvent,
  normalize,
  recordStep,
  setAge,
  setCompanion,
  setHardThings,
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

  test("online help defaults on (it only applies at 13 and over); the device model defaults off", () => {
    expect(DEFAULT_STATE.settings.onlineHelp).toBe(true);
    expect(DEFAULT_STATE.settings.deviceModel).toBe(false);
    const old = normalize({ age: "adult", settings: { sounds: false } });
    expect(old.settings.onlineHelp).toBe(true);
    expect(old.settings.deviceModel).toBe(false);
    const off = normalize({ settings: { onlineHelp: false, deviceModel: true } });
    expect(off.settings.onlineHelp).toBe(false);
    expect(off.settings.deviceModel).toBe(true);
    expect(normalize({ settings: { onlineHelp: "yes" } }).settings.onlineHelp).toBe(true);
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

  test("normalize drops invalid records but keeps valid ones", () => {
    expect(normalize({ records: [{ level: 99, at: 123 }, step] }).records).toEqual([step]);
  });

  test("normalize drops invalid custom steps but keeps valid ones", () => {
    const validCustom = { id: "c1", room: "class", text: "Ask the librarian", createdAt: "2026-09-28T10:00:00.000Z" };
    const cases = [
      { ...validCustom, room: "not-a-room" },
      { ...validCustom, text: "" },
      { ...validCustom, text: "   " },
      { ...validCustom, id: 5 },
      { ...validCustom, createdAt: 5 },
      "nonsense",
      null,
    ];
    expect(normalize({ customSteps: [...cases, validCustom] }).customSteps).toEqual([validCustom]);
    const trimmed = normalize({ customSteps: [{ ...validCustom, text: "  Ask the librarian  " }] }).customSteps;
    expect(trimmed[0].text).toBe("Ask the librarian");
    const capped = normalize({ customSteps: [{ ...validCustom, text: "y".repeat(200) }] }).customSteps;
    expect(capped[0].text).toHaveLength(140);
  });

  test("normalize drops a custom step with an unparseable createdAt", () => {
    const validCustom = { id: "c1", room: "class", text: "Ask the librarian", createdAt: "2026-09-28T10:00:00.000Z" };
    expect(normalize({ customSteps: [{ ...validCustom, createdAt: "not-a-date" }] }).customSteps).toEqual([]);
  });

  test("normalize drops invalid events but keeps valid ones", () => {
    const validEvent = { kind: "kit", at: "2026-09-28T10:00:00.000Z" };
    const cases = [
      { kind: "not-a-kind", at: "2026-09-28T10:00:00.000Z" },
      { kind: "kit", at: "not-a-date" },
      { kind: "kit" },
      { at: "2026-09-28T10:00:00.000Z" },
      "nonsense",
      null,
    ];
    expect(normalize({ events: [...cases, validEvent] }).events).toEqual([validEvent]);
  });

  test("normalize keeps only valid hardThings and dedupes, dedupes earned", () => {
    expect(normalize({ hardThings: ["class", "class", "not-a-thing", "panic"] }).hardThings).toEqual([
      "class",
      "panic",
    ]);
    expect(normalize({ earned: ["a", "a", "b", 5, null] }).earned).toEqual(["a", "b"]);
  });

  test("normalize rejects an unparseable lastSeen", () => {
    expect(normalize({ lastSeen: "not-a-date" }).lastSeen).toBeNull();
    expect(normalize({ lastSeen: "2026-09-28T10:00:00.000Z" }).lastSeen).toBe("2026-09-28T10:00:00.000Z");
  });

  test("normalize applies the companion name rule", () => {
    expect(normalize({ companion: { species: "firefly", name: "  Glow  " } }).companion).toEqual({
      species: "firefly",
      name: "Glow",
    });
    expect(normalize({ companion: { species: "hedgehog", name: "   " } }).companion?.name).toBe("Hedgehog");
    expect(normalize({ companion: { species: "not-a-species", name: "X" } }).companion).toBeNull();
  });

  test("normalize keeps only known boolean settings, others fall back to defaults", () => {
    const s = normalize({ settings: { sounds: "yes", timers: true } }).settings;
    expect(s.sounds).toBe(true);
    expect(s.timers).toBe(true);
  });

  test("normalize accepts only known theme values, defaulting to system", () => {
    expect(normalize({ settings: { theme: "dark" } }).settings.theme).toBe("dark");
    expect(normalize({ settings: { theme: "light" } }).settings.theme).toBe("light");
    expect(normalize({ settings: { theme: "system" } }).settings.theme).toBe("system");
    expect(normalize({ settings: { theme: "neon" } }).settings.theme).toBe("system");
    expect(normalize({ settings: {} }).settings.theme).toBe("system");
    expect(DEFAULT_STATE.settings.theme).toBe("system");
  });

  test("setHardThings dedupes", () => {
    expect(setHardThings(DEFAULT_STATE, ["class", "class", "panic"]).hardThings).toEqual(["class", "panic"]);
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

describe("text size setting", () => {
  test("defaults to normal, keeps a valid size, and upgrades the old largeText switch", () => {
    expect(normalize({}).settings.textSize).toBe("normal");
    expect(normalize({ settings: { textSize: "larger" } }).settings.textSize).toBe("larger");
    expect(normalize({ settings: { textSize: "huge" } }).settings.textSize).toBe("normal");
    expect(normalize({ settings: { largeText: true } }).settings.textSize).toBe("large");
    expect(normalize({ settings: { largeText: true, textSize: "normal" } }).settings.textSize).toBe("normal");
  });
});
