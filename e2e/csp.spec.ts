import { test as plain } from '@playwright/test';
import { test, expect } from './test';

// docs/adoption/SECURITY_REVIEW.md: the built UMD bundles under a strict
// Content-Security-Policy with Trusted Types enforced. Base project: base
// core. Concurrent project: concurrent core.
const cspPage = (core: string, query = '') =>
  `/e2e/fixtures/csp.html?core=${core}${query}`;

test('CSP: core and lithent/element render and update with no violation', async ({
  page,
}, info) => {
  await page.goto(cspPage(info.project.name));
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');

  const loaded = await page.evaluate(() => {
    const w = window as unknown as Record<string, Record<string, unknown>>;
    return 'deferRender' in w.core;
  });
  expect(loaded).toBe(info.project.name === 'concurrent');

  // Core: first render, then an update that changes text, an attribute, a
  // style and the order of a keyed list.
  const button = page.locator('#app .inc');
  const items = page.locator('#app .item');
  await expect(button).toHaveText('count:0');
  await expect(button).toHaveCSS('color', 'rgb(0, 0, 255)');
  await expect(items).toHaveText(['a', 'b', 'c']);

  await button.click();
  await expect(button).toHaveText('count:1');
  await expect(button).toHaveCSS('color', 'rgb(255, 0, 0)');
  await expect(page.locator('#app .app')).toHaveAttribute('data-count', '1');
  await expect(items).toHaveText(['c', 'b', 'a']);

  // lithent/element: rendered in a shadow root with its style sheet applied.
  const pay = page.locator('csp-widget .pay');
  await expect(pay).toHaveText('pay:5');
  await expect(pay).toHaveCSS('color', 'rgb(0, 128, 0)');

  await page.locator('csp-widget').evaluate(el => {
    el.setAttribute('amount', '9');
  });
  await expect(pay).toHaveText('pay:9');
  await pay.click();

  const result = await page.evaluate(() => {
    const w = window as unknown as Record<string, unknown[]>;
    return { violations: w.violations, events: w.widgetEvents };
  });
  expect(result).toEqual({ violations: [], events: [9] });
});

// The `innerHTML` prop assigns a string to a Trusted Types sink. The browser
// rejects it and reports it on the console, so this test does not use the
// fixture that fails on console errors.
plain(
  'CSP: the innerHTML prop is rejected by Trusted Types',
  async ({ page }, info) => {
    await page.goto(cspPage(info.project.name, '&probe=innerHTML'));
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');

    const result = await page.evaluate(() => {
      const w = window as unknown as Record<string, unknown>;
      return { probe: w.probeResult, violations: w.violations };
    });
    expect(result.probe).toBe('TypeError');
    expect(result.violations).toEqual([
      'require-trusted-types-for trusted-types-sink',
    ]);
    await expect(page.locator('#app b')).toHaveCount(0);
  }
);
