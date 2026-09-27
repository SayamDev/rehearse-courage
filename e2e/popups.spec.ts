import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { RETURNING, seed } from "./helpers";

const rec = (d: number) => ({ situationId: "class-answer", level: 1, at: new Date(Date.now() - d * 864e5).toISOString(), seconds: null, typed: false, roughDay: false });
const PRACTISED = { ...RETURNING, records: [rec(3), rec(2), rec(1)] };

async function axe(page: import("@playwright/test").Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const summary = r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
}

test("the welcome guide shows once and is remembered", async ({ page }) => {
  await seed(page, { ...RETURNING, welcomed: false });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Glow is ready when you are" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Panic now is always here")).toBeVisible();
  await axe(page);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).welcomed)).toBe(true);
  await page.reload();
  await page.waitForTimeout(1200);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("keep your progress safe: after three steps, saving a backup quiets it", async ({ page }) => {
  await seed(page, PRACTISED);
  await page.goto("/map");
  const dialog = page.getByRole("dialog", { name: "Keep your progress safe" });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await axe(page);
  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Save a backup" }).click();
  expect((await download).suggestedFilename()).toMatch(/\.json$/);
  await expect(dialog.getByText("Backup saved.")).toBeVisible();
  await dialog.getByRole("button", { name: "Done" }).click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).lastBackup)).toBeTruthy();
});

test("keep your progress safe: Don't show this again sticks", async ({ page }) => {
  await seed(page, PRACTISED);
  await page.goto("/map");
  const dialog = page.getByRole("dialog", { name: "Keep your progress safe" });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await dialog.getByLabel("Don't show this again").check();
  await dialog.getByRole("button", { name: "Not now" }).click();
  // The dialog's close event fires just after the click.
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).settings.saveNudgeOff)).toBe(true);
});

test("never on a practice step or while Panic now is open", async ({ page }) => {
  await seed(page, PRACTISED);
  await page.goto("/step/class-answer?level=2");
  await page.waitForTimeout(2500);
  await expect(page.getByRole("dialog", { name: "Keep your progress safe" })).toHaveCount(0);
  await page.goto("/map?calm=1");
  await page.waitForTimeout(2500);
  await expect(page.getByRole("dialog", { name: "Keep your progress safe" })).toHaveCount(0);
});
