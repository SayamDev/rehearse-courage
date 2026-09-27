import { describe, expect, test, vi } from "vitest";
import type { AiBinding } from "@/lib/safety/output";
import { GUARD_MODEL } from "@/lib/safety/output";
import { clientKey, sameOrigin } from "./guard";
import { createLimits, SITE_CAPS, VISITOR_LIMITS } from "./limits";
import { cleanTranscript, coachReply, tidySentence, transcribeAudio, type ProviderDeps } from "./provider";
import { firstJsonObject, WORKERS_CHAT_MODEL, WORKERS_WHISPER_MODEL } from "./workers";

const COACH = { age: "teen" as const, room: "class" as const, scene: "A class.", prompt: "Any answers?", answer: "I think it is ten" };

/** A fetch that answers Groq chat with this reply (or a status code). */
function groqFetch(reply: string | number) {
  return vi.fn(async (url: string | URL | Request) => {
    if (typeof reply === "number") return new Response("{}", { status: reply });
    if (String(url).includes("audio/transcriptions")) return Response.json({ text: reply });
    return Response.json({ choices: [{ message: { content: JSON.stringify({ reply, tidy: reply }) } }] });
  });
}

/** A Workers AI binding: chat answers `chat`, the guard answers `guard`, Whisper answers `whisper`. */
function binding({ chat = "", guard = { response: { safe: true } } as unknown, whisper = "" } = {}) {
  return {
    run: vi.fn(async (model: string) => {
      if (model === GUARD_MODEL) return guard;
      if (model === WORKERS_WHISPER_MODEL) return { text: whisper };
      if (model === WORKERS_CHAT_MODEL) return { response: chat };
      throw new Error("unknown model");
    }),
  } satisfies AiBinding;
}

function deps(over: Partial<ProviderDeps> = {}): ProviderDeps {
  return { groq: null, ai: null, limits: createLimits(), ...over };
}

