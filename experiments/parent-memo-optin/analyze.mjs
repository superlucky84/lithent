import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-optin-20261022');
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  path.join(root, '../js-framework-benchmark-upstream');
const read = name => JSON.parse(fs.readFileSync(path.join(out, name), 'utf8'));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const provenance = read('runtime-provenance.json');
const reused = read('reused-validation.json');
const initial = read('initial.json');
const preflight = read('preflight.json');
const diagnostic = read('diagnostic.json');
const gate = read('round-main/production-verify.json');
const contracts = read('round-main/contracts.json');
const cpu = ['round-main', 'round-reverse'].map(round =>
  read(round + '/production-cpu.json')
);
const mem = ['round-main', 'round-reverse'].map(round =>
  read(round + '/production-mem.json')
);
const memoryRecovery = fs.existsSync(path.join(out, 'memory-recovery.json'))
  ? read('memory-recovery.json')
  : { setupFailures: 0, preservedSamples: 0 };
const memoryPreflight = fs.existsSync(path.join(out, 'memory-preflight.json'))
  ? read('memory-preflight.json')
  : mem[0].memoryRegistration;
for (const run of mem) {
  assert.deepEqual(run.memoryRegistration.ids, memoryPreflight.ids);
  assert.equal(
    run.memoryRegistration.definitionsSHA256,
    memoryPreflight.definitionsSHA256
  );
  assert.equal(
    run.memoryRegistration.commonSHA256,
    memoryPreflight.commonSHA256
  );
}
// Bind the already completed CPU results to the original harness. The only
// subsequent harness addition registers missing memory cases in memory mode.
const currentRunner = fs.readFileSync(
  path.join(root, 'docs/benchmark/production-run.mjs'),
  'utf8'
);
const recordedRunner = fs.readFileSync(
  path.join(out, 'cpu-runner.mjs'),
  'utf8'
);
if (currentRunner !== recordedRunner) {
  const start = currentRunner.indexOf(
    "    if (mode === 'mem') {",
    currentRunner.indexOf("} else if (mode === 'cpu' || mode === 'mem')")
  );
  const end = currentRunner.indexOf('    const { startBrowser }', start);
  assert.ok(start > 0 && end > start);
  assert.equal(
    currentRunner.slice(0, start) + currentRunner.slice(end),
    recordedRunner
  );
}
const retention = read('round-main/production-retention.json');
assert.equal(
  hash(fs.readFileSync(path.join(root, reused.evidence.file))),
  reused.evidence.sha256
);
assert.equal(
  hash(fs.readFileSync(path.join(root, 'package.json'))),
  reused.defaultPackageSHA256
);
for (const [name, sha] of Object.entries(provenance.baseline))
  assert.equal(hash(fs.readFileSync(path.join(root, name))), sha, name);
for (const [name, sha] of Object.entries(provenance.source))
  assert.equal(
    hash(fs.readFileSync(path.join(out, 'runtime', name))),
    sha,
    name
  );
for (const [name, value] of Object.entries(provenance.bundles))
  assert.equal(
    hash(fs.readFileSync(path.join(out, 'runtime/dist', name))),
    value.sha256,
    name
  );
assert.equal(
  hash(
    fs.readFileSync(path.join(bench, 'frameworks/keyed/lithent/src/main.tsx'))
  ),
  initial.siblingSourceSHA256
);
assert.equal(diagnostic.complete, true);
assert.equal(diagnostic.runs.length, 6);
for (const run of diagnostic.runs) {
  assert.equal(run.work.opt, run.name === 'lithent');
  assert.deepEqual(run.errors, []);
  assert.equal(run.retention.registered, 0);
  assert.equal(run.retention.liveOutputsAndHost, 0);
  assert.equal(run.retention.retainedKeys, 1000);
  assert.equal(run.work.metrics.mounts, run.work.metrics.unmounts);
}
assert.equal(gate.complete, true);
assert.equal(gate.samples.length, 2);
for (const sample of gate.samples) {
  assert.equal(sample.scenarios, 9);
  assert.equal(sample.fontLoaded, true);
}
assert.equal(contracts.samples.length, 2);
const build = cpu[0].build;
for (const dir of ['source', 'diagnostic-source']) {
  assert.equal(
    hash(fs.readFileSync(path.join(out, dir, 'src/main.tsx'))),
    build.lithent.appSource
  );
  assert.equal(
    hash(fs.readFileSync(path.join(out, dir, 'lithent.mjs'))),
    build.lithent.core
  );
}
for (const name of ['lithent-before', 'lithent']) {
  assert.equal(
    hash(fs.readFileSync(path.join(out, 'diagnostic', name, 'main.js'))),
    diagnostic.builds[name].bundle
  );
  assert.equal(
    hash(fs.readFileSync(path.join(out, 'diagnostic', name, 'index.html'))),
    diagnostic.builds[name].html
  );
}
assert.equal(build.lithent.memoEnabled, true);
assert.equal(build['lithent-before'].memoEnabled, false);
for (const key of ['core', 'appSource', 'bundle'])
  assert.equal(build.lithent[key], build['lithent-before'][key]);
