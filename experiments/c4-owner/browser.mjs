import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';

const out = fs.realpathSync(process.argv[2]);
const initial = JSON.parse(fs.readFileSync(path.join(out, 'initial.json')));
const bench = JSON.parse(
  fs.readFileSync(path.join(out, 'runner-inputs.json'))
).bench;
const server = createServer((req, res) => {
  try {
    const parts = new URL(req.url, 'http://localhost').pathname
      .split('/')
      .filter(Boolean);
    const file =
      parts[0] === 'css'
        ? path.join(bench, ...parts)
        : path.join(
            out,
            'apps',
            parts[0],
            parts.slice(1).join('/') || 'index.html'
          );
    res.setHeader(
      'content-type',
      file.endsWith('.js')
        ? 'application/javascript'
        : file.endsWith('.css')
          ? 'text/css'
          : 'text/html'
    );
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
  executablePath: initial.browser.binary,
  headless: true,
  args: ['--js-flags=--expose-gc'],
});
const result = {
  at: new Date().toISOString(),
  chrome: browser.version(),
  contracts: null,
  retention: [],
};
try {
  const page = await browser.newPage();
  await page.goto(
    `http://127.0.0.1:${server.address().port}/diagnostic/index.html`
  );
  result.ownerContracts = await page.evaluate(() => window.__ownerContracts());
  result.contracts = await page.evaluate(async () => {
    const { boundary: b, store, renewTable } = window.__c4;
    const tick = async () => {
      await Promise.resolve();
      await Promise.resolve();
    };
    const click = async selector => {
      document.querySelector(selector).click();
      await tick();
    };
    const rows = () => [...document.querySelectorAll('tbody>tr')];
    const assert = (ok, msg) => {
      if (!ok) throw Error(msg);
    };
    await click('#run');
    const original = rows();
    let before = b.metrics.itemViews;
    await click('tbody>tr:nth-child(1000)>td:nth-child(2)>a');
    assert(
      b.metrics.itemViews - before === 1,
      'first selection visits one item'
    );
    before = b.metrics.itemViews;
    await click('tbody>tr:nth-child(999)>td:nth-child(2)>a');
    assert(
      b.metrics.itemViews - before === 2,
      'selection switch visits two items'
    );
    before = b.metrics.itemViews;
    await click('#update');
    assert(b.metrics.itemViews - before === 100, 'partial visits 100 items');
    assert(
      rows().every((row, i) => row === original[i]),
      'identity after targeted update'
    );
    const mutations = [];
    const observer = new MutationObserver(batch => mutations.push(...batch));
    observer.observe(document.querySelector('tbody'), {
      subtree: true,
      attributes: true,
      childList: true,
      characterData: true,
    });
    await click('#swaprows');
    assert(rows()[1] === original[998], 'swap identity');
    await click('tbody>tr:nth-child(2)>td:nth-child(2)>a');
    assert(rows()[1].className === 'danger', 'targeted update after swap');
    await click('tbody>tr:nth-child(2)>td:nth-child(3)>a');
    await click('tbody>tr:nth-child(3)>td:nth-child(2)>a');
    assert(rows().length === 999, 'selection after removing selected key');
    // Two model edits and invalidations in one turn, including overlap.
    before = b.metrics.itemViews;
    const key = store.state.rows[998].id;
    store.state.rows[998].label += ' edited';
    b.invalidate([key]);
    b.invalidate([key]);
    await tick();
    assert(b.metrics.itemViews - before === 1, 'coalescing');
    observer.disconnect();
    await click('#clear');
    await click('#run');
    assert(rows().length === 1000, 'recreate');
    return {
      passed: 9,
      mutationsObserved: mutations.length,
      metrics: { ...b.metrics },
    };
  });
  await page.close();
  for (const name of ['baseline', 'candidate'])
    for (let contextIndex = 0; contextIndex < 3; contextIndex++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.goto(
        `http://127.0.0.1:${server.address().port}/${name}/index.html`
      );
      const cdp = await context.newCDPSession(page);
      async function checkpoint() {
        await cdp.send('HeapProfiler.collectGarbage');
        await cdp.send('HeapProfiler.collectGarbage');
        return {
          heap: await cdp.send('Runtime.getHeapUsage'),
          dom: await cdp.send('Memory.getDOMCounters'),
        };
      }
      const before = await checkpoint();
      await page.evaluate(async () => {
        const click = async id => {
          document.querySelector(id).click();
          await Promise.resolve();
          await Promise.resolve();
        };
        for (let i = 0; i < 100; i++) {
          await click('#run');
          await click('#clear');
        }
      });
      const afterChurn = await checkpoint();
      await page.evaluate(async () => {
        document.querySelector('#run').click();
        await Promise.resolve();
        await Promise.resolve();
        for (let i = 0; i < 100; i++) {
          document.querySelector('#update').click();
          await Promise.resolve();
          await Promise.resolve();
        }
        document.querySelector('#clear').click();
        await Promise.resolve();
        await Promise.resolve();
      });
      const afterUpdatesAndClear = await checkpoint();
      assert.equal(
        afterUpdatesAndClear.dom.jsEventListeners,
        before.dom.jsEventListeners,
        'listeners'
      );
      assert.equal(
        afterUpdatesAndClear.dom.nodes,
        before.dom.nodes,
        'DOM nodes'
      );
      assert.deepEqual(errors, []);
      result.retention.push({
        name,
        contextIndex,
        before,
        afterChurn,
        afterUpdatesAndClear,
      });
      console.log(
        'retention',
        name,
        contextIndex,
        afterUpdatesAndClear.heap.usedSize
      );
      await context.close();
    }
  fs.writeFileSync(
    path.join(out, 'browser.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
} finally {
  await browser.close();
  server.close();
}
