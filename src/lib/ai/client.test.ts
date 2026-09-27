import { describe, expect, test, vi } from "vitest";
import { COACH_REPLIES, prewrittenReply, TIDY_UNAVAILABLE } from "@/lib/content/coach-replies";
import { checkOutputLocal } from "@/lib/safety/output";
import { ROOM_IDS, type AgeBand } from "@/lib/types";
import { canUseOnline, coachAnswer, tidyAnswer, transcribeAnswer, type ClientDeps } from "./client";

const state = (age: AgeBand | null, onlineHelp = true, deviceModel = false) => ({ age, settings: { onlineHelp, deviceModel } });
const REQ = { situationId: "class-answer", room: "class" as const, scene: "A class.", prompt: "Any answers?", answer: "It is ten", seed: "s" };

function deps(reply: Record<string, unknown> | null, device: ClientDeps["device"] = null): ClientDeps & { fetch: ReturnType<typeof vi.fn> } {
  const fetch = vi.fn(async () => (reply === null ? new Response("", { status: 500 }) : Response.json(reply)));
  return { fetch, device } as ClientDeps & { fetch: ReturnType<typeof vi.fn> };
}

describe("age gate on the device", () => {
  test.each([["under13"], [null]] as const)("%s never sends anything, and still gets a reply", async (age) => {
    const d = deps({ reply: "online", tidy: "online", text: "online" }, vi.fn(async () => '{"reply":"device"}'));
    const s = state(age, true, true);
    expect(canUseOnline(s)).toBe(false);
    const coach = await coachAnswer(s, REQ, d);
    expect(coach).toMatchObject({ kind: "reply", source: "prewritten" });
    expect(await tidyAnswer(s, "so um it is ten", d)).toEqual({ kind: "none" });
    expect(await transcribeAnswer(s, new Blob([new Uint8Array(4000)]), 3, d)).toEqual({ kind: "none" });
    expect(d.fetch).not.toHaveBeenCalled();
    expect(d.device).not.toHaveBeenCalled();
  });

  test("a teen with online help off sends nothing", async () => {
    const d = deps({ reply: "online" });
    expect(await coachAnswer(state("teen", false), REQ, d)).toMatchObject({ source: "prewritten" });
    expect(d.fetch).not.toHaveBeenCalled();
  });
});

describe("coachAnswer", () => {
  test("online first, sending the age band and answer but not a built-in scene", async () => {
    const d = deps({ reply: "Ten. Nice." });
    expect(await coachAnswer(state("teen"), REQ, d)).toEqual({ kind: "reply", text: "Ten. Nice.", source: "online" });
    const [path, init] = d.fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(path).toBe("/api/coach");
    expect(JSON.parse(String(init.body))).toEqual({ age: "teen", situationId: "class-answer", room: "class", answer: "It is ten" });
  });

  test("the person's own step sends its text as the scene", async () => {
    const d = deps({ reply: "Sure." });
    await coachAnswer(state("adult"), { ...REQ, situationId: "custom-1", scene: "Ask for a book." }, d);
    const [, init] = d.fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body)).scene).toBe("Ask for a book.");
  });

  test("a crisis is caught on the device before sending", async () => {
    const d = deps({ reply: "x" });
    expect(await coachAnswer(state("adult"), { ...REQ, answer: "I want to die" }, d)).toEqual({ kind: "crisis" });
    expect(d.fetch).not.toHaveBeenCalled();
  });

  test("a crisis flagged by the server is passed on", async () => {
    expect(await coachAnswer(state("adult"), REQ, deps({ reply: null, crisis: true }))).toEqual({ kind: "crisis" });
  });

  test("server null, then the device model, then pre-written", async () => {
    const device = vi.fn(async () => 'OK {"reply":"Ten — good one!"}');
    expect(await coachAnswer(state("adult", true, true), REQ, deps({ reply: null }, device))).toEqual({
      kind: "reply",
      text: "Ten, good one.",
      source: "device",
    });
    const unsafe = vi.fn(async () => '{"reply":"Calm down."}');
    expect(await coachAnswer(state("adult", true, true), REQ, deps(null, unsafe))).toMatchObject({ source: "prewritten" });
  });

  test("an empty answer (spoken but not transcribed) gets a pre-written reply without a request", async () => {
    const d = deps({ reply: "x" });
    expect(await coachAnswer(state("adult"), { ...REQ, answer: "  " }, d)).toMatchObject({ source: "prewritten" });
    expect(d.fetch).not.toHaveBeenCalled();
  });

  test("uses kid wording for under 13", async () => {
    const out = await coachAnswer(state("under13"), { ...REQ, seed: "x" }, deps(null));
    expect(out).toEqual({ kind: "reply", text: prewrittenReply("class", "x").kid, source: "prewritten" });
  });
});

describe("tidyAnswer and transcribeAnswer", () => {
  test("tidy online, device fallback, else none", async () => {
    expect(await tidyAnswer(state("teen"), "so it is um ten", deps({ tidy: "It is ten." }))).toEqual({
      kind: "tidy",
      text: "It is ten.",
      source: "online",
    });
    const device = vi.fn(async () => '{"tidy":"It is ten."}');
    expect(await tidyAnswer(state("teen", false, true), "so it is um ten", deps(null, device))).toMatchObject({ source: "device" });
    expect(await tidyAnswer(state("teen"), "so it is um ten", deps(null))).toEqual({ kind: "none" });
  });

  test("transcribe sends the age band and returns text, checking it for crisis", async () => {
    const audio = new Blob([new Uint8Array(4000)], { type: "audio/webm" });
    const d = deps({ text: "it is ten" });
    expect(await transcribeAnswer(state("adult"), audio, 3.4, d)).toEqual({ kind: "text", text: "it is ten" });
    const form = (d.fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as FormData;
    expect(form.get("age")).toBe("adult");
    expect(form.get("seconds")).toBe("3");
    expect(await transcribeAnswer(state("adult"), audio, 3, deps({ text: "i want to die" }))).toEqual({ kind: "crisis" });
    expect(await transcribeAnswer(state("adult"), new Blob([new Uint8Array(10)]), 3, deps({ text: "x" }))).toEqual({ kind: "none" });
  });
});

describe("pre-written content", () => {
  test("every reply passes the same output filter as AI replies", () => {
    for (const room of ROOM_IDS) {
      for (const r of COACH_REPLIES[room]) {
        for (const text of [r.kid, r.grown]) {
          expect(checkOutputLocal(text, "coach", "teen"), text).toEqual({ ok: true });
          expect(text).not.toMatch(/take your time/i);
        }
      }
    }
    expect(TIDY_UNAVAILABLE).not.toMatch(/[!—–]/);
  });

  test("different moments get different replies", () => {
    const seen = new Set(Array.from({ length: 20 }, (_, i) => prewrittenReply("class", `seed-${i}`).grown));
    expect(seen.size).toBeGreaterThan(1);
  });
});