assert.equal(build.lithent.core, provenance.bundles['lithent.mjs'].sha256);
assert.equal(
  hash(
    fs.readFileSync(path.join(root, 'experiments/parent-memo-optin/main.tsx'))
  ),
  build.lithent.appSource
);
assert.equal(preflight.typecheck.exitCode, 0);
assert.equal(preflight.typecheck.sourceSHA256, build.lithent.appSource);
assert.equal(
  preflight.typecheck.configurationSHA256,
  hash(fs.readFileSync(path.join(out, 'typecheck.json')))
);
for (const round of ['round-main', 'round-reverse'])
  for (const [name, expected] of Object.entries(build)) {
    const dir = path.join(out, round, name);
    assert.equal(
      hash(fs.readFileSync(path.join(dir, 'main.js'))),
      expected.bundle
    );
    assert.equal(
      hash(fs.readFileSync(path.join(dir, 'index.html'))),
      expected.html
    );
    assert.equal(
      fs
        .readFileSync(path.join(dir, 'main.js'), 'utf8')
        .includes('__memoDiagnostic'),
      false
    );
    for (const marker of [
      '__LITHENT_DIAGNOSTIC__',
      'liveOutputsAndHost',
      'retainedKeys',
    ])
      assert.equal(
        fs.readFileSync(path.join(dir, 'main.js'), 'utf8').includes(marker),
        false,
        marker
      );
  }
