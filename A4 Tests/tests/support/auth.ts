import { Page, expect } from '@playwright/test';

const COORDINATOR = {
  username: process.env.COORD_USER ?? 'example22',
  password: process.env.COORD_PASS ?? 'Password123',
};

const FACILITATOR = {
  username: process.env.FACIL_USER ?? 's.mpumelelo',
  password: process.env.FACIL_PASS ?? 'Password124',
};

async function submitLogin(page: Page, u: string, p: string) {
  await page.goto('/login');

  // Label-based first; placeholder as fallback if labels are not wired up.
  const username = page.getByLabel(/username/i).or(page.getByPlaceholder(/username/i)).first();
  const password = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i)).first();

  await username.fill(u);
  await password.fill(p);
  await page.getByRole('button', { name: /log ?in|sign ?in/i }).click();

  // Session established: we should be off the login route.
  await expect(page).not.toHaveURL(/\/login/i);
}

/** Log in as the Coordinator (can add facilitators). */
export async function loginAsCoordinator(page: Page) {
  await submitLogin(page, COORDINATOR.username, COORDINATOR.password);
}

/** Log in as a Facilitator (can create learning tasks, cannot add facilitators). */
export async function loginAsFacilitator(page: Page) {
  await submitLogin(page, FACILITATOR.username, FACILITATOR.password);
}

/** Open the "Create Learning Task" screen and wait for the form. */
export async function openCreateTask(page: Page) {
  await page.getByRole('link', { name: /create.*task|new.*task/i })
    .or(page.getByRole('button', { name: /create.*task|new.*task/i }))
    .first()
    .click();
  await expect(page.getByLabel(/task title|title/i).first()).toBeVisible();
}

/** Fill and submit the learning task form. */
export async function createTask(
  page: Page,
  data: { title: string; subject?: string; description?: string },
) {
  await page.getByLabel(/task title|^title$/i).first().fill(data.title);

  if (data.subject) {
    const subject = page.getByLabel(/subject/i).first();
    const tag = await subject.evaluate((el) => el.tagName.toLowerCase());
    if (tag === 'select') {
      await subject.selectOption({ label: data.subject });
    } else {
      await subject.fill(data.subject);
    }
  }

  if (data.description) {
    await page.getByLabel(/description|instructions|details/i).first().fill(data.description);
  }

  await page.getByRole('button', { name: /save.*task|create.*task|save/i }).first().click();
}