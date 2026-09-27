import type { AiBinding } from "@/lib/safety/output";

/**
 * Cloudflare Workers AI through the Worker's `AI` binding: no extra key,
 * and Cloudflare does not train on it. On the free plan, requests past the
 * daily free allocation fail instead of billing. Used when Groq cannot help.
 */
export const WORKERS_CHAT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
export const WORKERS_WHISPER_MODEL = "@cf/openai/whisper-large-v3-turbo";

export class WorkersError extends Error {}

/** Pulls the first JSON object out of a model's text answer. */
export function firstJsonObject(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** One short chat answer, parsed as JSON (the prompt asks for a JSON object). */
export async function workersChat(ai: AiBinding, system: string, user: string, maxTokens = 200): Promise<unknown> {
  let out: unknown;
  try {
    out = await ai.run(WORKERS_CHAT_MODEL, {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.5,
    });
  } catch (err) {
    throw new WorkersError(err instanceof Error ? err.name : "Workers AI failed");
  }
  const response = (out as { response?: unknown } | null)?.response;
  if (response && typeof response === "object") return response;
  if (typeof response !== "string") throw new WorkersError("Workers AI returned nothing");
  const parsed = firstJsonObject(response);
  if (parsed === null) throw new WorkersError("Workers AI returned no JSON");
  return parsed;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

/** Transcribes one short recording with Whisper on Workers AI. */
export async function workersTranscribe(ai: AiBinding, audio: Blob): Promise<string> {
  let out: unknown;
  try {
    const audioB64 = toBase64(new Uint8Array(await audio.arrayBuffer()));
    out = await ai.run(WORKERS_WHISPER_MODEL, { audio: audioB64, language: "en" });
  } catch (err) {
    throw new WorkersError(err instanceof Error ? err.name : "Workers AI transcription failed");
  }
  const text = (out as { text?: unknown } | null)?.text;
  if (typeof text !== "string") throw new WorkersError("Workers AI returned no text");
  return text.trim();
}
