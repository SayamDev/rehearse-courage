import { expect, test } from "@playwright/test";
import { seed } from "./helpers";

test("first visit, first step, step done, back to the map", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/start$/);

  // Give a name, skip age (means under 13) and what feels hard, meet the firefly, keep its name.
  await page.getByLabel("Your name").fill("Sam");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByRole("heading", { name: "Meet your firefly" })).toBeVisible();
  await page.getByRole("button", { name: "Let's go" }).click();

  await expect(page).toHaveURL(/\/$/);
  // The welcome guide opens once, on the first Home visit.
  const welcome = page.getByRole("dialog", { name: "Firefly is ready when you are" });
  await expect(welcome).toBeVisible();
  await welcome.getByRole("button", { name: "Let's start" }).click();
  await expect(welcome).toBeHidden();
  await expect(page.getByText("Hi Sam, today's one step")).toBeVisible();
  await page.getByRole("link", { name: "Start" }).click();

  await expect(page).toHaveURL(/\/step\/[\w-]+\?level=1/);
  await page.getByRole("button", { name: "I've thought of it" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "You had a go." })).toBeVisible();
  await expect(page.getByText("That took courage.")).toBeVisible();
  await expect(page.getByText("+15 courage points")).toBeVisible();

  await page.getByRole("link", { name: "Back to the map" }).click();
  await expect(page).toHaveURL(/\/map$/);
  await expect(page.getByText("Furthest step: 1 of 6")).toBeVisible();
});

test("a typed step at level 2 is saved and earns Typed it first", async ({ page }) => {
  await seed(page);
  await page.goto("/step/class-answer?level=2");
  await page.getByLabel("Type it here").fill("I think the answer is twelve.");
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Typed it first." })).toBeVisible();
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).records);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ situationId: "class-answer", level: 2, typed: true, seconds: null });
});

for (const route of ["/", "/map", "/step/class-answer?level=3", "/start"]) {
  test(`Need a pause opens from ${route} and closes with Escape`, async ({ page }) => {
    await seed(page);
    await page.goto(route);
    await page.getByRole("link", { name: "Need a pause" }).click();
    const dialog = page.getByRole("dialog", { name: "Need a pause" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("You are safe. This feeling will pass.")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/calm=1/);
    expect(new URL(page.url()).pathname).toBe(route.split("?")[0]);
  });
}

test("/help shows fallback lines without a country header", async ({ page }) => {
  await page.goto("/help");
  await expect(page.getByRole("heading", { name: "Talk to someone" })).toBeVisible();
  await expect(page.getByText("Find a Helpline")).toBeVisible();
  await expect(page.getByText("If you are in danger now, call your local emergency number.")).toBeVisible();
  await expect(page.getByText("Rehearse Courage is practice, not therapy.")).toBeVisible();
});
