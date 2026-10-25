import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { read, guard } from './init.mjs';
import { distribution } from '../peer-baseline/statistics.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const names = ['baseline', 'event', 'c2', 'combined'];
const runs = ['main', 'reverse'].map(order =>
  read(path.join(out, `ui-${order}/production-cpu.json`))
);
for (const run of runs) {
  assert(run.complete);
  assert.equal(run.samples.length, 8);
  assert.equal(
    run.samples.reduce((sum, sample) => sum + sample.result.length, 0),
    160
  );
  for (const sample of run.samples) {
    assert(names.includes(sample.name));
    assert(!sample.error);
    assert.equal(sample.result.length, sample.id.startsWith('04_') ? 25 : 15);
  }
}
const summarize = selected =>
  [...new Set(runs[0].samples.map(sample => sample.id))].sort().map(id => ({
    id,
    conditions: Object.fromEntries(
      names.map(name => [
        name,
        Object.fromEntries(
          ['total', 'script', 'paint'].map(metric => [
            metric,
            distribution(
              selected.flatMap(run =>
                run.samples
                  .filter(sample => sample.id === id && sample.name === name)
                  .flatMap(sample => sample.result.map(value => value[metric]))
              )
            ),
          ])
        ),
      ])
    ),
  }));
const rows = {
  main: summarize([runs[0]]),
  reverse: summarize([runs[1]]),
  pooled: summarize(runs),
};
const comparisons = [
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
        items.map(item => ({
          id: item.id,
          ...Object.fromEntries(
            ['total', 'script', 'paint'].map(metric => [
              metric,
              item.conditions[candidate][metric].median /
                item.conditions[reference][metric].median,
            ])
          ),
        })),
      ])
    ),
  ])
);
const result = {
  at: new Date().toISOString(),
  scope:
    'Deterministic uncached directory UI, click-to-final-paint computed by the frozen runner for partial/select. Not the original cached app or a nine-item peer score.',
  inputs: read(path.join(out, 'ui-inputs.json')),
  names,
  rows,
  ratios,
};
fs.writeFileSync(
  path.join(out, 'ui-results.json'),
  JSON.stringify(result, null, 2) + '\n',
  { flag: 'wx' }
);
console.log(JSON.stringify(ratios.pooled, null, 2));
