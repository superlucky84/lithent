import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const baseline = resolve(process.argv[2] || '/tmp/lithent-vite8/baseline');
const output = resolve(process.argv[3] || '/tmp/lithent-vite8/runtime.json');
const variants = process.argv[4]
  ? JSON.parse(readFileSync(resolve(process.argv[4]), 'utf8'))
  : {
      'base-before': resolve(baseline, 'base/lithent.mjs'),
      'base-after': resolve(root, 'dist/lithent.mjs'),
      'concurrent-before': resolve(
        baseline,
        'concurrent/lithentConcurrent.mjs'
      ),
      'concurrent-after': resolve(
        root,
        'lithentConcurrent/dist/lithentConcurrent.mjs'
      ),
    };
const result = {
  complete: false,
  date: new Date().toISOString(),
  note: 'Local production ESM diagnostic; no browser rendering timing, CPU throttling or official benchmark equivalence. Same app, alternating order, fresh contexts, forced GC.',
  node: process.version,
  warmupUpdates: Number(process.env.LITHENT_RUNTIME_WARMUP || 100),
  measuredUpdates: 30,
  rows: 1000,
  inputs: {},
  samples: [],
};
for (const [name, file] of Object.entries(variants)) {
  const bytes = readFileSync(file);
  result.inputs[name] = {
    sha256: createHash('sha256').update(bytes).digest('hex'),
    raw: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
    brotli: brotliCompressSync(bytes).length,
  };
}
const save = () =>
  writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.LITHENT_CHROME || '/usr/bin/chromium',
});
result.chromium = browser.version();
try {
  for (let round = 0; round < 4; round++) {
    const names = Object.keys(variants);
    if (round % 2) names.reverse();
    for (const name of names) {
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        const cdp = await context.newCDPSession(page);
        await cdp.send('Performance.enable');
        const url =
          'data:text/javascript;base64,' +
          readFileSync(variants[name]).toString('base64');
        await page.evaluate(async url => {
          const L = await import(url);
          const { h, mount, render, getComponentKey, componentMap, nextTick } =
            L;
          let rows = Array.from({ length: 1000 }, (_, id) => ({
            id,
            label: `row ${id}`,
          }));
          let renew;
          const keys = [];
          const retired = [];
          const Row = mount((_renew, props) => {
            keys.push(new WeakRef(getComponentKey()));
            return () => h('li', {}, props.row.label);
          });
          const App = mount(bump => {
            renew = bump;
            return () =>
              h(
                'ul',
                {},
                rows.map(row => h(Row, { key: row.id, row }))
              );
          });
          let destroy = render(h(App, {}), document.body);
          for (const key of keys.slice(0, 20))
            retired.push(new WeakRef(componentMap.get(key.deref()).vd.value));
          window.fixture = {
            keys,
            retired,
            async update(count) {
              const start = performance.now();
              for (let i = 0; i < count; i++) {
                for (let j = 0; j < rows.length; j += 10) rows[j].label += '.';
                renew();
                await nextTick();
              }
              return performance.now() - start;
            },
            async swapAndClear() {
              [rows[1], rows[998]] = [rows[998], rows[1]];
              renew();
              await nextTick();
              if (
                !document
                  .querySelectorAll('li')[1]
                  .textContent.startsWith('row 998')
              )
                throw Error('Keyed swap failed');
              rows = [];
              renew();
              await nextTick();
              if (document.querySelectorAll('li').length)
                throw Error('Clear failed');
              destroy();
              destroy = renew = null;
            },
          };
        }, url);
        await page.evaluate(
          count => window.fixture.update(count),
          Number(process.env.LITHENT_RUNTIME_WARMUP || 100)
        );
        const updateMs = await page.evaluate(() => window.fixture.update(30));
        const count = await page.locator('li').count();
        assert.equal(count, 1000);
        for (let i = 0; i < 2; i++)
          await cdp.send('HeapProfiler.collectGarbage');
        const live = await page.evaluate(() => ({
          keys: window.fixture.keys.filter(ref => ref.deref()).length,
          retired: window.fixture.retired.filter(ref => ref.deref()).length,
        }));
        assert.equal(live.keys, 1000);
        assert.equal(
          live.retired,
          0,
          name + ': initial row nodes retained after updates'
        );
        const liveMetrics = await cdp.send('Performance.getMetrics');
        const liveHeap = liveMetrics.metrics.find(
          metric => metric.name === 'JSHeapUsedSize'
        ).value;
        const liveDom = await cdp.send('Memory.getDOMCounters');
        await page.evaluate(() => window.fixture.swapAndClear());
        for (let i = 0; i < 2; i++)
          await cdp.send('HeapProfiler.collectGarbage');
        const disposed = await page.evaluate(() => ({
          keys: window.fixture.keys.filter(ref => ref.deref()).length,
          retired: window.fixture.retired.filter(ref => ref.deref()).length,
          nodes: document.body.childNodes.length,
        }));
        assert.deepEqual(disposed, { keys: 0, retired: 0, nodes: 0 });
        assert.deepEqual(errors, []);
        const disposedMetrics = await cdp.send('Performance.getMetrics');
        const disposedHeap = disposedMetrics.metrics.find(
          metric => metric.name === 'JSHeapUsedSize'
        ).value;
        const disposedDom = await cdp.send('Memory.getDOMCounters');
        result.samples.push({
          round,
          name,
          updateMs,
          live,
          disposed,
          liveHeap,
          disposedHeap,
          liveDom,
          disposedDom,
        });
        save();
        console.log(JSON.stringify(result.samples.at(-1)));
      } finally {
        await context.close();
      }
    }
  }
  result.complete = true;
} finally {
  await browser.close();
  save();
}
