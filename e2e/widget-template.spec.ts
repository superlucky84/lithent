import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test, expect } from './test';

// createLithent/widget: the built bundle on the template's own host page,
// which uses the widget only through attributes, properties and DOM events.
// The bundle has the base core built in, so the concurrent project skips this
// file (playwright.config.ts) rather than run the same bundle twice.
const template = fileURLToPath(
  new URL('../createLithent/widget/', import.meta.url)
);
const { name } = JSON.parse(
  readFileSync(resolve(template, 'package.json'), 'utf8')
) as { name: string };
const bundle = resolve(template, 'dist', `${name}.js`);
const hostPage = pathToFileURL(resolve(template, 'dist/index.html')).href;

test('widget template: the built bundle works on a plain host page', async ({
  page,
}) => {
  await page.goto(hostPage);
  const widget = page.locator('feedback-widget');
  const log = page.locator('#log');
  const faces = widget.locator('.face');

  // Rendered in an open shadow root, from attributes and a slot.
  await expect(widget.locator('.question')).toHaveText(
    'Was this page helpful?'
  );
  expect(
    await widget.evaluate(el => el.shadowRoot?.querySelector('form') !== null)
  ).toBe(true);
  await expect(page.locator('small[slot="footer"]')).toBeVisible();

  // The page styles its own buttons with dashed borders and uppercase text.
  await expect(faces.first()).toHaveCSS('border-top-style', 'solid');
  await expect(faces.first()).toHaveCSS('text-transform', 'none');

  // feedback-rate, then a submit the page cancels: the form stays.
  await expect(widget.locator('textarea')).toHaveCount(0);
  await faces.nth(3).click();
  await expect(faces.nth(3)).toHaveAttribute('aria-pressed', 'true');
  await expect(log).toContainText(
    'feedback-rate {"pageId":"pricing","rating":4}'
  );
  await widget.locator('textarea').fill('  More examples ');
  await page.check('#reject');
  await widget.locator('.send').click();
  await expect(log).toContainText('feedback-submit cancelled by the page');
  await expect(widget.locator('textarea')).toHaveValue('  More examples ');

  // An accepted submit carries the trimmed comment and thanks the user.
  await page.uncheck('#reject');
  await widget.locator('.send').click();
  await expect(log).toContainText(
    'feedback-submit {"pageId":"pricing","rating":4,"comment":"More examples"}'
  );
  await expect(widget.locator('.thanks')).toHaveText(
    'Thanks for your feedback!'
  );
  await widget.locator('.again').click();
  await expect(widget.locator('.face[aria-pressed="true"]')).toHaveCount(0);

  // Changing page-id starts over; the property follows the attribute.
  await faces.nth(0).click();
  await expect(widget.locator('textarea')).toHaveCount(1);
  await page.click('#next-page');
  await expect(widget.locator('textarea')).toHaveCount(0);
  expect(
    await widget.evaluate(
      el => (el as unknown as Record<string, unknown>).pageId
    )
  ).toBe('docs');

  // An Object property and CSS custom properties from the page.
  await page.click('#korean');
  await expect(widget.locator('.question')).toHaveText(
    '이 페이지가 도움이 되었나요?'
  );
  await expect(faces.first()).toHaveAttribute('aria-label', '매우 나쁨');
  await page.click('#dark');
  await expect(widget.locator('.card')).toHaveCSS(
    'background-color',
    'rgb(30, 41, 59)'
  );

  // The bundle defines the element and leaves no globals behind.
  expect(
    await page.evaluate(() =>
      Object.keys(window).filter(key => /lithent|widget/i.test(key))
    )
  ).toEqual([]);
});

test('widget template: the bundle runs under a strict Content-Security-Policy', async ({
  page,
}) => {
  const origin = 'https://widget.test';
  await page.route(`${origin}/**`, route => {
    const { pathname } = new URL(route.request().url());
    if (pathname === '/widget.js')
      return route.fulfill({
        contentType: 'text/javascript',
        body: readFileSync(bundle),
      });
    return route.fulfill({
      contentType: 'text/html',
      headers: {
        'Content-Security-Policy':
          "default-src 'none'; script-src 'self'; style-src 'self'",
      },
      body: `<!doctype html>
        <feedback-widget page-id="csp" question="Strict?"></feedback-widget>
        <script src="/widget.js"></script>`,
    });
  });

  const violations: string[] = [];
  await page.exposeFunction('reportViolation', (text: string) =>
    violations.push(text)
  );
  await page.addInitScript(() =>
    document.addEventListener('securitypolicyviolation', event =>
      (
        window as unknown as { reportViolation(text: string): void }
      ).reportViolation(`${event.violatedDirective} ${event.blockedURI}`)
    )
  );

  await page.goto(`${origin}/`);
  const widget = page.locator('feedback-widget');
  await expect(widget.locator('.question')).toHaveText('Strict?');
  await widget.locator('.face').nth(4).click();
  // Shadow DOM styles applied without 'unsafe-inline'.
  await expect(widget.locator('.send')).toHaveCSS(
    'background-color',
    'rgb(37, 99, 235)'
  );
  expect(violations).toEqual([]);
});
