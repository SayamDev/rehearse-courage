import { newBadges } from "./achievements";
import { daysBetween } from "./dates";
import { MAX_CUSTOM, makeCustomStep } from "./ladder";
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

export type Theme = "system" | "light" | "dark";

/** Root text size: 100%, 115%, 130% (DESIGN.md). */
export type TextSize = "normal" | "large" | "larger";

export type Settings = {
  reduceMotion: boolean;
  textSize: TextSize;
  sounds: boolean;
  confetti: boolean;
  /** Off by default: no clocks unless the user asks. */
  timers: boolean;
  /** Off by default: recordings are only kept when the user opts in (Then vs Now). */
  keepRecordings: boolean;
  theme: Theme;
  /** On by default, but only ever used at 13 and over: Cobi's live replies, tidy and speech to text online. */
  onlineHelp: boolean;
  /** Off by default: the person downloaded the small AI model to this device and chose to use it. */
  deviceModel: boolean;
  /** "Don't show this again" on the keep-your-progress-safe pop-up. */
  saveNudgeOff: boolean;
  /** On by default: the coach's line and Cobi's reply play when they appear (Hear it replays them). */
  playCoach: boolean;
  /** Off by default: read lines a little slower (kids already hear them about 10% slower). */
  slowerVoice: boolean;
};

export type CourageState = {
  version: 1;
  age: AgeBand | null;
  hardThings: HardThing[];
  companion: { species: Species; name: string } | null;
  /** What the person wants to be called (optional). Shown on Me and Home; never sent anywhere. */
  name: string | null;
  /** The name question has been asked (first visit or the one-time pop-up), whatever the answer. */
  nameAsked: boolean;
  records: StepRecord[];
  customSteps: CustomStep[];
  events: AppEvent[];
  earned: string[];
  lastSeen: string | null;
  cameBack: boolean;
  /** The welcome guide has been seen (closing it in any way counts). */
  welcomed: boolean;
  /** When a backup file was last saved from Me or the pop-up. */
  lastBackup: string | null;
  /** The natural-voice download has been offered once by its pop-up, whatever the answer. */
  voiceOffered: boolean;
  settings: Settings;
};

type Result = { state: CourageState; newlyEarned: string[] };

export const DEFAULT_STATE: CourageState = {
  version: 1,
  age: null,
  hardThings: [],
  companion: null,
  name: null,
  nameAsked: false,
  records: [],
  customSteps: [],
  events: [],
  earned: [],
  lastSeen: null,
  cameBack: false,
  welcomed: false,
  lastBackup: null,
  voiceOffered: false,
  settings: {
    reduceMotion: false,
    textSize: "normal",
    sounds: true,
    confetti: true,
    timers: false,
    keepRecordings: false,
    theme: "system",
    onlineHelp: true,
    deviceModel: false,
    saveNudgeOff: false,
    playCoach: true,
    slowerVoice: false,
  },
};

const AGES: AgeBand[] = ["under13", "teen", "adult"];
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isParseableDate = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v));
const dedupe = <T>(items: T[]): T[] => [...new Set(items)];

/** Companion name rule shared by normalize and setCompanion: trim, cap at 24 chars, fall back to species name. */
/** Longest name kept: a first name or nickname is plenty. */
export const MAX_NAME = 30;

/** Trims and tidies a typed name; blank means no name. Control characters are dropped. */
export function cleanPersonName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME).trim();
  return name || null;
}

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
    isParseableDate(v.createdAt)
  );
}

function normalizeCustomStep(v: CustomStep): CustomStep {
  return { ...v, text: v.text.trim().slice(0, MAX_CUSTOM) };
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

const KNOWN_BOOLEAN_SETTINGS: Exclude<keyof Settings, "theme" | "textSize">[] = [
  "reduceMotion",
  "sounds",
  "confetti",
  "timers",
  "keepRecordings",
  "onlineHelp",
  "deviceModel",
  "saveNudgeOff",
  "playCoach",
  "slowerVoice",
];

const THEMES: Theme[] = ["system", "light", "dark"];
const TEXT_SIZES: TextSize[] = ["normal", "large", "larger"];

function normalizeSettings(v: unknown): Settings {
  const raw = isObject(v) ? v : {};
  const settings = { ...DEFAULT_STATE.settings };
  for (const key of KNOWN_BOOLEAN_SETTINGS) {
    if (typeof raw[key] === "boolean") settings[key] = raw[key];
  }
  if (THEMES.includes(raw.theme as Theme)) settings.theme = raw.theme as Theme;
  // Older saves had a single largeText switch (115%).
  if (TEXT_SIZES.includes(raw.textSize as TextSize)) settings.textSize = raw.textSize as TextSize;
  else if (raw.largeText === true) settings.textSize = "large";
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
    name: cleanPersonName(p.name),
    nameAsked: p.nameAsked === true || cleanPersonName(p.name) !== null,
    records: arr<unknown>(p.records).filter(isValidRecord),
    customSteps: arr<unknown>(p.customSteps).filter(isValidCustomStep).map(normalizeCustomStep),
    events: arr<unknown>(p.events).filter(isValidEvent),
    earned: dedupe(arr<unknown>(p.earned).filter((v): v is string => typeof v === "string")),
    lastSeen: isParseableDate(p.lastSeen) ? p.lastSeen : null,
    cameBack: p.cameBack === true,
    // Saves from before the welcome guide existed: anyone who already practised has found their way.
    welcomed: p.welcomed === true || (p.welcomed === undefined && arr<unknown>(p.records).length > 0),
    lastBackup: isParseableDate(p.lastBackup) ? p.lastBackup : null,
    voiceOffered: p.voiceOffered === true,
    settings: normalizeSettings(p.settings),
  };
}

function withBadges(state: CourageState): Result {
  const fresh = newBadges(state.earned, state);
  return { state: fresh.length ? { ...state, earned: [...state.earned, ...fresh] } : state, newlyEarned: fresh };
}

/** Saves (or, with blank or null, removes) the person's name. Either way the question counts as asked. */
export function setName(s: CourageState, name: string | null): CourageState {
  return { ...s, name: cleanPersonName(name), nameAsked: true };
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

export function markWelcomed(s: CourageState): CourageState {
  return s.welcomed ? s : { ...s, welcomed: true };
}

export function markBackedUp(s: CourageState, now: Date): CourageState {
  return { ...s, lastBackup: now.toISOString() };
}

export function updateSettings(s: CourageState, patch: Partial<Settings>): CourageState {
  return { ...s, settings: { ...s.settings, ...patch } };
}

/** The voice pop-up had its one turn. */
export function markVoiceOffered(s: CourageState): CourageState {
  return { ...s, voiceOffered: true };
}
