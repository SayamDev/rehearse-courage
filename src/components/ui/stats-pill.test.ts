import { describe, expect, test } from "vitest";
import { braveDaysLabel, pointsLabel } from "./stats-pill";

describe("braveDaysLabel", () => {
  test("singular for one", () => {
    expect(braveDaysLabel(1)).toBe("1 brave day this week");
  });

  test("plural for other counts", () => {
    expect(braveDaysLabel(3)).toBe("3 brave days this week");
    expect(braveDaysLabel(0)).toBe("0 brave days this week");
  });
});

describe("pointsLabel", () => {
  test("singular for one", () => {
    expect(pointsLabel(1)).toBe("1 courage point");
  });

  test("plural for other counts", () => {
    expect(pointsLabel(145)).toBe("145 courage points");
    expect(pointsLabel(0)).toBe("0 courage points");
  });
});
