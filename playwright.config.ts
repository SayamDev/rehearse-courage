import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end journeys and accessibility checks. Runs against the dev
 * server on port 3330 (reused if already running). Set PW_CHROMIUM_PATH to
 * use an already-installed Chromium instead of Playwright's download.
 */
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3330",
    launchOptions: { executablePath },
  },
  projects: [
    { name: "phone", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "laptop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3330",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
