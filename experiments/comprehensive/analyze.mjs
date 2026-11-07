import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, hash, guard, read } from './init.mjs';
import { distribution, weighted } from '../peer-baseline/statistics.mjs';

const out = fs.realpathSync(process.argv[2]);
const scope = process.argv[3] || 'core';
const selected = scope.startsWith('final-') ? scope.slice(6) : null;
const peers = [
  'react-hooks',
  'react-classes',
  'preact-hooks',
  'preact-classes',
];
const names = selected
  ? ['baseline', selected, ...peers]
  : ['baseline', 'event', 'c2', 'combined'];
const initial = guard(out);
const inputs = read(path.join(out, 'app-inputs.json'));
const cpu = ['main', 'reverse'].map(order =>
  read(path.join(out, `${scope}-${order}/production-cpu.json`))
);
const mem = ['main', 'reverse'].map(order =>
  read(path.join(out, `${scope}-${order}/production-mem.json`))
);
for (const [kind, runs, itemCount, perApp] of [
  ['cpu', cpu, 9, 145],
  ['mem', mem, 5, 15],
]) {
  for (const run of runs) {
    assert(run.complete);
    assert.equal(run.chromeBinarySha256, initial.browser.sha256);
    assert.equal(run.chromeFrameworkSha256, initial.browser.engineSHA256);
    assert.equal(run.samples.length, itemCount * names.length);
    assert.equal(
      run.samples.reduce((sum, sample) => sum + sample.result.length, 0),
      perApp * names.length
    );
    const seen = new Set();
    for (const sample of run.samples) {
      assert(names.includes(sample.name));
      assert(!sample.error);
      assert.equal(
        sample.result.length,
        kind === 'mem' ? 3 : sample.id.startsWith('04_') ? 25 : 15
      );
      const key = `${sample.name}/${sample.id}`;
      assert(!seen.has(key));
      seen.add(key);
      assert.equal(
        run.build[sample.name].bundle,
        inputs.apps[sample.name].bundle
      );
    }
  }
  for (let i = 0; i < runs[0].samples.length; i += names.length) {
    const a = runs[0].samples.slice(i, i + names.length),
      b = runs[1].samples.slice(i, i + names.length);
    assert.equal(new Set([...a, ...b].map(sample => sample.id)).size, 1);
    assert.deepEqual(
      a.map(sample => sample.name),
      b.map(sample => sample.name).reverse()
    );
  }
}
function summarize(runs, memory = false) {
  return [...new Set(runs[0].samples.map(sample => sample.id))]
    .sort()
    .map(id => ({
      id,
      conditions: Object.fromEntries(
        names.map(name => {
          const values = runs.flatMap(run =>
            run.samples
              .filter(sample => sample.name === name && sample.id === id)
              .flatMap(sample => sample.result)
          );
          return [
            name,
            memory
              ? distribution(values)
              : Object.fromEntries(
                  ['total', 'script', 'paint'].map(metric => [
                    metric,
                    distribution(values.map(value => value[metric])),
                  ])
                ),
          ];
        })
      ),
    }));
}
const rows = {
  main: summarize([cpu[0]]),
  reverse: summarize([cpu[1]]),
  pooled: summarize(cpu),
};
const memory = {
  main: summarize([mem[0]], true),
  reverse: summarize([mem[1]], true),
  pooled: summarize(mem, true),
};
const common = fs.readFileSync(
  path.join(inputs.bench, 'webdriver-ts-results/src/Common.ts'),
  'utf8'
);
const weights = common
  .match(/benchmarkWeights = \[([\s\S]*?)\];/)[1]
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
const comparisons = selected
  ? names
      .slice(1)
      .map(name => [selected, name])
      .filter(([a, b]) => a !== b)
      .concat([[selected, 'baseline']])
  : [
      ['event', 'baseline'],
      ['c2', 'baseline'],
      ['combined', 'baseline'],
      ['combined', 'event'],
      ['combined', 'c2'],
    ];
const ratios = Object.fromEntries(
  Object.entries(rows).map(([order, items]) => [
    order,
    Object.fromEntries(
      comparisons.map(([candidate, reference]) => [
        `${candidate}/${reference}`,
        {
          items: items.map(item => ({
            id: item.id,
            ...Object.fromEntries(
              ['total', 'script', 'paint'].map(metric => [
                metric,
                item.conditions[candidate][metric].median /
                  item.conditions[reference][metric].median,
              ])
            ),
          })),
          weighted: Object.fromEntries(
            ['total', 'script', 'paint'].map(metric => [
              metric,
              weighted(
                items.map(
                  item =>
                    item.conditions[candidate][metric].median /
                    item.conditions[reference][metric].median
                ),
                weights
              ),
            ])
          ),
        },
      ])
    ),
  ])
);
const goal = selected
  ? Object.fromEntries(
      Object.entries(rows).map(([order, items]) => [
        order,
        items.map(item => {
          const best = Math.min(
            ...peers.map(name => item.conditions[name].total.median)
          );
          const ratio = item.conditions[selected].total.median / best;
          return {
            id: item.id,
            bestPeerMs: best,
            referencePeers: peers.filter(
              name => item.conditions[name].total.median === best
            ),
            candidateMs: item.conditions[selected].total.median,
            ratio,
            pass: ratio <= 1.1,
            baselineRatio: item.conditions.baseline.total.median / best,
          };
        }),
      ])
    )
  : null;
const result = {
  at: new Date().toISOString(),
  scope,
  names,
  selected,
  inputs: {
    initial: hash(fs.readFileSync(path.join(out, 'initial.json'))),
    apps: hash(fs.readFileSync(path.join(out, 'app-inputs.json'))),
    common: hash(common),
    cpu: cpu.map(run => ({
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      loadStart: run.loadStart,
      loadEnd: run.loadEnd,
    })),
    memory: mem.map(run => ({
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
    })),
  },
  weights,
  rows,
  memory,
  ratios,
  goal,
};
const file = path.join(out, `${scope}-results.json`);
fs.writeFileSync(file, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(
  JSON.stringify(
    {
      file,
      weighted: Object.fromEntries(
        Object.entries(ratios.pooled).map(([name, value]) => [
          name,
          value.weighted,
        ])
      ),
      goalPasses:
        goal &&
        Object.fromEntries(
          Object.entries(goal).map(([order, items]) => [
            order,
            items.filter(item => item.pass).length,
          ])
        ),
    },
    null,
    2
  )
);
