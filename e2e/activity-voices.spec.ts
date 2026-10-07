import { expect, test } from "@playwright/test";
import { clipId, voiceFor } from "../src/lib/voice/lines";
import { RETURNING, seed } from "./helpers";

for (const accent of ["uk", "us"] as const) {
  for (const age of ["adult", "under13"] as const) {
    test(`${accent}, ${age}: every game plays its contextual recording`, async ({ page }) => {
      await seed(page, { ...RETURNING, age, settings: { ...RETURNING.settings, accent, reduceMotion: true, playCoach: false } });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const games = ["hot-seat", "story-dice", "rescue-snap", "word-builder", "breath-balloon", "say-it-like", "describe-it", "keep-it-going"];
      for (const game of games) {
        await page.goto(`/games/${game}`);
        await expect(page.locator("h1")).toBeVisible();
        if (game === "hot-seat") await page.getByRole("button", { name: "Spin", exact: true }).click();
        if (game === "story-dice") await page.getByRole("button", { name: "Roll the dice" }).click();
        if (game === "describe-it") await page.getByText("Stuck? Questions that help", { exact: true }).click();
        if (game === "word-builder") {
          const pool = page.getByRole("list", { name: "Words to place" });
          while (await pool.getByRole("button").count()) await pool.getByRole("button").first().click();
        }
        if (game === "breath-balloon") {
          // Explicit hold must honour the automatic-reading setting too.
          await page.getByRole("button", { name: "Hold to breathe in" }).focus();
          await page.keyboard.down(" ");
          await expect(page.getByRole("status")).toHaveText("Breathe in slowly.");
          await page.keyboard.up(" ");
          continue;
        }
        const hear = page.getByRole("button", { name: "Hear it", exact: true }).first();
        await expect(hear).toBeEnabled();
        const raw = await hear.locator("..").locator("p, blockquote").first().textContent();
        const text = raw!.trim().replace(/^[“]|[”]$/g, "");
        const role = game === "keep-it-going" ? "friend" : "narrator";
        const delivery = ["hot-seat", "rescue-snap", "describe-it", "keep-it-going"].includes(game) ? "game" : "practice";
        const set = age === "under13" ? "kids" : "grown";
        const id = clipId(voiceFor(role, set, accent, delivery), text);
        const recording = page.waitForResponse((r) => r.url().endsWith(`/voice/${id}.m4a`));
        await hear.click();
        const response = await recording;
        expect([200, 206]).toContain(response.status());
        await expect(page.getByRole("button", { name: "Stop", exact: true }).first()).toBeVisible();
      }
      expect(errors).toEqual([]);
    });
  }

  test(`${accent}: the breathing introduction finishes before the first timed breath, and Pause stops it`, async ({ page }) => {
    await seed(page, { ...RETURNING, age: "adult", settings: { ...RETURNING.settings, accent, playCoach: true, reduceMotion: true } });
    await page.goto("/kit/breathing");
    await expect(page.getByRole("button", { name: "Start breathing" })).toBeVisible();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => performance.getEntriesByType("resource").some((e) => e.name.endsWith(".m4a")))).toBe(false);
    const recording = page.waitForResponse((r) => /\/voice\/[0-9a-f]{8}\.m4a$/.test(r.url()));
    await page.getByRole("button", { name: "Start breathing" }).click();
    expect([200, 206]).toContain((await recording).status());
    await expect(page.getByText("Let your shoulders relax", { exact: true })).toBeVisible();
    await expect(page.getByText("Breathe in slowly", { exact: true })).toBeHidden();
    await page.getByRole("button", { name: "Pause breathing" }).click();
    await expect(page.getByRole("button", { name: "Start breathing" })).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByText("Take a moment to get comfortable", { exact: true })).toBeVisible();
  });
}

test("balloon counts only after the breath out, and supports reduced-motion keyboard use", async ({ page }) => {
  await seed(page, { ...RETURNING, settings: { ...RETURNING.settings, playCoach: false, reduceMotion: true } });
  await page.goto("/games/breath-balloon");
  await page.getByRole("button", { name: "Hold to breathe in" }).focus();
  await page.keyboard.down(" ");
  await page.waitForTimeout(2600);
  await page.keyboard.up(" ");
  await expect(page.getByRole("list", { name: "0 of 5 breaths" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("And breathe out.");
  await expect(page.getByRole("list", { name: "1 of 5 breaths" })).toBeVisible();
});

for (const accent of ["uk", "us"] as const) {
  test(`${accent}: Body kit tools use the calm guide or everyday example recordings`, async ({ page }) => {
    await seed(page, { ...RETURNING, age: "adult", settings: { ...RETURNING.settings, accent, playCoach: false } });
    for (const tool of ["grounding", "blushing", "sweating", "rescue", "speech"]) {
      await page.goto(`/kit/${tool}`);
      const hear = page.getByRole("button", { name: "Hear it", exact: true }).first();
      await expect(hear).toBeEnabled();
      const text = (await hear.locator("..").locator("p, blockquote").first().textContent())!.trim().replace(/^[“]|[”]$/g, "");
      const delivery = tool === "rescue" ? "practice" : "calm";
      const id = clipId(voiceFor("narrator", "grown", accent, delivery), text);
      const recording = page.waitForResponse((r) => r.url().endsWith(`/voice/${id}.m4a`));
      await hear.click();
      expect([200, 206]).toContain((await recording).status());
    }
  });
}
