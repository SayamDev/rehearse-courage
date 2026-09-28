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
