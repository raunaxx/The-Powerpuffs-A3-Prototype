import { test, expect } from '@playwright/test';
import { loginAsFacilitator, openCreateTask, createTask } from './support/auth';

test.describe('Facilitator learning task workflow', () => {
  test('T04: Facilitator creates a task and it persists after reload', async ({ page }) => {
    await loginAsFacilitator(page);
    await openCreateTask(page);

    const title = `Algebra baseline quiz ${Date.now().toString().slice(-5)}`;

    await createTask(page, {
      title,
      subject: 'Mathematics',
      description: '10-question baseline assessment for Grade 10.',
    });

    await expect(page.getByText(/saved|created|success/i).first()).toBeVisible();

    // Persistence check: survives a full page reload.
    await page.reload();
    await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
  });

  test('T05: Empty task form shows field-level validation errors', async ({ page }) => {
    await loginAsFacilitator(page);
    await openCreateTask(page);

    await page.getByRole('button', { name: /save.*task|create.*task|save/i }).first().click();

    // Errors are rendered visibly...
    await expect(page.getByText(/title.*required|required.*title/i).first()).toBeVisible();
    await expect(page.getByText(/subject.*required|required.*subject/i).first()).toBeVisible();

    // ...and the control is marked invalid for assistive technology.
    await expect(page.getByLabel(/task title|^title$/i).first())
      .toHaveAttribute('aria-invalid', 'true');

    // NOTE (D-03): the message is not linked via aria-describedby and there is
    // no aria-live region, so it is not announced. Logged as a serious defect.
  });
});