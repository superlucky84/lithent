// Supplemental correctness probe, separate from the frozen DC-21 performance run.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
const run = path.resolve(process.argv[2]);
const dest = path.resolve(process.argv[3]);
assert(
  !fs.existsSync(dest),
  'Preserve previous observations; choose a fresh output'
);
const hash = data => createHash('sha256').update(data).digest('hex');
const raw = {
  at: new Date().toISOString(),
  scope:
    'supplemental native/helper and public-API trusted-click probe; no timing samples',
  flatSourceCommit: '7e838bcd723261cb3840388f4f0ce1dd8c13e7ec',
  inputs: {},
  results: {},
};
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
raw.browser = browser.version();
try {
  for (const variant of ['baseline', 'slot', 'flat']) {
    const helper = path.join(run, variant, 'production/event-helper.mjs');
    const bundle = path.join(run, variant, 'production/lithent.umd.js');
    raw.inputs[helper] = hash(fs.readFileSync(helper));
    raw.inputs[bundle] = hash(fs.readFileSync(bundle));
    let page = await browser.newPage();
    const sourceHelper = await page.evaluate(
      code => {
        const updateEvent = new Function(
          code.replace(/\bexport\s+/g, '') + '\nreturn updateEvent;'
        )();
        const el = document.createElement('button');
        const calls = [];
        const a = () => calls.push('a');
        const b = () => calls.push('b');
        el.addEventListener('click', () => updateEvent(el, 'onclick', b), {
          once: true,
        });
        updateEvent(el, 'onClick', a);
        el.click();
        const first = calls.splice(0);
        el.click();
        return { first, next: calls.slice() };
      },
      fs.readFileSync(helper, 'utf8')
    );
    await page.close();
    page = await browser.newPage();
    await page.addScriptTag({ content: fs.readFileSync(bundle, 'utf8') });
    await page.evaluate(() => {
      const { h, mount, render } = window.lithent;
      const calls = [];
      const trusted = [];
      let aliases = false;
      let bump;
      customElements.define(
        'edge-probe',
        class extends HTMLElement {
          constructor() {
            super();
            this.addEventListener(
              'click',
              event => {
                trusted.push(event.isTrusted);
                aliases = true;
                bump();
              },
              { once: true }
            );
          }
        }
      );
      const a = () => calls.push('a');
      const b = () => calls.push('b');
      const App = mount(renew => {
        bump = renew;
        return () =>
          h(
            'edge-probe',
            aliases ? { onClick: a, onclick: b } : { onClick: a },
            'go'
          );
      });
      render(h(App, {}), document.body);
      window.__edge = { calls, trusted };
    });
    await page.locator('edge-probe').click();
    const first = await page.evaluate(() => ({
      calls: window.__edge.calls.splice(0),
      trusted: window.__edge.trusted.slice(),
    }));
    await page.locator('edge-probe').click();
    const next = await page.evaluate(() => window.__edge.calls.splice(0));
    const expectedFirst = variant === 'flat' ? [] : ['a'];
    assert.deepEqual(sourceHelper.first, expectedFirst);
    assert.deepEqual(sourceHelper.next, ['a', 'b']);
    assert.deepEqual(first.calls, expectedFirst);
    assert.deepEqual(first.trusted, [true]);
    assert.deepEqual(next, ['a', 'b']);
    raw.results[variant] = {
      sourceHelper,
      publicAPI: { firstTrustedClick: first, nextClick: next },
      unchangedHandlerPreservedDuringFirstClick: first.calls.includes('a'),
    };
    await page.close();
  }
  for (const [file, digest] of Object.entries(raw.inputs))
    assert.equal(hash(fs.readFileSync(file)), digest, file);
  raw.knownFlatRegressionReproduced = true;
  raw.notes =
    'Probe success means reproduction confirmed; flat fails unchanged-handler preservation. This is not a passing contract result for flat.';
  fs.writeFileSync(dest, JSON.stringify(raw, null, 2) + '\n');
  console.log(JSON.stringify(raw.results, null, 2));
} finally {
  await browser.close();
}
