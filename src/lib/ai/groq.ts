import { z } from "zod";

/**
 * Groq's free plan (OpenAI-compatible API). Groq does not keep request data
 * by default, and Zero Data Retention is also turned on in the Groq console.
 * Nothing here logs what people said.
 */
const CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
export const GROQ_MODEL = "openai/gpt-oss-20b";
export const GROQ_WHISPER = "whisper-large-v3-turbo";

/** Groq's limit for today or this minute is used up. */
export class GroqLimitError extends Error {}
export class GroqError extends Error {}

export type GroqDeps = { key: string; fetch: typeof fetch; model?: string };

/** Strict JSON schema mode needs every property required and closed objects. */
function strictSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  const close = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.type === "object" && n.properties && typeof n.properties === "object") {
      n.required = Object.keys(n.properties);
      n.additionalProperties = false;
      Object.values(n.properties).forEach(close);
    }
    if (n.items) close(n.items);
  };
  close(json);
  return json;
}

async function send(deps: GroqDeps, url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await deps.fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { Authorization: `Bearer ${deps.key}`, ...(init.headers as Record<string, string> | undefined) },
    });
    if (res.status === 429) throw new GroqLimitError("Groq limit reached");
    if (!res.ok) throw new GroqError(`Groq returned ${res.status}`);
    return res;
  } catch (err) {
    if (err instanceof GroqLimitError || err instanceof GroqError) throw err;
    throw new GroqError(err instanceof Error ? err.name : "Groq request failed");
  } finally {
    clearTimeout(timer);
  }
}

/** One short JSON answer from the chat model, checked against `schema`. */
export async function groqJson<T>(
  system: string,
  user: string,
  name: string,
  schema: z.ZodType<T>,
  deps: GroqDeps,
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {},
): Promise<T> {
  const res = await send(
    deps,
    CHAT_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: deps.model ?? GROQ_MODEL,
        temperature: opts.temperature ?? 0.5,
        reasoning_effort: "low",
        max_completion_tokens: opts.maxTokens ?? 400,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_schema", json_schema: { name, strict: true, schema: strictSchema(schema) } },
      }),
    },
    opts.timeoutMs ?? 6_000,
  );
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new GroqError("Groq returned no content");
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new GroqError("Groq returned invalid JSON");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new GroqError("Groq output did not match");
  return parsed.data;
}

/** Transcribes one short recording with Whisper (the free plan counts each request as at least 10 seconds). */
export async function groqTranscribe(audio: Blob, filename: string, deps: GroqDeps): Promise<string> {
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", GROQ_WHISPER);
  form.append("language", "en");
  form.append("response_format", "json");
  form.append("temperature", "0");
  const res = await send(deps, TRANSCRIBE_URL, { method: "POST", body: form }, 15_000);
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}
