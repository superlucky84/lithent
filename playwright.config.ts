import { defineConfig, devices } from '@playwright/test';

const browsers = {
  chromium: { name: 'chromium', device: 'Desktop Chrome' },
  firefox: { name: 'firefox', device: 'Desktop Firefox' },
  webkit: { name: 'webkit', device: 'Desktop Safari' },
} as const;
const selected = process.env.LITHENT_E2E_BROWSER ?? 'chromium';
if (!Object.hasOwn(browsers, selected))
  throw new Error(
    `Invalid LITHENT_E2E_BROWSER: ${JSON.stringify(selected)}; expected chromium, firefox or webkit`
  );
const browser = browsers[selected as keyof typeof browsers];

export default defineConfig({
  metadata: { browser: browser.name },
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices[browser.device],
    browserName: browser.name,
    launchOptions:
      browser.name === 'firefox'
        ? { firefoxUserPrefs: { 'browser.chrome.site_icons': false } }
        : browser.name === 'chromium' && process.env.LITHENT_CHROME
          ? { executablePath: process.env.LITHENT_CHROME }
          : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: ['base', 'concurrent'].map((core, index) => ({
    name: core,
    testIgnore: core === 'base' ? '**/scheduler.spec.ts' : [],
    use: { baseURL: `http://127.0.0.1:${43130 + index}` },
  })),
  webServer: ['base', 'concurrent'].map((core, index) => ({
    command: `node e2e/server.mjs ${core}`,
    url: `http://127.0.0.1:${43130 + index}/e2e/fixtures/integration.html`,
    reuseExistingServer: false,
    timeout: 60_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
  })),
});
