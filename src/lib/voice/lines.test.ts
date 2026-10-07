import { readFileSync, existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { allLines, clipId, spokenText, VOICES, voiceFor, deliveryRate } from "./lines";

describe("voice lines", () => {
  test("every clip id is unique", () => {
    const ids = allLines().map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("ids are stable and ignore spacing, but change with the voice or the words", () => {
    const v = VOICES.uk.teacher.grown;
    expect(clipId(v, "Hello  there ")).toBe(clipId(v, "Hello there"));
    expect(clipId(v, "Hello there")).not.toBe(clipId(v, "Hello here"));
    expect(clipId(VOICES.uk.narrator.grown, "Hello there")).not.toBe(clipId(v, "Hello there"));
    expect(clipId(v, "Hello there")).toMatch(/^[0-9a-f]{8}$/);
  });

  test("friends sound younger for kids, adults sound the same for everyone", () => {
    expect(VOICES.uk.friend.kids.id).not.toBe(VOICES.uk.friend.grown.id);
    expect(VOICES.uk.teacher.kids.id).toBe(VOICES.uk.teacher.grown.id);
  });

  test("covers both wordings of the coach's lines and the rescue phrases", () => {
    const texts = new Set(allLines().map((l) => l.text));
    expect(texts.has(spokenText("Right, a question for the room. Does anyone have an answer?"))).toBe(true);
    expect(texts.has(spokenText("Here is my question for the class. Who can tell me the answer?"))).toBe(true);
    expect(texts.has("Can I come back to that?")).toBe(true);
  });

  test("every line is in British and American voices, and the games and Body kit are voiced", () => {
    const lines = allLines();
    const hot = lines.filter((l) => l.text === "What made you smile this week?");
    expect(new Set(hot.map((l) => l.accent))).toEqual(new Set(["uk", "us"]));
    expect(lines.some((l) => l.text === "Breathe in slowly.")).toBe(true);
    expect(lines.filter((l) => l.delivery !== "neutral").every((l) => l.voice.engine === "kokoro")).toBe(true);
  });

  test("new lines are in the script: situations, dares, Right before and the new games", () => {
    const texts = new Set(allLines().map((l) => l.text));
    expect(texts.has("Hi, what can I get for you?")).toBe(true);
    expect(texts.has("Thank someone and tell them why.")).toBe(true);
    expect(texts.has("You are ready enough. Go and give it a try.")).toBe(true);
    expect(texts.has("I went to the beach at the weekend.")).toBe(true);
    expect(allLines().some((l) => l.role === "friend" && l.text === "I made pancakes this morning.")).toBe(true);
  });
  test("all fixed activity lines have recordings in both accents", () => {
    const manifest = new Set(JSON.parse(readFileSync("public/voice/manifest.json", "utf8")).ids);
    for (const line of allLines().filter((l) => l.delivery !== "neutral")) {
      expect(manifest.has(line.id), `${line.accent}: ${line.text}`).toBe(true);
      expect(existsSync(`public/voice/${line.id}.m4a`)).toBe(true);
    }
  });

  test("the same sentence can be calm guidance or an everyday example", () => {
    const calm = voiceFor("narrator", "grown", "uk", "calm");
    const practice = voiceFor("narrator", "grown", "uk", "practice");
    expect(clipId(calm, "Take your time.")).not.toBe(clipId(practice, "Take your time."));
    expect(deliveryRate("calm")).toBeLessThan(deliveryRate("practice"));
    expect(deliveryRate("practice")).toBeLessThan(deliveryRate("game"));
  });

});
