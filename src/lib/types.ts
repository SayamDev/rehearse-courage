export type AgeBand = "under13" | "teen" | "adult";

/** Text written twice: simpler for under 13, fuller for everyone else. */
export type Words = { kid: string; grown: string };

export type RoomId = "class" | "friends" | "presenting" | "out";

/** 1 think, 2 type or whisper, 3 say alone, 4 say to coach, 5 a little pressure, 6 real-life mission. */
export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export type HardThing =
  | "class"
  | "friends"
  | "presenting"
  | "out"
  | "panic"
  | "blushing"
  | "stuttering"
  | "words"
  | "focus";

export const HARD_THINGS: HardThing[] = [
  "class",
  "friends",
  "presenting",
  "out",
  "panic",
  "blushing",
  "stuttering",
  "words",
  "focus",
];

export const ROOM_IDS: RoomId[] = ["class", "friends", "presenting", "out"];

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

/**
 * Things done outside a practice step. "dare" is today's tiny dare done for
 * real, "ready" is Right before (a quick warm-up just before the moment),
 * and "notYet" is choosing Not yet at step 6, which still counts.
 */
export type EventKind = "kit" | "rescue" | "thenNow" | "panic" | "game" | "dare" | "ready" | "notYet";

export const EVENT_KINDS: EventKind[] = ["kit", "rescue", "thenNow", "panic", "game", "dare", "ready", "notYet"];

/** `detail` says which one, where it matters: the game, the dare or the situation. */
export type AppEvent = { kind: EventKind; at: string; detail?: string };

/** How a real-life try felt, if the person wanted to say. */
export type Feeling = "easier" | "expected" | "hard";

export const FEELINGS: Feeling[] = ["easier", "expected", "hard"];

/**
 * A proud moment: a real-life try at step 6, kept on the device for the
 * person's journey. The note is only saved when they choose to add one.
 */
export type ProudMoment = { situationId: string; at: string; outcome: "did" | "tried"; feel: Feeling | null; note: string | null };
