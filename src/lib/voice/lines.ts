import { ACCEPTANCE_LINES, BODY_EXPLAINERS, BREATH_CUES, FOR_REAL_LINE, GROUNDING_STEPS, REFRAME_CARDS, SPEECH_TOOLS, STEP_DONE_LINE } from "@/lib/content/body";
import { COACH_FALLBACK, COACH_LINES, PRESSURE_CUES, PRESSURE_LINES } from "@/lib/content/coach";
import { COACH_REPLIES } from "@/lib/content/coach-replies";
import { RESCUE_PHRASES } from "@/lib/content/phrases";
import { SITUATIONS } from "@/lib/content/situations";
import { DARES } from "@/lib/content/dares";
import { READY_LINES } from "@/lib/content/ready";
import { BALLOON_CUES, BUILD_SENTENCES, DESCRIBE_HINTS, HOT_SEAT, KEEP_GOING, SAY_LINES, SNAP_ROUNDS, STORY_STARTS } from "@/lib/games";
import type { RoomId, Words } from "@/lib/types";

/**
 * Who says a line. The room decides who is talking to you at step 4: the
 * teacher in class, a friend with friends, the group's host when presenting.
 * A classmate (or another friend, or someone in the audience) joins at
 * step 5. The narrator reads everything else (scenes, ideas, missions,
 * phrases, the Body kit and the games).
 */
export type Role = "teacher" | "friend" | "host" | "narrator" | "classmate";

/** Kids hear the kid wording, child-sounding friends and a slightly slower pace. */
export type VoiceSet = "kids" | "grown";

/** British English (the default) or American English voices, chosen in Me. */
export type Accent = "uk" | "us";
export const ACCENTS: { value: Accent; label: string }[] = [
  { value: "uk", label: "British" },
  { value: "us", label: "American" },
];

/**
 * One voice. Every voice is Qwen3-TTS (VoiceDesign) run through VoiceStudio
 * on the maker's Mac: free, natural, and designed from a plain description
 * (`describe`). The maker listened to the cast before recording.
 */
export type Voice = { id: string; engine: "kokoro" | "omnivoice" | "qwen"; name: string; describe?: string; instruct?: string; seed?: number };

const qwen = (name: string, describe: string): Voice => ({ id: `qwen:${name}`, engine: "qwen", name, describe });

type Cast = Record<VoiceSet, Voice>;
const same = (v: Voice): Cast => ({ kids: v, grown: v });

function cast(accent: "British" | "American", tag: "uk" | "us"): Record<Role, Cast> {
  return {
    narrator: same(qwen(`narrator-${tag}`, `A warm, calm ${accent} woman in her thirties, speaking naturally and gently at an easy pace.`)),
    teacher: same(qwen(`teacher-${tag}`, `A friendly, encouraging ${accent} female teacher in her forties, clear and kind, with a natural classroom tone.`)),
    host: same(qwen(`host-${tag}`, `A relaxed, friendly ${accent} man in his thirties, warm and natural, hosting a small group.`)),
    friend: {
      kids: qwen(`friend-child-${tag}`, `A cheerful ten-year-old ${accent} girl, natural and friendly, talking to a classmate.`),
      grown: qwen(`friend-young-${tag}`, `A friendly ${accent} woman in her early twenties, casual and natural, chatting with a friend.`),
    },
    classmate: {
      kids: qwen(`classmate-child-${tag}`, `A cheerful ten-year-old ${accent} boy, natural and friendly.`),
      grown: qwen(`classmate-young-${tag}`, `A friendly ${accent} man in his early twenties, casual and natural.`),
    },
  };
}

/** The cast, by accent. */
export const VOICES: Record<Accent, Record<Role, Cast>> = { uk: cast("British", "uk"), us: cast("American", "us") };

export function voiceFor(role: Role, set: VoiceSet, accent: Accent = "uk"): Voice {
  return VOICES[accent][role][set];
}

/** Kids hear pre-recorded lines about 10% slower (pitch kept). */
export const KIDS_RATE = 0.9;

export const ROOM_ROLE: Record<RoomId, Role> = { class: "teacher", friends: "friend", presenting: "host", out: "host" };

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

export type Line = { role: Role; set: VoiceSet; accent: Accent; voice: Voice; text: string; id: string };

const plain = (s: string): Words => ({ kid: s, grown: s });

/** Every fixed line the app reads aloud, as [role, wording] pairs. */
function script(): [Role, Words][] {
  const out: [Role, Words][] = [];
  const say = (role: Role, ...ws: Words[]) => ws.forEach((w) => out.push([role, w]));
  for (const s of SITUATIONS) {
    say("narrator", s.scene, s.mission, ...s.ideas);
    const coach = COACH_LINES[s.id];
    if (coach) say(ROOM_ROLE[s.room], coach);
  }
  for (const room of Object.keys(COACH_REPLIES) as RoomId[]) {
    say(ROOM_ROLE[room], COACH_FALLBACK, ...COACH_REPLIES[room]);
    say("narrator", PRESSURE_LINES[room]);
    for (const c of PRESSURE_CUES[room]) say(c.role, c.text);
  }
  say("narrator", ...RESCUE_PHRASES.map((p) => p.text), ...RESCUE_PHRASES.map((p) => p.when));
  // Body kit.
  say("narrator", ...GROUNDING_STEPS.map((g) => plain(g.hint)), plain(BREATH_CUES.in), plain(BREATH_CUES.out), plain(STEP_DONE_LINE), plain(FOR_REAL_LINE));
  say("narrator", ...ACCEPTANCE_LINES, ...SPEECH_TOOLS.map((t) => t.how), ...SPEECH_TOOLS.flatMap((t) => t.practice.map(plain)));
  for (const kind of ["blushing", "sweating"] as const) {
    say("narrator", ...BODY_EXPLAINERS[kind], ...REFRAME_CARDS[kind].flatMap((c) => [c.thought, c.tryThis]));
  }
  // Games.
  say("narrator", ...HOT_SEAT, ...SNAP_ROUNDS.map((r) => r.moment), ...BUILD_SENTENCES, ...STORY_STARTS.map(plain), ...Object.values(BALLOON_CUES).map(plain));
  say("narrator", ...SAY_LINES, ...DESCRIBE_HINTS, ...KEEP_GOING.flatMap((k) => k.ideas));
  say("friend", ...KEEP_GOING.map((k) => k.says));
  // Tiny dares and Right before.
  say("narrator", ...DARES.map((d) => d.text), READY_LINES.wobbly, READY_LINES.go);
  return out;
}

/**
 * Every fixed line in every voice it can be heard in (both wordings, both
 * accents), deduplicated by clip. The recording script records these; the
 * app plays a clip when one exists and otherwise falls back to the
 * on-device voices.
 */
export function allLines(): Line[] {
  const out: Line[] = [];
  for (const accent of ["uk", "us"] as Accent[]) {
    for (const [role, w] of script()) {
      for (const set of ["kids", "grown"] as VoiceSet[]) {
        const voice = voiceFor(role, set, accent);
        const text = spokenText(set === "kids" ? w.kid : w.grown);
        out.push({ role, set, accent, voice, text, id: clipId(voice, text) });
      }
    }
  }
  const seen = new Set<string>();
  return out.filter((l) => (seen.has(l.id) ? false : (seen.add(l.id), true)));
}
