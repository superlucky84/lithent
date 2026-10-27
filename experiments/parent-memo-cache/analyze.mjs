import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {
  root,
  bench,
  chrome,
  names,
  hash,
  fileHash,
  guard,
  read,
} from './config.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-cache-20261022');
const previous = guard(out);
const priorFiles = JSON.parse(
  zlib.gunzipSync(fs.readFileSync(path.join(root, previous.evidence.file)))
).files;
let upstreamFilesVerified = 0;
for (const [name, record] of Object.entries(priorFiles))
  if (name.startsWith('benchmark/')) {
    assert.equal(
      fileHash(path.join(bench, name.slice('benchmark/'.length))),
      record.sha256,
      name
    );
    upstreamFilesVerified++;
  }
const get = name => read(path.join(out, name));
const build = get('round-main/build-manifest.json');
const gate = get('round-main/production-verify.json');
const contracts = get('round-main/contracts.json');
const diagnostic = get('diagnostic.json');
const dispose = get('root-dispose.json');
const retention = get('retention.json');
for (const [value, count] of [
  [gate, 5],
  [dispose, 6],
  [retention, 15],
]) {
  assert.equal(value.complete, true);
  assert.equal(value.samples.length, count);
  assert.deepEqual(value.build, build);
}
assert.equal(contracts.samples.length, 5);
assert.deepEqual(contracts.build, build);
for (const sample of gate.samples) {
  assert.equal(sample.scenarios, 9);
  assert.equal(sample.fontLoaded, true);
}
assert.equal(diagnostic.complete, true);
assert.equal(diagnostic.runs.length, 9);
for (const run of diagnostic.runs) {
  assert.equal(run.retention.retainedKeys, 1000);
  assert.equal(run.retention.registered, 0);
  assert.equal(run.retention.liveOutputsAndHost, 0);
  assert.equal(run.work.metrics.mounts, run.work.metrics.unmounts);
  assert.deepEqual(run.errors, []);
}
for (const sample of dispose.samples) {
  assert.equal(sample.retention.observed, 1001);
  assert.equal(sample.retention.rowsAndHost, 0);
  assert.equal(sample.retention.rootInterface, 0);
}
for (const file of [
  'production-run.mjs',
  'targeted-update.mjs',
  'official-memory.mjs',
])
  assert.equal(
    fileHash(path.join(root, 'docs/benchmark', file)),
    fileHash(path.join(out, file))
  );
for (const [file, sha] of Object.entries(previous.provenance.source))
  assert.equal(fileHash(path.join(out, 'runtime', file)), sha);
for (const [file, item] of Object.entries(previous.provenance.bundles))
  assert.equal(fileHash(path.join(out, 'runtime/dist', file)), item.sha256);
const rowHash = fileHash(
  path.join(root, 'experiments/parent-memo-cache/main.tsx')
);
for (const name of names.slice(2))
  for (const [file, field] of [
    ['main.js', 'bundle'],
    ['index.html', 'html'],
  ])
    assert.equal(
      fileHash(path.join(out, 'diagnostic', name, file)),
      diagnostic.builds[name][field]
    );
for (const kind of ['original-default', 'original-isolated', 'row'])
  for (const diagnostic of [false, true]) {
    const stage = path.join(
      out,
      'sources',
      kind + (diagnostic ? '-diagnostic' : '')
    );
    assert.equal(
      fs.readFileSync(path.join(stage, 'typecheck.log'), 'utf8'),
      ''
    );
    assert.equal(
      fileHash(path.join(stage, 'cacheUpdate.ts')),
      build['row-memo'].helper
    );
    if (kind === 'row' || !diagnostic)
      assert.equal(
        fileHash(path.join(stage, 'src/main.tsx')),
        build[kind === 'row' ? 'row-memo' : kind].appSource
      );
    assert.equal(
      fileHash(path.join(stage, 'lithent.mjs')),
      build[kind === 'original-default' ? kind : 'row-memo'].core
    );
  }
