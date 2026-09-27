import { describe, expect, test, vi } from "vitest";
import { checkOutputLocal, checkReply, cleanReply, guardReply, parseGuard, type AiBinding } from "./output";

describe("cleanReply", () => {
  test("turns dashes into commas and exclamation marks into full stops", () => {
    expect(cleanReply("Great idea — I like it!")).toBe("Great idea, I like it.");
    expect(cleanReply("Nice – really!!")).toBe("Nice, really.");
  });

  test("strips markdown, wrapping quotes and extra spaces", () => {
    expect(cleanReply('  "**That** is   a _good_ point."  ')).toBe("That is a good point.");
  });
});

describe("checkOutputLocal", () => {
  const ok = (t: string, kind: "coach" | "tidy" = "coach", input = "") => checkOutputLocal(t, kind, "adult", input).ok;

  test("allows a kind, in-character reply", () => {
    expect(ok("Thanks, that is a really good answer. What made you think of it?")).toBe(true);
  });

  test.each([
    ["", "empty"],
    ["Calm down, it is fine.", "banned"],
    ["You've got this.", "banned"],
    ["Don't be nervous about it.", "banned"],
    ["Try not to stutter next time.", "speech"],
    ["You said um a lot.", "speech"],
    ["That was very fluent.", "speech"],
    ["Try to speak more clearly.", "speech"],
    ["It sounds like you have anxiety.", "health"],
    ["A therapist could help with that.", "health"],
    ["What is your name?", "personal"],
    ["Which school do you go to?", "personal"],
    ["Send me a photo of it.", "personal"],
    ["Have a look at www.example.com for more.", "link"],
    ["Email me at a@b.co", "email"],
    ["Call 0800 123 4567 to talk.", "phone"],
    ["That is shit.", "profanity"],
    ["You should kill yourself.", "crisis"],
    ["Maybe hurt yourself a little.", "crisis"],
    ["You could try some alcohol first.", "crisis"],
  ])("rejects %j (%s)", (text, reason) => {
    expect(checkOutputLocal(text, "coach", "adult")).toEqual({ ok: false, reason });
  });

  test("does not flag ordinary words that contain a short banned word", () => {
    expect(ok("I love reading Dickens too. That sounds relaxing.")).toBe(true);
  });

  test("teen replies have a shorter limit than adult ones", () => {
    const long = "That is a lovely thing to share with the class. ".repeat(5).trim();
    expect(long.length).toBeGreaterThan(220);
    expect(long.length).toBeLessThan(320);
    expect(checkOutputLocal(long, "coach", "teen")).toEqual({ ok: false, reason: "long" });
    expect(checkOutputLocal(long, "coach", "adult").ok).toBe(true);
  });

  test("a tidy must stay close to the person's own words", () => {
    const input = "so um I think like the book was good because the ending was um surprising";
    expect(ok("I think the book was good because the ending was surprising.", "tidy", input)).toBe(true);
    expect(ok("Quantum physics explains the nature of reality in many ways.", "tidy", input)).toBe(false);
    expect(ok(`${"The book was good. ".repeat(12)}`, "tidy", "the book was good")).toBe(false);
  });
});

describe("Llama Guard", () => {
  test.each([
    [{ response: { safe: true } }, "safe"],
    [{ response: { safe: false, categories: ["S1"] } }, "unsafe"],
    [{ response: "safe" }, "safe"],
    [{ response: "unsafe\nS11" }, "unsafe"],
    [{ nothing: 1 }, "unavailable"],
    [null, "unavailable"],
  ])("parses %j as %s", (out, verdict) => {
    expect(parseGuard(out)).toBe(verdict);
  });

  test("a failing binding is unavailable, not safe", async () => {
    const ai: AiBinding = { run: () => Promise.reject(new Error("budget")) };
    expect(await guardReply(ai, "hi", "hello")).toBe("unavailable");
  });
});

describe("checkReply", () => {
  const opts = { kind: "coach" as const, age: "teen" as const, userText: "I think it is ten" };

  test("returns cleaned text when both checks pass", async () => {
    const ai: AiBinding = { run: vi.fn().mockResolvedValue({ response: { safe: true } }) };
    expect(await checkReply("Yes, ten is right — well done!", opts, { ai, takeGuard: () => true })).toBe(
      "Yes, ten is right, well done.",
    );
    expect(ai.run).toHaveBeenCalledOnce();
  });

  test("the local filter runs first and skips the guard when it fails", async () => {
    const ai: AiBinding = { run: vi.fn() };
    expect(await checkReply("Calm down.", opts, { ai, takeGuard: () => true })).toBeNull();
    expect(ai.run).not.toHaveBeenCalled();
  });

  test("an unsafe guard verdict replaces the reply", async () => {
    const ai: AiBinding = { run: vi.fn().mockResolvedValue({ response: "unsafe\nS10" }) };
    expect(await checkReply("Nice answer.", opts, { ai, takeGuard: () => true })).toBeNull();
  });

  test("with no guard budget or binding the local result stands", async () => {
    const ai: AiBinding = { run: vi.fn() };
    expect(await checkReply("Nice answer.", opts, { ai, takeGuard: () => false })).toBe("Nice answer.");
    expect(ai.run).not.toHaveBeenCalled();
    expect(await checkReply("Nice answer.", opts, { ai: null, takeGuard: () => true })).toBe("Nice answer.");
  });

  test("an unavailable guard keeps the locally checked reply", async () => {
    const ai: AiBinding = { run: vi.fn().mockRejectedValue(new Error("down")) };
    expect(await checkReply("Nice answer.", opts, { ai, takeGuard: () => true })).toBe("Nice answer.");
  });
});
