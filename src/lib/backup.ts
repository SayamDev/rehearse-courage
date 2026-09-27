import { normalize, type CourageState } from "./state";

const APP = "rehearse-courage";

export function exportBackup(s: CourageState): string {
  return JSON.stringify({ app: APP, version: 1, savedAt: new Date().toISOString(), state: s }, null, 2);
}

/** Throws Error("not-a-backup") for anything that is not a Rehearse Courage backup. */
export function importBackup(text: string): CourageState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("not-a-backup");
  }
  const p = parsed as { app?: unknown; state?: unknown };
  if (!p || p.app !== APP || !p.state) throw new Error("not-a-backup");
  return normalize(p.state);
}
