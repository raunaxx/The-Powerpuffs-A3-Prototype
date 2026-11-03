import { test, expect } from '@playwright/test';
import { loginAsFacilitator, openCreateTask, createTask } from './support/auth';

test('T10: Failed task save shows a retry affordance and recovers', async ({ page }) => {
  await loginAsFacilitator(page);
  await openCreateTask(page);

  // Abort the first write request only; allow the retry through.
  let attempts = 0;
  await page.route(/\/api\/.*task/i, async (route) => {
    if (route.request().method() === 'GET') return route.continue();
    attempts += 1;
    if (attempts === 1) {
      await route.abort('failed');
    } else {
      await route.continue();
    }
  });

  const title = `Recovery task ${Date.now().toString().slice(-5)}`;
  await createTask(page, { title, subject: 'Mathematics' });

  // A recoverable error, not a silent loss.
  await expect(
    page.getByText(/could not save|failed|try again|error/i).first(),
  ).toBeVisible({ timeout: 10_000 });

  const retry = page.getByRole('button', { name: /retry|try again/i }).first();
  await expect(retry).toBeVisible();
  await retry.click();

  await expect(page.getByText(/saved|success/i).first()).toBeVisible({ timeout: 15_000 });
  expect(attempts).toBeGreaterThanOrEqual(2);
});

test('T11: App recovers from corrupted local persistence', async ({ page }) => {
  await page.goto('/login');

  // Deliberately corrupt every storage entry the app may read.
  await page.evaluate(() => {
    localStorage.setItem('stemmate.tasks', 'not-json{{{');
    localStorage.setItem('stemmate.session', '%%%CORRUPT%%%');
    sessionStorage.setItem('stemmate.draft', ']]]');
  });

  await page.reload();

  // Must not white-screen: either a reset notice or a usable login screen.
  await expect(
    page.getByText(/session reset|please log ?in again|something went wrong/i)
      .or(page.getByRole('button', { name: /log ?in|sign ?in/i })),
  ).toBeVisible({ timeout: 15_000 });

  // The document body must still render content (no blank canvas).
  const bodyText = await page.locator('body').innerText();
  expect(bodyText.trim().length).toBeGreaterThan(0);
});