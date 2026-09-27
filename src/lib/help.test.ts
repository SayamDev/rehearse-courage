import { describe, expect, test } from "vitest";
import { contactHref, emergencyNumbers, safeReturn } from "./help";

describe("safeReturn", () => {
  test("allows same-site paths", () => {
    expect(safeReturn("/step/class-answer")).toBe("/step/class-answer");
    expect(safeReturn(["/room/class", "/x"])).toBe("/room/class");
  });

  test("rejects anything that could leave the site", () => {
    for (const bad of [
      undefined,
      "",
      "https://evil.test",
      "//evil.test",
      "/\\evil.test",
      "javascript:alert(1)",
      "/\t/evil.test",
      "/\n/evil.test",
      "/ /evil.test",
    ]) {
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

  test("call-or-text numbers are callable and text lines open a message", () => {
    expect(contactHref("Call or text 988")).toBe("tel:988");
    expect(contactHref("Call or text 1737")).toBe("tel:1737");
    expect(contactHref("Text SHOUT to 85258")).toBe("sms:85258?&body=SHOUT");
  });

  test("anything else stays as text", () => {
    expect(contactHref("Ask a trusted adult")).toBeNull();
  });
});

describe("emergencyNumbers", () => {
  test("splits numbers, leaves the text fallback alone", () => {
    expect(emergencyNumbers("999")).toEqual(["999"]);
    expect(emergencyNumbers("112 or 999")).toEqual(["112", "999"]);
    expect(emergencyNumbers("your local emergency number")).toEqual([]);
  });
});
