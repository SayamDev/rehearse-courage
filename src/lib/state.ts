import { newBadges } from "./achievements";
import { daysBetween } from "./dates";
import { makeCustomStep } from "./ladder";
import { SPECIES } from "./companion";
import {
  EVENT_KINDS,
  HARD_THINGS,
  ROOM_IDS,
  type AgeBand,
  type AppEvent,
  type CustomStep,
  type EventKind,
  type HardThing,
  type RoomId,
  type Species,
  type StepRecord,
} from "./types";

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
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isParseableDate = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v));
const dedupe = <T>(items: T[]): T[] => [...new Set(items)];

/** Companion name rule shared by normalize and setCompanion: trim, cap at 24 chars, fall back to species name. */
function cleanCompanionName(species: Species, name: string): string {
  return name.trim().slice(0, 24) || (SPECIES.find((x) => x.id === species)?.name ?? "Friend");
}

function isValidRecord(v: unknown): v is StepRecord {
  if (!isObject(v)) return false;
  const level = v.level;
  return (
    typeof v.situationId === "string" &&
    typeof level === "number" &&
    Number.isInteger(level) &&
    level >= 1 &&
    level <= 6 &&
    isParseableDate(v.at) &&
    (v.seconds === null || (typeof v.seconds === "number" && Number.isFinite(v.seconds) && v.seconds >= 0)) &&
    typeof v.typed === "boolean" &&
    typeof v.roughDay === "boolean"
  );
}

function isValidCustomStep(v: unknown): v is CustomStep {
  if (!isObject(v)) return false;
  return (
    typeof v.id === "string" &&
    (ROOM_IDS as string[]).includes(v.room as string) &&
    typeof v.text === "string" &&
    v.text.trim().length > 0 &&
    typeof v.createdAt === "string"
  );
}

function normalizeCustomStep(v: CustomStep): CustomStep {
  return { ...v, text: v.text.trim().slice(0, 140) };
}

function isValidEvent(v: unknown): v is AppEvent {
  if (!isObject(v)) return false;
  return (EVENT_KINDS as string[]).includes(v.kind as string) && isParseableDate(v.at);
}

function isValidHardThing(v: unknown): v is HardThing {
  return typeof v === "string" && (HARD_THINGS as string[]).includes(v);
}

function isValidCompanion(v: unknown): v is { species: Species; name: string } {
  return isObject(v) && SPECIES.some((s) => s.id === v.species) && typeof v.name === "string";
}

const KNOWN_BOOLEAN_SETTINGS: (keyof Settings)[] = [
  "reduceMotion",
  "largeText",
  "sounds",
  "confetti",
  "timers",
  "keepRecordings",
];

function normalizeSettings(v: unknown): Settings {
  const raw = isObject(v) ? v : {};
  const settings = { ...DEFAULT_STATE.settings };
  for (const key of KNOWN_BOOLEAN_SETTINGS) {
    if (typeof raw[key] === "boolean") settings[key] = raw[key];
  }
  return settings;
}

/** Fills in anything missing and drops anything invalid, so older saves and restored backups keep working. */
export function normalize(raw: unknown): CourageState {
  if (!raw || typeof raw !== "object") return DEFAULT_STATE;
  const p = raw as Partial<CourageState>;
  const companion = isValidCompanion(p.companion)
    ? { species: p.companion.species, name: cleanCompanionName(p.companion.species, p.companion.name) }
    : null;
  return {
    version: 1,
    age: AGES.includes(p.age as AgeBand) ? (p.age as AgeBand) : null,
    hardThings: dedupe(arr<unknown>(p.hardThings).filter(isValidHardThing)),
    companion,
    records: arr<unknown>(p.records).filter(isValidRecord),
    customSteps: arr<unknown>(p.customSteps).filter(isValidCustomStep).map(normalizeCustomStep),
    events: arr<unknown>(p.events).filter(isValidEvent),
    earned: dedupe(arr<unknown>(p.earned).filter((v): v is string => typeof v === "string")),
    lastSeen: isParseableDate(p.lastSeen) ? p.lastSeen : null,
    cameBack: p.cameBack === true,
    settings: normalizeSettings(p.settings),
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
  return { ...s, companion: { species, name: cleanCompanionName(species, name) } };
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
