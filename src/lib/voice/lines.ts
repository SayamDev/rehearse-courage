import { COACH_FALLBACK, COACH_LINES, PRESSURE_CUES } from "@/lib/content/coach";
import { COACH_REPLIES } from "@/lib/content/coach-replies";
import { RESCUE_PHRASES } from "@/lib/content/phrases";
import { SITUATIONS } from "@/lib/content/situations";
import type { RoomId, Words } from "@/lib/types";

/**
 * Who says a line. The room decides who is talking to you at step 4: the
 * teacher in class, a friend with friends, the group's host when presenting.
 * The narrator reads everything else (the scene, ideas, missions, phrases).
 */
export type Role = "teacher" | "friend" | "host" | "narrator" | "classmate";

/** Kids hear the kid wording, a child-sounding friend and a slightly slower pace. */
export type VoiceSet = "kids" | "grown";

/** One voice: an engine and that engine's voice name. */
export type Voice = { id: string; engine: "kokoro" | "omnivoice"; name: string; instruct?: string; seed?: number };

const KOKORO = (name: string): Voice => ({ id: `kokoro:${name}`, engine: "kokoro", name });

/** Adult roles sound the same for everyone; only the friend changes with age. */
export const VOICES: Record<Role, Record<VoiceSet, Voice>> = {
  teacher: { kids: KOKORO("bf_emma"), grown: KOKORO("bf_emma") },
  host: { kids: KOKORO("am_michael"), grown: KOKORO("am_michael") },
  narrator: { kids: KOKORO("af_heart"), grown: KOKORO("af_heart") },
  friend: {
    kids: { id: "omni:friend-child", engine: "omnivoice", name: "friend-child", instruct: "female, child, british accent", seed: 7 },
    grown: { id: "omni:friend-young", engine: "omnivoice", name: "friend-young", instruct: "female, young adult, british accent", seed: 11 },
  },
  // Someone else in the room at step 5: a classmate, another friend, someone in the audience.
  classmate: {
    kids: { id: "omni:classmate-child", engine: "omnivoice", name: "classmate-child", instruct: "male, child, british accent", seed: 5 },
    grown: { id: "omni:classmate-young", engine: "omnivoice", name: "classmate-young", instruct: "male, young adult, british accent", seed: 9 },
  },
};

/** Kids hear pre-recorded lines about 10% slower (pitch kept). */
export const KIDS_RATE = 0.9;

export const ROOM_ROLE: Record<RoomId, Role> = { class: "teacher", friends: "friend", presenting: "host" };

/** FNV-1a, 32-bit: a short, stable id for a clip. */
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Text as it is spoken: whitespace tidied, so small edits to spacing keep the same clip. */
export function spokenText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** The clip for this voice saying this text. Changing either gives a new clip. */
export function clipId(voice: Voice, text: string): string {
  return hash(`${voice.id}|${spokenText(text)}`);
}

export type Line = { role: Role; set: VoiceSet; voice: Voice; text: string; id: string };

function line(role: Role, set: VoiceSet, text: string): Line {
  const voice = VOICES[role][set];
  return { role, set, voice, text: spokenText(text), id: clipId(voice, text) };
}

function both(role: Role, w: Words): Line[] {
  return [line(role, "kids", w.kid), line(role, "grown", w.grown)];
}

/**
 * Every fixed line the app can read aloud, in both wordings, deduplicated by
 * clip. The recording script records these; the app plays a clip when one
 * exists and otherwise falls back to the on-device voices.
 */
export function allLines(): Line[] {
  const out: Line[] = [];
  for (const s of SITUATIONS) {
    out.push(...both("narrator", s.scene), ...both("narrator", s.mission));
    for (const idea of s.ideas) out.push(...both("narrator", idea));
    const coach = COACH_LINES[s.id];
    if (coach) out.push(...both(ROOM_ROLE[s.room], coach));
  }
  for (const room of Object.keys(COACH_REPLIES) as RoomId[]) {
    out.push(...both(ROOM_ROLE[room], COACH_FALLBACK));
    for (const reply of COACH_REPLIES[room]) out.push(...both(ROOM_ROLE[room], reply));
  }
  for (const p of RESCUE_PHRASES) out.push(...both("narrator", p.text));
  for (const cues of Object.values(PRESSURE_CUES)) for (const c of cues) out.push(...both(c.role, c.text));
  const seen = new Set<string>();
  return out.filter((l) => (seen.has(l.id) ? false : (seen.add(l.id), true)));
}
