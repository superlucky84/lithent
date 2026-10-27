// Post-GC JS heap and DOM/listener churn, separate from official UASM memory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
import { hash, read, guard } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const input = read(path.join(out, 'app-inputs.json'));
const initial = guard(out);
const chrome = initial.browser.binary;
const expected = { chrome: initial.browser.sha256 };
const names = ['baseline', 'event', 'c2', 'combined'];
assert(
  !fs.existsSync(path.join(out, 'retention.json')),
  'Preserve previous retention results'
);
assert.equal(hash(fs.readFileSync(chrome)), expected.chrome);
const base = path.join(out, 'round-main');
const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const folder = url.pathname.startsWith('/css/') ? input.bench : base;
    const file = path.resolve(folder, '.' + url.pathname);
    assert.ok(file.startsWith(folder + '/'));
    res.setHeader(
      'content-type',
      {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
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
  executablePath: chrome,
  headless: true,
  args: ['--js-flags=--expose-gc'],
});
const result = {
  startedAt: new Date().toISOString(),
  complete: false,
  browser: browser.version(),
  chromeSHA256: expected.chrome,
  samples: [],
  note: 'Fresh contexts, JSHeapUsedSize/DOM counters after GC; not measureUserAgentSpecificMemory and not proof of all possible leak absence.',
};
const save = () =>
  fs.writeFileSync(
    path.join(out, 'retention.json'),
    JSON.stringify(result, null, 2) + '\n'
  );
try {
  for (let round = 0; round < 3; round++)
    for (const name of round % 2 ? names.slice().reverse() : names) {
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
        const collect = async () => {
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
        const sample = { round, name, checkpoints: [], updateCheckpoints: [] };
        let completed = 0;
        for (const cycles of [0, 5, 25, 100]) {
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
          sample.checkpoints.push({ cycles, ...(await collect()) });
        }
        await page.evaluate(async () => {
          document.getElementById('run').click();
          await new Promise(queueMicrotask);
        });
        completed = 0;
        for (const updates of [0, 1, 5, 25, 100]) {
          await page.evaluate(async count => {
            for (let i = 0; i < count; i++) {
              document.getElementById('update').click();
              await new Promise(queueMicrotask);
            }
          }, updates - completed);
          completed = updates;
          sample.updateCheckpoints.push({ updates, ...(await collect()) });
        }
        assert.deepEqual(errors, []);
        assert.equal(
          sample.checkpoints.at(-1).nodes,
          sample.checkpoints[0].nodes
        );
        assert.equal(
          sample.checkpoints.at(-1).jsEventListeners,
          sample.checkpoints[0].jsEventListeners
        );
        assert.equal(
          sample.updateCheckpoints.at(-1).nodes,
          sample.updateCheckpoints[0].nodes
        );
        assert.equal(
          sample.updateCheckpoints.at(-1).jsEventListeners,
          sample.updateCheckpoints[0].jsEventListeners
        );
        result.samples.push(sample);
        save();
      } finally {
        await context.close();
      }
    }
  result.complete = true;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  result.finishedAt = new Date().toISOString();
  save();
  guard(out);
}
console.log(
  JSON.stringify({ complete: result.complete, contexts: result.samples.length })
);
