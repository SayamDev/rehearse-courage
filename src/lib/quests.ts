import { dayKey } from "./dates";
import type { AppEvent, StepRecord } from "./types";

export type Quest = { id: string; text: string; kind: "speak" | "type" | "rescue" | "kit"; target: number };

/** Small, optional daily ideas. Missing them changes nothing. */
export const QUEST_POOL: Quest[] = [
  { id: "speak-1", text: "Say one thing out loud", kind: "speak", target: 1 },
  { id: "speak-2", text: "Do two speaking steps", kind: "speak", target: 2 },
  { id: "type-1", text: "Type one answer", kind: "type", target: 1 },
  { id: "rescue-3", text: "Practise 3 rescue phrases", kind: "rescue", target: 3 },
  { id: "rescue-1", text: "Practise one rescue phrase", kind: "rescue", target: 1 },
  { id: "kit-1", text: "Try one calm-down tool", kind: "kit", target: 1 },
  { id: "kit-2", text: "Use a calm-down tool twice", kind: "kit", target: 2 },
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Same quests all day, different mix each day, no two of the same id. */
export function dailyQuests(day: string, count = 3): Quest[] {
  return [...QUEST_POOL]
    .map((q) => ({ q, k: hash(`${day}:${q.id}`) }))
    .sort((a, b) => a.k - b.k)
    .slice(0, count)
    .map(({ q }) => q);
}

export function questProgress(q: Quest, records: StepRecord[], events: AppEvent[], day: string): number {
  const today = (iso: string) => dayKey(new Date(iso)) === day;
  let done = 0;
  if (q.kind === "speak") done = records.filter((r) => today(r.at) && r.level >= 3 && !r.typed).length;
  if (q.kind === "type") done = records.filter((r) => today(r.at) && r.typed).length;
  if (q.kind === "rescue" || q.kind === "kit") done = events.filter((e) => today(e.at) && e.kind === q.kind).length;
  return Math.min(done, q.target);
}
