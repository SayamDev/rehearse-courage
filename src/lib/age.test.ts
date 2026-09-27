import { describe, expect, test } from "vitest";
import { aiAllowed, effectiveAge, serverSpeechAllowed, words } from "./age";

describe("age rules", () => {
  test("skipped age counts as under 13", () => {
    expect(effectiveAge(null)).toBe("under13");
  });

  test("AI only for 13 and over", () => {
    expect(aiAllowed(null)).toBe(false);
    expect(aiAllowed("under13")).toBe(false);
    expect(aiAllowed("teen")).toBe(true);
    expect(aiAllowed("adult")).toBe(true);
  });

  test("server speech to text only for 13 and over", () => {
    expect(serverSpeechAllowed(null)).toBe(false);
    expect(serverSpeechAllowed("under13")).toBe(false);
    expect(serverSpeechAllowed("teen")).toBe(true);
  });

  test("words picks the kid version for under 13 and skipped age", () => {
    const w = { kid: "short", grown: "longer words" };
    expect(words(w, null)).toBe("short");
    expect(words(w, "under13")).toBe("short");
    expect(words(w, "teen")).toBe("longer words");
    expect(words(w, "adult")).toBe("longer words");
  });
});
