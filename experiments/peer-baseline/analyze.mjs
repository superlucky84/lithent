import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {
  root,
  bench,
  chrome,
  names,
  peers,
  fileHash,
  hash,
  read,
} from './config.mjs';
import { verify } from './guard.mjs';
import { distribution, weighted } from './statistics.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
const frozen = verify(out),
  p = read(path.join(out, 'provenance.json'));
const get = file => read(path.join(out, file));
const initial = get('initial.json'),
  build = get('round-main/build-manifest.json'),
  gate = get('round-main/production-verify.json'),
  contracts = get('contracts.json');
for (const value of [gate, contracts]) {
  assert.equal(value.complete, true);
  assert.deepEqual(value.build, build);
  assert.equal(value.samples.length, 5);
  assert.deepEqual(new Set(value.samples.map(s => s.name)), new Set(names));
  for (const sample of value.samples) {
    assert.equal(sample.scenarios, 9);
    assert.equal(sample.fontLoaded, true);
  }
}
assert.equal(
  fileHash(path.join(out, 'sources/lithent/src/main.tsx')),
  p.lithent.app
);
assert.equal(
  fileHash(path.join(out, 'sources/lithent/lithent.mjs')),
  p.lithent.core
);
assert.equal(
  fileHash(path.join(out, 'sources/lithent/cacheUpdate.ts')),
  p.lithent.helper
);
const cpu = ['round-main', 'round-reverse'].map(round =>
  get(round + '/production-cpu.json')
);
const mem = ['round-main', 'round-reverse'].map(round =>
  get(round + '/production-mem.json')
);
for (const [kind, runs, items, count] of [
  ['cpu', cpu, 9, 725],
  ['mem', mem, 5, 75],
]) {
  for (const run of runs) {
    assert.equal(run.complete, true);
    assert.deepEqual(run.build, build);
    assert.equal(run.alternatingOrder, true);
    assert.equal(run.samples.length, items * 5);
    assert.equal(
      run.samples.reduce((sum, sample) => sum + sample.result.length, 0),
      count
    );
    assert.equal(run.chromeBinarySha256, fileHash(chrome));
    assert.equal(
      run.chromeFrameworkSha256,
      'b1d0216b347be90a898e9961302916aa1dbf4659f96597ea836dd3eb149574b7'
    );
    const seen = new Set();
    for (const sample of run.samples) {
      assert.ok(names.includes(sample.name));
      assert.equal(!!sample.error, false);
      assert.equal(
        sample.result.length,
        kind === 'mem' ? 3 : sample.id.startsWith('04_') ? 25 : 15
      );
      const key = sample.name + '/' + sample.id;
      assert.equal(seen.has(key), false);
      seen.add(key);
    }
  }
  for (let i = 0; i < items * 5; i += 5) {
    const main = runs[0].samples.slice(i, i + 5),
      reverse = runs[1].samples.slice(i, i + 5);
    assert.equal(new Set([...main, ...reverse].map(s => s.id)).size, 1);
    assert.deepEqual(
      main.map(s => s.name),
      reverse.map(s => s.name).reverse()
    );
  }
}
const memoryPreflight = get('memory-preflight.json');
for (const run of mem)
  assert.deepEqual(run.memoryRegistration, memoryPreflight);
