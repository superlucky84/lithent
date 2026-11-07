import { test, expect, ready } from './test';

for (const mode of ['native', 'fallback']) {
  test(`cleanup: ${mode} reports the original error after complete teardown`, async ({
    page,
  }, info) => {
    await ready(
      page,
      `/e2e/fixtures/cleanup.html?mode=${mode}`,
      info.project.name
    );
    await expect(page.locator('#app p')).toHaveCount(2);
    expect(await page.evaluate(() => window.cleanupProbe.supported)).toBe(
      mode === 'native'
    );
    await page.getByRole('button', { name: 'Destroy', exact: true }).click();
    await expect(page.locator('#app')).toBeEmpty();
    await expect
      .poll(() => page.evaluate(() => window.cleanupProbe.errors))
      .toEqual([{ same: true, empty: true }]);
    expect(await page.evaluate(() => window.cleanupProbe.calls)).toEqual([
      'bad',
      'remaining',
      'child',
      'good',
    ]);
    await page.getByRole('button', { name: 'Destroy', exact: true }).click();
    expect(await page.evaluate(() => window.cleanupProbe.calls)).toHaveLength(
      4
    );
    expect(await page.evaluate(() => window.cleanupProbe.errors)).toHaveLength(
      1
    );
  });
}
