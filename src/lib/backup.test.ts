import { describe, expect, test } from "vitest";
import { backupFilename, exportBackup, importBackup } from "./backup";
import { DEFAULT_STATE } from "./state";

describe("backup", () => {
  test("filename uses the local date", () => {
    expect(backupFilename(new Date(2026, 8, 7, 23, 30))).toBe("rehearse-courage-backup-2026-09-07.json");
  });

  test("round trips, and rejects anything else", () => {
    const s = { ...DEFAULT_STATE, companion: { species: "firefly" as const, name: "Glow" } };
    expect(importBackup(exportBackup(s)).companion).toEqual(s.companion);
    expect(() => importBackup("{}")).toThrow("not-a-backup");
    expect(() => importBackup("not json")).toThrow("not-a-backup");
  });
});
