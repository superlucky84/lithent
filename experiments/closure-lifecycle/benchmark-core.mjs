import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const arg = name => args[args.indexOf(name) + 1];
const iterationsMultiplier = args.includes('--iterations-multiplier')
  ? Number(arg('--iterations-multiplier'))
  : 1;
if (!Number.isSafeInteger(iterationsMultiplier) || iterationsMultiplier < 1)
  throw new Error('Pass a positive integer --iterations-multiplier');
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
const previous = args.includes('--previous-concurrent');
if (previous && !args.includes('--previous-adapter'))
  throw new Error('Pass --previous-adapter with --previous-concurrent');
const previousLifecycle = previous
  ? readFileSync(arg('--previous-adapter'), 'utf8')
  : undefined;
if (previous)
  files.set(
    '/previous.mjs',
    readFileSync(arg('--previous-concurrent'), 'utf8')
  );
for (const core of ['base', 'concurrent', ...(previous ? ['previous'] : [])])
  for (const mode of ['active', 'paused']) {
    // Isolate module instances to keep opt-in history out of ordinary-path JIT.
    const name = `${core}-${mode}`;
    files.set(`/${name}.mjs`, files.get(`/${core}.mjs`));
    files.set(
      `/lifecycle-${name}.mjs`,
      (core === 'previous' ? previousLifecycle : lifecycle).replace(
        /(['"])lithent\1/g,
        JSON.stringify(`/${name}.mjs`)
      )
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
  const measurements = await page.evaluate(
    async ({ previous, onlyWorkload, iterationsMultiplier }) => {
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
        ...(previous ? ['previous', 'previous-active', 'previous-paused'] : []),
      ])
        modules[name] = await import(`/${name}.mjs`);
      const adapters = {};
      for (const name of [
        'base-active',
        'concurrent-active',
        'base-paused',
        'concurrent-paused',
        ...(previous ? ['previous-active', 'previous-paused'] : []),
      ])
        adapters[name] = await import(`/lifecycle-${name}.mjs`);
      const run = async (name, workload, enabled) => {
        const { h, mount, render, nextTick, componentMap } = modules[name];
        const host = document.createElement('div');
        document.body.appendChild(host);
        let value = 0;
        let updateRoot;
        let updateLeaf;
        let updateBackground;
        let backgroundDraws = 0;
        let retained;
        let retainedHost;
        let draftValue = 'saved draft';
        const Leaf = mount((renew, props) => {
          if (props.id === 0) updateLeaf = renew;
          return () => h('span', {}, String(value));
        });
        let destroyOther;
        if (enabled === 'paused' && workload === 'retained-host') {
          retainedHost = document.createElement('section');
          document.body.appendChild(retainedHost);
          const Editor = mount(renew => {
            updateBackground = renew;
            return () => {
              backgroundDraws++;
              return h(
                'article',
                {},
                h('input', {
                  value: draftValue,
                  onInput: event => {
                    draftValue = event.target.value;
                  },
                }),
                h(
                  'ul',
                  {},
                  Array.from({ length: 8192 }, (_, key) =>
                    h('li', { key }, String(value))
                  )
                )
              );
            };
          });
          retained = adapters[name].createRetainedView(
            retainedHost,
            () => () => h(Editor, {}),
            { freezeChildren: true }
          );
          retained.show();
          retainedHost.querySelector('input').value = 'user draft';
          retainedHost
            .querySelector('input')
            .dispatchEvent(new Event('input', { bubbles: true }));
          retained.hide();
        } else if (enabled === 'paused') {
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
            if (workload === 'retained-host')
              return h(
                'main',
                {},
                h('input', {
                  value: String(value),
                  onInput: event => {
                    value = Number(event.target.value);
                    updateRoot();
                    updateBackground?.();
                  },
                }),
                h('output', {}, String(value)),
                Array.from({ length: 32 }, (_, id) => h(Leaf, { id, key: id }))
              );
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
        const input = host.querySelector('input');
        const renew = workload === 'parent' ? updateRoot : updateLeaf;
        const update = () => {
          if (workload === 'retained-host') {
            input.value = String(value + 1);
            input.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            value++;
            renew();
          }
        };
        const iterations =
          (workload === 'retained-host'
            ? 1000
            : workload === 'parent'
              ? 2000
              : 10000) * iterationsMultiplier;
        // Warm the exact mounted tree outside the timed loop.
        for (let i = 0; i < 200; i++) {
          update();
          await nextTick();
        }
        const started = performance.now();
        for (let i = 0; i < iterations; i++) {
          update();
          await nextTick();
        }
        const elapsed = performance.now() - started;
        if (host.querySelector('span').textContent !== String(value))
          throw new Error('Benchmark failed to commit the latest value');
        if (retained) {
          const draft = retainedHost.querySelector('input');
          if (backgroundDraws !== 1)
            throw new Error('Hidden native child rendered during input');
          retained.show();
          await nextTick();
          if (
            backgroundDraws !== 2 ||
            retainedHost.querySelector('input') !== draft ||
            draft.value !== 'user draft' ||
            retainedHost.querySelector('li').textContent !== String(value)
          )
            throw new Error(
              'Retained editor replay mismatch: ' +
                JSON.stringify({
                  name,
                  backgroundDraws,
                  sameInput: retainedHost.querySelector('input') === draft,
                  draft: draft.value,
                  row: retainedHost.querySelector('li').textContent,
                  value,
                })
            );
          retained.dispose();
          retainedHost.remove();
        }
        destroy();
        destroyOther?.();
        host.remove();
        if (
          componentMap.renderGate?.blocks ||
          componentMap.renderGate?.reparent ||
          componentMap.renderGate?.boundaryOwner
        )
          throw new Error('Benchmark leaked its boundary adapter');
        return { elapsed, iterations };
      };
      const results = [];
      // Warm every module/workload before collecting any sample.
      const workloads = ['leaf', 'parent', 'retained-host'];
      if (onlyWorkload && !workloads.includes(onlyWorkload))
        throw new Error('Unknown workload: ' + onlyWorkload);
      for (const workload of onlyWorkload ? [onlyWorkload] : workloads)
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
          if (previous && core === 'concurrent')
            variants.push(
              ['previous', 'previous', false],
              ['previousBoundaryActive', 'previous-active', 'active'],
              ['previousBoundaryElsewherePaused', 'previous-paused', 'paused']
            );
          for (const [, name, enabled] of variants)
            for (let warmup = 0; warmup < 3; warmup++)
              await run(name, workload, enabled);
          const samples = Object.fromEntries(
            variants.map(([key]) => [key, []])
          );
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
            ordinaryDeltaPercent:
              (medians.current / medians.baseline - 1) * 100,
            activeBoundaryDeltaPercent: supported
              ? (medians.boundaryActive / medians.current - 1) * 100
              : undefined,
            elsewherePausedDeltaPercent: supported
              ? (medians.boundaryElsewherePaused / medians.current - 1) * 100
              : undefined,
            previousPausedDeltaPercent:
              previous && supported
                ? (medians.boundaryElsewherePaused /
                    medians.previousBoundaryElsewherePaused -
                    1) *
                  100
                : undefined,
          });
        }
      return results;
    },
    {
      previous,
      onlyWorkload: args.includes('--workload') ? arg('--workload') : undefined,
      iterationsMultiplier,
    }
  );
  const result = {
    baselineCommit: args.includes('--baseline-commit')
      ? arg('--baseline-commit')
      : undefined,
    previousCommit: args.includes('--previous-commit')
      ? arg('--previous-commit')
      : undefined,
    currentCommit: args.includes('--current-commit')
      ? arg('--current-commit')
      : undefined,
    sourceHashes: Object.fromEntries(
      [
        ...Array.from(files).filter(([path]) =>
          [
            '/baseline.mjs',
            '/baseline-concurrent.mjs',
            '/base.mjs',
            '/concurrent.mjs',
            '/previous.mjs',
          ].includes(path)
        ),
        ['lifecycle.mjs', lifecycle],
        ...(previous ? [['previous-lifecycle.mjs', previousLifecycle]] : []),
      ].map(([path, source]) => [
        path,
        createHash('sha256').update(source).digest('hex'),
      ])
    ),
    browser: browser.version(),
    node: process.version,
    rounds: 9,
    iterationsMultiplier,
    methodology:
      'Default iterations: 2000 parent renews with 64 child components; 10000 leaf renews under 16 DOM levels; 1000 input events with 32 result components, with a frozen retained editor containing 8192 rows only in the paused variant. All measured iteration counts are multiplied by iterationsMultiplier. Hidden native renews are suppressed, resume replays once and preserves draft DOM. Setup/hide/resume excluded from timing. 3 full warmup runs per variant and 200 exact-tree warmup renews per sample. Alternating variant order, median of 9 samples. Independent module instances isolate JIT history. Local synthetic JS update timings, no paint/input latency or performance guarantee.',
    measurements,
  };
  if (args.includes('--output'))
    writeFileSync(arg('--output'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
