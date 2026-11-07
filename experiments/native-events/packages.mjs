// Exercise the published export maps and all six production JS formats.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = fs.realpathSync(process.argv[2]);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const artifacts = JSON.parse(fs.readFileSync(path.join(out, 'artifacts.json')));
const initial = JSON.parse(
  fs.readFileSync(
    path.join(root, 'docs/benchmark/comprehensive-initial-inputs.json')
  )
);
for (const [file, expected] of Object.entries(artifacts.sources))
  assert.equal(hash(fs.readFileSync(path.join(root, file))), expected, file);
assert.equal(
  hash(fs.readFileSync(initial.browser.binary)),
  initial.browser.sha256
);
assert.equal(
  hash(fs.readFileSync(initial.browser.engine)),
  initial.browser.engineSHA256
);
const consumer = path.join(out, 'package-consumer');
fs.mkdirSync(path.join(consumer, 'node_modules'), { recursive: true });
for (const [name, folder] of [
  ['lithent', root],
  ['lithent-concurrent', path.join(root, 'lithentConcurrent')],
]) {
  const link = path.join(consumer, 'node_modules', name);
  if (!fs.existsSync(link)) fs.symlinkSync(folder, link);
  assert.equal(fs.realpathSync(link), fs.realpathSync(folder));
}
fs.writeFileSync(
  path.join(consumer, 'package.json'),
  '{"private":true,"type":"module"}\n'
);
const probeFile = path.join(consumer, 'probe.mjs');
fs.writeFileSync(
  probeFile,
  "import { createRequire } from 'node:module';\nconst require=createRequire(import.meta.url);\nexport const load=async name=>({imported:await import(name),required:require(name)});\n"
);
const { load } = await import(pathToFileURL(probeFile).href);
const result = {
  at: new Date().toISOString(),
  node: process.version,
  samples: [],
  exports: {},
  complete: false,
};
const browser = await chromium.launch({
  executablePath: initial.browser.binary,
  headless: true,
});
result.browser = { ...initial.browser, version: browser.version() };
try {
  for (const [core, folder, stem, packageName] of [
    ['base', 'dist', 'lithent', 'lithent'],
    [
      'concurrent',
      'lithentConcurrent/dist',
      'lithentConcurrent',
      'lithent-concurrent',
    ],
  ]) {
    const { imported, required } = await load(packageName);
    assert.deepEqual(
      Object.keys(imported).sort(),
      Object.keys(required).sort()
    );
    assert.equal('deferRender' in imported, core === 'concurrent');
    result.exports[core] = Object.keys(imported).sort();
    for (const [format, suffix] of [
      ['esm', 'mjs'],
      ['umd', 'umd.js'],
      ['cjs', 'cjs'],
    ]) {
      const file = `${folder}/${stem}.${suffix}`;
      const bytes = fs.readFileSync(path.join(root, file));
      assert.equal(hash(bytes), artifacts.bundles[file].sha256, file);
      for (const mode of ['interop', 'alias', 'replace']) {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        try {
          if (format === 'umd')
            await page.addScriptTag({ content: bytes.toString() });
          await page.evaluate(
            async ({ format, code, globalName }) => {
              window.__core =
                format === 'esm'
                  ? await import(
                      'data:text/javascript;charset=utf-8,' +
                        encodeURIComponent(code)
                    )
                  : format === 'umd'
                    ? window[globalName]
                    : (() => {
                        const module = { exports: {} };
                        new Function('module', 'exports', code)(
                          module,
                          module.exports
                        );
                        return module.exports;
                      })();
            },
            { format, code: bytes.toString(), globalName: stem }
          );
          await page.evaluate(mode => {
            const { h, mount, render, nextTick, ref, mountCallback } =
              window.__core;
            const calls = [],
              trusted = [];
            let changed = false,
              renew = () => {};
            const a = Object.freeze(() => calls.push('a'));
            const b = Object.freeze({
              handleEvent() {
                calls.push(this === b ? 'b' : 'bad-receiver');
              },
            });
            if (mode !== 'interop')
              customElements.define(
                'native-package-edge',
                class extends HTMLElement {
                  constructor() {
                    super();
                    this.addEventListener(
                      'click',
                      event => {
                        trusted.push(event.isTrusted);
                        changed = true;
                        renew();
                      },
                      { once: true }
                    );
                  }
                }
              );
            const button = ref(null);
            const external = () => calls.push('external');
            const App = mount(bump => {
              renew = bump;
              if (mode === 'interop')
                mountCallback(() => {
                  button.value.addEventListener('click', a);
                  button.value.addEventListener('click', a);
                  button.value.addEventListener('click', external);
                  return () =>
                    button.value.removeEventListener('click', external);
                });
              return () =>
                h(
                  mode === 'interop' ? 'button' : 'native-package-edge',
                  mode === 'alias'
                    ? changed
                      ? { onClick: a, onclick: b }
                      : { onClick: a }
                    : { ref: button, onClick: changed ? b : a },
                  'native event'
                );
            });
            const dispose = render(h(App, {}), document.body);
            window.__probe = {
              calls,
              trusted,
              dispose,
              remove: () => button.value.removeEventListener('click', a),
              change: async () => {
                changed = true;
                renew();
                await nextTick();
              },
            };
          }, mode);
          const target = page.locator(
            mode === 'interop' ? 'button' : 'native-package-edge'
          );
          await target.click();
          const first = await page.evaluate(() => ({
            calls: window.__probe.calls.splice(0),
            trusted: window.__probe.trusted.slice(),
          }));
          assert.deepEqual(first, {
            calls:
              mode === 'replace'
                ? []
                : mode === 'interop'
                  ? ['a', 'external']
                  : ['a'],
            trusted: mode === 'interop' ? [] : [true],
          });
          const observations = { first };
          if (mode === 'interop') {
            await page.evaluate(() => window.__probe.remove());
            await target.click();
            observations.removed = await page.evaluate(() =>
              window.__probe.calls.splice(0)
            );
            assert.deepEqual(observations.removed, ['external']);
            await page.evaluate(() => window.__probe.change());
          }
          await target.click();
          observations.next = await page.evaluate(() =>
            window.__probe.calls.splice(0)
          );
          assert.deepEqual(
            observations.next,
            mode === 'alias'
              ? ['a', 'b']
              : mode === 'interop'
                ? ['external', 'b']
                : ['b']
          );
          observations.reusedFrozenEvent = await page.evaluate(() => {
            const element = document.querySelector(
              'button,native-package-edge'
            );
            const event = Object.freeze(new Event('click'));
            element.dispatchEvent(event);
            element.dispatchEvent(event);
            return window.__probe.calls.splice(0);
          });
          const one =
            mode === 'alias'
              ? ['a', 'b']
              : mode === 'interop'
                ? ['external', 'b']
                : ['b'];
          assert.deepEqual(observations.reusedFrozenEvent, [...one, ...one]);
          await page.evaluate(() => window.__probe.dispose());
          assert.equal(await target.count(), 0);
          assert.deepEqual(errors, []);
          result.samples.push({
            core,
            format,
            file,
            sha256: hash(bytes),
            mode,
            ...observations,
            errors,
          });
        } finally {
          await page.close();
        }
      }
    }
  }
  assert.equal(result.samples.length, 18);
  result.complete = true;
} finally {
  await browser.close();
  fs.writeFileSync(
    path.join(out, 'packages.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
}
console.log(
  '18 production package probes passed across both cores and ESM/UMD/CJS.'
);
