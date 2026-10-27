import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
import {
  root,
  bench,
  chrome,
  names,
  fileHash,
  guard,
  read,
} from './config.mjs';

const mode = process.argv[2];
assert.ok(['dispose', 'churn'].includes(mode));
const out = path.resolve(process.argv[3] || '/tmp/lithent-c3-cache-20261022');
guard(out);
const diagnostic = mode === 'dispose';
const base = path.join(out, diagnostic ? 'diagnostic' : 'round-main');
const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const folder = url.pathname.startsWith('/css/') ? bench : base;
    const file = path.resolve(folder, '.' + url.pathname);
    assert.ok(file.startsWith(folder + '/'));
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
  executablePath: chrome,
  args: ['--js-flags=--expose-gc'],
});
const result = {
  startedAt: new Date().toISOString(),
  complete: false,
  mode,
  chrome: browser.version(),
  chromeSHA256: fileHash(chrome),
  build: read(path.join(out, 'round-main/build-manifest.json')),
  samples: [],
};
const destination = path.join(
  out,
  diagnostic ? 'root-dispose.json' : 'retention.json'
);
const save = () =>
  fs.writeFileSync(destination, JSON.stringify(result, null, 2) + '\n');
try {
  for (let round = 0; round < 3; round++)
    for (const name of (round % 2 ? [...names].reverse() : names).filter(
      name => !diagnostic || name.startsWith('original')
    )) {
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        const cdp = await context.newCDPSession(page);
        await cdp.send('Performance.enable');
        await page.goto(
          `http://127.0.0.1:${server.address().port}/${name}/index.html`
        );
        await page.evaluate(() => document.fonts.ready);
        const retained = async () => {
          await page.evaluate(
            () =>
              new Promise(resolve =>
                requestAnimationFrame(() => requestAnimationFrame(resolve))
              )
          );
          await cdp.send('HeapProfiler.collectGarbage');
          await cdp.send('HeapProfiler.collectGarbage');
          const { metrics } = await cdp.send('Performance.getMetrics');
          return {
            jsHeapMB:
              metrics.find(metric => metric.name === 'JSHeapUsedSize').value /
              1024 ** 2,
            ...(await cdp.send('Memory.getDOMCounters')),
          };
        };
        const sample = { name, round, checkpoints: [] };
        if (diagnostic) {
          await page.evaluate(async () => {
            for (const id of ['run', 'update', 'swaprows']) {
              document.getElementById(id).click();
              await new Promise(queueMicrotask);
            }
            window.__rootObserved = [
              ...document.querySelectorAll('tbody>tr'),
              document.getElementById('main'),
            ].map(node => new WeakRef(node));
            window.__cacheRoot.destroy();
          });
          await retained();
          sample.retention = await page.evaluate(() => ({
            rowsAndHost: window.__rootObserved.filter(ref => ref.deref())
              .length,
            observed: window.__rootObserved.length,
            rootInterface: window.__cacheRoot.retention(),
            main: !!document.getElementById('main'),
          }));
          assert.equal(sample.retention.observed, 1001);
          assert.equal(sample.retention.rowsAndHost, 0);
          assert.equal(sample.retention.rootInterface, 0);
          assert.equal(sample.retention.main, false);
        } else {
          let completed = 0;
          for (const cycles of [0, 5, 25, 100, 300]) {
            await page.evaluate(async count => {
              for (let i = 0; i < count; i++) {
                document.getElementById('run').click();
                await new Promise(queueMicrotask);
                if (document.querySelectorAll('tbody>tr').length !== 1000)
                  throw Error('Missing rows');
                document.getElementById('clear').click();
                await new Promise(queueMicrotask);
                if (document.querySelectorAll('tbody>tr').length)
                  throw Error('Uncleared rows');
              }
            }, cycles - completed);
            completed = cycles;
            sample.checkpoints.push({ cycles, ...(await retained()) });
          }
          await page.evaluate(async () => {
            document.getElementById('run').click();
            await new Promise(queueMicrotask);
          });
          sample.updateCheckpoints = [];
          let completedUpdates = 0;
          for (const updates of [0, 1, 5, 25, 100]) {
            await page.evaluate(async count => {
              for (let i = 0; i < count; i++) {
                document.getElementById('update').click();
                await new Promise(queueMicrotask);
              }
            }, updates - completedUpdates);
            completedUpdates = updates;
            sample.updateCheckpoints.push({ updates, ...(await retained()) });
          }
          await page.evaluate(async () => {
            document.getElementById('clear').click();
            await new Promise(queueMicrotask);
            if (document.querySelectorAll('tbody>tr').length)
              throw Error('Rows remain');
          });
          sample.afterUpdatesClear = await retained();
        }
        assert.deepEqual(errors, []);
        sample.errors = errors;
        result.samples.push(sample);
        save();
        console.log(mode, name, round, 'complete');
      } finally {
        await context.close();
      }
    }
  guard(out);
  result.complete = true;
  result.finishedAt = new Date().toISOString();
} finally {
  save();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
