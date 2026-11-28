import { test, expect, type Page } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';
const PREVIEW_URL = 'http://localhost:4173';

/** Matches every StarMapCanvas story ID produced by Storybook's kebab slugger. */
const STAR_MAP_STORY_PREFIX = '02-core-shell-and-map-starmapcanvas';

/**
 * Fetches Storybook's runtime story map and returns every story ID.
 * Storybook 8 publishes it at /index.json on the running dev server.
 */
async function fetchStoryIds(): Promise<string[]> {
  const response = await fetch(`${STORYBOOK_URL}/index.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Storybook index.json: ${response.status}`);
  }
  const data = (await response.json()) as {
    v: number;
    entries: Record<
      string,
      {
        id: string;
        name: string;
        title: string;
        type: 'story' | 'docs';
        tags: string[];
        importPath: string;
      }
    >;
  };
  return Object.values(data.entries)
    .filter((entry) => entry.type === 'story')
    .map((entry) => entry.id);
}

/**
 * Opens a story in the iOS portrait iframe and asserts that it renders cleanly:
 * no console/page errors and a non-empty #storybook-root.
 */
async function openStoryCleanly(page: Page, storyId: string): Promise<void> {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`${msg.location().url}:${msg.location().lineNumber} ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message || String(err));
  });

  await page.goto(`${STORYBOOK_URL}/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`);
  await page.waitForLoadState('domcontentloaded');

  // Give React/Storybook a moment to mount the story (and report any mount-time errors).
  await page.waitForTimeout(1000);

  if (consoleErrors.length > 0) {
    throw new Error(`Console errors for story ${storyId}: ${consoleErrors.slice(0, 5).join('; ')}`);
  }
  if (pageErrors.length > 0) {
    throw new Error(`Page JS errors for story ${storyId}: ${pageErrors.slice(0, 5).join('; ')}`);
  }

  const root = page.locator('#storybook-root');
  await expect(root).toBeVisible();
  const box = await root.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  }
}

test.describe('Storybook regression suite (iOS Portrait 390×844)', () => {
  test('every Storybook story renders without console/page errors and with non-empty output', async ({
    page,
  }) => {
    const storyIds = await fetchStoryIds();
    test.info().annotations.push({ type: 'storyCount', description: String(storyIds.length) });

    for (const storyId of storyIds) {
      await test.step(`Story: ${storyId}`, async () => {
        await openStoryCleanly(page, storyId);
      });
    }
  });

  test.describe('Star Map stories', () => {
    test('every Star Map story renders SVG geometry >= 300x300 with 44px touch hitboxes and edges', async ({
      page,
    }) => {
      const storyIds = await fetchStoryIds();
      const ids = storyIds.filter((id) => id.startsWith(STAR_MAP_STORY_PREFIX));
      expect(ids.length).toBeGreaterThan(0);
      test.info().annotations.push({ type: 'starMapStoryCount', description: String(ids.length) });

      for (const storyId of ids) {
        await test.step(`Star Map: ${storyId}`, async () => {
          await openStoryCleanly(page, storyId);

          // The map <svg> must exist and be large enough to hold the sector on iOS portrait.
          const svg = page.locator('svg').first();
          await expect(svg).toBeVisible();
          const svgBox = await svg.boundingBox();
          expect(svgBox).toBeTruthy();
          expect(svgBox!.width).toBeGreaterThanOrEqual(300);
          expect(svgBox!.height).toBeGreaterThanOrEqual(300);

          // Hyperlane edges are rendered as <line> elements inside the SVG.
          const edges = page.locator('svg line');
          const edgeCount = await edges.count();
          test
            .info()
            .annotations.push({ type: `${storyId}-edges`, description: String(edgeCount) });
          expect(edgeCount).toBeGreaterThan(0);

          // Star nodes are <g role="button"> with an invisible >= 44x44px hitbox rect.
          const starNodes = page.locator('g[role="button"]');
          const nodeCount = await starNodes.count();
          test
            .info()
            .annotations.push({ type: `${storyId}-nodes`, description: String(nodeCount) });
          expect(nodeCount).toBeGreaterThan(0);

          // Each node's counter-scaled touch hitbox rect must be >= 44x44 px.
          const hitBoxes = page.locator('svg rect[fill="transparent"]');
          const hitBoxCount = await hitBoxes.count();
          for (let i = 0; i < Math.min(hitBoxCount, 12); i++) {
            const rect = hitBoxes.nth(i);
            const width = await rect.getAttribute('width');
            const height = await rect.getAttribute('height');
            expect(parseFloat(width ?? '0')).toBeGreaterThanOrEqual(44);
            expect(parseFloat(height ?? '0')).toBeGreaterThanOrEqual(44);
          }

          // Verify at least one star node is actually visible within the SVG viewport
          // (a bug where initial centering ignores initialZoom will leave nodes off-screen
          // even though DOM elements exist — the prior broken state had translate(-1005,-940) scale(0.2)).
          expect(svgBox).not.toBeNull();
          const visibleNodes: number[] = [];
          for (let i = 0; i < nodeCount; i++) {
            const box = await starNodes.nth(i).boundingBox();
            if (box && svgBox) {
              const cx = box.x + box.width / 2;
              const cy = box.y + box.height / 2;
              const inside =
                cx >= svgBox.x &&
                cx <= svgBox.x + svgBox.width &&
                cy >= svgBox.y &&
                cy <= svgBox.y + svgBox.height;
              if (inside) visibleNodes.push(i);
            }
          }
          expect(visibleNodes.length).toBeGreaterThan(0);
        });
      }
    });

    test('interactive click regression: tap star node activates route summary; System Info mode opens peek card', async ({
      page,
    }) => {
      // Start from an idle story with a single-system route (Sol only).
      await openStoryCleanly(page, `${STAR_MAP_STORY_PREFIX}--01-sol-idle-default`);

      // --- Tap Proxima Centauri: route should extend in edit-route mode ---
      // Use aria-label* match since node labels (text) are hidden below LABEL_HIDE_ZOOM_THRESHOLD
      // (0.7), and the aria-label changes to "Proxima Centauri (Current Location)" after plotting.
      // At initialZoom=0.2 the hitbox rects (220px) heavily overlap, so dispatchEvent('click')
      // targets the exact node reliably rather than relying on hit-testing.
      const proxima = page.locator('g[role="button"][aria-label*="Proxima Centauri"]');
      await expect(proxima).toBeVisible();

      // Before tapping, no itinerary hop exists yet (labels are hidden at zoom 0.2, so
      // 'Proxima Centauri' text only exists after a route is plotted in the drawer).
      expect(await page.getByText('Proxima Centauri').count()).toBe(0);

      // Tap Proxima to extend the route in edit-route mode.
      // At initialZoom=0.2 the hitbox rects (220px) heavily overlap, so dispatchEvent('click')
      // targets the exact node reliably rather than relying on hit-testing.
      await proxima.dispatchEvent('click');
      await page.waitForTimeout(300);

      // After tapping, the drawer shows the plotted route: "Anchored Itinerary (1 Hops)"
      // and an itinerary leg row naming Proxima Centauri (the route edge).
      await expect(page.getByText(/Anchored Itinerary \(1 Hops\)/i)).toBeVisible();
      await expect(page.getByText('Proxima Centauri').first()).toBeVisible();

      // --- Toggle to System Info mode ---
      const systemInfoBtn = page.locator('button[aria-label="System Info"]');
      await expect(systemInfoBtn).toBeVisible();
      // Use dispatchEvent for reliable React onClick handling in the iOS-portrait canvas.
      await systemInfoBtn.dispatchEvent('click');
      await page.waitForTimeout(300);

      // Verify System Info mode is active (warning bg on button).
      await expect(systemInfoBtn).toHaveClass(/bg-\[hsl\(var\(--color-warning\)\)\]/);

      // --- Tap Proxima in info mode: opens System Telemetry peek card ---
      await proxima.dispatchEvent('click');
      await page.waitForTimeout(300);

      // The peek card header "System Telemetry" appears when a node is inspected in info mode.
      await expect(page.getByText('System Telemetry')).toBeVisible();

      // The node name "Proxima Centauri" should appear inside the peek card.
      await expect(page.getByText('Proxima Centauri').first()).toBeVisible();

      // Route must not be mutated by info-mode taps: itinerary still shows exactly 1 hop.
      await expect(page.getByText(/Anchored Itinerary \(1 Hops\)/i)).toBeVisible();
    });
  });
});

test.describe('App preview smoke test', () => {
  test('the Vite preview app loads on iOS portrait without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message || String(err));
    });

    await page.goto(PREVIEW_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    // The app is currently a placeholder ("Hello World") — verify it loads with visible content.
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Hello World');
  });
});
