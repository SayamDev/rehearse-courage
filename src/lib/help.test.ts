import { describe, expect, test } from "vitest";
import { contactHref, safeReturn } from "./help";

describe("safeReturn", () => {
  test("allows same-site paths", () => {
    expect(safeReturn("/step/class-answer")).toBe("/step/class-answer");
    expect(safeReturn(["/room/class", "/x"])).toBe("/room/class");
  });

  test("rejects anything that could leave the site", () => {
    for (const bad of [undefined, "", "https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)"]) {
      expect(safeReturn(bad)).toBeNull();
    }
  });
});

describe("contactHref", () => {
  test("phone numbers become tel links without spaces or dashes", () => {
    expect(contactHref("0800 1111")).toBe("tel:08001111");
    expect(contactHref("1-800-422-4453")).toBe("tel:18004224453");
  });

  test("a bare domain becomes a web link", () => {
    expect(contactHref("findahelpline.com")).toBe("https://findahelpline.com");
  });

  test("instructions stay as text", () => {
    expect(contactHref("Text SHOUT to 85258")).toBeNull();
    expect(contactHref("Call or text 988")).toBeNull();
  });
});
