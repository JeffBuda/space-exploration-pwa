import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './.github/tests',
  testMatch: '**/*.spec.ts',
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    baseURL: 'http://localhost:6006',
  },
  reporter: 'list',
  timeout: 30000,
  webServer: {
    command: 'npx storybook dev --no-open --port 6006',
    url: 'http://localhost:6006',
    reuseExistingServer: true,
  },
});
