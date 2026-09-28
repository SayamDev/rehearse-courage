import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

test("body double: switch it on from a step, and the firefly stays beside you", async ({ page }) => {
  await seed(page);
  await page.goto("/step/class-answer?level=1");
  await page.getByRole("button", { name: "Practise with Glow beside you" }).click();
  await expect(page.getByText("Glow is practising too.")).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).settings.bodyDouble)).toBe(true);
  await page.getByRole("button", { name: "Stop practising with Glow" }).click();
  await expect(page.getByRole("button", { name: "Practise with Glow beside you" })).toBeVisible();
});

test("Then and now in Me explains how to start when recordings are off", async ({ page }) => {
  await seed(page);
  await page.goto("/me");
  await expect(page.getByRole("heading", { name: "Then and now" })).toBeVisible();
  await expect(page.getByText(/Turn on .Keep my recordings on this device/)).toBeVisible();
});

test("two tabs: an older tab never saves over newer progress, and sees it straight away", async ({ page, context }) => {
  await seed(page);
  await page.goto("/games/story-dice");
  const other = await context.newPage();
  await other.goto("/");
  await expect(other.getByRole("heading", { name: "This week" })).toBeVisible();

  // The first tab finishes a step while the second is open on Home.
  await page.goto("/step/class-answer?level=1");
  await page.getByRole("button", { name: "I've thought of it" }).click();
  await expect(page.getByRole("heading", { name: /You had a go|Typed it first/ })).toBeVisible();

  // Home in the other tab has already picked it up.
  await expect(other.getByText(/1 brave day so far/)).toBeVisible();

  // Now the older tab saves something of its own (moving in the app, no reload): the step must survive.
  await other.getByRole("link", { name: "Hot seat" }).first().click();
  await expect(other.getByRole("button", { name: "Spin", exact: true })).toBeVisible();
  await expect
    .poll(() =>
      other.evaluate(() => {
        const s = JSON.parse(localStorage.getItem("courage:v1")!);
        return [s.records.length, s.events.filter((e: { kind: string }) => e.kind === "game").length];
      }),
    )
    .toEqual([1, 2]);
});
