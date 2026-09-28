export type AgeBand = "under13" | "teen" | "adult";

/** Text written twice: simpler for under 13, fuller for everyone else. */
export type Words = { kid: string; grown: string };

export type RoomId = "class" | "friends" | "presenting";

/** 1 think, 2 type or whisper, 3 say alone, 4 say to coach, 5 a little pressure, 6 real-life mission. */
export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export type HardThing =
  | "class"
  | "friends"
  | "presenting"
  | "panic"
  | "blushing"
  | "stuttering"
  | "words"
  | "focus";

export const HARD_THINGS: HardThing[] = [
  "class",
  "friends",
  "presenting",
  "panic",
  "blushing",
  "stuttering",
  "words",
  "focus",
];

export const ROOM_IDS: RoomId[] = ["class", "friends", "presenting"];

export type Species = "firefly" | "hedgehog" | "fox";

export type StepRecord = {
  /** Situation id or custom step id. */
  situationId: string;
  level: Level;
  /** ISO timestamp. */
  at: string;
  /** Seconds spoken, or null when typed or not measured. */
  seconds: number | null;
  typed: boolean;
  roughDay: boolean;
};

export type CustomStep = { id: string; room: RoomId; text: string; createdAt: string };

export type EventKind = "kit" | "rescue" | "thenNow" | "panic" | "game";

export const EVENT_KINDS: EventKind[] = ["kit", "rescue", "thenNow", "panic", "game"];

export type AppEvent = { kind: EventKind; at: string };
