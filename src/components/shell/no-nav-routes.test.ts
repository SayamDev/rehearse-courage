import { describe, expect, test } from "vitest";
import { NO_NAV_ROUTES, hidesNav } from "./no-nav-routes";

describe("hidesNav", () => {
  test("is true for every route listed in NO_NAV_ROUTES", () => {
    for (const route of NO_NAV_ROUTES) {
      expect(hidesNav(route)).toBe(true);
    }
  });

  test("is false for routes that keep the bottom nav", () => {
    expect(hidesNav("/")).toBe(false);
    expect(hidesNav("/map")).toBe(false);
    expect(hidesNav("/kit")).toBe(false);
    expect(hidesNav("/badges")).toBe(false);
    expect(hidesNav("/me")).toBe(false);
  });

  test("does not match by prefix", () => {
    expect(hidesNav("/start/extra")).toBe(false);
    expect(hidesNav("/starter")).toBe(false);
  });
});
