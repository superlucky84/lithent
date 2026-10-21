// C1 diagnostic fixture: work counts, unthrottled renew latency and weak retention.
// Latency here is JS + nextTick, not an official click-to-paint score.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  existsSync,
} from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { loadavg } from 'node:os';
import { build } from 'vite';
import { chromium } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out = process.env.LITHENT_C1_OUT || '/tmp/lithent-c1-parent-20261021';
const bench = resolve(
  process.env.LITHENT_BENCHMARK_ROOT || '../js-framework-benchmark-upstream'
);
const npm = bench + '/frameworks/keyed/lithent/node_modules/lithent';
const chrome =
  process.env.LITHENT_CHROME_BINARY ||
  '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome';
const hash = data => createHash('sha256').update(data).digest('hex');
const save = (name, data) =>
  writeFileSync(out + '/' + name, JSON.stringify(data, null, 2));
const mode = process.argv[2];
const source = `
import { h, mount, render, nextTick, getComponentKey, getComponentSubInfo } from 'lithent';
const noop = () => {};
let fields = [], order = [], refresh = noop, dispose = noop;
let heldKeys = [], weak = [];
const host = document.getElementById('main');
const Field = mount((renew, props) => {
  const field = props.field;
  field.renew = renew; field.key = getComponentKey();
  return () => <label data-id={field.id}><input value={field.value}/><span>{field.value}</span></label>;
});
const Shell = mount((_renew, _props, children) => () => <section>{children}</section>);
globalThis.__c1 = {
  setup(n, nested) {
    dispose();
    fields = Array.from({length:n}, (_, id) => ({id, value:''}));
    order = [...fields];
    const List = mount(renew => {
      refresh = renew;
      return () => nested
        ? h(Shell, {}, h(Shell, {}, ...order.map(field => h(Field, {key:field.id, field}))))
        : <section>{order.map(field => <Field key={field.id} field={field}/>)}</section>;
    });
    dispose = render(<List/>, host);
  },
  async update(indices) {
    for (const i of indices) { fields[i].value += 'x'; fields[i].renew(); }
    await nextTick();
  },
  async reorder() { order.reverse(); refresh(); await nextTick(); },
  // Synthetic in-place structural mutation tests stale identity validation.
  // This is not a recommended app pattern or a timing scenario.
  mutateLiveOrder() {
    const node = getComponentSubInfo(fields[0].key, 'vd').value;
    const siblings = node.getParent().children;
    [siblings[0], siblings[1]] = [siblings[1], siblings[0]];
    const labels = host.querySelectorAll('label');
    labels[0].parentNode.insertBefore(labels[1], labels[0]);
    [order[0], order[1]] = [order[1], order[0]];
  },
  check() {
    const labels = [...host.querySelectorAll('label')];
    if (labels.length !== fields.length) throw Error('row count');
    for (let i=0;i<labels.length;i++) {
      if (Number(labels[i].dataset.id) !== order[i].id ||
          labels[i].querySelector('input').value !== String(order[i].value) ||
          labels[i].querySelector('span').textContent !== String(order[i].value)) throw Error('value/order');
    }
  },
  release() {
    const arrays = new Set();
    heldKeys = fields.map(field => field.key);
    weak = fields.map(field => {
      const node = getComponentSubInfo(field.key, 'vd').value;
      arrays.add(node.getParent().children);
      return new WeakRef(node);
    });
    weak.push(...[...arrays].map(array => new WeakRef(array)));
    // Use a module-level noop: a closure created in this scope can keep the
    // shared activation (including the strong arrays Set) alive in V8.
    for (const field of fields) field.renew = noop;
    dispose(); dispose = noop; refresh = noop; fields = []; order = [];
    return {keys:heldKeys.length, weak:weak.length, registered:heldKeys.filter(key => getComponentSubInfo(key, 'vd')).length};
  },
  retained() { return {keys:heldKeys.length, alive:weak.filter(ref => ref.deref()).length, dom:host.childNodes.length}; }
};
`;
const runtime = `
function __hit(k, n=1) { const c = globalThis.__counts ||= {}; c[k] = (c[k] || 0) + n; }
function __search(a, x, k) { const i = a.indexOf(x); __hit(k + 'Calls'); __hit(k + 'Visits', i < 0 ? a.length : i + 1); return i; }
`;
const replaceOne = (code, from, to) => {
  if (code.split(from).length !== 2)
    throw Error('Expected unique instrumentation marker: ' + from);
  return code.replace(from, to);
};
function instrument(code, id) {
  if (!id.endsWith('/wDom.ts')) return;
  code = replaceOne(
    code,
    'brothers.indexOf(originalWDom)',
    "__search(brothers, originalWDom, 'parent')"
  );
  code = replaceOne(
    code,
    'node.compChild.indexOf(prevChild)',
    "__search(node.compChild, prevChild, 'slot')"
  );
  if (code.includes('const parentPositions')) {
    code = replaceOne(
      code,
      'let positions = key && parentPositions.get(key);',
      "__hit('lookups'); let positions = key && parentPositions.get(key);"
    );
    code = replaceOne(
      code,
      'let index = positions && positions.get(brothers);',
      "let index = positions && positions.get(brothers); __hit(index === undefined ? 'cold' : brothers[index] === originalWDom ? 'hits' : 'stale');"
    );
    code = replaceOne(
      code,
      'positions = new WeakMap();',
      "__hit('innerMaps'); positions = new WeakMap();"
    );
    code = replaceOne(
      code,
      'positions.set(brothers, index);',
      "__hit('writes'); positions.set(brothers, index);"
    );
  }
  return runtime + code;
}

