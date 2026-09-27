import { words } from "@/lib/age";
import { coachLine } from "@/lib/content/coach";
import { situationById } from "@/lib/content/situations";
import { checkCrisis } from "@/lib/safety/crisis";
import type { RoomId } from "@/lib/types";
import { clientKey, json, sameOrigin } from "./guard";
import { coachReply, tidySentence, transcribeAudio, type ProviderDeps } from "./provider";
import { AiAgeSchema, CoachBody, TidyBody } from "./schemas";

/**
 * The logic behind `/api/coach`, `/api/tidy` and `/api/transcribe`, kept
 * here so it is tested without a server. Every route: same origin only,
 * 13 and over only, crisis check before any AI, a daily share per visitor,
 * then the provider chain. `null` tells the browser to use its own fallback.
 */

export const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
export const MAX_AUDIO_SECONDS = 120;

const NOT_AVAILABLE = { error: "not-available" };

async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

/** Under 13, a skipped age question, or anything unexpected is refused before anything else is read. */
function ageAllowed(raw: unknown): boolean {
  return AiAgeSchema.safeParse((raw as { age?: unknown } | null)?.age).success;
}

export async function handleCoach(request: Request, deps: ProviderDeps): Promise<Response> {
  if (!sameOrigin(request)) return json(NOT_AVAILABLE, 403);
  const raw = await readJson(request);
  if (!ageAllowed(raw)) return json(NOT_AVAILABLE, 403);
  const parsed = CoachBody.safeParse(raw);
  if (!parsed.success) return json({ error: "bad-request" }, 400);
  const body = parsed.data;

  // Built-in steps use their own pre-written scene and question; the person's own steps send their text.
  const situation = situationById(body.situationId);
  const scene = situation ? words(situation.scene, body.age) : (body.scene ?? "");
  const room = (situation?.room ?? body.room) as RoomId;
  const prompt = words(coachLine(body.situationId), body.age);
  if (!scene) return json({ error: "bad-request" }, 400);

  if (checkCrisis(body.answer).crisis || checkCrisis(scene).crisis) return json({ reply: null, crisis: true });
  if (!deps.limits.takeToken("coach", await clientKey(request))) return json({ reply: null, reason: "limit" });

  const out = await coachReply({ age: body.age, room, scene, prompt, answer: body.answer }, deps);
  return json(out ? { reply: out.text, source: out.source } : { reply: null });
}

export async function handleTidy(request: Request, deps: ProviderDeps): Promise<Response> {
  if (!sameOrigin(request)) return json(NOT_AVAILABLE, 403);
  const raw = await readJson(request);
  if (!ageAllowed(raw)) return json(NOT_AVAILABLE, 403);
  const parsed = TidyBody.safeParse(raw);
  if (!parsed.success) return json({ error: "bad-request" }, 400);

  if (checkCrisis(parsed.data.text).crisis) return json({ tidy: null, crisis: true });
  if (!deps.limits.takeToken("tidy", await clientKey(request))) return json({ tidy: null, reason: "limit" });

  const out = await tidySentence(parsed.data, deps);
  return json(out ? { tidy: out.text, source: out.source } : { tidy: null });
}

/** Safari records MP4, Chrome and Firefox WebM or Ogg; the name tells Whisper which. */
export function audioFilename(type: string): string {
  if (/mp4|m4a|aac/.test(type)) return "answer.mp4";
  if (/ogg/.test(type)) return "answer.ogg";
  if (/wav/.test(type)) return "answer.wav";
  return "answer.webm";
}

export async function handleTranscribe(request: Request, deps: ProviderDeps): Promise<Response> {
  if (!sameOrigin(request)) return json(NOT_AVAILABLE, 403);
  const form = await request.formData().catch(() => null);
  if (!form || !AiAgeSchema.safeParse(form.get("age")).success) return json(NOT_AVAILABLE, 403);
  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0 || audio.size > MAX_AUDIO_BYTES) return json({ error: "bad-request" }, 400);
  const seconds = Math.min(MAX_AUDIO_SECONDS, Math.max(0, Number(form.get("seconds")) || 0));

  if (!deps.limits.takeToken("transcribe", await clientKey(request))) return json({ text: null, reason: "limit" });

  const out = await transcribeAudio(audio, audioFilename(audio.type), seconds, deps);
  if (!out) return json({ text: null });
  return json({ text: out.text, ...(checkCrisis(out.text).crisis ? { crisis: true } : {}) });
}