for (const round of ['round-main', 'round-reverse'])
  for (const name of names) {
    assert.equal(
      fileHash(path.join(out, round, name, 'main.js')),
      build[name].bundle
    );
    assert.equal(
      fileHash(path.join(out, round, name, 'index.html')),
      build[name].html
    );
    if (name.startsWith('row-')) assert.equal(build[name].appSource, rowHash);
    assert.equal(
      build[name].helper,
      fileHash(path.join(root, 'helper/src/hook/cacheUpdate.ts'))
    );
    for (const marker of [
      '__memoDiagnostic',
      '__cacheRoot',
      '__LITHENT_DIAGNOSTIC__',
      'liveOutputsAndHost',
    ])
      assert.equal(
        fs
          .readFileSync(path.join(out, round, name, 'main.js'), 'utf8')
          .includes(marker),
        false
      );
  }
assert.equal(new Set(names.slice(2).map(name => build[name].bundle)).size, 1);
const cpu = ['round-main', 'round-reverse'].map(round =>
  get(round + '/production-cpu.json')
);
const mem = ['round-main', 'round-reverse'].map(round =>
  get(round + '/production-mem.json')
);
for (const [kind, runs, items, perRound] of [
  ['cpu', cpu, 9, 725],
  ['mem', mem, 5, 75],
]) {
  for (const run of runs) {
    assert.equal(run.complete, true);
    assert.deepEqual(run.build, build);
    assert.equal(run.alternatingOrder, true);
    assert.equal(run.chromeBinarySha256, fileHash(chrome));
    assert.equal(
      run.chromeFrameworkSha256,
      'b1d0216b347be90a898e9961302916aa1dbf4659f96597ea836dd3eb149574b7'
    );
    assert.equal(run.samples.length, items * names.length);
    assert.equal(
      run.samples.reduce((sum, sample) => sum + sample.result.length, 0),
      perRound
    );
    const pairs = new Set();
    for (const sample of run.samples) {
      assert.ok(names.includes(sample.name));
      assert.equal(!!sample.error, false);
      assert.equal(
        sample.result.length,
        kind === 'mem' ? 3 : sample.id.startsWith('04_') ? 25 : 15
      );
      assert.equal(pairs.has(sample.name + '/' + sample.id), false);
      pairs.add(sample.name + '/' + sample.id);
    }
  }
  for (let i = 0; i < items * names.length; i += names.length) {
    const main = runs[0].samples.slice(i, i + names.length),
      reverse = runs[1].samples.slice(i, i + names.length);
    assert.equal(
      new Set([...main, ...reverse].map(sample => sample.id)).size,
      1
    );
    assert.deepEqual(
      main.map(sample => sample.name),
      reverse.map(sample => sample.name).reverse()
    );
  }
}
const memoryPreflight = get('memory-preflight.json');
for (const run of mem)
  assert.deepEqual(run.memoryRegistration, memoryPreflight);
