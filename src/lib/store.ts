"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_STATE, normalize, type CourageState } from "./state";

const KEY = "courage:v1";

type Snapshot = CourageState & { hydrated: boolean };

const SERVER: Snapshot = { ...DEFAULT_STATE, hydrated: false };
let current: Snapshot | null = null;
const listeners = new Set<() => void>();

function load(): Snapshot {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...normalize(JSON.parse(raw)), hydrated: true };
  } catch {
    // Storage blocked or corrupted: start fresh in memory.
  }
  return { ...DEFAULT_STATE, hydrated: true };
}

function save(s: CourageState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage full or blocked: progress stays in memory for this visit.
  }
}

function snapshot(): Snapshot {
  if (!current) current = load();
  return current;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useCourage(): Snapshot {
  return useSyncExternalStore(subscribe, snapshot, () => SERVER);
}

/** Applies a pure action from state.ts, saves, notifies. Returns badge ids earned by this action. */
export function act(
  fn: (s: CourageState) => CourageState | { state: CourageState; newlyEarned: string[] },
): string[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hydrated: _hydrated, ...base } = snapshot();
  const out = fn(base);
  const next = "state" in out ? out.state : out;
  const earned = "state" in out ? out.newlyEarned : [];
  current = { ...next, hydrated: true };
  save(next);
  listeners.forEach((l) => l());
  return earned;
}

/** Delete everything on this device. Recordings (IndexedDB) are cleared by the recordings module in a later plan. */
export function clearEverything(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to remove.
  }
  current = { ...DEFAULT_STATE, hydrated: true };
  listeners.forEach((l) => l());
}
