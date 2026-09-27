import { describe, expect, test, vi } from "vitest";
import { audioFilename, handleCoach, handleTidy, handleTranscribe, MAX_AUDIO_BYTES } from "./handlers";
import { createLimits, SITE_CAPS } from "./limits";
import type { ProviderDeps } from "./provider";

const SAME = { "sec-fetch-site": "same-origin", "cf-connecting-ip": "198.51.100.7" };

function post(path: string, body: unknown, headers: Record<string, string> = SAME) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return new Request(`https://courage.test${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "content-length": String(new TextEncoder().encode(text).length), ...headers },
    body: text,
  });
}

/** A multipart request with the Content-Length a browser would send. */
async function multipart(f: FormData, headers: Record<string, string> = SAME) {
  const draft = new Request("https://courage.test/api/transcribe", { method: "POST", body: f });
  const bytes = await draft.arrayBuffer();
  return new Request("https://courage.test/api/transcribe", {
    method: "POST",
    headers: { "content-type": draft.headers.get("content-type") ?? "", "content-length": String(bytes.byteLength), ...headers },
    body: bytes,
  });
}

function groq(content: Record<string, string> | number) {
  return vi.fn(async (url: string | URL | Request) => {
    if (typeof content === "number") return new Response("{}", { status: content });
    if (String(url).includes("audio")) return Response.json({ text: content.text });
    return Response.json({ choices: [{ message: { content: JSON.stringify(content) } }] });
  });
}

function deps(fetch = groq({ reply: "Ten. Nice thinking." }), visitor = { coach: 5, tidy: 5, transcribe: 5 }): ProviderDeps {
  return { groq: { key: "k", fetch }, ai: null, limits: createLimits(visitor, SITE_CAPS) };
}

const COACH = { age: "teen", situationId: "class-answer", room: "class", answer: "I think it is ten" };

describe("/api/coach", () => {
  test("answers a teen with a checked reply built from the pre-written scene and question", async () => {
    const fetch = groq({ reply: "Ten. Nice thinking." });
    const res = await handleCoach(post("/api/coach", COACH), deps(fetch));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ reply: "Ten. Nice thinking.", source: "groq" });
    const sent = JSON.parse(String((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(sent.messages[1].content).toContain("a question for the room");
  });

  test.each([{ ...COACH, age: "under13" }, { ...COACH, age: undefined }, { ...COACH, age: null }, "not json"])(
    "refuses under 13, a skipped age and anything unexpected (%j) without calling AI",
    async (body) => {
      const fetch = groq({ reply: "x" });
      const res = await handleCoach(post("/api/coach", body), deps(fetch));
      expect(res.status).toBe(403);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  test("refuses a body that is too large or has no declared length, without reading it", async () => {
    const big = post("/api/coach", { ...COACH, answer: "a".repeat(9000) });
    expect((await handleCoach(big, deps())).status).toBe(413);
    const unsized = new Request("https://courage.test/api/coach", { method: "POST", headers: SAME, body: JSON.stringify(COACH) });
    expect((await handleCoach(unsized, deps())).status).toBe(413);
  });

  test("a crisis in the person's own step text skips AI", async () => {
    const fetch = groq({ reply: "x" });
    const body = { ...COACH, situationId: "custom-x", scene: "Tell them I want to kill myself" };
    expect(await (await handleCoach(post("/api/coach", body), deps(fetch))).json()).toEqual({ reply: null, crisis: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  test("refuses other sites", async () => {
    const res = await handleCoach(post("/api/coach", COACH, { "sec-fetch-site": "cross-site" }), deps());
    expect(res.status).toBe(403);
  });

  test("rejects a bad body", async () => {
    expect((await handleCoach(post("/api/coach", { ...COACH, answer: "" }), deps())).status).toBe(400);
    expect((await handleCoach(post("/api/coach", { ...COACH, answer: "a".repeat(601) }), deps())).status).toBe(400);
    expect((await handleCoach(post("/api/coach", { ...COACH, room: "kitchen" }), deps())).status).toBe(400);
  });

  test("a crisis in the answer skips AI", async () => {
    const fetch = groq({ reply: "x" });
    const res = await handleCoach(post("/api/coach", { ...COACH, answer: "honestly I want to die" }), deps(fetch));
    expect(await res.json()).toEqual({ reply: null, crisis: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  test("the person's own step sends its own scene", async () => {
    const fetch = groq({ reply: "Sure, here it is." });
    const body = { ...COACH, situationId: "custom-abc", room: "friends", scene: "Ask the librarian for a book." };
    await handleCoach(post("/api/coach", body), deps(fetch));
    const sent = JSON.parse(String((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(sent.messages[1].content).toContain("Ask the librarian for a book.");
    expect(sent.messages[0].content).toContain("a friend in a small, friendly group");
    expect((await handleCoach(post("/api/coach", { ...body, scene: undefined }), deps())).status).toBe(400);
  });

  test("past the visitor's daily share, the browser uses its own reply", async () => {
    const d = deps(groq({ reply: "Hi." }), { coach: 1, tidy: 1, transcribe: 1 });
    await handleCoach(post("/api/coach", COACH), d);
    expect(await (await handleCoach(post("/api/coach", COACH), d)).json()).toEqual({ reply: null, reason: "limit" });
  });

  test("a failing provider gives null, not an error", async () => {
    expect(await (await handleCoach(post("/api/coach", COACH), deps(groq(500)))).json()).toEqual({ reply: null });
  });
});

describe("/api/tidy", () => {
  test("tidies for adults", async () => {
    const res = await handleTidy(
      post("/api/tidy", { age: "adult", text: "so um I think the book was um good" }),
      deps(groq({ tidy: "I think the book was good." })),
    );
    expect(await res.json()).toEqual({ tidy: "I think the book was good.", source: "groq" });
  });

  test("refuses under 13 and checks for crisis first", async () => {
    const fetch = groq({ tidy: "x" });
    expect((await handleTidy(post("/api/tidy", { age: "under13", text: "hello" }), deps(fetch))).status).toBe(403);
    const res = await handleTidy(post("/api/tidy", { age: "teen", text: "I want to kill myself" }), deps(fetch));
    expect(await res.json()).toEqual({ tidy: null, crisis: true });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("/api/transcribe", () => {
  function form(age: string | null, size = 2000, seconds = "4") {
    const f = new FormData();
    if (age) f.append("age", age);
    f.append("seconds", seconds);
    f.append("audio", new Blob([new Uint8Array(size)], { type: "audio/webm;codecs=opus" }), "a.webm");
    return multipart(f);
  }

  test("returns the transcript for a teen", async () => {
    const res = await handleTranscribe(await form("teen"), deps(groq({ text: "it is ten" })));
    expect(await res.json()).toEqual({ text: "it is ten" });
  });

  test("never transcribes for under 13 or a skipped age", async () => {
    const fetch = groq({ text: "x" });
    expect((await handleTranscribe(await form("under13"), deps(fetch))).status).toBe(403);
    expect((await handleTranscribe(await form(null), deps(fetch))).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  test("rejects empty or oversized audio", async () => {
    expect((await handleTranscribe(await form("adult", 0), deps())).status).toBe(400);
    expect((await handleTranscribe(await form("adult", MAX_AUDIO_BYTES + 1), deps())).status).toBe(400);
    expect((await handleTranscribe(await form("adult", MAX_AUDIO_BYTES + 100 * 1024), deps())).status).toBe(413);
  });

  test("counts the audio's real length, not only what the browser claims", async () => {
    const limits = createLimits({ coach: 5, tidy: 5, transcribe: 5 }, { ...SITE_CAPS, groqAudioSeconds: 60 });
    const fetch = groq({ text: "hello" });
    // 400 KB is about 100 seconds of speech, even though the form says 0.
    const res = await handleTranscribe(await form("adult", 400_000, "0"), { groq: { key: "k", fetch }, ai: null, limits });
    expect(await res.json()).toEqual({ text: null });
    expect(fetch).not.toHaveBeenCalled();
  });

  test("flags a crisis in what was said", async () => {
    const res = await handleTranscribe(await form("adult"), deps(groq({ text: "I want to die" })));
    expect(await res.json()).toEqual({ text: "I want to die", crisis: true });
  });

  test("silence is null", async () => {
    expect(await (await handleTranscribe(await form("adult"), deps(groq({ text: "Thank you." })))).json()).toEqual({ text: null });
  });

  test("names the file by its type", () => {
    expect(audioFilename("audio/mp4")).toBe("answer.mp4");
    expect(audioFilename("audio/ogg;codecs=opus")).toBe("answer.ogg");
    expect(audioFilename("audio/webm")).toBe("answer.webm");
  });
});
