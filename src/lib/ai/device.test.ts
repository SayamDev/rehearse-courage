import { describe, expect, test } from "vitest";
import { isMetered, MODEL_F16, MODEL_F32, pickModel } from "./device";

describe("on-device model", () => {
  test("uses the half-precision model only where the graphics chip supports it", () => {
    expect(pickModel(true)).toBe(MODEL_F16);
    expect(pickModel(false)).toBe(MODEL_F32);
  });

  test.each([
    [undefined, false],
    [{ type: "wifi" }, false],
    [{ effectiveType: "4g" }, false],
    [{ saveData: true }, true],
    [{ type: "cellular" }, true],
    [{ effectiveType: "2g" }, true],
  ])("connection %j is metered: %s", (conn, metered) => {
    expect(isMetered(conn)).toBe(metered);
  });
});
