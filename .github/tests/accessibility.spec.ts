import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const STORYBOOK_URL = 'http://localhost:6006';

// Scan a story iframe scoped to the React render root (#root) and drop
// page-level structural rules that don't apply to Storybook-embedded stories
// (Storybook's iframe chrome intentionally has no <main> landmark or <h1>).
const scanStory = async (page: import('@playwright/test').Page, id: string) => {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=${id}`);
  const results = await new AxeBuilder({ page })
    .include('#root')
    .disableRules(['landmark-one-main', 'page-has-heading-one'])
    .analyze();
  expect(results.violations).toEqual([]);
};

test.describe('Accessibility audit', () => {
  test('StarMapCanvas (default) has no accessibility violations', async ({ page }) => {
    await scanStory(page, '02-Core-Shell-And-Map/StarMapCanvas--default');
  });
});
