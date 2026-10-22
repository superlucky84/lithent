import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = process.argv[2] || '/tmp/lithent-c3-optin-20261022';
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  path.join(root, '../js-framework-benchmark-upstream');
const browserPath =
  process.env.LITHENT_CHROME_BINARY ||
  '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome';
const hash = file =>
  crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const base = url.pathname.startsWith('/css/')
      ? bench
      : path.join(out, 'diagnostic');
    const file = path.resolve(base, '.' + url.pathname);
    if (!file.startsWith(base + '/')) throw Error('Outside root');
    res.setHeader(
      'content-type',
      {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.woff2': 'font/woff2',
      }[path.extname(file)] || 'application/octet-stream'
    );
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
  headless: true,
  executablePath: browserPath,
});
const result = {
  at: new Date().toISOString(),
  chrome: browser.version(),
  chromeSHA256: hash(browserPath),
  builds: Object.fromEntries(
    ['lithent-before', 'lithent'].map(name => [
      name,
      {
        bundle: hash(path.join(out, 'diagnostic', name, 'main.js')),
        html: hash(path.join(out, 'diagnostic', name, 'index.html')),
      },
    ])
  ),
  runs: [],
};
try {
  for (let round = 0; round < 3; round++)
    for (const name of round % 2
      ? ['lithent', 'lithent-before']
      : ['lithent-before', 'lithent']) {
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        await page.goto(
          `http://127.0.0.1:${server.address().port}/${name}/index.html`
        );
        const work = await page.evaluate(async () => {
          const app = window.__memoDiagnostic;
          const opt = app.memoEnabled;
          const rows = () => [...document.querySelectorAll('tbody>tr')];
          const assert = (value, message) => {
            if (!value) throw Error(message);
          };
          const settle = () => new Promise(queueMicrotask);
          const click = async selector => {
            document.querySelector(selector).click();
            await settle();
          };
          const counts = [];
          const measure = async (stage, action, expected) => {
            const before = app.metrics.renders;
            await action();
            const count = app.metrics.renders - before;
            assert(
              count === expected,
              stage + ' updater count ' + count + ' != ' + expected
            );
            counts.push({ stage, renders: count });
          };
          await measure('create', () => click('#run'), 1000);
          const initial = rows();
          await measure(
            'refresh',
            async () => {
              app.refresh();
              await settle();
            },
            opt ? 0 : 1000
          );
          await measure(
            'first-select',
            () => click('tbody>tr:nth-child(2)>td:nth-child(2)>a'),
            opt ? 1 : 1000
          );
          await measure(
            'move-select',
            () => click('tbody>tr:nth-child(3)>td:nth-child(2)>a'),
            opt ? 2 : 1000
          );
          const labels = rows().map(row => row.cells[1].textContent);
          await measure('partial', () => click('#update'), opt ? 100 : 1000);
          assert(
            rows().every(
              (row, i) =>
                row === initial[i] &&
                row.cells[1].textContent === labels[i] + (i % 10 ? '' : ' !!!')
            ),
            'partial identity/value'
          );
          await measure('swap', () => click('#swaprows'), opt ? 0 : 1000);
          assert(
            rows()[1] === initial[998] && rows()[998] === initial[1],
            'swap identity'
          );
          // Two queued parent operations share a final state in either order.
          for (const swapFirst of [false, true]) {
            const before = rows();
            const labels = before.map(row => row.cells[1].textContent);
            const clickSync = selector =>
              document.querySelector(selector).click();
            if (swapFirst) clickSync('#swaprows');
            clickSync('#update');
            if (!swapFirst) clickSync('#swaprows');
            await settle();
            const swapped = [...before];
            [swapped[1], swapped[998]] = [swapped[998], swapped[1]];
            assert(
              rows().every((row, i) => row === swapped[i]),
              'batched identity'
            );
            assert(
              before.every(
                (row, i) =>
                  row.cells[1].textContent ===
                  labels[i] +
                    ((swapFirst ? (i === 1 ? 998 : i === 998 ? 1 : i) : i) % 10
                      ? ''
                      : ' !!!')
              ),
              'batched label values'
            );
          }
          const selected = rows().find(row => row.className === 'danger');
          const beforeRemove = app.metrics.renders;
          selected.cells[2].querySelector('a').click();
          await settle();
          assert(
            rows().length === 999 &&
              !rows().includes(selected) &&
              !rows().some(row => row.className === 'danger'),
            'selected removal'
          );
          assert(
            app.metrics.renders - beforeRemove === (opt ? 0 : 999),
            'remove updater count'
          );
          app.destroy();
          assert(
            app.metrics.mounts === app.metrics.unmounts,
            'dispose lifecycle'
          );
          return {
            opt,
            counts,
            metrics: { ...app.metrics },
            remainingHost: !!document.getElementById('main'),
          };
        });
        const cdp = await context.newCDPSession(page);
        await cdp.send('HeapProfiler.collectGarbage');
        await cdp.send('HeapProfiler.collectGarbage');
        const retention = await page.evaluate(() =>
          window.__memoDiagnostic.retention()
        );
        assert.equal(work.remainingHost, false);
        assert.equal(retention.retainedKeys, 1000);
        assert.equal(retention.registered, 0);
        assert.equal(retention.liveOutputsAndHost, 0);
        assert.deepEqual(errors, []);
        result.runs.push({ name, round, work, retention, errors });
        console.log(JSON.stringify(result.runs.at(-1)));
      } finally {
        await context.close();
      }
    }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  result.complete = result.runs.length === 6;
  fs.writeFileSync(
    path.join(out, 'diagnostic.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
}
