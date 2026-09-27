import { checkReply, type AiAge, type AiBinding, type ReplyKind } from "@/lib/safety/output";
import type { RoomId } from "@/lib/types";
import { groqJson, groqTranscribe, type GroqDeps } from "./groq";
import type { Limits } from "./limits";
import { coachSystem, coachUser, tidySystem, tidyUser } from "./prompts";
import { CoachOutput, TidyOutput } from "./schemas";
import { workersChat, workersTranscribe } from "./workers";

/**
 * Provider order for people aged 13 and over:
 * 1. Groq (free plan, zero data retention).
 * 2. Cloudflare Workers AI (free allocation, through the binding).
 * Every reply then passes the output check. When nothing can answer, the
 * result is null and the browser uses the on-device model or a
 * pre-written reply, so the app always works.
 */
export type ProviderDeps = { groq: GroqDeps | null; ai: AiBinding | null; limits: Limits };
export type Source = "groq" | "workers";
export type AiResult = { text: string; source: Source } | null;

/** Never log what people said: only which provider failed and the error's kind. */
function note(what: string, err: unknown) {
  console.warn(`${what} failed:`, err instanceof Error ? err.constructor.name : "unknown");
}

async function ask(
  deps: ProviderDeps,
  prompt: { system: string; user: string; name: string; kind: ReplyKind; age: AiAge; userText: string },
  pick: (raw: unknown) => string | null,
): Promise<AiResult> {
  const check = (raw: string) =>
    checkReply(raw, prompt, { ai: deps.ai, takeGuard: () => deps.limits.takeSiteBudget("workersGuard") });

  let raw: string | null = null;
  let source: Source | null = null;

  if (deps.groq && deps.limits.takeSiteBudget("groqChat")) {
    try {
      const schema = prompt.kind === "coach" ? CoachOutput : TidyOutput;
      raw = pick(await groqJson<unknown>(prompt.system, prompt.user, prompt.name, schema, deps.groq, { maxTokens: 700 }));
      source = "groq";
    } catch (err) {
      note("groq", err);
    }
  }

  if (raw === null && deps.ai && deps.limits.takeSiteBudget("workersChat")) {
    try {
      raw = pick(await workersChat(deps.ai, prompt.system, prompt.user));
      source = "workers";
    } catch (err) {
      note("workers", err);
    }
  }

  if (raw === null || source === null) return null;
  // A reply that fails the check is not retried elsewhere: the pre-written reply is used instead.
  const text = await check(raw);
  return text ? { text, source } : null;
}

export function coachReply(
  req: { age: AiAge; room: RoomId; scene: string; prompt: string; answer: string },
  deps: ProviderDeps,
): Promise<AiResult> {
  return ask(
    deps,
    {
      system: coachSystem(req.age, req.room),
      user: coachUser(req.scene, req.prompt, req.answer),
      name: "coach_reply",
      kind: "coach",
      age: req.age,
      userText: req.answer,
    },
    (raw) => {
      const p = CoachOutput.safeParse(raw);
      return p.success ? p.data.reply : null;
    },
  );
}

export function tidySentence(req: { age: AiAge; text: string }, deps: ProviderDeps): Promise<AiResult> {
  return ask(
    deps,
    { system: tidySystem(req.age), user: tidyUser(req.text), name: "tidy_sentence", kind: "tidy", age: req.age, userText: req.text },
    (raw) => {
      const p = TidyOutput.safeParse(raw);
      return p.success ? p.data.tidy : null;
    },
  );
}

/** What Whisper tends to "hear" in silence. */
const SILENCE = /^\s*(thank you( so much| for watching)?|thanks( for watching)?|you|bye|okay|so)?[\s.!,]*$/i;

export function cleanTranscript(text: string): string | null {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t || SILENCE.test(t)) return null;
  return t;
}

export async function transcribeAudio(
  audio: Blob,
  filename: string,
  seconds: number,
  deps: ProviderDeps,
): Promise<{ text: string; source: Source } | null> {
  if (
    deps.groq &&
    deps.limits.takeSiteBudget("groqTranscribe") &&
    deps.limits.takeSiteBudget("groqAudioSeconds", Math.max(10, Math.ceil(seconds)))
  ) {
    try {
      const text = cleanTranscript(await groqTranscribe(audio, filename, deps.groq));
      return text ? { text, source: "groq" } : null;
    } catch (err) {
      note("groq transcribe", err);
    }
  }
  if (deps.ai && deps.limits.takeSiteBudget("workersWhisper")) {
    try {
      const text = cleanTranscript(await workersTranscribe(deps.ai, audio));
      return text ? { text, source: "workers" } : null;
    } catch (err) {
      note("workers transcribe", err);
    }
  }
  return null;
}
