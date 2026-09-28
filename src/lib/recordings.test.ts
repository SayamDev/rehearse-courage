import { describe, expect, it } from "vitest";
import { slotFor, type Recording } from "./recordings";

describe("slotFor", () => {
  it("keeps the first recording and replaces only the latest after that", () => {
    const rec = {} as Recording;
    expect(slotFor({})).toBe("first");
    expect(slotFor({ first: rec })).toBe("latest");
    expect(slotFor({ first: rec, latest: rec })).toBe("latest");
  });
});