const allRuns = [...cpu, ...mem, gate, retention];
for (const run of allRuns) {
  assert.equal(run.complete, true);
  assert.deepEqual(run.build, build);
  assert.equal(run.chromeBinarySha256, cpu[0].chromeBinarySha256);
  assert.equal(run.chromeFrameworkSha256, cpu[0].chromeFrameworkSha256);
}
assert.deepEqual(contracts.build, build);
assert.equal(
  hash(fs.readFileSync(cpu[0].chromeBinaryPath)),
  cpu[0].chromeBinarySha256
);
assert.equal(
  hash(fs.readFileSync(cpu[0].chromeFrameworkPath)),
  cpu[0].chromeFrameworkSha256
);
for (const [kind, runs, batches] of [
  ['cpu', cpu, 18],
  ['mem', mem, 10],
]) {
  for (const run of runs) {
    assert.equal(run.alternatingOrder, true);
    assert.equal(run.samples.length, batches);
    for (const sample of run.samples) {
      assert.equal(!!sample.error, false);
      assert.equal(
        sample.result.length,
        kind === 'mem' ? 3 : sample.id.startsWith('04_') ? 25 : 15
      );
    }
  }
  for (let i = 0; i < batches; i += 2) {
    assert.equal(runs[0].samples[i].id, runs[1].samples[i].id);
    assert.notEqual(runs[0].samples[i].name, runs[1].samples[i].name);
  }
}
assert.equal(retention.samples.length, 6);
for (const sample of retention.samples) {
  assert.deepEqual(
    sample.checkpoints.map(point => point.cycles),
    [0, 5, 25, 100]
  );
  assert.deepEqual(
    sample.updateCheckpoints.map(point => point.updates),
    [0, 1, 5, 25, 100]
  );
}
const median = values => {
  const sorted = [...values].sort((a, b) => a - b),
    i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
const distribution = values => {
  const sorted = [...values].sort((a, b) => a - b),
    i = Math.floor(sorted.length / 2);
  return {
    count: sorted.length,
    median: median(sorted),
    p25: median(sorted.slice(0, i)),
    p75: median(sorted.slice(Math.ceil(sorted.length / 2))),
    min: sorted[0],
    max: sorted.at(-1),
  };
};
const summarize = (runs, memory = false) =>
  [...new Set(runs[0].samples.map(sample => sample.id))].sort().map(id => {
    const row = { id, off: {}, on: {}, ratio: {} };
    for (const [label, name] of [
      ['off', 'lithent-before'],
      ['on', 'lithent'],
    ]) {
      const values = runs.flatMap(run =>
        run.samples
          .filter(sample => sample.id === id && sample.name === name)
          .flatMap(sample => sample.result)
      );
      row[label] = memory
        ? distribution(values)
        : Object.fromEntries(
            ['total', 'script', 'paint'].map(metric => [
              metric,
              distribution(values.map(value => value[metric])),
            ])
          );
    }
    if (memory) {
      row.ratio = row.on.median / row.off.median;
      row.deltaMB = row.on.median - row.off.median;
    } else
      for (const metric of ['total', 'script'])
        row.ratio[metric] = row.on[metric].median / row.off[metric].median;
    return row;
  });
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
const weightsSource = fs.readFileSync(
  path.join(bench, 'webdriver-ts-results/src/Common.ts'),
  'utf8'
);
const weights = weightsSource
  .match(/benchmarkWeights = \[([\s\S]*?)\];/)[1]
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
const weighted = Object.fromEntries(
  Object.entries(rows).map(([round, items]) => [
    round,
    Object.fromEntries(
      ['total', 'script'].map(metric => [
        metric,
        Math.exp(
          items.reduce(
            (sum, item, i) => sum + weights[i] * Math.log(item.ratio[metric]),
            0
          ) / weights.reduce((a, b) => a + b, 0)
        ),
      ])
    ),
  ])
);
const totals = runs =>
  runs.map(run =>
    run.samples.reduce((sum, sample) => sum + sample.result.length, 0)
  );
assert.deepEqual(totals(cpu), [290, 290]);
assert.deepEqual(totals(mem), [30, 30]);
const sizes = {};
for (const name of ['lithent-before', 'lithent'])
  sizes[name] = Object.fromEntries(
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
  );
const result = {
  status: 'DC-13 same-row-app memo on/off measurement; no public API adoption',
  checkpoint: initial.head,
  provenance,
  reused,
  build,
  diagnostic,
  gate,
  contracts,
  rows,
  weighted,
  memory,
  retention,
  sizes,
  cpuSamples: totals(cpu),
  memorySamples: totals(mem),
  weights,
  weightSourceSHA256: hash(weightsSource),
  compression: {
    node: process.version,
    zlib: process.versions.zlib,
    gzipLevel: 9,
  },
  runs: [...cpu, ...mem].map(run => ({
    mode: run.mode,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    machine: run.machine,
    loadStart: run.loadStart,
    loadEnd: run.loadEnd,
    failedBatches: run.failedBatches || [],
    chrome: run.chrome,
    chromeBinarySHA256: run.chromeBinarySha256,
    chromeFrameworkSHA256: run.chromeFrameworkSha256,
  })),
  limits: [
    'Off means the same isolated renderer without memo registration, not the default original app.',
    'Official memory has 3 samples per app/round; diagnostic heap/DOM/listener and full dispose are separate.',
    'Two paired orders do not eliminate temporal/load confounding. No p-value or confidence-interval claim.',
    'Full React/Preact comparison, concurrent support, full B4/hardening/integration and public package/budget/adoption remain incomplete.',
  ],
};
result.preflight = preflight;
result.memoryProtocol = {
  registration: memoryPreflight,
  recovery: memoryRecovery,
  resumptions: mem[0].resumptions || [],
  setupFailures: memoryRecovery.setupFailures,
  note: 'Registry and disabled metadata restored process-locally. Recovery, if present, preserves unchanged completed batches. Workload, GC and memory measurement methods unchanged.',
};
result.retentionSummary = retention.samples.map(sample => {
  const warm = sample.checkpoints[1],
    last = sample.checkpoints.at(-1),
    end = sample.afterUpdatesClear;
  return {
    name: sample.name,
    round: sample.round,
    warmHeapMB: warm.jsHeapMB,
    after100HeapMB: last.jsHeapMB,
    afterUpdateClearHeapMB: end.jsHeapMB,
    nodes5to100: last.nodes - warm.nodes,
    listeners5to100: last.jsEventListeners - warm.jsEventListeners,
    nodesAfterUpdateClear: end.nodes - warm.nodes,
    listenersAfterUpdateClear: end.jsEventListeners - warm.jsEventListeners,
  };
});
fs.writeFileSync(
  path.join(out, 'analysis.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify(
    {
      weighted,
      cpu: result.cpuSamples,
      memory: result.memorySamples,
      rows: rows.pooled.map(row => ({
        id: row.id,
        totalPercent: (row.ratio.total - 1) * 100,
        scriptPercent: (row.ratio.script - 1) * 100,
      })),
      memoryRows: memory.pooled,
    },
    null,
    2
  )
);
