import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { RETURNING, seed } from "./helpers";

const UNDER13 = { ...RETURNING, age: "under13" };
const SKIPPED = { ...RETURNING, age: null };
const TEEN_OFFLINE = { ...RETURNING, settings: { ...RETURNING.settings, onlineHelp: false } };

/** Every request the page makes to the AI routes. */
function watchApi(page: Page): string[] {
  const calls: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) calls.push(new URL(r.url()).pathname);
  });
  return calls;
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
}

async function typeAnswerAtStep4(page: Page) {
  await page.goto("/step/class-answer?level=4");
  await page.getByRole("button", { name: "Type instead" }).click();
  await page.getByLabel("Type what you would say").fill("I think the answer is ten.");
  await page.getByRole("button", { name: "Hear Cobi's reply" }).click();
}

test("a teen hears Cobi answer what they typed, then finishes the step", async ({ page }) => {
  await seed(page);
  await page.route("**/api/coach", (r) => r.fulfill({ json: { reply: "Ten. Nice thinking, that is right.", source: "groq" } }));
  await typeAnswerAtStep4(page);
  const reply = page.locator("figure", { hasText: "Nice thinking" });
  await expect(reply).toBeVisible();
  await expect(reply).toBeFocused();
  await expect(page.getByText("Cobi's reply comes from an online AI.")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await axe(page);
  await page.getByRole("button", { name: "Finish" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).records);
  expect(records[0]).toMatchObject({ situationId: "class-answer", level: 4, typed: true, seconds: null });
  // The answer itself is never saved.
  expect(await page.evaluate(() => localStorage.getItem("courage:v1"))).not.toContain("answer is ten");
});

test("Try again after Cobi's reply puts focus back where the answer was typed", async ({ page }) => {
  await seed(page);
  await page.route("**/api/coach", (r) => r.fulfill({ json: { reply: "Ten. Nice thinking.", source: "groq" } }));
  await typeAnswerAtStep4(page);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByLabel("Type what you would say")).toBeFocused();
});

test("when the AI cannot answer, Cobi's own reply appears instead", async ({ page }) => {
  await seed(page);
  await page.route("**/api/coach", (r) => r.fulfill({ json: { reply: null } }));
  await typeAnswerAtStep4(page);
  await expect(page.getByRole("button", { name: "Finish" })).toBeVisible();
  await expect(page.locator("figure").last()).toContainText(/Thank|Good|glad/);
});

for (const [name, state] of [
  ["under 13", UNDER13],
  ["a skipped age", SKIPPED],
  ["a teen with online help off", TEEN_OFFLINE],
] as const) {
  test(`${name}: Cobi still answers, and nothing is sent`, async ({ page }) => {
    await seed(page, state);
    const calls = watchApi(page);
    await typeAnswerAtStep4(page);
    await expect(page.getByRole("button", { name: "Finish" })).toBeVisible();
    await expect(page.getByText("Cobi's reply comes from an online AI.")).toHaveCount(0);
    await page.goto("/kit/frames");
    await expect(page.getByRole("heading", { name: "Sentence frames" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Say it messy, then tidy" })).toHaveCount(0);
    expect(calls).toEqual([]);
  });
}

test("a crisis in a step 4 answer goes to support without sending anything", async ({ page }) => {
  await seed(page);
  const calls = watchApi(page);
  await page.goto("/step/class-answer?level=4");
  await page.getByRole("button", { name: "Type instead" }).click();
  await page.getByLabel("Type what you would say").fill("honestly I want to die");
  await page.getByRole("button", { name: "Hear Cobi's reply" }).click();
  await expect(page).toHaveURL(/\/help\?crisis=1/);
  expect(calls).toEqual([]);
});

test("a teen can tidy a messy sentence and say it back", async ({ page }) => {
  await seed(page);
  await page.route("**/api/tidy", (r) => r.fulfill({ json: { tidy: "I think the book was good because the ending surprised me.", source: "groq" } }));
  await page.goto("/kit/frames");
  await page.getByLabel("Your messy version").fill("so um I think like the book was good because the ending was like surprising");
  await page.getByRole("button", { name: "Tidy it" }).click();
  const tidy = page.getByText("I think the book was good because the ending surprised me.");
  await expect(tidy).toBeFocused();
  await expect(page.getByRole("button", { name: "Say the tidy version" })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await axe(page);
});

test("tidy says so when it is not available", async ({ page }) => {
  await seed(page);
  await page.route("**/api/tidy", (r) => r.fulfill({ json: { tidy: null } }));
  await page.goto("/kit/frames");
  await page.getByLabel("Your messy version").fill("so um it is ten");
  await page.getByRole("button", { name: "Tidy it" }).click();
  await expect(page.getByText("Tidy is not available right now. Try one of the frames below.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tidy it" })).toBeFocused();
});

test("Me: a teen can turn online help off; under 13 sees no AI switches", async ({ page }) => {
  await seed(page);
  await page.goto("/me");
  const online = page.getByRole("switch", { name: "Online AI help" });
  await expect(online).toHaveAttribute("aria-checked", "true");
  await online.click();
  await expect(online).toHaveAttribute("aria-checked", "false");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("courage:v1")!).settings.onlineHelp)).toBe(false);

  await page.getByRole("button", { name: "Under 13" }).click();
  await expect(page.getByText("AI help is only for people aged 13 and over.")).toBeVisible();
  await expect(page.getByRole("switch", { name: "Online AI help" })).toHaveCount(0);
});

test("the AI routes refuse under 13, a skipped age and other sites", async ({ request, baseURL }) => {
  const origin = { origin: baseURL!, "content-type": "application/json" };
  const body = { situationId: "class-answer", room: "class", answer: "It is ten" };
  expect((await request.post("/api/coach", { headers: origin, data: { ...body, age: "under13" } })).status()).toBe(403);
  expect((await request.post("/api/coach", { headers: origin, data: body })).status()).toBe(403);
  expect((await request.post("/api/tidy", { headers: origin, data: { age: "under13", text: "hi" } })).status()).toBe(403);
  expect(
    (await request.post("/api/coach", { headers: { origin: "https://elsewhere.example", "content-type": "application/json" }, data: { ...body, age: "teen" } })).status(),
  ).toBe(403);
  // A teen from this site gets an answer (null here, as the test server has no AI key).
  const ok = await request.post("/api/coach", { headers: origin, data: { ...body, age: "teen" } });
  expect(ok.status()).toBe(200);
  expect(ok.headers()["cache-control"]).toBe("no-store");
});
