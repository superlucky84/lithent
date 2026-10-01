import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
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
    ...devices['Desktop Chrome'],
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
