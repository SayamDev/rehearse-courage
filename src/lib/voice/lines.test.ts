import { describe, expect, test } from "vitest";
import { allLines, clipId, spokenText, VOICES } from "./lines";

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
    expect(lines.every((l) => l.voice.engine === "qwen")).toBe(true);
  });
});