describe("provider order", () => {
  test("Groq answers first, and its reply is cleaned and guarded", async () => {
    const ai = binding({ chat: '{"reply":"Workers"}' });
    const fetch = groqFetch("Yes, ten is right — nice!");
    const out = await coachReply(COACH, deps({ groq: { key: "k", fetch }, ai }));
    expect(out).toEqual({ text: "Yes, ten is right, nice.", source: "groq" });
    expect(ai.run).toHaveBeenCalledTimes(1);
    expect(ai.run.mock.calls[0][0]).toBe(GUARD_MODEL);
    const body = JSON.parse(String((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.model).toBe("openai/gpt-oss-20b");
    expect(body.messages[1].content).toContain("I think it is ten");
  });

  test("falls back to Workers AI when Groq is rate limited or fails", async () => {
    for (const status of [429, 500]) {
      const ai = binding({ chat: 'Sure: {"reply":"Ten, good thinking."}' });
      const out = await coachReply(COACH, deps({ groq: { key: "k", fetch: groqFetch(status) }, ai }));
      expect(out).toEqual({ text: "Ten, good thinking.", source: "workers" });
    }
  });

  test("with no key, the binding alone is used; with neither, the result is null", async () => {
    const ai = binding({ chat: '{"reply":"Nice."}' });
    expect(await coachReply(COACH, deps({ ai }))).toEqual({ text: "Nice.", source: "workers" });
    expect(await coachReply(COACH, deps())).toBeNull();
  });

  test("a reply that fails the output check becomes null and is not retried", async () => {
    const ai = binding({ chat: '{"reply":"Other."}' });
    const out = await coachReply(COACH, deps({ groq: { key: "k", fetch: groqFetch("Calm down, it is fine.") }, ai }));
    expect(out).toBeNull();
    expect(ai.run).not.toHaveBeenCalled();
  });

  test("an unsafe guard verdict becomes null", async () => {
    const ai = binding({ guard: { response: "unsafe\nS1" } });
    expect(await coachReply(COACH, deps({ groq: { key: "k", fetch: groqFetch("Nice answer.") }, ai }))).toBeNull();
  });

  test("when the guard's daily share is used up, replies still get the local filter", async () => {
    const limits = createLimits(VISITOR_LIMITS, { ...SITE_CAPS, workersGuard: 0 });
    const ai = binding();
    expect(await coachReply(COACH, { groq: { key: "k", fetch: groqFetch("Nice answer.") }, ai, limits })).toEqual({
      text: "Nice answer.",
      source: "groq",
    });
    expect(await coachReply(COACH, { groq: { key: "k", fetch: groqFetch("You got this.") }, ai, limits })).toBeNull();
    expect(ai.run).not.toHaveBeenCalled();
  });

  test("site budgets are respected", async () => {
    const limits = createLimits(VISITOR_LIMITS, { ...SITE_CAPS, groqChat: 0, workersChat: 0 });
    const fetch = groqFetch("Nice.");
    const ai = binding({ chat: '{"reply":"Nice."}' });
    expect(await coachReply(COACH, { groq: { key: "k", fetch }, ai, limits })).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(ai.run).not.toHaveBeenCalled();
  });

  test("tidy keeps the person's own words", async () => {
    const input = "so um I think the book was um good";
    const ok = await tidySentence({ age: "adult", text: input }, deps({ groq: { key: "k", fetch: groqFetch("I think the book was good.") } }));
    expect(ok).toEqual({ text: "I think the book was good.", source: "groq" });
    const drift = await tidySentence(
      { age: "adult", text: input },
      deps({ groq: { key: "k", fetch: groqFetch("Paris is the capital city of France.") } }),
    );
    expect(drift).toBeNull();
  });
});

describe("transcription", () => {
  const audio = new Blob([new Uint8Array(2000)], { type: "audio/webm" });

  test("Groq Whisper first, then Workers AI Whisper", async () => {
    expect(await transcribeAudio(audio, "a.webm", 5, deps({ groq: { key: "k", fetch: groqFetch("hello there") } }))).toEqual({
      text: "hello there",
      source: "groq",
    });
    const ai = binding({ whisper: "hi from workers" });
    expect(await transcribeAudio(audio, "a.webm", 5, deps({ groq: { key: "k", fetch: groqFetch(429) }, ai }))).toEqual({
      text: "hi from workers",
      source: "workers",
    });
  });

  test("counts at least ten seconds of audio against the daily share", async () => {
    const limits = createLimits(VISITOR_LIMITS, { ...SITE_CAPS, groqAudioSeconds: 15 });
    const fetch = groqFetch("one");
    await transcribeAudio(audio, "a.webm", 2, { groq: { key: "k", fetch }, ai: null, limits });
    expect(await transcribeAudio(audio, "a.webm", 2, { groq: { key: "k", fetch }, ai: null, limits })).toBeNull();
    expect(fetch).toHaveBeenCalledOnce();
  });

  test.each(["Thank you.", "Thanks for watching!", "you", "  ", "..."])("treats %j as silence", (t) => {
    expect(cleanTranscript(t)).toBeNull();
  });

  test("keeps real words, including repeated starts", () => {
    expect(cleanTranscript("  I I think  it is ten ")).toBe("I I think it is ten");
  });
});

describe("limits", () => {
  test("each visitor has a daily share that resets the next day", () => {
    const l = createLimits({ coach: 2, tidy: 1, transcribe: 1 }, SITE_CAPS);
    const day1 = new Date("2026-09-27T10:00:00Z");
    expect(l.takeToken("coach", "a", day1)).toBe(true);
    expect(l.takeToken("coach", "a", day1)).toBe(true);
    expect(l.takeToken("coach", "a", day1)).toBe(false);
    expect(l.takeToken("coach", "b", day1)).toBe(true);
    expect(l.takeToken("coach", "a", new Date("2026-09-28T00:00:01Z"))).toBe(true);
  });
});

describe("request guards", () => {
  const req = (headers: Record<string, string>) => new Request("https://courage.test/api/coach", { method: "POST", headers });

  test("same-origin only", () => {
    expect(sameOrigin(req({ "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(sameOrigin(req({ "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(sameOrigin(req({ origin: "https://courage.test", host: "courage.test" }))).toBe(true);
    expect(sameOrigin(req({ origin: "https://evil.test", host: "courage.test" }))).toBe(false);
    expect(sameOrigin(req({}))).toBe(false);
  });

  test("the rate-limit key is a keyed daily hash, never the address", async () => {
    const day1 = new Date("2026-09-27T10:00:00Z");
    const a = await clientKey(req({ "cf-connecting-ip": "203.0.113.9" }), day1);
    expect(await clientKey(req({ "cf-connecting-ip": "203.0.113.9" }), day1)).toBe(a);
    expect(await clientKey(req({ "cf-connecting-ip": "203.0.113.10" }), day1)).not.toBe(a);
    const b = await clientKey(req({ "cf-connecting-ip": "203.0.113.9" }), new Date("2026-09-28T10:00:00Z"));
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    expect(a).not.toBe(b);
    // A plain hash of ip and date would be guessable; this one uses a secret that only lives in memory.
    const plain = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("203.0.113.9|2026-09-27")));
    expect(a).not.toBe(Array.from(plain.slice(0, 8), (x) => x.toString(16).padStart(2, "0")).join(""));
  });

  test("a forwarded-for header cannot choose the key", async () => {
    const day = new Date("2026-09-27T10:00:00Z");
    expect(await clientKey(req({ "x-forwarded-for": "1.1.1.1" }), day)).toBe(await clientKey(req({ "x-forwarded-for": "2.2.2.2" }), day));
  });
});

describe("firstJsonObject", () => {
  test("finds JSON inside chatty text", () => {
    expect(firstJsonObject('Here you go: {"reply":"Hi."} Thanks')).toEqual({ reply: "Hi." });
    expect(firstJsonObject("no json")).toBeNull();
  });
});
