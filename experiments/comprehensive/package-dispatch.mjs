// Trusted regression through each final production module format, both cores.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
import { root, hash, read } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = read(path.join(out, 'initial.json'));
const adoption = read(path.join(out, 'adoption.json'));
for (const [file, digest] of Object.entries(adoption.sources))
  assert.equal(hash(fs.readFileSync(path.join(root, file))), digest, file);
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
for (const [name, target] of [
  ['lithent', root],
  ['lithent-concurrent', path.join(root, 'lithentConcurrent')],
]) {
  const link = path.join(consumer, 'node_modules', name);
  if (fs.existsSync(link))
    assert.equal(fs.realpathSync(link), fs.realpathSync(target));
  else fs.symlinkSync(target, link);
}
fs.writeFileSync(
  path.join(consumer, 'package.json'),
  JSON.stringify({ private: true, type: 'module' }) + '\n'
);
const probeFile = path.join(consumer, 'probe.mjs');
fs.writeFileSync(
  probeFile,
  "import { createRequire } from 'node:module';\nconst require=createRequire(import.meta.url);\nexport const load=async name=>({imported:await import(name),required:require(name)});\n"
);
const { load } = await import(pathToFileURL(probeFile).href);
const result = { at: new Date().toISOString(), samples: [], complete: false };
const destination = path.join(out, 'package-dispatch.json');
assert(!fs.existsSync(destination));
const browser = await chromium.launch({
  executablePath: initial.browser.binary,
  headless: true,
});
result.browser = browser.version();
try {
  result.controls = {};
  const frozenControls = read(
    path.join(root, 'docs/benchmark/comprehensive-event-dispatch.json')
  ).inputs;
  const observation = fs
    .readFileSync(
      path.join(root, 'experiments/comprehensive/observe.mjs'),
      'utf8'
    )
    .replace(/^import[^\n]+\n/, '')
    .replace('export function observe', 'function observe');
  for (const variant of ['baseline', 'slot', 'flat-original', 'event']) {
    const helper = fs.readFileSync(
      path.join(out, variant, 'dist/event-helper.mjs'),
      'utf8'
    );
    assert.equal(hash(helper), frozenControls[variant].helper);
    const page = await browser.newPage();
    try {
      const observed = await page.evaluate(
        ({ helper, observation }) =>
          new Function(
            helper.replace(/\bexport\s+/g, '') +
              '\n' +
              observation +
              '\nreturn observe();'
          )(),
        { helper, observation }
      );
      const native = variant === 'baseline';
      assert.deepEqual(
        observed.externalOrder,
        native ? ['external', 'new'] : ['new', 'external']
      );
      assert.equal(observed.externalRemove, native ? 0 : 1);
      assert.equal(observed.externalDedup, native ? 1 : 2);
      assert.deepEqual(observed.reusedFrozenEvent, ['a', 'b']);
      result.controls[variant] = { helper: hash(helper), observed };
    } finally {
      await page.close();
    }
  }
  for (const [name, folder, stem, globalName] of [
    ['base', 'dist', 'lithent', 'lithent'],
    [
      'concurrent',
      'lithentConcurrent/dist',
      'lithentConcurrent',
      'lithentConcurrent',
    ],
  ]) {
    const packageName = name === 'base' ? 'lithent' : 'lithent-concurrent';
    const { imported, required } = await load(packageName);
    assert.deepEqual(
      Object.keys(imported).sort(),
      Object.keys(required).sort()
    );
    assert.equal('deferRender' in imported, name === 'concurrent');
    for (const [format, suffix] of [
      ['esm', 'mjs'],
      ['umd', 'umd.js'],
      ['cjs', 'cjs'],
    ]) {
      const file = path.join(root, folder, `${stem}.${suffix}`),
        bytes = fs.readFileSync(file);
      if (name === 'base')
        assert.equal(hash(bytes), adoption.bundles[path.basename(file)].sha256);
      else
        assert.equal(
          hash(bytes),
          adoption.concurrentBundles[path.basename(file)].sha256
        );
      const page = await browser.newPage();
      try {
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
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
          { format, code: bytes.toString(), globalName }
        );
        await page.evaluate(() => {
          const { h, mount, render } = window.__core;
          const calls = [],
            trusted = [];
          let aliases = false,
            renew = () => {};
          customElements.define(
            'package-edge',
            class extends HTMLElement {
              constructor() {
                super();
                this.addEventListener(
                  'click',
                  event => {
                    trusted.push(event.isTrusted);
                    aliases = true;
                    renew();
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
                'package-edge',
                aliases ? { onClick: a, onclick: b } : { onClick: a },
                'dispatch'
              );
          });
          const dispose = render(h(App, {}), document.body);
          window.__probe = { calls, trusted, dispose };
        });
        await page.locator('package-edge').click();
        const first = await page.evaluate(() => ({
          calls: window.__probe.calls.splice(0),
          trusted: window.__probe.trusted.slice(),
        }));
        assert.deepEqual(first, { calls: ['a'], trusted: [true] });
        await page.locator('package-edge').click();
        const next = await page.evaluate(() => window.__probe.calls.splice(0));
        assert.deepEqual(next, ['a', 'b']);
        await page.evaluate(() => window.__probe.dispose());
        assert.equal(await page.locator('package-edge').count(), 0);
        let creationFailure;
        if (format === 'esm') {
          await page.evaluate(() => {
            window.__probe = null;
          });
          const cdp = await page.context().newCDPSession(page);
          const collect = async () => {
            await page.evaluate(
              () =>
                new Promise(resolve =>
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => setTimeout(resolve, 100))
                  )
                )
            );
            await cdp.send('HeapProfiler.collectGarbage');
            await cdp.send('HeapProfiler.collectGarbage');
            return cdp.send('Memory.getDOMCounters');
          };
          const empty = await collect();
          const observed = await page.evaluate(() => {
            const { h, mount, render, getComponentKey } = window.__core;
            window.__failureRefs = [];
            customElements.define(
              'failure-edge',
              class extends HTMLElement {
                constructor() {
                  super();
                  window.__failureRefs.push(new WeakRef(this));
                }
              }
            );
            const handler = () => {};
            window.__failureRefs.push(new WeakRef(handler));
            const caught = [];
            try {
              render(
                h('failure-edge', {
                  onClick: handler,
                  title: {
                    toString() {
                      throw new Error('failure-dom-setter');
                    },
                  },
                }),
                document.body
              );
            } catch (error) {
              caught.push(error.message);
            }
            const Failed = mount(() => {
              window.__failureRefs.push(new WeakRef(getComponentKey()));
              throw new Error('failure-component');
            });
            try {
              render(h(Failed, {}), document.body);
            } catch (error) {
              caught.push(error.message);
            }
            return {
              caught,
              refs: window.__failureRefs.length,
              bodyChildren: document.body.childNodes.length,
            };
          });
          assert.deepEqual(observed, {
            caught: ['failure-dom-setter', 'failure-component'],
            refs: 3,
            bodyChildren: 0,
          });
          const settled = await collect();
          const remaining = await page.evaluate(
            () => window.__failureRefs.filter(ref => ref.deref()).length
          );
          assert.equal(remaining, 0);
          assert.equal(settled.nodes, empty.nodes);
          assert.equal(settled.jsEventListeners, empty.jsEventListeners);
          creationFailure = { empty, observed, settled, remaining };
        }
        const svg = await page.evaluate(() => {
          const { h, mount, render, nextTick } = window.__core;
          const calls = [];
          let changed = false,
            renew = () => {};
          const App = mount(bump => {
            renew = bump;
            return () => {
              const version = changed ? 1 : 0;
              return h(
                'svg',
                {
                  xmlns: 'http://www.w3.org/2000/svg',
                  onClick: Object.freeze(function (event) {
                    calls.push({
                      version,
                      svg: this instanceof SVGElement,
                      current: event.currentTarget === this,
                      target: event.target.localName,
                    });
                  }),
                },
                h('circle', { cx: 5, cy: 5, r: 5 })
              );
            };
          });
          const dispose = render(h(App, {}), document.body),
            circle = document.querySelector('circle');
          const event = Object.freeze(
            new MouseEvent('click', { bubbles: true })
          );
          circle.dispatchEvent(event);
          changed = true;
          renew();
          return nextTick().then(() => {
            circle.dispatchEvent(event);
            dispose();
            return calls;
          });
        });
        assert.deepEqual(svg, [
          { version: 0, svg: true, current: true, target: 'circle' },
          { version: 1, svg: true, current: true, target: 'circle' },
        ]);
        let portalPublication;
        if (name === 'concurrent') {
          portalPublication = await page.evaluate(async () => {
            const { h, mount, render, nextTick, notifyStoreWrite } =
              window.__core;
            const target = document.createElement('div');
            document.body.appendChild(target);
            const calls = [];
            let shown = false,
              armed = false,
              renders = 0,
              renew = () => {};
            const duringBuild = [];
            const Observer = mount(() => () => {
              if (armed) {
                armed = false;
                target.click();
                duringBuild.push(...calls);
                notifyStoreWrite();
              }
              return h('i', {}, 'observer');
            });
            const App = mount(bump => {
              renew = bump;
              return () => {
                const frame = ++renders;
                return h(
                  'section',
                  {},
                  shown
                    ? h(
                        'portal',
                        { portal: target, onClick: () => calls.push(frame) },
                        h('b', {}, 'ported')
                      )
                    : null,
                  h(Observer, {})
                );
              };
            });
            const destroy = render(h(App, {}), document.body);
            renders = 0;
            shown = true;
            armed = true;
            renew();
            await nextTick();
            const committedRenders = renders,
              targetChildren = target.childNodes.length;
            target.click();
            const first = calls.slice();
            shown = false;
            renew();
            await nextTick();
            target.click();
            const afterRemove = calls.slice(),
              remaining = target.childNodes.length;
            destroy();
            target.remove();
            return {
              duringBuild,
              committedRenders,
              targetChildren,
              first,
              afterRemove,
              remaining,
            };
          });
          assert.deepEqual(portalPublication, {
            duringBuild: [],
            committedRenders: 2,
            targetChildren: 1,
            first: [2],
            afterRemove: [2],
            remaining: 0,
          });
        }
        assert.deepEqual(errors, []);
        result.samples.push({
          name,
          format,
          file: path.relative(root, file),
          sha256: hash(bytes),
          first,
          next,
          nodeExports: Object.keys(imported).sort(),
          creationFailure,
          svg,
          portalPublication,
          errors,
        });
      } finally {
        await page.close();
      }
    }
  }
  const ui = read(path.join(out, 'ui-inputs.json'));
  const uiBase = path.join(out, 'ui-apps');
  const server = createServer((request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      if (pathname === '/favicon.ico') {
        response.writeHead(204);
        response.end();
        return;
      }
      const folder = pathname.startsWith('/css/') ? ui.bench : uiBase;
      const file = path.resolve(folder, '.' + pathname);
      assert(file.startsWith(folder + '/'));
      response.setHeader(
        'content-type',
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
        }[path.extname(file)] || 'application/octet-stream'
      );
      response.end(fs.readFileSync(file));
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  result.directory = [];
  try {
    for (const [variant, input] of Object.entries(ui.apps)) {
      assert.equal(
        hash(fs.readFileSync(path.join(uiBase, variant, 'main.js'))),
        input.bundle
      );
      const page = await browser.newPage();
      try {
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        await page.goto(
          `http://127.0.0.1:${server.address().port}/${variant}/index.html`
        );
        await page.evaluate(() => document.fonts.ready);
        await page.locator('#run').click();
        assert.equal(await page.locator('tbody>tr').count(), 1000);
        const trusted = {
          run: await page.evaluate(() => window.__directory.lastTrusted()),
        };
        await page.locator('input').fill('Sam Lee');
        assert.equal(await page.locator('tbody>tr').count(), 250);
        trusted.filter = await page.evaluate(() =>
          window.__directory.lastTrusted()
        );
        await page.evaluate(() => {
          window.__savedRow = document.querySelector('tbody>tr');
        });
        await page
          .locator('tbody>tr')
          .first()
          .locator('td:nth-child(2)>a')
          .click();
        assert.equal(await page.locator('tr.danger').count(), 1);
        assert(
          await page.evaluate(
            () => window.__savedRow === document.querySelector('tbody>tr')
          )
        );
        trusted.select = await page.evaluate(() =>
          window.__directory.lastTrusted()
        );
        await page
          .locator('tbody>tr')
          .first()
          .locator('td:nth-child(3)>a>span')
          .click();
        assert.equal(await page.locator('tbody>tr').count(), 249);
        trusted.remove = await page.evaluate(() =>
          window.__directory.lastTrusted()
        );
        await page.locator('input').fill('');
        assert.equal(await page.locator('tbody>tr').count(), 999);
        await page.locator('#clear').click();
        assert.equal(await page.locator('tbody>tr').count(), 0);
        trusted.clear = await page.evaluate(() =>
          window.__directory.lastTrusted()
        );
        assert(Object.values(trusted).every(Boolean));
        assert.deepEqual(errors, []);
        result.directory.push({
          variant,
          bundle: input.bundle,
          rows: [1000, 250, 249, 999, 0],
          selectedIdentity: true,
          trusted,
          errors,
        });
      } finally {
        await page.close();
      }
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
  const table = await browser.newPage();
  try {
    const errors = [];
    table.on('pageerror', error => errors.push(String(error)));
    await table.goto(
      pathToFileURL(path.join(root, 'docs/benchmark/comprehensive-table.html'))
        .href
    );
    assert.equal(await table.locator('#results tr').count(), 10);
    await table.locator('#metric').selectOption('memory');
    assert.equal(await table.locator('#results tr').count(), 6);
    await table.locator('#order').selectOption('reverse');
    assert.equal(await table.locator('#results tr').count(), 6);
    await table.locator('#metric').selectOption('script');
    assert.equal(await table.locator('#results tr').count(), 10);
    assert.deepEqual(errors, []);
    result.interactiveTable = {
      cpuRows: 9,
      memoryRows: 5,
      orderAndMetricControls: true,
      errors,
    };
  } finally {
    await table.close();
  }
  result.complete = true;
} catch (error) {
  result.error = String(error.stack || error);
  throw error;
} finally {
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(destination, JSON.stringify(result, null, 2) + '\n', {
    flag: 'wx',
  });
  await browser.close();
}
console.log(
  JSON.stringify({ complete: result.complete, formats: result.samples.length })
);
