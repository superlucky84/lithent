import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export const test = base.extend<{ browserErrors: string[] }>({
  browserErrors: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
      page.on('console', message => {
        if (message.type() === 'error')
          errors.push(`console: ${message.text()}`);
      });
      page.on('requestfailed', request =>
        errors.push(
          `requestfailed: ${request.url()} ${request.failure()?.errorText}`
        )
      );
      page.on('response', response => {
        if (response.status() >= 400)
          errors.push(`HTTP ${response.status()}: ${response.url()}`);
      });
      await use(errors);
      if (errors.length)
        await testInfo.attach('browser-errors', {
          body: errors.join('\n'),
          contentType: 'text/plain',
        });
      expect(errors, 'No browser or network errors').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

export async function ready(page: Page, path: string, core: string) {
  const response = await page.goto(path);
  expect(response?.ok(), 'HTML was served successfully').toBe(true);
  await expect(page.locator('html')).toHaveAttribute('data-core', core);
}
