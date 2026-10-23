import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const directory = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2]);
const rawPath = path.join(out, 'raw.json');
assert(!fs.existsSync(rawPath), 'Use a fresh output directory');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const binary = process.env.LITHENT_CHROME_BINARY || '/usr/bin/chromium';
const actualBinary =
  fs.existsSync('/usr/lib/chromium/chromium') && binary === '/usr/bin/chromium'
    ? '/usr/lib/chromium/chromium'
    : binary;
const inputs = [binary, actualBinary, path.join(directory, 'fixture.mjs')];
for (const variant of ['baseline', 'candidate'])
  for (const lane of ['production', 'diagnostic'])
    inputs.push(path.join(out, variant, lane, 'lithent.mjs'));
const frozen = Object.fromEntries(
  inputs.map(file => [file, hash(fs.readFileSync(file))])
);
const raw = {
  startedAt: new Date().toISOString(),
  environment: {
    platform: os.platform(),
    arch: os.arch(),
    node: process.version,
    cpu: os.cpus()[0].model,
    cpuMax: fs.readFileSync('/sys/fs/cgroup/cpu.max', 'utf8').trim(),
    memoryMax: fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf8').trim(),
  },
  frozen,
  protocol: {
    warmups: 10,
    retainedPerPage: 30,
    pagesPerOrder: 3,
    orders: 2,
    memoryPages: 3,
    memoryUpdates: 100,
    official: false,
  },
  gates: [],
  diagnostics: [],
  timings: [],
  memory: [],
  failures: [],
};
const save = () => fs.writeFileSync(rawPath, JSON.stringify(raw, null, 2));
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const [, variant, lane, name] = url.pathname.split('/');
    assert(
      ['baseline', 'candidate'].includes(variant) &&
        ['production', 'diagnostic'].includes(lane)
    );
    if (name === 'index.html') {
      res.setHeader('content-type', 'text/html');
      res.end(
        `<!doctype html><meta charset="utf-8"><style>body{font:14px sans-serif}input{width:40px}span{padding:1px}</style><div id="host"></div><script type="module">import{setup}from'./fixture.mjs';const q=new URL(location.href).searchParams;window.app=setup(q.get('kind'),Number(q.get('size')));window.ready=true;</script>`
      );
    } else {
      assert(['fixture.mjs', 'core.mjs'].includes(name));
      res.setHeader('content-type', 'text/javascript');
      res.end(
        fs.readFileSync(
          name === 'fixture.mjs'
            ? path.join(directory, name)
            : path.join(out, variant, lane, 'lithent.mjs')
        )
      );
    }
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const baseURL = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: binary,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
raw.environment.browser = browser.version();
raw.environment.browserProtocol = await (
  await browser.newBrowserCDPSession()
).send('Browser.getVersion');
const workloads = [
  ['reveal', 1000],
  ['reorder', 200],
  ['control', 200],
];
const open = async (variant, lane, kind, size) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(
    `${baseURL}/${variant}/${lane}/index.html?kind=${kind}&size=${size}`
  );
  await page.waitForFunction(() => window.ready);
  return { context, page, errors };
};
try {
  // Correctness and diagnostics finish before the timing lane starts.
  for (const [kind, size] of workloads)
    for (const variant of ['baseline', 'candidate']) {
      const { context, page, errors } = await open(
        variant,
        'production',
        kind,
        size
      );
      const gate = await page.evaluate(async () => {
        const initial = window.app.validate();
        for (let i = 0; i < 12; i++) await window.app.step(false, true);
        const final = window.app.validate();
        window.app.dispose();
        window.app = null;
        return {
          initial,
          final,
          remaining: document.querySelector('#host').childNodes.length,
        };
      });
      assert.equal(errors.length, 0, errors.join('\n'));
      raw.gates.push({ kind, size, variant, ...gate });
      await context.close();
      const diagnostic = await open(variant, 'diagnostic', kind, size);
      const counts = await diagnostic.page.evaluate(async () => {
        for (const key of Object.keys(window.__anchorMetrics))
          window.__anchorMetrics[key] = 0;
        for (let i = 0; i < 12; i++) await window.app.step(false, true);
        return { ...window.__anchorMetrics };
      });
      assert.equal(diagnostic.errors.length, 0, diagnostic.errors.join('\n'));
      raw.diagnostics.push({ kind, size, variant, updates: 12, ...counts });
      await diagnostic.context.close();
      save();
    }
  console.log('PASS: 6 production gates and 6 separate diagnostics');
  for (let order = 0; order < 2; order++)
    for (const [kind, size] of workloads)
      for (let round = 0; round < 3; round++) {
        const sequence =
          (order + round) % 2
            ? ['candidate', 'baseline']
            : ['baseline', 'candidate'];
        for (const variant of sequence) {
          const startedAt = new Date().toISOString();
          const load = os.loadavg();
          const { context, page, errors } = await open(
            variant,
            'production',
            kind,
            size
          );
          const samples = await page.evaluate(async () => {
            for (let i = 0; i < 10; i++) await window.app.step();
            const samples = [];
            for (let i = 0; i < 30; i++) samples.push(await window.app.step());
            window.app.validate();
            return samples;
          });
          assert.equal(errors.length, 0, errors.join('\n'));
          raw.timings.push({
            order,
            kind,
            size,
            round,
            variant,
            startedAt,
            finishedAt: new Date().toISOString(),
            load,
            samples,
          });
          await context.close();
          save();
        }
        console.log(`CPU order=${order} kind=${kind} pair=${round} complete`);
      }
  // Memory observations are separate fresh contexts, after all timings.
  for (const [kind, size] of workloads)
    for (let round = 0; round < 3; round++)
      for (const variant of round % 2
        ? ['candidate', 'baseline']
        : ['baseline', 'candidate']) {
        const { context, page, errors } = await open(
          variant,
          'production',
          kind,
          size
        );
        const session = await context.newCDPSession(page);
        await session.send('Performance.enable');
        const memory = async () => {
          await session.send('HeapProfiler.collectGarbage');
          await session.send('HeapProfiler.collectGarbage');
          const metrics = (await session.send('Performance.getMetrics'))
            .metrics;
          const dom = await session.send('Memory.getDOMCounters');
          return {
            heapBytes: metrics.find(item => item.name === 'JSHeapUsedSize')
              .value,
            ...dom,
          };
        };
        const initial = await memory();
        await page.evaluate(async () => {
          for (let i = 0; i < 100; i++) await window.app.step(false);
          window.app.validate();
        });
        const after = await memory();
        await page.evaluate(() => {
          window.app.dispose();
          window.app = null;
        });
        const disposed = await memory();
        assert.equal(errors.length, 0, errors.join('\n'));
        raw.memory.push({
          kind,
          size,
          round,
          variant,
          initial,
          after,
          disposed,
        });
        await context.close();
        save();
      }
  for (const [file, sha] of Object.entries(frozen))
    assert.equal(hash(fs.readFileSync(file)), sha, file);
  raw.finishedAt = new Date().toISOString();
  raw.complete = true;
  save();
  console.log(
    `PASS: ${raw.timings.length * 30} timing samples, ${raw.memory.length} memory contexts`
  );
} catch (error) {
  raw.failures.push({ at: new Date().toISOString(), message: error.stack });
  save();
  throw error;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
