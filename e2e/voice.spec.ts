import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { RETURNING, seed } from "./helpers";

test("Hear it plays the recorded line, and nothing plays until it is tapped", async ({ page }) => {
  await seed(page, { ...RETURNING, age: "adult" });
  await page.goto("/step/friends-join?level=4");
  const coach = page.locator("figure").filter({ hasText: "Cobi, your coach" });
  await expect(coach.getByRole("button", { name: "Hear it" })).toBeVisible();

  // Tap to hear: no clip is fetched before the tap.
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => performance.getEntriesByType("resource").some((e) => e.name.endsWith(".m4a")))).toBe(false);

  const clip = page.waitForRequest((r) => /\/voice\/[0-9a-f]{8}\.m4a$/.test(r.url()));
  await coach.getByRole("button", { name: "Hear it" }).click();
  await clip;
});

test("the voice offer appears once after a first practice, and Not now counts as offered", async ({ page }) => {
  // A capable device, so the offer is not skipped as too small.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
  });
  const rec = { situationId: "class-answer", level: 1, at: new Date().toISOString(), seconds: null, typed: false, roughDay: false };
  await seed(page, { ...RETURNING, voiceOffered: false, records: [rec] });
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "A natural voice for every line" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Download (about 90 MB)" })).toBeVisible();
  const results = await new AxeBuilder({ page }).include("dialog").analyze();
  expect(results.violations).toEqual([]);
  await dialog.getByRole("button", { name: "Not now" }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).voiceOffered)).toBe(true);
});

test("Me has the voice settings, with auto-play off by default", async ({ page }) => {
  await seed(page);
  await page.goto("/me");
  await expect(page.getByRole("heading", { name: "Voices" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Play the coach's lines automatically" })).not.toBeChecked();
});
