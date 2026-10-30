import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
const out = fs.realpathSync(process.argv[2]);
const read = f => JSON.parse(fs.readFileSync(path.join(out, f), 'utf8'));
const initial = read('initial.json'),
  bench = read('runner-inputs.json').bench;
const mime = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};
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
    res.setHeader('content-type', mime[path.extname(file)] || 'text/html');
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({
  executablePath: initial.browser.binary,
  headless: true,
  args: ['--js-flags=--expose-gc'],
});
const url = name =>
  `http://127.0.0.1:${server.address().port}/${name}/index.html`;
const result = {
  at: new Date().toISOString(),
  chrome: browser.version(),
  native: null,
  work: null,
  retention: [],
};
try {
  const page = await browser.newPage();
  await page.goto(url('diagnostic'));
  result.native = await page.evaluate(() => window.__sd.nativeContracts());
  result.work = await page.evaluate(async () => {
    const tick = async () => {
      for (let i = 0; i < 8; i++) await Promise.resolve();
    };
    const click = async selector => {
      document.querySelector(selector).click();
      await tick();
    };
    await click('#run');
    const rows = [...document.querySelectorAll('tbody>tr')];
    const measurements = [];
    for (const [name, selector] of [
      ['partial', '#update'],
      ['select', 'tbody>tr:nth-child(1000)>td:nth-child(2)>a'],
      ['select-switch', 'tbody>tr:nth-child(999)>td:nth-child(2)>a'],
    ]) {
      window.__sd.resetMetrics();
      await click(selector);
      measurements.push({ name, ...window.__sd.metrics });
    }
    if (
      ![...document.querySelectorAll('tbody>tr')].every((r, i) => r === rows[i])
    )
      throw Error('row identity changed');
    return measurements;
  });
  await page.close();
  for (const name of ['stock', 'control', 'candidate'])
    for (let index = 0; index < 3; index++) {
      const context = await browser.newContext();
      try {
        const page = await context.newPage(),
          errors = [];
        page.on('pageerror', e => errors.push(String(e)));
        await page.goto(url(name));
        await page.evaluate(() => document.fonts.ready);
        const cdp = await context.newCDPSession(page);
        const collect = async () => {
          await cdp.send('HeapProfiler.collectGarbage');
          await cdp.send('HeapProfiler.collectGarbage');
          return {
            heap: await cdp.send('Runtime.getHeapUsage'),
            dom: await cdp.send('Memory.getDOMCounters'),
          };
        };
        const before = await collect();
        await page.evaluate(async () => {
          const tick = async () => {
            for (let j = 0; j < 5; j++) await Promise.resolve();
          };
          for (let i = 0; i < 100; i++) {
            document.querySelector('#run').click();
            await tick();
            document.querySelector('#clear').click();
            await tick();
          }
        });
        const afterChurn = await collect();
        await page.evaluate(async () => {
          const tick = async () => {
            for (let j = 0; j < 5; j++) await Promise.resolve();
          };
          document.querySelector('#run').click();
          await tick();
          for (let i = 0; i < 100; i++) {
            document.querySelector('#update').click();
            await tick();
          }
          document.querySelector('#clear').click();
          await tick();
        });
        const afterUpdatesAndClear = await collect();
        assert.deepEqual(afterChurn.dom, before.dom);
        assert.deepEqual(afterUpdatesAndClear.dom, before.dom);
        assert.deepEqual(errors, []);
        result.retention.push({
          name,
          index,
          before,
          afterChurn,
          afterUpdatesAndClear,
        });
        console.log(
          'retention',
          name,
          index,
          afterUpdatesAndClear.heap.usedSize
        );
      } finally {
        await context.close();
      }
    }
  fs.writeFileSync(
    path.join(out, 'browser.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
  console.log({ native: result.native, contexts: result.retention.length });
} finally {
  await browser.close();
  await new Promise(r => server.close(r));
}
