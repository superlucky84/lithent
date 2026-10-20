// Preserve the isolated key-match core experiment and its raw measurements.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const experiment =
  process.env.LITHENT_KEYMATCH_OUT || '/tmp/lithent-keymatch-core-20261020';
const out = experiment + '/main';
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  resolve(root, '../js-framework-benchmark-upstream');
const read = file => JSON.parse(readFileSync(file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
const names = ['lithent-before', 'lithent'];
const manifest = read(out + '/build-manifest.json');
const runs = Object.fromEntries(
  ['cpu', 'verify'].map(mode => [
    mode,
    read(out + '/production-' + mode + '.json'),
  ])
);
for (const mode of ['mem', 'retention'])
  if (existsSync(out + '/production-' + mode + '.json'))
    runs[mode] = read(out + '/production-' + mode + '.json');
if (existsSync(out + '/reverse/production-cpu.json'))
  runs.reverse = read(out + '/reverse/production-cpu.json');
for (const [mode, run] of Object.entries(runs)) {
  assert.equal(run.complete, true, mode + ' incomplete');
  assert.deepEqual(run.build, manifest);
  assert.deepEqual(run.versions, runs.cpu.versions);
  assert.equal(
    run.chrome.replace(/^Chrome\//, ''),
    runs.cpu.chrome.replace(/^Chrome\//, '')
  );
  assert(run.chromeBinarySha256 && run.chromeFrameworkSha256);
  assert.equal(run.chromeBinarySha256, runs.cpu.chromeBinarySha256);
  assert.equal(run.chromeFrameworkSha256, runs.cpu.chromeFrameworkSha256);
  assert.equal(run.chromeBinaryPath, runs.cpu.chromeBinaryPath);
  if (!['cpu', 'mem', 'reverse'].includes(mode)) continue;
  const groups = new Set();
  for (const sample of run.samples) {
    assert(names.includes(sample.name));
    assert(!groups.has(sample.name + '/' + sample.id));
    groups.add(sample.name + '/' + sample.id);
    assert.equal(sample.error, undefined);
    assert.equal(
      sample.result.length,
      mode === 'mem' ? 3 : sample.id.startsWith('04_') ? 25 : 15
    );
    assert(
      sample.result.every(v =>
        mode === 'mem'
          ? Number.isFinite(v)
          : ['total', 'script', 'paint'].every(k => Number.isFinite(v[k]))
      )
    );
  }
}
assert.equal(runs.cpu.samples.length, 18);
assert.equal(runs.verify.samples.length, 2);
if (runs.reverse) assert.equal(runs.reverse.samples.length, 18);
if (runs.mem) assert.equal(runs.mem.samples.length, 10);
if (runs.retention) assert.equal(runs.retention.samples.length, 6);
assert.equal(manifest.lithent.appSource, manifest['lithent-before'].appSource);
assert.equal(manifest.lithent.helper, manifest['lithent-before'].helper);
assert.notEqual(manifest.lithent.core, manifest['lithent-before'].core);
assert.equal(manifest.lithent.coreOrigin, 'local-unreleased');
for (const name of names) {
  for (const [file, field] of [
    ['sources/' + name + '/src/main.tsx', 'appSource'],
    ['sources/' + name + '/lithent.mjs', 'core'],
    ['sources/' + name + '/helper.mjs', 'helper'],
    [name + '/main.js', 'bundle'],
  ])
    assert.equal(hash(readFileSync(out + '/' + file)), manifest[name][field]);
  assert.equal(runs.cpu.samples.filter(s => s.name === name).length, 9);
}
for (const [stage, name] of [
  ['before', 'lithent-before'],
  ['after', 'lithent'],
])
  assert.equal(
    hash(readFileSync(experiment + '/' + stage + '/dist/lithent.mjs')),
    manifest[name].core
  );
const weights = readFileSync(
  bench + '/webdriver-ts-results/src/Common.ts',
  'utf8'
)
  .match(/benchmarkWeights = \[([\s\S]*?)\];/)[1]
  .split(',')
  .map(v => v.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
const summarize = samples =>
  samples.map(({ name, id, result }) => ({
    name,
    id,
    count: result.length,
    ...Object.fromEntries(
      ['total', 'script', 'paint'].map(k => [k, median(result.map(v => v[k]))])
    ),
  }));
const compare = rows => {
  const ratios = rows
    .filter(s => s.name === 'lithent')
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(s => {
      const before = rows.find(
        b => b.name === 'lithent-before' && b.id === s.id
      );
      assert(before);
      return {
        id: s.id,
        total: s.total / before.total,
        script: s.script / before.script,
      };
    });
  return {
    ratios,
    weightedRatio:
      ratios.length === 9
        ? Object.fromEntries(
            ['total', 'script'].map(k => [
              k,
              Math.exp(
                ratios.reduce(
                  (sum, r, i) => sum + weights[i] * Math.log(r[k]),
                  0
                ) / weights.reduce((a, b) => a + b, 0)
              ),
            ])
          )
        : null,
  };
};
const main = summarize(runs.cpu.samples);
const reverse = runs.reverse ? summarize(runs.reverse.samples) : [];
const files = {};
const add = (name, file) => {
  const bytes = readFileSync(file);
  files[name] = { sha256: hash(bytes), content: bytes.toString('utf8') };
};
const tree = (name, dir) => {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) tree(name + '/' + ent.name, dir + '/' + ent.name);
    else if (ent.isFile()) add(name + '/' + ent.name, dir + '/' + ent.name);
  }
};
for (const stage of ['before', 'after'])
  tree('runtime/' + stage, experiment + '/' + stage);
tree('sources', out + '/sources');
for (const name of names) tree('bundles/' + name, out + '/' + name);
for (const file of [
  'build-manifest.json',
  'versions.json',
  'contracts.json',
  'production-keyed.log',
])
  add(file, out + '/' + file);
for (const file of ['test-dual-final.log', 'test-e2e.log'])
  add('checks/' + file, experiment + '/' + file);
for (const file of [
  'production-run.mjs',
  'targeted-update.mjs',
  'keymatch-core-summarize.mjs',
])
  add(
    'tools/' + file,
    file === 'keymatch-core-summarize.mjs'
      ? root + '/docs/benchmark/' + file
      : experiment + '/tools/' + file
  );
for (const file of readdirSync(bench + '/webdriver-ts/dist').filter(x =>
  x.endsWith('.js')
))
  add('runner/' + file, bench + '/webdriver-ts/dist/' + file);
for (const file of [
  'vite.config.js',
  'package.json',
  'package-lock.json',
  'index.html',
])
  add('upstream/lithent/' + file, bench + '/frameworks/keyed/lithent/' + file);
add('upstream/Common.ts', bench + '/webdriver-ts-results/src/Common.ts');
const sizes = Object.fromEntries(
  ['before', 'after'].map(stage => [
    stage,
    [
      'dist/lithent.umd.js',
      'lithentConcurrent/dist/lithentConcurrent.umd.js',
    ].map(file => {
      const bytes = readFileSync(experiment + '/' + stage + '/' + file);
      return {
        file,
        raw: bytes.length,
        gzip: gzipSync(bytes, { level: 9 }).length,
        br: brotliCompressSync(bytes).length,
        sha256: hash(bytes),
      };
    }),
  ])
);
add(
  'tests/core-keyedConsumption.test.tsx',
  root + '/src/tests/core-keyedConsumption.test.tsx'
);
for (const file of [
  'baseline-base.log',
  'baseline-concurrent.log',
  'keyed-base.log',
  'keyed-concurrent.log',
])
  add('checks/' + file, experiment + '/' + file);
for (const file of [
  'restored-checks.json',
  'restored-base.log',
  'restored-concurrent.log',
  'restored-build-core.log',
  'restored-build-concurrent.log',
  'restored-size.log',
])
  if (existsSync(experiment + '/' + file))
    add('checks/' + file, experiment + '/' + file);
for (const file of ['src/render.ts', 'lithentConcurrent/src/render.ts'])
  assert(
    readFileSync(experiment + '/before/' + file).equals(
      readFileSync(experiment + '/after/' + file)
    )
  );
const pooled = runs.reverse
  ? summarize(
      runs.cpu.samples.map(s => ({
        ...s,
        result: [
          ...s.result,
          ...runs.reverse.samples.find(r => r.name === s.name && r.id === s.id)
            .result,
        ],
      }))
    )
  : [];
const evidence = gzipSync(JSON.stringify({ files }), { level: 9 });
writeFileSync(
  root + '/docs/benchmark/keymatch-core-evidence.json.gz',
  evidence
);
const result = {
  date: new Date().toISOString(),
  decision: process.env.LITHENT_KEYMATCH_DECISION || 'candidate-under-review',
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  build: manifest,
  browser: {
    binary: runs.cpu.chromeBinaryPath,
    binarySha256: runs.cpu.chromeBinarySha256,
    frameworkSha256: runs.cpu.chromeFrameworkSha256,
  },
  limitations: [
    'Non-isolated machine; repeated directions inform adoption, not statistical significance.',
    'CPU timings use the base core with the original upstream app; concurrent correctness and builds were checked separately.',
    'Failed whole batches were retried and excluded from completed samples; details remain in runs.*.failedBatches.',
    ...(!runs.mem
      ? [
          'No additional memory or retention measurements after the CPU adoption gate failed.',
        ]
      : []),
  ],
  weights,
  main,
  comparison: compare(main),
  reverse,
  reverseComparison: reverse.length ? compare(reverse) : null,
  pooled,
  pooledComparison: pooled.length ? compare(pooled) : null,
  memory:
    runs.mem?.samples.map(s => ({
      name: s.name,
      id: s.id,
      count: s.result.length,
      medianMB: median(s.result),
    })) || null,
  sizes,
  runs,
  contracts: read(out + '/contracts.json'),
  traceDirectories: [
    out + '/traces',
    ...(runs.reverse ? [out + '/reverse/traces'] : []),
  ],
  evidence: {
    file: 'keymatch-core-evidence.json.gz',
    sha256: hash(evidence),
    bytes: evidence.length,
    files: Object.keys(files).length,
  },
};
writeFileSync(
  root + '/docs/benchmark/keymatch-core-results.json',
  JSON.stringify(result, null, 2)
);
console.log(
  JSON.stringify(
    {
      comparison: result.comparison,
      reverseComparison: result.reverseComparison,
      pooledComparison: result.pooledComparison,
      memory: result.memory,
      sizes,
      evidence: result.evidence,
    },
    null,
    2
  )
);
