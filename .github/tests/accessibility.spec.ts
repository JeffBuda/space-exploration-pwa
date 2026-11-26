import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Accessibility audit', () => {
  test('main page has no accessibility violations', async ({ page }) => {
    await page.goto(STORYBOOK_URL);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  // Add more tests for specific stories as needed
  test('StarMap story has no accessibility violations', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=03-map-starmapcanvas--default`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