if (mode === 'prepare') {
  if (existsSync(out + '/diagnostic-builds.json'))
    throw Error('Use a fresh output directory');
  mkdirSync(out, { recursive: true });
  const manifest = {};
  for (const variant of ['baseline', 'candidate']) {
    const snapshot = out + '/' + variant;
    cpSync((variant === 'baseline' ? npm : root) + '/src', snapshot + '/src', {
      recursive: true,
      filter: p => !p.includes('/tests'),
    });
    cpSync(
      (variant === 'baseline' ? npm : root) + '/dist/lithent.mjs',
      snapshot + '/core.mjs'
    );
    for (const counts of [true, false]) {
      const name = variant + (counts ? '-counts' : '-plain');
      const stage = out + '/sources/' + name;
      mkdirSync(stage, { recursive: true });
      writeFileSync(stage + '/app.tsx', source);
      await build({
        configFile: false,
        root: stage,
        logLevel: 'error',
        plugins: counts
          ? [{ name: 'c1-counts', enforce: 'pre', transform: instrument }]
          : [],
        resolve: {
          alias: [
            {
              find: /^lithent$/,
              replacement: snapshot + (counts ? '/src/index.ts' : '/core.mjs'),
            },
            { find: /^@\//, replacement: snapshot + '/src/' },
          ],
        },
        esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
        build: {
          outDir: out + '/' + name,
          minify: !counts,
          sourcemap: !counts,
          target: 'esnext',
          lib: {
            entry: stage + '/app.tsx',
            formats: ['es'],
            fileName: () => 'main.js',
          },
        },
      });
      writeFileSync(
        out + '/' + name + '/index.html',
        '<!doctype html><div id="main"></div><script type="module" src="main.js"></script>'
      );
      manifest[name] = {
        source: hash(source),
        wDom: hash(readFileSync(snapshot + '/src/wDom.ts')),
        core: hash(readFileSync(snapshot + '/core.mjs')),
        bundle: hash(readFileSync(out + '/' + name + '/main.js')),
      };
    }
  }
  save('diagnostic-builds.json', manifest);
} else if (mode === 'measure') {
  if (existsSync(out + '/diagnostics.json'))
    throw Error('Results already exist');
  const server = createServer((req, res) => {
    const p = resolve(out, '.' + new URL(req.url, 'http://localhost').pathname);
    try {
      if (!p.startsWith(out + '/')) throw Error('path');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader(
        'content-type',
        extname(p) === '.js' ? 'text/javascript' : 'text/html'
      );
      res.end(readFileSync(p));
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({
    executablePath: chrome,
    headless: true,
  });
  const result = {
    startedAt: new Date().toISOString(),
    chrome: browser.version(),
    chromeHash: hash(readFileSync(chrome)),
    loadStart: loadavg(),
    builds: JSON.parse(readFileSync(out + '/diagnostic-builds.json')),
    counts: [],
    latency: [],
    memory: [],
  };
  const open = async name => {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', error => {
      throw error;
    });
    await page.goto(
      'http://127.0.0.1:' + server.address().port + '/' + name + '/index.html'
    );
    await page.waitForFunction(() => globalThis.__c1);
    return { context, page };
  };
  try {
    for (const variant of ['baseline', 'candidate'])
      for (const n of [1000, 10000])
        for (const nested of [false, true]) {
          const { context, page } = await open(variant + '-counts');
          await page.evaluate(
            ({ n, nested }) => globalThis.__c1.setup(n, nested),
            { n, nested }
          );
          for (const [action, indices] of [
            ['first-cold', [0]],
            ['last-cold', [n - 1]],
            ['last-warm', [n - 1]],
            ['partial-cold', Array.from({ length: n / 10 }, (_, i) => i * 10)],
            ['partial-warm', Array.from({ length: n / 10 }, (_, i) => i * 10)],
            ['reorder', []],
            ['post-reorder-cold', [0, n - 1]],
            ['post-reorder-warm', [0, n - 1]],
          ]) {
            const counts = await page.evaluate(
              async ({ action, indices }) => {
                const nodes = [...document.querySelectorAll('input')];
                globalThis.__counts = {};
                if (action === 'reorder') await globalThis.__c1.reorder();
                else await globalThis.__c1.update(indices);
                globalThis.__c1.check();
                const current = [...document.querySelectorAll('input')];
                if (nodes.some(node => !current.includes(node)))
                  throw Error('DOM identity');
                return globalThis.__counts;
              },
              { action, indices }
            );
            result.counts.push({ variant, n, nested, action, counts });
          }
          if (!nested) {
            await page.evaluate(async () => {
              globalThis.__c1.setup(4, false);
              await globalThis.__c1.update([0]);
              globalThis.__c1.mutateLiveOrder();
            });
            const counts = await page.evaluate(async () => {
              globalThis.__counts = {};
              await globalThis.__c1.update([0]);
              globalThis.__c1.check();
              return globalThis.__counts;
            });
            result.counts.push({
              variant,
              n: 4,
              nested: false,
              action: 'synthetic-stale',
              counts,
            });
          }
          console.log('Counted', variant, n, nested);
          await context.close();
        }
    // Fresh context per trial; alternate core order. Retain all observations.
    for (let trial = 0; trial < 3; trial++)
      for (const n of [1000, 10000])
        for (const nested of [false, true])
          for (const variant of trial % 2
            ? ['candidate', 'baseline']
            : ['baseline', 'candidate']) {
            const { context, page } = await open(variant + '-plain');
            const latency = await page.evaluate(
              async ({ n, nested }) => {
                const api = globalThis.__c1;
                let start = performance.now();
                api.setup(n, nested);
                const create = performance.now() - start;
                const indices = Array.from(
                  { length: n / 10 },
                  (_, i) => i * 10
                );
                start = performance.now();
                await api.update(indices);
                const cold = performance.now() - start;
                for (let i = 0; i < 5; i++) await api.update(indices);
                const warm = [];
                for (let i = 0; i < 30; i++) {
                  start = performance.now();
                  await api.update(indices);
                  warm.push(performance.now() - start);
                }
                start = performance.now();
                await api.reorder();
                const reorder = performance.now() - start;
                start = performance.now();
                await api.update(indices);
                const afterReorder = performance.now() - start;
                api.check();
                return { create, cold, warm, reorder, afterReorder };
              },
              { n, nested }
            );
            result.latency.push({ variant, trial, n, nested, ...latency });
            await context.close();
          }
    save('diagnostics-progress.json', result);
    for (let trial = 0; trial < 3; trial++)
      for (const variant of trial % 2
        ? ['candidate', 'baseline']
        : ['baseline', 'candidate']) {
        const { context, page } = await open(variant + '-plain');
        const cdp = await context.newCDPSession(page);
        const heap = async () => {
          await page.evaluate(() => new Promise(r => setTimeout(r, 0)));
          await cdp.send('HeapProfiler.collectGarbage');
          return (await cdp.send('Runtime.getHeapUsage')).usedSize;
        };
        const empty = await heap();
        await page.evaluate(() => globalThis.__c1.setup(1000, false));
        const created = await heap();
        await page.evaluate(() =>
          globalThis.__c1.update(Array.from({ length: 1000 }, (_, i) => i))
        );
        const warmed = await heap();
        const released = await page.evaluate(() => globalThis.__c1.release());
        const disposed = await heap();
        await heap();
        const retained = await page.evaluate(() => globalThis.__c1.retained());
        result.memory.push({
          variant,
          trial,
          empty,
          created,
          warmed,
          disposed,
          released,
          retained,
        });
        console.log('Retention', variant, trial, JSON.stringify(retained));
        save('diagnostics-progress.json', result);
        await context.close();
      }
    result.finishedAt = new Date().toISOString();
    result.loadEnd = loadavg();
    save('diagnostics.json', result);
    console.log(
      'Completed',
      result.counts.length,
      'counts,',
      result.latency.length,
      'latency contexts,',
      result.memory.length,
      'memory contexts'
    );
  } finally {
    await browser.close();
    await new Promise(r => server.close(r));
  }
} else throw Error('Use prepare or measure');
