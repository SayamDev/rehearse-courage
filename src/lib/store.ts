"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_STATE, normalize, type CourageState } from "./state";

const KEY = "courage:v1";

type Snapshot = CourageState & { hydrated: boolean };

const SERVER: Snapshot = { ...DEFAULT_STATE, hydrated: false };
let current: Snapshot | null = null;
const listeners = new Set<() => void>();
/** The saved text this tab last read or wrote, so a change made by another tab can be spotted. */
let lastRaw: string | null = null;
/** False after a save failed (storage full or blocked): then this tab's memory is newer than storage. */
let saved = true;

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Snapshot {
  try {
    if (raw) return { ...normalize(JSON.parse(raw)), hydrated: true };
  } catch {
    // Corrupted: start fresh in memory.
  }
  return { ...DEFAULT_STATE, hydrated: true };
}

function load(): Snapshot {
  lastRaw = read();
  return parse(lastRaw);
}

function save(s: CourageState) {
  const raw = JSON.stringify(s);
  try {
    window.localStorage.setItem(KEY, raw);
    lastRaw = raw;
    saved = true;
  } catch {
    // Storage full or blocked: progress stays in memory for this visit.
    saved = false;
  }
}

function snapshot(): Snapshot {
  if (!current) current = load();
  return current;
}

const notify = () => listeners.forEach((l) => l());

/**
 * Another tab (or window) saved: show its progress here too. The browser
 * only sends this to the other tabs, never the one that saved.
 */
function onStorage(e: StorageEvent) {
  if (e.key !== KEY && e.key !== null) return;
  current = load();
  notify();
}

function subscribe(fn: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/**
 * The state an action starts from. Normally what this tab holds, but if
 * another tab saved since, its newer progress is read first, so an older tab
 * can never save over it (and drop steps or badges).
 */
function latest(): Snapshot {
  const mine = snapshot();
  if (!saved) return mine;
  const raw = read();
  if (raw === lastRaw) return mine;
  current = load();
  return current;
}

export function useCourage(): Snapshot {
  return useSyncExternalStore(subscribe, snapshot, () => SERVER);
}

/** Applies a pure action from state.ts, saves, notifies. Returns badge ids earned by this action. */
export function act(
  fn: (s: CourageState) => CourageState | { state: CourageState; newlyEarned: string[] },
): string[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hydrated: _hydrated, ...base } = latest();
  const out = fn(base);
  const next = "state" in out ? out.state : out;
  const earned = "state" in out ? out.newlyEarned : [];
  current = { ...next, hydrated: true };
  save(next);
  notify();
  return earned;
}

/** Delete everything on this device. Recordings (IndexedDB) are cleared by the recordings module in a later plan. */
export function clearEverything(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to remove.
  }
  lastRaw = null;
  saved = true;
  current = { ...DEFAULT_STATE, hydrated: true };
  notify();
}
