import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

const ROUTES = [
  "/",
  "/start",
  "/map",
  "/room/class",
  "/step/class-answer?level=1",
  "/step/class-answer?level=3",
  "/step/class-answer?level=4",
  "/step/class-answer?level=6",
  "/kit",
  "/kit/breathing",
  "/kit/blushing",
  "/kit/rescue",
  "/kit/frames",
  "/kit/speech",
  "/badges",
  "/me",
  "/help",
  "/help?crisis=1&from=/map",
  "/privacy",
  "/games",
  "/games/hot-seat",
  "/games/story-dice",
  "/games/rescue-snap",
  "/games/word-builder",
  "/games/breath-balloon",
  "/games/say-it-like",
  "/games/describe-it",
  "/games/keep-it-going",
  "/room/out",
  "/step/out-order?level=5",
  "/journey",
  "/ready",
  "/ready?s=out-order",
  "/about",
  "/for-adults",
  "/offline",
  "/?calm=1",
  "/no-such-page",
];

for (const scheme of ["light", "dark"] as const) {
  for (const route of ROUTES) {
    test(`axe: ${route} (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await seed(page);
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      // /start is where a new person lands; everything else is checked as a returning person.
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
      expect(summary, summary.join("\n")).toEqual([]);
    });
  }
}
