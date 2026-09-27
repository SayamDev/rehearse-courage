import type { Page } from "@playwright/test";

/** A returning person: companion chosen, nothing practised yet. */
export const RETURNING = {
  version: 1,
  age: "teen",
  hardThings: ["class"],
  companion: { species: "firefly", name: "Glow" },
  records: [],
  customSteps: [],
  events: [],
  earned: [],
  lastSeen: null,
  cameBack: false,
  settings: {
    reduceMotion: false,
    textSize: "normal",
    sounds: true,
    confetti: true,
    timers: false,
    keepRecordings: false,
    theme: "system",
  },
};

/** Seeds saved progress once per test (not again after in-app navigation or reloads). */
export async function seed(page: Page, state: object = RETURNING) {
  await page.addInitScript((v) => {
    if (!sessionStorage.getItem("e2e-seeded")) {
      localStorage.setItem("courage:v1", v);
      sessionStorage.setItem("e2e-seeded", "1");
    }
  }, JSON.stringify(state));
}
