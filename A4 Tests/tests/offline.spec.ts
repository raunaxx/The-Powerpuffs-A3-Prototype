import { test, expect } from '@playwright/test';
import { loginAsFacilitator, openCreateTask, createTask } from './support/auth';

test('T06: Task created offline is queued and syncs on reconnect', async ({ page, context }) => {
  await loginAsFacilitator(page);
  await openCreateTask(page);

  // Force the browser offline before submitting.
  await context.setOffline(true);

  const title = `Offline task ${Date.now().toString().slice(-5)}`;
  await createTask(page, { title, subject: 'Physical Science' });

  // The app must acknowledge a local-only save rather than claiming success.
  await expect(
    page.getByText(/saved locally|offline|will sync|queued/i).first(),
  ).toBeVisible({ timeout: 10_000 });

  // Restore connectivity and flush the queue.
  await context.setOffline(false);

  const retry = page.getByRole('button', { name: /retry|sync now|reconnect/i });
  if (await retry.count()) await retry.first().click();

  await expect(page.getByText(/synced|saved|success/i).first()).toBeVisible({ timeout: 15_000 });

  // Confirm the record reached persistence.
  await page.reload();
  await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
});