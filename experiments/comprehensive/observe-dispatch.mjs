import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { guard, hash, read } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const variants = process.argv.slice(3);
assert(variants.length);
const initial = guard(out);
const dest = path.join(
  out,
  `dispatch-${new Date().toISOString().replaceAll(':', '-')}.json`
);
const raw = {
  at: new Date().toISOString(),
  scope:
    'Source-helper and production public-API trusted dispatch correctness; no timing samples',
  inputs: {},
  results: {},
};
const browser = await chromium.launch({
  executablePath: initial.browser.binary,
  headless: true,
});
raw.browser = browser.version();
assert.equal(raw.browser, initial.browser.expectedVersion);
try {
  for (const variant of variants) {
    const directory = path.join(out, variant, 'dist');
    const helper = fs.readFileSync(
      path.join(directory, 'event-helper.mjs'),
      'utf8'
    );
    const bundle = fs.readFileSync(path.join(directory, 'lithent.umd.js'));
    assert.equal(
      hash(bundle),
      read(path.join(out, variant, 'build.json')).bundles['lithent.umd.js']
        .sha256
    );
    raw.inputs[variant] = { helper: hash(helper), bundle: hash(bundle) };
    let page = await browser.newPage();
    const source = await page.evaluate(code => {
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
    }, helper);
    await page.close();
    const publicAPI = {};
    for (const nested of [false, true]) {
      page = await browser.newPage();
      await page.addScriptTag({ content: bundle.toString() });
      await page.evaluate(nested => {
        const { h, mount, render } = window.lithent;
        const calls = [],
          trusted = [];
        let aliases = false,
          renew;
        customElements.define(
          'dispatch-edge',
          class extends HTMLElement {
            constructor() {
              super();
              this.addEventListener(
                'click',
                event => {
                  trusted.push(event.isTrusted);
                  aliases = true;
                  renew();
                  if (nested) this.dispatchEvent(new MouseEvent('click'));
                },
                { once: true }
              );
            }
          }
        );
        const a = () => calls.push('a'),
          b = () => calls.push('b');
        const App = mount(bump => {
          renew = bump;
          return () =>
            h(
              'dispatch-edge',
              aliases ? { onClick: a, onclick: b } : { onClick: a },
              'go'
            );
        });
        render(h(App, {}), document.body);
        window.__dispatch = { calls, trusted };
      }, nested);
      await page.locator('dispatch-edge').click();
      const first = await page.evaluate(() => ({
        calls: window.__dispatch.calls.splice(0),
        trusted: window.__dispatch.trusted.slice(),
      }));
      await page.locator('dispatch-edge').click();
      const next = await page.evaluate(() => window.__dispatch.calls.splice(0));
      publicAPI[nested ? 'nested' : 'ordinary'] = { first, next };
      assert.deepEqual(first.trusted, [true]);
      assert.deepEqual(next, ['a', 'b']);
      await page.close();
    }
    raw.results[variant] = { source, publicAPI };
    const expected = variant === 'flat-original' ? [] : ['a'];
    assert.deepEqual(source.first, expected);
    assert.deepEqual(source.next, ['a', 'b']);
    assert.deepEqual(publicAPI.ordinary.first.calls, expected);
    if (variant !== 'flat-original')
      assert.equal(
        publicAPI.nested.first.calls.filter(call => call === 'a').length,
        2
      );
  }
  guard(out);
  raw.complete = true;
} catch (error) {
  raw.error = String(error.stack || error);
  process.exitCode = 1;
} finally {
  await browser.close();
  raw.finishedAt = new Date().toISOString();
  fs.writeFileSync(dest, JSON.stringify(raw, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ dest, ...raw }, null, 2));
}
