import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

const saved = (page: import("@playwright/test").Page) => page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!));

test.beforeEach(async ({ page }) => {
  await seed(page);
});

test("tiny dare: I did it counts today, and Home shows the courage level", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Today's tiny dare" })).toBeVisible();
  await expect(page.getByText("Level 1: Spark").filter({ visible: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Another one" }).click();
  await page.getByRole("button", { name: "I did it" }).click();
  await expect(page.getByText("Done today. That was real courage.")).toBeFocused();
  await expect(page.getByRole("status").filter({ hasText: "+10 courage points" })).toBeVisible();
  await expect.poll(async () => (await saved(page)).events.filter((e: { kind: string }) => e.kind === "dare").length).toBe(1);
  await expect.poll(async () => (await saved(page)).earned).toContain("tiny-dare");
});

test("step 6: I tried, how it felt and a note go onto the journey", async ({ page }) => {
  await page.goto("/step/out-order?level=6");
  await page.getByRole("button", { name: "I tried" }).click();
  await expect(page.getByRole("heading", { name: "You tried it for real." })).toBeFocused();
  await page.getByRole("button", { name: "Easier than I thought" }).click();
  await expect(page.getByRole("button", { name: "Easier than I thought" })).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("A line for your proud moments (optional)").fill("I asked for a hot chocolate");
  await page.getByRole("button", { name: "Save to my proud moments" }).click();
  await expect(page.getByText("Saved to your proud moments.")).toBeFocused();

  await page.getByRole("link", { name: "See your journey" }).click();
  await expect(page.getByRole("heading", { name: "Your journey" })).toBeVisible();
  const moments = page.getByRole("region", { name: "Proud moments" });
  await expect(moments.getByText("Order at a counter", { exact: true }).first()).toBeVisible();
  await expect(moments.getByText(/Tried it/)).toBeVisible();
  await expect(moments.getByText("Easier than I thought.")).toBeVisible();
  await expect(moments.getByText("“I asked for a hot chocolate”")).toBeVisible();
});

test("step 6: a note that needs support opens the support lines", async ({ page }) => {
  await page.goto("/step/out-order?level=6");
  await page.getByRole("button", { name: "I did it" }).click();
  await page.getByLabel("A line for your proud moments (optional)").fill("I want to kill myself");
  await page.getByRole("button", { name: "Save to my proud moments" }).click();
  await expect(page).toHaveURL(/\/help\?crisis=1/);
});

test("step 6: Not yet is kind, counts, and offers a way in", async ({ page }) => {
  await page.goto("/step/present-intro?level=6");
  await page.getByRole("button", { name: "Not yet" }).click();
  await expect(page.getByRole("heading", { name: "Not yet is fine." })).toBeFocused();
  await expect(page.getByRole("link", { name: "Get ready for the moment" })).toHaveAttribute("href", "/ready?s=present-intro");
  await expect.poll(async () => (await saved(page)).earned).toContain("not-yet");
  await expect.poll(async () => (await saved(page)).records.length).toBe(0);
});

test("Right before: four short screens, then going counts", async ({ page }) => {
  await page.goto("/ready");
  await page.getByRole("button", { name: "Make a phone call" }).click();
  await expect(page.getByRole("heading", { name: "One slow breath first" })).toBeFocused();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Your words" })).toBeFocused();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "If your mind goes blank" })).toBeFocused();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "You are ready enough" })).toBeFocused();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("heading", { name: "If your mind goes blank" })).toBeFocused();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "I'm going" }).click();
  await expect(page.getByRole("heading", { name: "Go for it" })).toBeFocused();
  await expect(page.getByRole("link", { name: "Say how it went" })).toHaveAttribute("href", "/step/out-phone?level=6");
  await expect.poll(async () => (await saved(page)).events.some((e: { kind: string; detail?: string }) => e.kind === "ready" && e.detail === "out-phone")).toBe(true);
});

test("share: the picture is made on the device and can be saved; focus comes back", async ({ page }) => {
  await page.goto("/journey");
  const open = page.getByRole("button", { name: "Share your level" });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Share it" });
  await expect(dialog.getByRole("img", { name: /Picture to share: My courage level/ })).toBeVisible();
  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Save picture" }).click();
  expect((await download).suggestedFilename()).toBe("rehearse-courage-level-1-spark.png");
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(open).toBeFocused();
});

test("print: the parents and teachers guide has a print button", async ({ page }) => {
  await page.goto("/for-adults");
  await expect(page.getByRole("button", { name: "Print this guide" })).toBeVisible();
});

test("top bar: one tap switches light and dark, and it is remembered", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/map");
  await page.getByRole("button", { name: "Switch to dark colours" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light colours" })).toBeFocused();
  await expect.poll(async () => (await saved(page)).settings.theme).toBe("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light colours" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
