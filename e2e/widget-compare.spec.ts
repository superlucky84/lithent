import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test, expect } from './test';

// showcase/widget-compare: the create-lithent widget built with lithent,
// React, Preact and Lit (docs/widget-compare/). The template's scenario runs
// on each build's copy of the template's host page, so the size comparison
// compares widgets that do the same thing. Every bundle has its framework
// built in, so the concurrent project skips this file (playwright.config.ts).
const dist = fileURLToPath(
  new URL('../showcase/widget-compare/dist/', import.meta.url)
);

// What loading each bundle leaves on window (DESIGN DC-5). Lit records its
// versions there by design; the comparison page shows the same lists.
const expectedGlobals: Record<string, string[]> = {
  lithent: [],
  react: [],
  preact: [],
  lit: [
    'litPropertyMetadata',
    'reactiveElementVersions',
    'litHtmlVersions',
    'litElementVersions',
  ],
};

test('widget compare: the build has exactly the four versions', () => {
  const sizes = JSON.parse(
    readFileSync(resolve(dist, 'sizes.json'), 'utf8')
  ) as Record<string, unknown>;
  expect(Object.keys(sizes)).toEqual(Object.keys(expectedGlobals));
});

for (const [framework, globals] of Object.entries(expectedGlobals)) {
  test(`widget compare (${framework}): the template's scenario on its host page`, async ({
    page,
  }) => {
    // Non-enumerable, so it is not one of the keys it records.
    await page.addInitScript(() =>
      Object.defineProperty(window, '__keysBefore', {
        value: Object.keys(window),
      })
    );
    await page.goto(pathToFileURL(resolve(dist, framework, 'index.html')).href);
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
    await expect(faces).toHaveCount(5);
    await expect(faces.first()).toHaveAttribute('aria-label', 'Very bad');

    // The page styles its own buttons with dashed borders and uppercase text.
    await expect(faces.first()).toHaveCSS('border-top-style', 'solid');
    await expect(faces.first()).toHaveCSS('text-transform', 'none');
    // ::part(card) and ::part(send) are the widget's styling hooks.
    expect(
      await widget.evaluate(el =>
        [...el.shadowRoot!.querySelectorAll('[part]')].map(node =>
          node.getAttribute('part')
        )
      )
    ).toEqual(['card']);

    // feedback-rate, then a submit the page cancels: the form stays.
    await expect(widget.locator('textarea')).toHaveCount(0);
    await faces.nth(3).click();
    await expect(faces.nth(3)).toHaveAttribute('aria-pressed', 'true');
    await expect(faces.nth(0)).toHaveAttribute('aria-pressed', 'false');
    await expect(log).toContainText(
      'feedback-rate {"pageId":"pricing","rating":4}'
    );
    await expect(widget.locator('.send')).toHaveAttribute('part', 'send');
    await expect(widget.locator('.send')).toHaveText('Send');
    await expect(widget.locator('textarea')).toHaveAttribute(
      'placeholder',
      'Anything we could do better? (optional)'
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
    await expect(widget.locator('.again')).toHaveText('Send another');
    await widget.locator('.again').click();
    await expect(faces).toHaveCount(5);
    await expect(widget.locator('.face[aria-pressed="true"]')).toHaveCount(0);

    // Changing page-id starts over; the property follows the attribute.
    await faces.nth(0).click();
    await expect(widget.locator('textarea')).toHaveCount(1);
    await page.click('#next-page');
    await expect(widget.locator('textarea')).toHaveCount(0);
    await expect(widget.locator('.face[aria-pressed="true"]')).toHaveCount(0);
    expect(
      await widget.evaluate(
        el => (el as unknown as Record<string, unknown>).pageId
      )
    ).toBe('docs');
    await faces.nth(1).click();
    await expect(log).toContainText(
      'feedback-rate {"pageId":"docs","rating":2}'
    );

    // An Object property and CSS custom properties from the page.
    await page.click('#korean');
    await expect(widget.locator('.question')).toHaveText(
      '이 페이지가 도움이 되었나요?'
    );
    await expect(faces.first()).toHaveAttribute('aria-label', '매우 나쁨');
    await expect(widget.locator('.send')).toHaveText('보내기');
    await page.click('#dark');
    await expect(widget.locator('.card')).toHaveCSS(
      'background-color',
      'rgb(30, 41, 59)'
    );

    // An Object attribute is JSON, read the same way.
    await widget.evaluate(el => {
      (el as unknown as Record<string, unknown>).labels = undefined;
      el.setAttribute('labels', '{"send":"Submit"}');
    });
    await expect(widget.locator('.send')).toHaveText('Submit');
    await expect(faces.first()).toHaveAttribute('aria-label', 'Very bad');

    // What the bundle left on window.
    expect(
      await page.evaluate(() => {
        const before = (window as unknown as { __keysBefore: string[] })
          .__keysBefore;
        return Object.keys(window).filter(key => !before.includes(key));
      })
    ).toEqual(globals);
  });

  test(`widget compare (${framework}): runs under a strict Content-Security-Policy`, async ({
    page,
  }) => {
    const origin = 'https://widget.test';
    await page.route(`${origin}/**`, route => {
      const { pathname } = new URL(route.request().url());
      if (pathname === '/widget.js')
        return route.fulfill({
          contentType: 'text/javascript',
          body: readFileSync(resolve(dist, framework, 'widget.js')),
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
    await expect(widget.locator('.send')).toHaveCSS(
      'background-color',
      'rgb(37, 99, 235)'
    );
    expect(violations).toEqual([]);
  });
}
