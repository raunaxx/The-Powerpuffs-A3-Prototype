import { test, expect } from '@playwright/test';
import { loginAsCoordinator, loginAsFacilitator } from './support/auth';

test.describe('Authentication and role separation', () => {
  test('T01: Coordinator can add a facilitator', async ({ page }) => {
    await loginAsCoordinator(page);

    await page.getByRole('link', { name: /add.*facilitator/i })
      .or(page.getByRole('button', { name: /add.*facilitator/i }))
      .first()
      .click();

    const suffix = Date.now().toString().slice(-6);
    const newUser = `facilitator.${suffix}`;

    await page.getByLabel(/username/i).first().fill(newUser);
    await page.getByLabel(/^password$/i).first().fill('SecurePass123');
    // Some forms include a confirmation field; fill only if present.
    const confirm = page.getByLabel(/confirm.*password|repeat.*password/i);
    if (await confirm.count()) await confirm.first().fill('SecurePass123');

    await page.getByRole('button', { name: /create.*facilitator|add.*facilitator|save/i })
      .first()
      .click();

    await expect(
      page.getByText(/facilitator.*(created|added|saved)/i).first(),
    ).toBeVisible();

    // Persistence: the new account is listed after a full reload.
    await page.reload();
    await expect(page.getByText(newUser, { exact: false }).first()).toBeVisible();
  });

  test('T02: Facilitator cannot add a facilitator', async ({ page }) => {
    await loginAsFacilitator(page);

    // Control absent from the interface.
    await expect(
      page.getByRole('link', { name: /add.*facilitator/i }),
    ).toHaveCount(0);

    // Direct navigation must not grant access.
    await page.goto('/add-facilitator');
    await expect(page).toHaveURL(/login|unauthori[sz]ed|dashboard|home|not.*permitted/i);

    // If the route renders, the create control must not be operable.
    const createBtn = page.getByRole('button', { name: /create.*facilitator/i });
    if (await createBtn.count()) {
      await expect(createBtn.first()).toBeDisabled();
    }
  });

  test('T03: Unauthenticated user is redirected from a protected route', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/add-facilitator');

    await expect(page).toHaveURL(/login/i);
    await expect(page.getByRole('button', { name: /log ?in|sign ?in/i })).toBeVisible();
  });
});