import { aiAllowed, effectiveAge, words } from "@/lib/age";
import { prewrittenReply } from "@/lib/content/coach-replies";
import { situationById } from "@/lib/content/situations";
import { checkCrisis } from "@/lib/safety/crisis";
import { checkOutputLocal, cleanReply, type AiAge } from "@/lib/safety/output";
import type { AgeBand, RoomId } from "@/lib/types";
import { coachSystem, coachUser, tidySystem, tidyUser } from "./prompts";
import { CoachOutput, TidyOutput } from "./schemas";
import { firstJsonObject } from "./workers";

/**
 * The browser side of the AI. For under 13 (or a skipped age) nothing here
 * ever makes a request: every function answers from the device. For 13
 * and over, online help is used only while the setting is on, then the
 * on-device model if the person downloaded it, then a pre-written reply.
 * A crisis check runs on the device before anything is sent.
 */

type AiState = { age: AgeBand | null; settings: { onlineHelp: boolean; deviceModel: boolean } };

export function canUseOnline(s: AiState): boolean {
  return aiAllowed(s.age) && s.settings.onlineHelp;
}

export function canUseDevice(s: AiState): boolean {
  return aiAllowed(s.age) && s.settings.deviceModel;
}

/** Runs the on-device model with a system and user message; null when it cannot. */
export type DeviceAsk = (system: string, user: string) => Promise<string | null>;
export type ClientDeps = { fetch: typeof fetch; device: DeviceAsk | null; timeoutMs?: number };

const aiAge = (s: AiState) => effectiveAge(s.age) as AiAge;

async function post(deps: ClientDeps, path: string, body: BodyInit, json: boolean): Promise<Record<string, unknown> | null> {
  try {
    const res = await deps.fetch(path, {
      method: "POST",
      body,
      headers: json ? { "Content-Type": "application/json" } : undefined,
      signal: AbortSignal.timeout(deps.timeoutMs ?? 12_000),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function onDevice(deps: ClientDeps, system: string, user: string): Promise<unknown> {
  if (!deps.device) return null;
  try {
    const text = await deps.device(system, user);
    return text ? firstJsonObject(text) : null;
  } catch {
    return null;
  }
}

export type CoachAnswer = { kind: "reply"; text: string; source: "online" | "device" | "prewritten" } | { kind: "crisis" };

export async function coachAnswer(
  s: AiState,
  req: { situationId: string; room: RoomId; scene: string; prompt: string; answer: string; seed: string },
  deps: ClientDeps,
): Promise<CoachAnswer> {
  const answer = req.answer.trim().slice(0, 600);
  if (answer && checkCrisis(answer).crisis) return { kind: "crisis" };
  const fallback: CoachAnswer = { kind: "reply", text: words(prewrittenReply(req.room, req.seed), s.age), source: "prewritten" };
  if (!answer) return fallback;
  const age = aiAge(s);

  if (canUseOnline(s)) {
    const body = {
      age,
      situationId: req.situationId,
      room: req.room,
      // Built-in steps are looked up on the server; only the person's own step text is sent.
      scene: situationById(req.situationId) ? undefined : req.scene,
      answer,
    };
    const out = await post(deps, "/api/coach", JSON.stringify(body), true);
    if (out?.crisis === true) return { kind: "crisis" };
    if (typeof out?.reply === "string" && out.reply) return { kind: "reply", text: out.reply, source: "online" };
  }

  if (canUseDevice(s)) {
    const parsed = CoachOutput.safeParse(await onDevice(deps, coachSystem(age, req.room), coachUser(req.scene, req.prompt, answer)));
    if (parsed.success) {
      const text = cleanReply(parsed.data.reply);
      if (checkOutputLocal(text, "coach", age).ok) return { kind: "reply", text, source: "device" };
    }
  }

  return fallback;
}

export type TidyAnswer = { kind: "tidy"; text: string; source: "online" | "device" } | { kind: "crisis" } | { kind: "none" };

export async function tidyAnswer(s: AiState, raw: string, deps: ClientDeps): Promise<TidyAnswer> {
  const text = raw.trim().slice(0, 600);
  if (!text) return { kind: "none" };
  if (checkCrisis(text).crisis) return { kind: "crisis" };
  if (!aiAllowed(s.age)) return { kind: "none" };
  const age = aiAge(s);

  if (canUseOnline(s)) {
    const out = await post(deps, "/api/tidy", JSON.stringify({ age, text }), true);
    if (out?.crisis === true) return { kind: "crisis" };
    if (typeof out?.tidy === "string" && out.tidy) return { kind: "tidy", text: out.tidy, source: "online" };
  }

  if (canUseDevice(s)) {
    const parsed = TidyOutput.safeParse(await onDevice(deps, tidySystem(age), tidyUser(text)));
    if (parsed.success) {
      const tidy = cleanReply(parsed.data.tidy);
      if (checkOutputLocal(tidy, "tidy", age, text).ok) return { kind: "tidy", text: tidy, source: "device" };
    }
  }

  return { kind: "none" };
}

export type HeardAnswer = { kind: "text"; text: string } | { kind: "crisis" } | { kind: "none" };

/** What they said, as text, from one short recording. Only ever online, only at 13 and over with online help on. */
export async function transcribeAnswer(s: AiState, audio: Blob | null, seconds: number, deps: ClientDeps): Promise<HeardAnswer> {
  if (!canUseOnline(s) || !audio || audio.size < 1000) return { kind: "none" };
  const form = new FormData();
  form.append("age", aiAge(s));
  form.append("seconds", String(Math.round(seconds)));
  form.append("audio", audio, "answer");
  const out = await post(deps, "/api/transcribe", form, false);
  if (out?.crisis === true) return { kind: "crisis" };
  if (typeof out?.text !== "string" || !out.text) return { kind: "none" };
  return checkCrisis(out.text).crisis ? { kind: "crisis" } : { kind: "text", text: out.text };
}
