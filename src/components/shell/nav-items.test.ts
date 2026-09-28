import { describe, expect, test } from "vitest";
import { NAV_ITEMS, activeNav } from "./bottom-nav";

describe("activeNav", () => {
  test.each([
    ["/", "/"],
    ["/map", "/map"],
    ["/room/class", "/map"],
    ["/step/class-answer", "/map"],
    ["/kit", "/kit"],
    ["/badges", "/badges"],
    ["/journey", "/badges"],
    ["/me", "/me"],
    ["/help", ""],
  ])("%s -> %s", (pathname, expected) => {
    expect(activeNav(pathname)).toBe(expected);
  });
});

describe("NAV_ITEMS", () => {
  test("has five items in order Home, Map, Kit, Badges, Me", () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual(["Home", "Map", "Kit", "Badges", "Me"]);
    expect(NAV_ITEMS.map((i) => i.href)).toEqual(["/", "/map", "/kit", "/badges", "/me"]);
  });

  test("every item has an icon component", () => {
    for (const item of NAV_ITEMS) {
      expect(item.icon).toBeDefined();
    }
  });
});
