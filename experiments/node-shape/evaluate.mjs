import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { read, guard } from '../keyed-placement/init.mjs';
import { distribution, weighted } from '../peer-baseline/statistics.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const cpu = Object.fromEntries(
  ['main', 'reverse'].map(order => [
    order,
    read(path.join(out, 'measure-' + order, 'production-cpu.json')),
  ])
);
const memory = Object.fromEntries(
  ['main', 'reverse'].map(order => [
    order,
    read(path.join(out, 'measure-' + order, 'production-mem.json')),
  ])
);
for (const run of [...Object.values(cpu), ...Object.values(memory)]) {
  assert.equal(run.complete, true);
  assert.equal(run.chrome, 'Chrome/156.0.8078.47');
  assert.deepEqual(run.build, cpu.main.build);
  assert.equal(run.chromeBinarySha256, cpu.main.chromeBinarySha256);
  assert.equal(run.chromeFrameworkSha256, cpu.main.chromeFrameworkSha256);
}
const ids = [...new Set(cpu.main.samples.map(sample => sample.id))].sort();
assert.equal(ids.length, 9);
const memIds = [
  ...new Set(memory.main.samples.map(sample => sample.id)),
].sort();
assert.equal(memIds.length, 5);
const common = fs.readFileSync(
  path.join(out, 'official-benchmark/webdriver-ts-results/src/Common.ts'),
  'utf8'
);
const weights = common
  .match(/benchmarkWeights\s*=\s*\[([^\]]+)\]/)[1]
  .split(',')
  .map(x => x.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
const lookup = (run, name, id) => {
  const samples = run.samples.filter(
    sample => sample.name === name && sample.id === id
  );
  assert.equal(samples.length, 1, name + ':' + id);
  return samples[0].result;
};
const cpuOrders = {},
  memoryOrders = {};
let distributions = 0;
for (const order of ['main', 'reverse', 'pooled']) {
  const rounds = order === 'pooled' ? ['main', 'reverse'] : [order];
  cpuOrders[order] = { rows: [], weighted: {} };
  for (const id of ids) {
    const count = (id.startsWith('04') ? 25 : 15) * rounds.length;
    const row = { id, metrics: {} };
    for (const metric of ['total', 'script', 'paint']) {
      const pair = Object.fromEntries(
        ['baseline', 'candidate'].map(name => {
          const values = rounds.flatMap(round =>
            lookup(cpu[round], name, id).map(value => value[metric])
          );
          assert.equal(values.length, count);
          distributions++;
          return [name, distribution(values)];
        })
      );
      row.metrics[metric] = {
        ...pair,
        ratio: pair.candidate.median / pair.baseline.median,
        changePercent: 100 * (pair.candidate.median / pair.baseline.median - 1),
      };
    }
    cpuOrders[order].rows.push(row);
  }
  for (const metric of ['total', 'script', 'paint'])
    cpuOrders[order].weighted[metric] = weighted(
      cpuOrders[order].rows.map(row => row.metrics[metric].ratio),
      weights
    );
  memoryOrders[order] = memIds.map(id => {
    const pair = Object.fromEntries(
      ['baseline', 'candidate'].map(name => {
        const values = rounds.flatMap(round => lookup(memory[round], name, id));
        assert.equal(values.length, 3 * rounds.length);
        distributions++;
        return [name, distribution(values)];
      })
    );
    return {
      id,
      ...pair,
      differenceMB: pair.candidate.median - pair.baseline.median,
      ratio: pair.candidate.median / pair.baseline.median,
    };
  });
}
assert.equal(distributions, 192);
const summary = {
  at: new Date().toISOString(),
  scope:
    'Same original app/helper; isolated baseline versus unified WDom factory; Chrome156 fresh samples only',
  cpuSamples: Object.values(cpu).reduce(
    (n, run) =>
      n + run.samples.reduce((m, sample) => m + sample.result.length, 0),
    0
  ),
  memorySamples: Object.values(memory).reduce(
    (n, run) =>
      n + run.samples.reduce((m, sample) => m + sample.result.length, 0),
    0
  ),
  failedBatches: [...Object.values(cpu), ...Object.values(memory)].flatMap(
    run => run.failedBatches || []
  ),
  warnings: Object.values(cpu).flatMap(run =>
    run.samples.flatMap(sample => sample.warnings || [])
  ),
  weights,
  ids,
  cpuOrders,
  memoryOrders,
  distributions,
  collection: Object.fromEntries(
    [
      ...Object.entries(cpu).map(([name, run]) => ['cpu-' + name, run]),
      ...Object.entries(memory).map(([name, run]) => ['memory-' + name, run]),
    ].map(([name, run]) => [
      name,
      {
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        loadStart: run.loadStart,
        loadEnd: run.loadEnd,
        chrome: run.chrome,
        chromeBinarySha256: run.chromeBinarySha256,
        chromeFrameworkSha256: run.chromeFrameworkSha256,
        machine: run.machine,
      },
    ])
  ),
  note: 'Descriptive medians and quartiles; total includes browser rendering. No IC/deopt timing is pooled. No final React/Preact target claim.',
};
assert.equal(summary.cpuSamples, 580);
assert.equal(summary.memorySamples, 60);
fs.writeFileSync(
  path.join(out, 'performance.json'),
  JSON.stringify(summary, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    cpuSamples: summary.cpuSamples,
    memorySamples: summary.memorySamples,
    failedBatches: summary.failedBatches.length,
    warnings: summary.warnings.length,
    weighted: Object.fromEntries(
      Object.entries(cpuOrders).map(([name, order]) => [name, order.weighted])
    ),
    memory: memoryOrders.pooled.map(row => ({
      id: row.id,
      baseline: row.baseline.median,
      candidate: row.candidate.median,
      ratio: row.ratio,
    })),
  })
);
