import { SITUATIONS, situationById } from "./content/situations";
import { braveDaysTotal } from "./courage";
import { GAMES } from "./games";
import { mapLight } from "./ladder";
import { ROOM_IDS, type AppEvent, type CustomStep, type EventKind, type ProudMoment, type StepRecord } from "./types";

export type BadgeInput = {
  records: StepRecord[];
  customSteps: CustomStep[];
  events: AppEvent[];
  cameBack: boolean;
  proud?: ProudMoment[];
};

type Badge = { id: string; title: string; description: string; earned: (i: BadgeInput) => boolean };

const count = (events: AppEvent[], kind: EventKind) => events.filter((e) => e.kind === kind).length;
const roomOf = (id: string) => situationById(id)?.room;
const braveDays = (i: BadgeInput) => braveDaysTotal(i.records, i.events);
const gamesPlayed = (i: BadgeInput) => new Set(i.events.filter((e) => e.kind === "game" && e.detail).map((e) => e.detail)).size;

const RULES: Badge[] = [
  { id: "first-words", title: "First words", description: "You spoke out loud for the first time.", earned: (i) => i.records.some((r) => r.level >= 3 && !r.typed) },
  { id: "typed-first", title: "Typed it first", description: "You typed your answer. That counts.", earned: (i) => i.records.some((r) => r.typed) },
  { id: "hand-up", title: "Hand up", description: "You reached step 5 in class.", earned: (i) => i.records.some((r) => r.level >= 5 && roomOf(r.situationId) === "class") },
  { id: "said-anyway", title: "Said it anyway", description: "You spoke on a rough day.", earned: (i) => i.records.some((r) => r.roughDay && r.level >= 3 && !r.typed) },
  { id: "back-again", title: "Back again", description: "You came back after a break. Welcome back.", earned: (i) => i.cameBack },
  { id: "out-in-the-wild", title: "Out in the wild", description: "You tried it for real.", earned: (i) => i.records.some((r) => r.level === 6) },
  { id: "calm-captain", title: "Calm captain", description: "You used the body kit 10 times.", earned: (i) => count(i.events, "kit") >= 10 },
  { id: "rescue-ready", title: "Rescue ready", description: "You practised 5 rescue phrases.", earned: (i) => count(i.events, "rescue") >= 5 },
  {
    id: "room-explorer",
    title: "Room explorer",
    description: "You tried a step in every practice area.",
    earned: (i) => new Set(i.records.map((r) => roomOf(r.situationId)).filter(Boolean)).size >= ROOM_IDS.length,
  },
  { id: "my-own-step", title: "My own step", description: "You added a step of your own.", earned: (i) => i.customSteps.length > 0 },
  { id: "then-and-now", title: "Then and now", description: "You listened to how far you have come.", earned: (i) => count(i.events, "thenNow") > 0 },
  { id: "dawn", title: "Dawn", description: "Your whole map is lit.", earned: (i) => mapLight(i.records, SITUATIONS) >= 1 },
  { id: "tiny-dare", title: "Tiny dare", description: "You did a tiny dare, out in the real world.", earned: (i) => count(i.events, "dare") >= 1 },
  { id: "dare-collector", title: "Dare collector", description: "You did 10 tiny dares.", earned: (i) => count(i.events, "dare") >= 10 },
  { id: "ready-steady", title: "Ready, steady", description: "You got ready just before a real moment.", earned: (i) => count(i.events, "ready") >= 1 },
  { id: "not-yet", title: "Not yet counts", description: "You were honest that today was not the day. That is brave too.", earned: (i) => count(i.events, "notYet") >= 1 },
  { id: "proud-moment", title: "Proud moment", description: "You looked back on a real-life try.", earned: (i) => (i.proud ?? []).length >= 1 },
  { id: "game-explorer", title: "Game explorer", description: "You tried every warm-up game.", earned: (i) => gamesPlayed(i) >= GAMES.length },
  { id: "brave-3", title: "Three brave days", description: "You had 3 brave days. Any days count.", earned: (i) => braveDays(i) >= 3 },
  { id: "brave-7", title: "Seven brave days", description: "You had 7 brave days. They add up, and never reset.", earned: (i) => braveDays(i) >= 7 },
  { id: "brave-30", title: "Thirty brave days", description: "You had 30 brave days.", earned: (i) => braveDays(i) >= 30 },
  { id: "brave-100", title: "A hundred brave days", description: "You had 100 brave days. Look how far you have come.", earned: (i) => braveDays(i) >= 100 },
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
