import { newBadges } from "./achievements";
import { daysBetween } from "./dates";
import { makeCustomStep } from "./ladder";
import { SPECIES } from "./companion";
import type { AgeBand, AppEvent, CustomStep, EventKind, HardThing, RoomId, Species, StepRecord } from "./types";

export type Settings = {
  reduceMotion: boolean;
  largeText: boolean;
  sounds: boolean;
  confetti: boolean;
  /** Off by default: no clocks unless the user asks. */
  timers: boolean;
  /** Off by default: recordings are only kept when the user opts in (Then vs Now). */
  keepRecordings: boolean;
};

export type CourageState = {
  version: 1;
  age: AgeBand | null;
  hardThings: HardThing[];
  companion: { species: Species; name: string } | null;
  records: StepRecord[];
  customSteps: CustomStep[];
  events: AppEvent[];
  earned: string[];
  lastSeen: string | null;
  cameBack: boolean;
  settings: Settings;
};

type Result = { state: CourageState; newlyEarned: string[] };

export const DEFAULT_STATE: CourageState = {
  version: 1,
  age: null,
  hardThings: [],
  companion: null,
  records: [],
  customSteps: [],
  events: [],
  earned: [],
  lastSeen: null,
  cameBack: false,
  settings: { reduceMotion: false, largeText: false, sounds: true, confetti: true, timers: false, keepRecordings: false },
};

const AGES: AgeBand[] = ["under13", "teen", "adult"];
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Fills in anything missing so older saves and restored backups keep working. */
export function normalize(raw: unknown): CourageState {
  if (!raw || typeof raw !== "object") return DEFAULT_STATE;
  const p = raw as Partial<CourageState>;
  const companion =
    p.companion && SPECIES.some((s) => s.id === p.companion?.species) && typeof p.companion.name === "string"
      ? p.companion
      : null;
  return {
    version: 1,
    age: AGES.includes(p.age as AgeBand) ? (p.age as AgeBand) : null,
    hardThings: arr<HardThing>(p.hardThings),
    companion,
    records: arr<StepRecord>(p.records),
    customSteps: arr<CustomStep>(p.customSteps),
    events: arr<AppEvent>(p.events),
    earned: arr<string>(p.earned),
    lastSeen: typeof p.lastSeen === "string" ? p.lastSeen : null,
    cameBack: p.cameBack === true,
    settings: { ...DEFAULT_STATE.settings, ...(p.settings ?? {}) },
  };
}

function withBadges(state: CourageState): Result {
  const fresh = newBadges(state.earned, state);
  return { state: fresh.length ? { ...state, earned: [...state.earned, ...fresh] } : state, newlyEarned: fresh };
}

export function setAge(s: CourageState, age: AgeBand | null): CourageState {
  return { ...s, age };
}

export function setHardThings(s: CourageState, hard: HardThing[]): CourageState {
  return { ...s, hardThings: [...new Set(hard)] };
}

export function setCompanion(s: CourageState, species: Species, name: string): CourageState {
  const clean = name.trim().slice(0, 24) || (SPECIES.find((x) => x.id === species)?.name ?? "Friend");
  return { ...s, companion: { species, name: clean } };
}

export function recordStep(s: CourageState, r: StepRecord): Result {
  return withBadges({ ...s, records: [...s.records, r] });
}

export function addCustomStep(s: CourageState, room: RoomId, text: string, now: Date): Result {
  return withBadges({ ...s, customSteps: [...s.customSteps, makeCustomStep(room, text, now)] });
}

export function logEvent(s: CourageState, kind: EventKind, now: Date): Result {
  return withBadges({ ...s, events: [...s.events, { kind, at: now.toISOString() }] });
}

/** Called when the app opens. A gap of 7 or more days is celebrated, never punished. */
export function visit(s: CourageState, now: Date): Result {
  const gap = s.lastSeen ? daysBetween(new Date(s.lastSeen), now) : 0;
  return withBadges({ ...s, lastSeen: now.toISOString(), cameBack: s.cameBack || gap >= 7 });
}

export function updateSettings(s: CourageState, patch: Partial<Settings>): CourageState {
  return { ...s, settings: { ...s.settings, ...patch } };
}
