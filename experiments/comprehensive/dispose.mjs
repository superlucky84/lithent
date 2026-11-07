import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
import { hash, read, guard } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = guard(out);
const input = read(path.join(out, 'dispose-inputs.json'));
const dest = path.join(out, 'dispose-results.json');
assert(!fs.existsSync(dest));
const names = Object.keys(input.variants);
for (const name of names)
  assert.equal(
    hash(fs.readFileSync(path.join(out, 'dispose', name, 'main.mjs'))),
    input.variants[name].bundle
  );
const server = createServer((req, res) => {
  try {
    const [name, file] = new URL(req.url, 'http://localhost').pathname
      .split('/')
      .filter(Boolean);
    assert(names.includes(name));
    res.setHeader(
      'content-type',
      file === 'main.mjs' ? 'text/javascript' : 'text/html'
    );
    res.end(
      file === 'main.mjs'
        ? fs.readFileSync(path.join(out, 'dispose', name, file))
        : '<!doctype html><meta charset="utf-8"><p id="outside">outside</p><div id="main"></div>'
    );
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
  executablePath: initial.browser.binary,
  headless: true,
});
const result = {
  at: new Date().toISOString(),
  browser: browser.version(),
  scope:
    'Separate diagnostic root disposer, 3 fresh contexts/condition. Observe populated disposal with app-owned store/renew callback retained, then release those globals and check DOM weak references/post-GC counters. No timing.',
  input,
  samples: [],
  complete: false,
};
const save = () =>
  fs.writeFileSync(dest, JSON.stringify(result, null, 2) + '\n');
try {
  for (let round = 0; round < 3; round++)
    for (const name of round % 2 ? names.slice().reverse() : names) {
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        const session = await context.newCDPSession(page);
        await session.send('Performance.enable');
        await page.goto(
          `http://127.0.0.1:${server.address().port}/${name}/index.html`
        );
        const collect = async () => {
          await page.evaluate(
            () =>
              new Promise(resolve =>
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => setTimeout(resolve, 100))
                )
              )
          );
          await session.send('HeapProfiler.collectGarbage');
          await session.send('HeapProfiler.collectGarbage');
          const metrics = await session.send('Performance.getMetrics');
          return {
            ...(await session.send('Memory.getDOMCounters')),
            heapBytes: metrics.metrics.find(
              item => item.name === 'JSHeapUsedSize'
            ).value,
          };
        };
        const empty = await collect();
        const observed = await page.evaluate(async () => {
          window.__diagnostic = await import(
            new URL('main.mjs', location.href).href
          );
          document.getElementById('run').click();
          await new Promise(queueMicrotask);
          const elements = [...document.querySelectorAll('#main *')];
          window.__domRefs = elements.map(node => new WeakRef(node));
          return {
            rows: document.querySelectorAll('tbody>tr').length,
            weakRefs: elements.length,
          };
        });
        assert.equal(observed.rows, 1000);
        const mounted = await collect();
        await page.evaluate(() => {
          window.__diagnostic.disposeRoot();
        });
        const disposed = await collect();
        const inspect = () =>
          page.evaluate(() => ({
            remaining: document.getElementById('main').childNodes.length,
            outside: document.getElementById('outside').textContent,
            weakRemaining: window.__domRefs.filter(ref => ref.deref()).length,
          }));
        const retainedAppState = await inspect();
        await page.evaluate(() => {
          window.__diagnostic.releaseAppState();
          window.__diagnostic = null;
        });
        const released = await collect();
        const state = await inspect();
        const sample = {
          round,
          name,
          empty,
          observed,
          mounted,
          disposed,
          retainedAppState,
          released,
          state,
          errors,
        };
        result.samples.push(sample);
        save();
        assert.deepEqual(errors, []);
        assert.equal(retainedAppState.remaining, 0);
        assert.equal(retainedAppState.outside, 'outside');
        assert.equal(state.remaining, 0);
        assert.equal(state.outside, 'outside');
        assert.equal(state.weakRemaining, 0);
        assert.equal(released.nodes, empty.nodes);
        assert.equal(released.jsEventListeners, empty.jsEventListeners);
      } finally {
        await context.close();
      }
    }
  result.complete = true;
  guard(out);
} catch (error) {
  result.error = String(error.stack || error);
  throw error;
} finally {
  result.finishedAt = new Date().toISOString();
  save();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
console.log(
  JSON.stringify({ complete: result.complete, contexts: result.samples.length })
);
