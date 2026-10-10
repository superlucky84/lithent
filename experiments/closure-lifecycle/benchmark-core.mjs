import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const arg = name => args[args.indexOf(name) + 1];
if (!args.includes('--baseline') || !args.includes('--baseline-concurrent'))
  throw new Error(
    'Pass baseline ESM paths with --baseline/--baseline-concurrent'
  );
const files = new Map([
  ['/baseline.mjs', readFileSync(arg('--baseline'), 'utf8')],
  [
    '/baseline-concurrent.mjs',
    readFileSync(arg('--baseline-concurrent'), 'utf8'),
  ],
  ['/base.mjs', readFileSync(resolve(repo, 'dist/lithent.mjs'), 'utf8')],
  [
    '/concurrent.mjs',
    readFileSync(
      resolve(repo, 'lithentConcurrent/dist/lithentConcurrent.mjs'),
      'utf8'
    ),
  ],
]);
const lifecycle = readFileSync(
  resolve(repo, 'experiments/closure-lifecycle/dist/lifecycle.mjs'),
  'utf8'
);
for (const core of ['base', 'concurrent'])
  for (const mode of ['active', 'paused']) {
    // Isolate module instances to keep opt-in history out of ordinary-path JIT.
    const name = `${core}-${mode}`;
    files.set(`/${name}.mjs`, files.get(`/${core}.mjs`));
    files.set(
      `/lifecycle-${name}.mjs`,
      lifecycle.replace(/(['"])lithent\1/g, JSON.stringify(`/${name}.mjs`))
    );
  }
const server = createServer((request, response) => {
  const source = files.get(request.url);
  response.setHeader('Content-Type', source ? 'text/javascript' : 'text/html');
  response.end(source ?? '<!doctype html><body></body>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.LITHENT_CHROMIUM_PATH || undefined,
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const measurements = await page.evaluate(async () => {
    const modules = {};
    for (const name of [
      'baseline',
      'baseline-concurrent',
      'base',
      'concurrent',
      'base-active',
      'concurrent-active',
      'base-paused',
      'concurrent-paused',
    ])
      modules[name] = await import(`/${name}.mjs`);
    const adapters = {};
    for (const name of [
      'base-active',
      'concurrent-active',
      'base-paused',
      'concurrent-paused',
    ])
      adapters[name] = await import(`/lifecycle-${name}.mjs`);
    const run = async (name, workload, enabled) => {
      const { h, mount, render, nextTick, componentMap } = modules[name];
      const host = document.createElement('div');
      document.body.appendChild(host);
      let value = 0;
      let updateRoot;
      let updateLeaf;
      const Leaf = mount((renew, props) => {
        if (props.id === 0) updateLeaf = renew;
        return () => h('span', {}, String(value));
      });
      let destroyOther;
      if (enabled === 'paused') {
        let gate;
        const Other = mount(() => {
          gate = adapters[name].useRenderBoundary();
          return () => h('aside', {}, 'retained elsewhere');
        });
        const otherHost = document.createElement('div');
        const remove = render(h(Other, {}), otherHost);
        gate.pause();
        destroyOther = remove;
      }
      const Root = mount(renew => {
        updateRoot = renew;
        if (enabled === 'active') adapters[name].useRenderBoundary();
        return () => {
          if (workload === 'parent')
            return h(
              'div',
              {},
              Array.from({ length: 64 }, (_, id) => h(Leaf, { id, key: id }))
            );
          let node = h(Leaf, { id: 0 });
          for (let depth = 0; depth < 16; depth++) node = h('div', {}, node);
          return node;
        };
      });
      const destroy = render(h(Root, {}), host);
      const renew = workload === 'parent' ? updateRoot : updateLeaf;
      const iterations = workload === 'parent' ? 2000 : 10000;
      // Warm the exact mounted tree outside the timed loop.
      for (let i = 0; i < 200; i++) {
        value++;
        renew();
        await nextTick();
      }
      const started = performance.now();
      for (let i = 0; i < iterations; i++) {
        value++;
        renew();
        await nextTick();
      }
      const elapsed = performance.now() - started;
      if (host.querySelector('span').textContent !== String(value))
        throw new Error('Benchmark failed to commit the latest value');
      destroy();
      destroyOther?.();
      host.remove();
      if (componentMap.renderGate?.blocks)
        throw new Error('Benchmark leaked its boundary adapter');
      return { elapsed, iterations };
    };
    const results = [];
    // Warm every module/workload before collecting any sample.
    for (const workload of ['leaf', 'parent'])
      for (const core of ['base', 'concurrent']) {
        const before = core === 'base' ? 'baseline' : 'baseline-concurrent';
        const supported = adapters[`${core}-active`].supportsRenderBoundary();
        const variants = [
          ['baseline', before, false],
          ['current', core, false],
        ];
        if (supported)
          variants.push(
            ['boundaryActive', `${core}-active`, 'active'],
            ['boundaryElsewherePaused', `${core}-paused`, 'paused']
          );
        for (const [, name, enabled] of variants)
          for (let warmup = 0; warmup < 3; warmup++)
            await run(name, workload, enabled);
        const samples = Object.fromEntries(variants.map(([key]) => [key, []]));
        let iterations;
        for (let round = 0; round < 9; round++) {
          const order = round % 2 ? [...variants].reverse() : variants;
          for (const [variant, name, enabled] of order) {
            const sample = await run(name, workload, enabled);
            samples[variant].push(sample.elapsed);
            iterations = sample.iterations;
          }
        }
        const median = values => [...values].sort((a, b) => a - b)[4];
        const medians = Object.fromEntries(
          Object.entries(samples).map(([name, values]) => [
            name,
            median(values),
          ])
        );
        results.push({
          core,
          renderBoundarySupported: supported,
          workload,
          iterations,
          samplesMs: samples,
          medianMs: medians,
          ordinaryDeltaPercent: (medians.current / medians.baseline - 1) * 100,
          activeBoundaryDeltaPercent: supported
            ? (medians.boundaryActive / medians.current - 1) * 100
            : undefined,
          elsewherePausedDeltaPercent: supported
            ? (medians.boundaryElsewherePaused / medians.current - 1) * 100
            : undefined,
        });
      }
    return results;
  });
  const result = {
    baselineCommit: args.includes('--baseline-commit')
      ? arg('--baseline-commit')
      : undefined,
    sourceHashes: Object.fromEntries(
      [
        ...Array.from(files).filter(([path]) =>
          [
            '/baseline.mjs',
            '/baseline-concurrent.mjs',
            '/base.mjs',
            '/concurrent.mjs',
          ].includes(path)
        ),
        ['lifecycle.mjs', lifecycle],
      ].map(([path, source]) => [
        path,
        createHash('sha256').update(source).digest('hex'),
      ])
    ),
    browser: browser.version(),
    node: process.version,
    rounds: 9,
    methodology:
      '2000 parent renews with 64 child components; 10000 leaf renews under 16 DOM levels. 3 full warmup runs per variant and 200 exact-tree warmup renews per sample. Alternating variant order, median of 9 samples. Independent module instances isolate ordinary, active-boundary and unrelated-paused-boundary JIT history. Actual adapter in both opt-in cases. Local synthetic results, no performance guarantee.',
    measurements,
  };
  if (args.includes('--output'))
    writeFileSync(arg('--output'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