const median = values => {
  const a = [...values].sort((a, b) => a - b),
    i = Math.floor(a.length / 2);
  return a.length % 2 ? a[i] : (a[i - 1] + a[i]) / 2;
};
const distribution = values => {
  assert.ok(values.every(Number.isFinite));
  const a = [...values].sort((a, b) => a - b);
  return {
    count: a.length,
    median: median(a),
    p25: median(a.slice(0, Math.floor(a.length / 2))),
    p75: median(a.slice(Math.ceil(a.length / 2))),
    min: a[0],
    max: a.at(-1),
  };
};
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
};
const memory = {
  main: summarize([mem[0]], true),
  reverse: summarize([mem[1]], true),
  pooled: summarize(mem, true),
};
const weightSource = fs.readFileSync(
  path.join(bench, 'webdriver-ts-results/src/Common.ts'),
  'utf8'
);
const weights = weightSource
  .match(/benchmarkWeights = \[([\s\S]*?)\];/)[1]
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
const pairs = [
  ['renderer', 'original-isolated', 'original-default'],
  ['memo', 'row-memo', 'row-off'],
  ['helper', 'row-helper', 'row-off'],
  ['memoVsHelper', 'row-memo', 'row-helper'],
  ['endToEnd', 'row-memo', 'original-default'],
  ['helperEndToEnd', 'row-helper', 'original-default'],
];
const comparisons = Object.fromEntries(
  pairs.map(([key, on, off]) => [
    key,
    {
      on,
      off,
      cpu: Object.fromEntries(
        Object.entries(rows).map(([round, items]) => [
          round,
          {
            rows: items.map(item => ({
              id: item.id,
              total:
                item.conditions[on].total.median /
                item.conditions[off].total.median,
              script:
                item.conditions[on].script.median /
                item.conditions[off].script.median,
            })),
            weighted: Object.fromEntries(
              ['total', 'script'].map(metric => [
                metric,
                Math.exp(
                  items.reduce(
                    (sum, item, i) =>
                      sum +
                      weights[i] *
                        Math.log(
                          item.conditions[on][metric].median /
                            item.conditions[off][metric].median
                        ),
                    0
                  ) / weights.reduce((a, b) => a + b, 0)
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
            ratio: item.conditions[on].median / item.conditions[off].median,
            deltaMB: item.conditions[on].median - item.conditions[off].median,
          })),
        ])
      ),
    },
  ])
);
const retentionSummary = retention.samples.map(sample => {
  assert.deepEqual(
    sample.checkpoints.map(point => point.cycles),
    [0, 5, 25, 100, 300]
  );
  assert.deepEqual(
    sample.updateCheckpoints.map(point => point.updates),
    [0, 1, 5, 25, 100]
  );
  assert.deepEqual(sample.errors, []);
  const warm = sample.checkpoints[1],
    last = sample.checkpoints.at(-1),
    end = sample.afterUpdatesClear;
  return {
    name: sample.name,
    round: sample.round,
    warmHeapMB: warm.jsHeapMB,
    after300HeapMB: last.jsHeapMB,
    afterUpdateClearHeapMB: end.jsHeapMB,
    nodes5to300: last.nodes - warm.nodes,
    listeners5to300: last.jsEventListeners - warm.jsEventListeners,
    nodesAfterUpdateClear: end.nodes - warm.nodes,
    listenersAfterUpdateClear: end.jsEventListeners - warm.jsEventListeners,
  };
});
const sizes = Object.fromEntries(
  names.map(name => [
    name,
    Object.fromEntries(
      ['main.js', 'index.html'].map(file => {
        const bytes = fs.readFileSync(path.join(out, 'round-main', name, file));
        return [
          file,
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
  status: 'DC-15 bounded cache comparison complete; no core adoption',
  initial: get('initial.json'),
  reused: {
    evidence: previous.evidence,
    tests: previous.tests,
    baseline: previous.provenance.baseline,
    source: previous.provenance.source,
    bundles: previous.provenance.bundles,
  },
  build,
  gate,
  contracts,
  diagnostic,
  dispose,
  retention,
  retentionSummary,
  rows,
  memory,
  comparisons,
  weights,
  weightSourceSHA256: hash(weightSource),
  cpu,
  mem,
  cpuSamples: 1450,
  memorySamples: 150,
  sizes,
  compression: { node: process.version, zlib: process.versions.zlib },
  limits: [
    'End-to-end includes app architecture; memo/helper within row app shares JS and renderer.',
    'Two opposite orders do not eliminate temporal/load confounding. No significance or peer/adoption claim.',
    'Official memory has 3 samples/condition/round; retention CDP heap/DOM/listener is a separate diagnostic.',
    'No new core code; default 28 files/package and actual sibling app are preserved.',
    'Full React/Preact, public budget/entrypoint, concurrent new API and final hardening/integration remain incomplete.',
  ],
};
result.upstreamAudit = {
  files: upstreamFilesVerified,
  referenceEvidence: previous.evidence.sha256,
  note: 'Current upstream source/compiled runner/CSS/locks match prior preserved hashes; process-local memory registration writes no upstream files.',
};
fs.writeFileSync(
  path.join(out, 'analysis.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(comparisons).map(([key, value]) => [
        key,
        Object.fromEntries(
          Object.entries(value.cpu).map(([round, value]) => [
            round,
            value.weighted,
          ])
        ),
      ])
    ),
    null,
    2
  )
);