const summarize = (runs, memory = false) =>
  [...new Set(runs[0].samples.map(sample => sample.id))].sort().map(id => ({
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
const rows = {
    main: summarize([cpu[0]]),
    reverse: summarize([cpu[1]]),
    pooled: summarize(cpu),
  },
  memory = {
    main: summarize([mem[0]], true),
    reverse: summarize([mem[1]], true),
    pooled: summarize(mem, true),
  };
const common = fs.readFileSync(path.join(out, 'Common.ts'), 'utf8');
assert.equal(hash(common), p.commonSHA256);
assert.equal(
  fileHash(path.join(bench, 'webdriver-ts-results/src/Common.ts')),
  p.commonSHA256
);
const weights = common
  .match(/benchmarkWeights = \[([\s\S]*?)\];/)[1]
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
const colorBody = common.match(
  /const computeColor = function \(factor: number\): string \{([\s\S]*?)\n\};/
)[1];
const computeColor = new Function('factor', colorBody);
assert.equal(computeColor(1), 'rgb(99, 191, 124)');
assert.equal(computeColor(2), 'rgb(255, 236, 132)');
assert.equal(computeColor(4), 'rgb(249, 105, 108)');
fs.writeFileSync(
  path.join(out, 'color-function.js'),
  'const computeColor = function(factor) {' + colorBody + '\n};\n'
);
const normalize = (items, memoryMode = false) =>
  items.map(item => {
    const value = name =>
      memoryMode
        ? item.conditions[name].median
        : item.conditions[name].total.median;
    const bestAll = Math.min(...names.map(value)),
      bestPeer = Math.min(...peers.map(value)),
      referencePeers = peers.filter(name => value(name) === bestPeer),
      ratio = value('lithent') / bestPeer;
    return {
      id: item.id,
      bestAll,
      bestPeer,
      referencePeers,
      factors: Object.fromEntries(
        names.map(name => [
          name,
          {
            ratio: value(name) / bestAll,
            color: computeColor(value(name) / bestAll),
          },
        ])
      ),
      lithentPeerRatio: ratio,
      delta: value('lithent') - bestPeer,
      ...(memoryMode
        ? {}
        : {
            allowedMs: bestPeer * 1.1,
            excessMs: Math.max(0, value('lithent') - bestPeer * 1.1),
            requiredReduction: Math.max(0, 1 - 1.1 / ratio),
            pass: ratio <= 1.1,
          }),
    };
  });
const normalized = Object.fromEntries(
    Object.entries(rows).map(([round, items]) => [round, normalize(items)])
  ),
  normalizedMemory = Object.fromEntries(
    Object.entries(memory).map(([round, items]) => [
      round,
      normalize(items, true),
    ])
  );
const weightedCPU = Object.fromEntries(
  Object.entries(rows).map(([round, items]) => [
    round,
    Object.fromEntries(
      names.map(name => [
        name,
        Object.fromEntries(
          ['total', 'script'].map(metric => [
            metric,
            weighted(
              items.map(
                item =>
                  item.conditions[name][metric].median /
                  Math.min(...names.map(n => item.conditions[n][metric].median))
              ),
              weights
            ),
          ])
        ),
      ])
    ),
  ])
);
const weightedMemory = Object.fromEntries(
  Object.entries(memory).map(([round, items]) => [
    round,
    Object.fromEntries(
      names.map(name => [
        name,
        weighted(
          items.map(
            item =>
              item.conditions[name].median /
              Math.min(...names.map(n => item.conditions[n].median))
          ),
          items.map(() => 1)
        ),
      ])
    ),
  ])
);
const peerComparisons = Object.fromEntries(
  peers.map(peer => [
    peer,
    {
      cpu: Object.fromEntries(
        Object.entries(rows).map(([round, items]) => [
          round,
          {
            rows: items.map(item => ({
              id: item.id,
              total:
                item.conditions.lithent.total.median /
                item.conditions[peer].total.median,
              script:
                item.conditions.lithent.script.median /
                item.conditions[peer].script.median,
            })),
            weighted: Object.fromEntries(
              ['total', 'script'].map(metric => [
                metric,
                weighted(
                  items.map(
                    item =>
                      item.conditions.lithent[metric].median /
                      item.conditions[peer][metric].median
                  ),
                  weights
                ),
              ])
            ),
          },
        ])
      ),
      memory: Object.fromEntries(
        Object.entries(memory).map(([round, items]) => [
          round,
          items.map(item => ({
            id: item.id,
            ratio:
              item.conditions.lithent.median / item.conditions[peer].median,
            deltaMB:
              item.conditions.lithent.median - item.conditions[peer].median,
          })),
        ])
      ),
    },
  ])
);
const goal = {
  ...p.goal,
  rows: normalized.pooled.map(item => ({
    ...item,
    orders: {
      main: normalized.main.find(x => x.id === item.id).lithentPeerRatio,
      reverse: normalized.reverse.find(x => x.id === item.id).lithentPeerRatio,
    },
    consistent:
      normalized.main.find(x => x.id === item.id).pass &&
      normalized.reverse.find(x => x.id === item.id).pass,
  })),
  pooledPassed: normalized.pooled.filter(item => item.pass).length,
  mainPassed: normalized.main.filter(item => item.pass).length,
  reversePassed: normalized.reverse.filter(item => item.pass).length,
};
goal.allPooled = goal.pooledPassed === 9;
goal.allOrders = goal.mainPassed === 9 && goal.reversePassed === 9;
const targets = goal.rows
  .filter(item => !item.pass)
  .sort((a, b) => b.lithentPeerRatio - a.lithentPeerRatio)
  .slice(0, 2)
  .map(item => ({
    id: item.id,
    peer: item.referencePeers[0],
    ratio: item.lithentPeerRatio,
    requiredReduction: item.requiredReduction,
    excessMs: item.excessMs,
  }));
const sizes = Object.fromEntries(
  names.map(name => [
    name,
    Object.fromEntries(
      [
        ['html', 'index.html'],
        ['js', build[name].entryJS],
      ].map(([kind, file]) => {
        const bytes = fs.readFileSync(path.join(out, 'round-main', name, file));
        return [
          kind,
          {
            raw: bytes.length,
            gzip: zlib.gzipSync(bytes, { level: 9 }).length,
            brotli: zlib.brotliCompressSync(bytes).length,
          },
        ];
      })
    ),
  ])
);
const result = {
  status: 'DC-16 fixed peer baseline comparison; no core change',
  initial,
  provenance: p,
  frozenInputs: {
    file: 'frozen-inputs.json',
    sha256: fileHash(path.join(out, 'frozen-inputs.json')),
    files: Object.keys(frozen.files).length,
  },
  build,
  gate,
  contracts,
  rows,
  memory,
  normalized,
  normalizedMemory,
  weights,
  weightedCPU,
  weightedMemory,
  peerComparisons,
  goal,
  targets,
  cpu,
  mem,
  cpuSamples: 1450,
  memorySamples: 150,
  sizes,
  color: {
    sourceSHA256: p.commonSHA256,
    extractedSHA256: fileHash(path.join(out, 'color-function.js')),
    normalization:
      'Five apps minimum for color; four fixed peers minimum for user 1.10 CPU goal',
    mode: 'CPU total median primary; JS and paint separately; memory median separate',
  },
  limits: [
    'Pinned upstream implementations/locks; React hooks/classes use different locked versions, so this is an adapter comparison, not an isolated React version/hook experiment.',
    'Only the new same-build opposite orders are pooled; two orders do not eliminate temporal/load effects. No p-value/confidence claim.',
    'User CPU threshold applies to all 9 total-time medians; memory has 3 samples/condition/round and no approved CPU-like threshold.',
    'Startup excluded; production payload sizes are separate. No C3 or new core candidate is included.',
  ],
};
result.compression = {
  node: process.version,
  zlib: process.versions.zlib,
  gzipLevel: 9,
};
fs.writeFileSync(
  path.join(out, 'analysis.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify(
    {
      goal: {
        pooled: goal.pooledPassed,
        main: goal.mainPassed,
        reverse: goal.reversePassed,
      },
      targets,
      comparisons: Object.fromEntries(
        Object.entries(peerComparisons).map(([peer, value]) => [
          peer,
          value.cpu.pooled.weighted,
        ])
      ),
    },
    null,
    2
  )
);
