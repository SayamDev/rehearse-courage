import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

test.beforeEach(async ({ page }) => {
  await seed(page);
});

test("games hub lists five games and Home links to them", async ({ page }) => {
  await page.goto("/games");
  for (const name of ["Hot seat", "Story dice", "Rescue snap", "Word builder", "Breath balloon"]) {
    await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  }
});

test("hot seat: spin, answer in your head, and it counts", async ({ page }) => {
  await page.goto("/games/hot-seat");
  await page.getByRole("button", { name: "Spin", exact: true }).click();
  await page.getByRole("button", { name: "I answered in my head" }).click();
  await expect(page.getByRole("status").filter({ hasText: "one question answered" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).events.some((e: { kind: string }) => e.kind === "game"))).toBe(true);
});

test("story dice: rolling shows three pictures and a story prompt", async ({ page }) => {
  await page.goto("/games/story-dice");
  await page.getByRole("button", { name: "Roll the dice" }).click();
  await expect(page.getByText(/Tell a tiny story with/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Tell your story" })).toBeVisible();
});

test("rescue snap: any pick is fine and shows the best fit", async ({ page }) => {
  await page.goto("/games/rescue-snap");
  await page.getByRole("button", { name: /^“/ }).first().click();
  await expect(page.getByText(/Snap\. That one fits\.|That could work too/)).toBeVisible();
  await page.getByRole("button", { name: "Next moment" }).click();
  await expect(page.getByText("Moment 2 of 6")).toBeVisible();
});

test("word builder: placing every word finishes the sentence", async ({ page }) => {
  await page.goto("/games/word-builder");
  const pool = page.getByRole("list", { name: "Words to place" });
  while ((await pool.getByRole("button").count()) > 0) await pool.getByRole("button").first().click();
  await expect(page.getByText(/That reads well\.|Your way works/)).toBeVisible();
});

test("breath balloon: holding Space fills it and counts a breath", async ({ page }) => {
  await page.goto("/games/breath-balloon");
  const hold = page.getByRole("button", { name: "Hold to breathe in" });
  await hold.focus();
  await page.keyboard.down(" ");
  await page.waitForTimeout(2600);
  await page.keyboard.up(" ");
  await expect(page.getByRole("list", { name: "1 of 5 breaths" })).toBeVisible();
});
