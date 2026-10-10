import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const repo = fileURLToPath(new URL('../..', import.meta.url));
export default defineConfig({
  testDir: './browser',
  timeout: 15_000,
  expect: { timeout: 5000 },
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  outputDir: resolve(repo, 'test-results/closure-lifecycle'),
  use: {
    ...devices['Desktop Chrome'],
    launchOptions: process.env.LITHENT_CHROMIUM_PATH
      ? { executablePath: process.env.LITHENT_CHROMIUM_PATH }
      : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: ['base', 'concurrent'].map((core, index) => ({
    name: core,
    use: { baseURL: `http://127.0.0.1:${43140 + index}` },
  })),
  webServer: ['base', 'concurrent'].map((core, index) => ({
    command: `./node_modules/.bin/vite --config experiments/closure-lifecycle/demo/vite.config.ts --host 127.0.0.1 --port ${43140 + index} --strictPort`,
    cwd: repo,
    env: { LITHENT_CORE: core },
    url: `http://127.0.0.1:${43140 + index}`,
    reuseExistingServer: false,
    timeout: 30_000,
  })),
});
