import { SITUATIONS, situationById } from "./content/situations";
import { mapLight } from "./ladder";
import type { AppEvent, CustomStep, EventKind, StepRecord } from "./types";

export type BadgeInput = { records: StepRecord[]; customSteps: CustomStep[]; events: AppEvent[]; cameBack: boolean };

type Badge = { id: string; title: string; description: string; earned: (i: BadgeInput) => boolean };

const count = (events: AppEvent[], kind: EventKind) => events.filter((e) => e.kind === kind).length;
const roomOf = (id: string) => situationById(id)?.room;

const RULES: Badge[] = [
  { id: "first-words", title: "First words", description: "You spoke out loud for the first time.", earned: (i) => i.records.some((r) => r.level >= 3 && !r.typed) },
  { id: "typed-first", title: "Typed it first", description: "You typed before speaking. That counts.", earned: (i) => i.records.some((r) => r.typed) },
  { id: "hand-up", title: "Hand up", description: "You reached step 5 in class.", earned: (i) => i.records.some((r) => r.level >= 5 && roomOf(r.situationId) === "class") },
  { id: "said-anyway", title: "Said it anyway", description: "You spoke on a rough day.", earned: (i) => i.records.some((r) => r.roughDay && r.level >= 3 && !r.typed) },
  { id: "back-again", title: "Back again", description: "You came back after a break. Welcome back.", earned: (i) => i.cameBack },
  { id: "out-in-the-wild", title: "Out in the wild", description: "You tried it for real.", earned: (i) => i.records.some((r) => r.level === 6) },
  { id: "calm-captain", title: "Calm captain", description: "You used the body kit 10 times.", earned: (i) => count(i.events, "kit") >= 10 },
  { id: "rescue-ready", title: "Rescue ready", description: "You practised 5 rescue phrases.", earned: (i) => count(i.events, "rescue") >= 5 },
  {
    id: "room-explorer",
    title: "Room explorer",
    description: "You tried a step in every room.",
    earned: (i) => new Set(i.records.map((r) => roomOf(r.situationId)).filter(Boolean)).size >= 3,
  },
  { id: "my-own-step", title: "My own step", description: "You added a step of your own.", earned: (i) => i.customSteps.length > 0 },
  { id: "then-and-now", title: "Then and now", description: "You listened to how far you have come.", earned: (i) => count(i.events, "thenNow") > 0 },
  { id: "dawn", title: "Dawn", description: "Your whole map is lit.", earned: (i) => mapLight(i.records, SITUATIONS) >= 1 },
];

export const BADGES = RULES.map(({ id, title, description }) => ({ id, title, description }));

export function earnedBadges(input: BadgeInput): string[] {
  return RULES.filter((b) => b.earned(input)).map((b) => b.id);
}

/** Badges earned now that were not held before. Badges are never removed. */
export function newBadges(already: string[], input: BadgeInput): string[] {
  const held = new Set(already);
  return earnedBadges(input).filter((id) => !held.has(id));
}
