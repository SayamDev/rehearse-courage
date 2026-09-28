import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

test.beforeEach(async ({ page }) => {
  await seed(page);
});

test("games hub lists all eight games", async ({ page }) => {
  await page.goto("/games");
  for (const name of ["Hot seat", "Story dice", "Rescue snap", "Word builder", "Breath balloon", "Say it like", "Describe it", "Keep it going"]) {
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

test("say it like: deal a style, and a new line changes the line", async ({ page }) => {
  await page.goto("/games/say-it-like");
  await page.getByRole("button", { name: "Deal a card" }).click();
  await expect(page.getByText(/^Say it .+\. Then listen back if you like\.$/)).toBeVisible();
  const before = await page.locator("p", { hasText: /^“/ }).first().textContent();
  await page.getByRole("button", { name: "New line" }).click();
  await expect(page.locator("p", { hasText: /^“/ }).first()).not.toHaveText(before!);
});

test("describe it: a picture to describe without its name, and the next one", async ({ page }) => {
  await page.goto("/games/describe-it");
  await expect(page.getByText(/Describe it without saying/)).toBeVisible();
  await page.getByRole("button", { name: "Next picture" }).click();
  await expect(page.getByText(/Describe it without saying/)).toBeVisible();
});

test("keep it going: answer in your head and it counts, then the next line", async ({ page }) => {
  await page.goto("/games/keep-it-going");
  await page.getByRole("button", { name: "I asked it in my head" }).click();
  await expect(page.getByRole("status").filter({ hasText: "One question asked" })).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "I asked it in my head" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).events.some((e: { detail?: string }) => e.detail === "keep-it-going")))
    .toBe(true);
});
