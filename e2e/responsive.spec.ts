import { expect, test } from "@playwright/test";
import { RETURNING, seed } from "./helpers";

const ROUTES = [
  "/",
  "/map",
  "/room/class",
  "/step/class-answer?level=2",
  "/step/class-answer?level=5",
  "/kit",
  "/kit/rescue",
  "/kit/frames",
  "/kit/speech",
  "/badges",
  "/me",
  "/games",
  "/games/word-builder",
  "/games/story-dice",
  "/about",
  "/for-adults",
  "/help",
  "/journey",
  "/ready",
  "/ready?s=friends-join",
  "/room/out",
  "/games/say-it-like",
  "/games/keep-it-going",
];

// The narrowest phones and a portrait tablet: nothing may scroll sideways.
for (const width of [320, 768]) {
  test(`no page scrolls sideways at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    await seed(page, { ...RETURNING, name: "Alexandra-Marie" });
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `${route} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}
