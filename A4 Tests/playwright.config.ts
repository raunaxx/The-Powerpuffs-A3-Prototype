import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // sequential: tests share a deployed backend
  forbidOnly: !!process.env.CI,
  retries: 0, // no auto-retries: failures must be reported honestly
  workers: 1, // avoid mutating shared prototype state concurrently
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? "https://stemmatea4.vercel.app",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
