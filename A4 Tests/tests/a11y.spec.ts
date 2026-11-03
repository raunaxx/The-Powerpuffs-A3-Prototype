import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginAsFacilitator, openCreateTask } from './support/auth';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function scan(page: import('@playwright/test').Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );

  // Print a readable report so the run log itself is evidence.
  // eslint-disable-next-line no-console
  console.log(
    `[T09] ${label}: ${results.violations.length} violation(s) ` +
      `(${blocking.length} critical/serious)`,
  );
  for (const v of results.violations) {
    console.log(`  - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
  }

  expect(
    blocking.map((v) => `${v.id} (${v.impact})`),
    `Serious/critical axe violations on ${label}`,
  ).toEqual([]);
}

test.describe('Automated accessibility scan', () => {
  test('T09a: Login page has no critical or serious violations', async ({ page }) => {
    await page.goto('/login');
    await scan(page, '/login');
  });

  test('T09b: Create Task page has no critical or serious violations', async ({ page }) => {
    await loginAsFacilitator(page);
    await openCreateTask(page);
    await scan(page, '/create-task');
  });
});