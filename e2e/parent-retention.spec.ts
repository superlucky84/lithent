import { test, expect, ready } from './test';

test('updated nodes release previous VDOM and detached fragment objects', async ({
  page,
}, info) => {
  await ready(page, '/e2e/fixtures/parent-retention.html', info.project.name);
  await expect(page.locator('#app span')).toHaveText('0');
  await page.evaluate(async () => {
    for (let i = 0; i < 50; i++) await window.parentRetention.step();
  });
  await expect(page.locator('#app span')).toHaveText('50');

  // Run GC after the evaluation task ends: WeakRef targets survive the job
  // in which they were created, even when no ordinary reference remains.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('HeapProfiler.collectGarbage');
  expect(await page.evaluate(() => window.parentRetention.stats())).toEqual({
    renders: 51,
    spans: 1,
    fragments: 1,
  });
});
