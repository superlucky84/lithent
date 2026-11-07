import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

import { guard } from './init.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = fs.realpathSync(process.argv[2]);
const initial = guard(out);
const variants = ['baseline', 'event', 'c2', 'combined'];
const destination = path.join(out, 'event-comparison');
fs.mkdirSync(destination, { recursive: true });
assert(
  !fs.existsSync(path.join(destination, 'raw.json')),
  'Use a fresh measurement directory'
);
const hash = data => createHash('sha256').update(data).digest('hex');
const inputs = [
  initial.browser.binary,
  initial.browser.engine,
  path.join(dir, 'fixture.mjs'),
  path.join(dir, 'observe.mjs'),
  path.join(dir, 'event-run.mjs'),
  path.join(out, 'event/build.json'),
];
for (const v of variants)
  for (const name of ['lithent.mjs', 'event-helper.mjs'])
    inputs.push(path.join(out, v, 'dist', name));
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
    cores: os.cpus().length,
    totalMemory: os.totalmem(),
    initialLoad: os.loadavg(),
  },
  protocol: {
    size: 2000,
    variants: variants,
    orderPolicy: 'rotated-quartets-and-reverse',
    settleFrames: 2,
    settleMs: 100,
    orders: 2,
    pagesPerOrder: 4,
    warmupBatches: 10,
    retainedBatches: 30,
    updatesPerBatch: 5,
    dispatchWarmup: 3,
    dispatchBatches: 10,
    dispatchesPerBatch: 20000,
    memoryPages: 3,
    memoryUpdates: 100,
    churn: 10,
    official: false,
  },
  frozen,
  contracts: [],
  observations: [],
  diagnostics: [],
  timings: [],
  memory: [],
  failures: [],
};
const save = () =>
  fs.writeFileSync(
    path.join(destination, 'raw.json'),
    JSON.stringify(raw, null, 2)
  );
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const [, variant, name] = url.pathname.split('/');
    assert(variants.includes(variant));
    res.setHeader('cache-control', 'no-store');
    if (name === 'index.html') {
      res.setHeader('content-type', 'text/html');
      res.end(
        `<!doctype html><meta charset="utf-8"><style>body{font:14px sans-serif}button{width:80px;height:24px}</style><div id="host"></div><script type="module">import{setup,contracts}from'./fixture.mjs';import{observe}from'./observe.mjs';window.setup=setup;window.contracts=contracts;window.observe=observe;window.ready=true;</script>`
      );
    } else {
      assert(
        ['fixture.mjs', 'observe.mjs', 'core.mjs', 'event-helper.mjs'].includes(
          name
        )
      );
      res.setHeader('content-type', 'text/javascript');
      res.end(
        fs.readFileSync(
          ['fixture.mjs', 'observe.mjs'].includes(name)
            ? path.join(dir, name)
            : path.join(
                out,
                variant,
                'dist',
                name === 'core.mjs' ? 'lithent.mjs' : name
              )
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
  executablePath: initial.browser.binary,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
raw.environment.browser = browser.version();
raw.environment.browserProtocol = await (
  await browser.newBrowserCDPSession()
).send('Browser.getVersion');
const kinds = ['inline-only', 'inline-text', 'stable-text', 'noevent-text'];
const open = async variant => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${baseURL}/${variant}/index.html`);
  await page.waitForFunction(() => window.ready);
  return { context, page, errors };
};
const gcSnapshot = async (page, session) => {
  await session.send('HeapProfiler.collectGarbage');
  await session.send('HeapProfiler.collectGarbage');
  const metrics = await session.send('Performance.getMetrics');
  const dom = await session.send('Memory.getDOMCounters');
  return {
    heap: metrics.metrics.find(m => m.name === 'JSHeapUsedSize').value,
    ...dom,
  };
};
try {
  for (const variant of variants) {
    const ctx = await open(variant);
    const contracts = await ctx.page.evaluate(() => window.contracts());
    const observations = await ctx.page.evaluate(() => window.observe());
    assert.equal(ctx.errors.length, 0, ctx.errors.join('\n'));
    raw.contracts.push({ variant, ...contracts });
    raw.observations.push({ variant, ...observations });
    assert.deepEqual(observations.aliasDedup, ['a', 'b']);
    assert.deepEqual(observations.reusedFrozenEvent, ['a', 'b']);
    assert.deepEqual(observations.aliasReplacementOrder, ['b', 'c']);
    assert.deepEqual(
      observations.externalOrder,
      ['baseline', 'c2'].includes(variant)
        ? ['external', 'new']
        : ['new', 'external']
    );
    assert.equal(
      observations.externalRemove,
      ['baseline', 'c2'].includes(variant) ? 0 : 1
    );
    assert.equal(
      observations.externalDedup,
      ['baseline', 'c2'].includes(variant) ? 1 : 2
    );
    assert.deepEqual(
      observations.sameDispatchReplacement,
      ['baseline', 'c2'].includes(variant) ? [] : ['new']
    );
    assert.deepEqual(
      observations.nextDispatchReplacement,
      ['baseline', 'c2'].includes(variant) ? ['new'] : ['new', 'new']
    );
    await ctx.context.close();
    save();
    for (const kind of kinds) {
      const ctx = await open(variant);
      const diagnostic = await ctx.page.evaluate(async kind => {
        const nativeAdd = EventTarget.prototype.addEventListener;
        const nativeRemove = EventTarget.prototype.removeEventListener;
        let count = { add: 0, remove: 0 };
        // Diagnostics count native API calls only on fixture button nodes.
        EventTarget.prototype.addEventListener = function (type, ...args) {
          if (this instanceof HTMLButtonElement && type === 'click')
            count.add++;
          return nativeAdd.call(this, type, ...args);
        };
        EventTarget.prototype.removeEventListener = function (type, ...args) {
          if (this instanceof HTMLButtonElement && type === 'click')
            count.remove++;
          return nativeRemove.call(this, type, ...args);
        };
        window.app = window.setup(kind, 2000);
        const mount = { ...count };
        count = { add: 0, remove: 0 };
        await window.app.update(12);
        const update = { ...count };
        window.app.validate();
        const dispatch = window.app.dispatch(2000);
        count = { add: 0, remove: 0 };
        window.app.dispose();
        window.app = null;
        return { mount, updates: 12, update, dispatch, dispose: { ...count } };
      }, kind);
      assert.equal(ctx.errors.length, 0, ctx.errors.join('\n'));
      const eventful = kind !== 'noevent-text';
      const changing = kind.startsWith('inline');
      assert.equal(diagnostic.mount.add, eventful ? 2000 : 0);
      assert.equal(diagnostic.mount.remove, 0);
      assert.equal(
        diagnostic.update.add,
        ['baseline', 'c2'].includes(variant) && changing ? 24000 : 0
      );
      assert.equal(
        diagnostic.update.remove,
        ['baseline', 'c2'].includes(variant) && changing ? 24000 : 0
      );
      assert.deepEqual(diagnostic.dispose, { add: 0, remove: 0 });
      raw.diagnostics.push({ variant, kind, ...diagnostic });
      await ctx.context.close();
      save();
    }
  }
  console.log('PASS: lifecycle, native interop and registration gates');
  // Freeze input hashes across all collection, and keep this lane free of tests/builds/probes.
  for (let order = 0; order < 2; order++)
    for (const kind of kinds)
      for (let round = 0; round < 4; round++) {
        const rotation = variants;
        const rotated = [...rotation.slice(round), ...rotation.slice(0, round)];
        const sequence = order === 0 ? rotated : rotated.reverse();
        for (const variant of sequence) {
          const startedAt = new Date().toISOString();
          const ctx = await open(variant);
          const result = await ctx.page.evaluate(async kind => {
            window.app = window.setup(kind, 2000);
            const mount = window.app.mountMs;
            for (let i = 0; i < 10; i++) await window.app.update(5);
            const updates = [];
            for (let i = 0; i < 30; i++)
              updates.push(await window.app.update(5));
            window.app.validate();
            for (let i = 0; i < 3; i++) window.app.dispatch(20000);
            const dispatch = [];
            for (let i = 0; i < 10; i++)
              dispatch.push(window.app.dispatch(20000));
            const final = window.app.validate();
            window.app.dispose();
            window.app = null;
            return { mount, updates, dispatch, final };
          }, kind);
          assert.equal(ctx.errors.length, 0, ctx.errors.join('\n'));
          raw.timings.push({
            order,
            round,
            kind,
            variant,
            startedAt,
            load: os.loadavg(),
            ...result,
          });
          save();
          await ctx.context.close();
        }
        console.log(
          `timing order=${order} kind=${kind} round=${round + 1}/4 complete`
        );
      }
  for (const kind of kinds)
    for (let round = 0; round < 3; round++)
      for (const variant of [
        ...variants.slice(round),
        ...variants.slice(0, round),
      ]) {
        const ctx = await open(variant);
        const session = await ctx.context.newCDPSession(ctx.page);
        await session.send('Performance.enable');
        const empty = await gcSnapshot(ctx.page, session);
        await ctx.page.evaluate(kind => {
          window.app = window.setup(kind, 2000);
          window.app.validate();
        }, kind);
        const mounted = await gcSnapshot(ctx.page, session);
        await ctx.page.evaluate(async () => {
          await window.app.update(100);
          window.app.validate();
          window.app.dispatch(2000);
        });
        const updated = await gcSnapshot(ctx.page, session);
        await ctx.page.evaluate(async () => {
          await window.app.churn(10);
          window.app.validate();
        });
        const churned = await gcSnapshot(ctx.page, session);
        await ctx.page.evaluate(() => {
          window.app.dispose();
          window.app = null;
        });
        const disposed = await gcSnapshot(ctx.page, session);
        await ctx.page.evaluate(
          () =>
            new Promise(resolve =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => setTimeout(resolve, 100))
              )
            )
        );
        const settled = await gcSnapshot(ctx.page, session);
        assert.equal(ctx.errors.length, 0, ctx.errors.join('\n'));
        raw.memory.push({
          kind,
          variant,
          round,
          empty,
          mounted,
          updated,
          churned,
          disposed,
          settled,
        });
        save();
        await ctx.context.close();
      }
  for (const [file, sha] of Object.entries(frozen))
    assert.equal(hash(fs.readFileSync(file)), sha, file);
  raw.finishedAt = new Date().toISOString();
  save();
  console.log(
    `PASS: ${raw.timings.length} timing pages/${raw.timings.length * 30} update batches/${raw.timings.length * 10} dispatch batches, ${raw.memory.length} memory contexts; inputs unchanged`
  );
} catch (error) {
  raw.failures.push({ at: new Date().toISOString(), message: error.stack });
  save();
  throw error;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
