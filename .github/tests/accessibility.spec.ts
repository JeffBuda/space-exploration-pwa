import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Accessibility audit', () => {
  test('StarMapCanvas (default) has no accessibility violations', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=02-core-shell-and-map-starmapcanvas--01-sol-idle-default`);
    // Scan the full Storybook iframe body while dropping page-level rules
    // that don't apply to stories embedded in Storybook's manager UI.
    const results = await new AxeBuilder({ page })
      .disableRules([
        'landmark-one-main',
        'page-has-heading-one',
        // Storybook iframe chrome: .sb-errordisplay is manager UI, not app content
        'region',
      ])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
