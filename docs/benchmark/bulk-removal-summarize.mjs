// Validate and preserve the nested-list removal experiment independently.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out =
  process.env.LITHENT_PRODUCTION_OUT || '/tmp/lithent-bulk-core-20261019';
const baseline =
  process.env.LITHENT_BASELINE_CORE_OUT ||
  '/tmp/lithent-bulk-baseline-20261019';
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  resolve(root, '../js-framework-benchmark-upstream');
const names = ['lithent-before', 'lithent', 'retained'];
const candidate = out + '/runtime-after';
const decision = process.env.LITHENT_BULK_DECISION;
assert(decision, 'Set LITHENT_BULK_DECISION after reviewing measurements');
const read = file => JSON.parse(readFileSync(file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
const manifest = read(out + '/build-manifest.json');
const runs = Object.fromEntries(
  ['cpu', 'verify'].map(mode => [
    mode,
    read(out + '/production-' + mode + '.json'),
  ])
);
runs.reverse = read(out + '/reverse/production-cpu.json');
const contracts = read(out + '/contracts.json');
const selectionControl = read(out + '/selection-control/production-cpu.json');
assert.equal(selectionControl.complete, true);
assert.deepEqual(selectionControl.versions, runs.cpu.versions);
assert.equal(selectionControl.chrome, runs.cpu.chrome);
assert.deepEqual(selectionControl.build.control, manifest['lithent-before']);
for (const name of names)
  assert.deepEqual(selectionControl.build[name], manifest[name]);
assert.equal(selectionControl.samples.length, 3);
assert.equal(new Set(selectionControl.samples.map(s => s.name)).size, 3);
for (const sample of selectionControl.samples) {
  assert(['lithent-before', 'lithent', 'control'].includes(sample.name));
  assert.equal(sample.id, '04_select1k');
  assert.equal(sample.error, undefined);
  assert.equal(sample.result.length, 25);
  assert(
    sample.result.every(v =>
      ['total', 'script', 'paint'].every(k => Number.isFinite(v[k]))
    )
  );
}
const restoration = read(out + '/restoration.json');
for (const [file, sha256] of Object.entries(restoration)) {
  if (file.startsWith('upstream/')) continue;
  assert.equal(hash(readFileSync(baseline + '/' + file)), sha256);
}
for (const run of [...Object.values(runs), contracts]) {
  assert(run.finishedAt);
  assert.deepEqual(run.build, manifest);
  assert.equal(
    run.chrome.replace(/^Chrome\//, ''),
    runs.cpu.chrome.replace(/^Chrome\//, '')
  );
}
for (const run of Object.values(runs)) {
  assert.equal(run.complete, true);
  assert.deepEqual(run.versions, runs.cpu.versions);
}
assert.equal(runs.cpu.samples.length, 27);
assert.equal(runs.reverse.samples.length, 18);
assert.equal(runs.verify.samples.length, 3);
assert.equal(contracts.samples.length, 3);
for (const sample of runs.reverse.samples) {
  const mainOrder = runs.cpu.samples
    .filter(s => s.id === sample.id && s.name !== 'retained')
    .map(s => s.name);
  const reverseOrder = runs.reverse.samples
    .filter(s => s.id === sample.id)
    .map(s => s.name);
  assert.deepEqual(reverseOrder, mainOrder.reverse());
}
for (const mode of ['cpu', 'reverse']) {
  const groups = new Set();
  for (const sample of runs[mode].samples) {
    assert(names.includes(sample.name));
    assert(!groups.has(sample.name + '/' + sample.id));
    groups.add(sample.name + '/' + sample.id);
    assert.equal(sample.error, undefined);
    assert.equal(sample.result.length, sample.id.startsWith('04_') ? 25 : 15);
    assert(
      sample.result.every(v =>
        ['total', 'script', 'paint'].every(k => Number.isFinite(v[k]))
      )
    );
  }
}
for (const name of names) {
  for (const [file, field] of [
    ['src/main.tsx', 'appSource'],
    ['lithent.mjs', 'core'],
    ['helper.mjs', 'helper'],
  ])
    assert.equal(
      hash(readFileSync(out + '/sources/' + name + '/' + file)),
      manifest[name][field]
    );
  assert.equal(
    hash(readFileSync(out + '/' + name + '/main.js')),
    manifest[name].bundle
  );
  assert.equal(manifest[name].helper, manifest.lithent.helper);
  assert.equal(runs.cpu.samples.filter(s => s.name === name).length, 9);
}
assert.equal(manifest.lithent.appSource, manifest['lithent-before'].appSource);
assert.notEqual(manifest.lithent.core, manifest['lithent-before'].core);
assert.equal(manifest.lithent.core, manifest.retained.core);
assert.equal(
  hash(readFileSync(candidate + '/dist/lithent.mjs')),
  manifest.lithent.core
);
assert.equal(
  hash(readFileSync(baseline + '/dist/lithent.mjs')),
  manifest['lithent-before'].core
);
for (const [name, source] of [
  ['lithent', 'targeted-main.tsx'],
  ['retained', 'retained-row-main.tsx'],
])
  assert.equal(
    hash(readFileSync(root + '/docs/benchmark/' + source)),
    manifest[name].appSource
  );
const summarize = ({ name, id, result }) => ({
  name,
  id,
  count: result.length,
  ...Object.fromEntries(
    ['total', 'script', 'paint'].map(k => [k, median(result.map(v => v[k]))])
  ),
});
const main = runs.cpu.samples.map(summarize);
const repeated = runs.reverse.samples.map(sample =>
  summarize({
    ...sample,
    result: [
      ...runs.cpu.samples.find(
        s => s.name === sample.name && s.id === sample.id
      ).result,
      ...sample.result,
    ],
  })
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
const compare = (rows, phase, before, after) => {
  const ratios = rows
    .filter(s => s.name === after)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(s => {
      const b = rows.find(x => x.name === before && x.id === s.id);
      return {
        id: s.id,
        total: s.total / b.total,
        script: s.script / b.script,
      };
    });
  return {
    phase,
    before,
    after,
    ratios,
    weightedRatio: Object.fromEntries(
      ['total', 'script'].map(k => [
        k,
        Math.exp(
          ratios.reduce((sum, r, i) => sum + weights[i] * Math.log(r[k]), 0) /
            weights.reduce((a, b) => a + b, 0)
        ),
      ])
    ),
  };
};
const comparisons = [
  compare(main, 'main', 'lithent-before', 'lithent'),
  compare(main, 'main', 'lithent-before', 'retained'),
  compare(main, 'main', 'lithent', 'retained'),
  compare(
    runs.reverse.samples.map(summarize),
    'reverse',
    'lithent-before',
    'lithent'
  ),
  compare(repeated, 'pooled', 'lithent-before', 'lithent'),
];
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
tree('sources', out + '/sources');
for (const name of names) tree('bundles/' + name, out + '/' + name);
tree('runtime/before', baseline);
for (const file of [
  'src/render.ts',
  'lithentConcurrent/src/render.ts',
  'dist/lithent.mjs',
  'dist/lithent.umd.js',
  'lithentConcurrent/dist/lithentConcurrent.mjs',
  'lithentConcurrent/dist/lithentConcurrent.umd.js',
  'src/tests/core-bulkRemoval.test.tsx',
])
  add('runtime/after/' + file, candidate + '/' + file);
for (const file of [
  'build-manifest.json',
  'versions.json',
  'production-keyed.log',
])
  add(file, out + '/' + file);
for (const file of [
  'production-run.mjs',
  'targeted-update.mjs',
  'bulk-removal-summarize.mjs',
  'bulk-removal-traces.mjs',
])
  add('tools/' + file, root + '/docs/benchmark/' + file);
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
for (const file of [
  'css/currentStyle.css',
  'css/main.css',
  'css/bootstrap/dist/css/bootstrap.min.css',
])
  add('upstream/' + file, bench + '/' + file);
add('validation/test-dual.log', '/tmp/lithent-bulk-tests-20261019.log');
add('validation/test-e2e.log', '/tmp/lithent-bulk-e2e-20261019.log');
add('validation/restoration.json', out + '/restoration.json');
add(
  'validation/restore-base.log',
  '/tmp/lithent-bulk-restore-base-20261019.log'
);
add(
  'validation/restore-concurrent.log',
  '/tmp/lithent-bulk-restore-concurrent-20261019.log'
);
const size = file => {
  const bytes = readFileSync(file);
  return {
    raw: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
    br: brotliCompressSync(bytes).length,
    sha256: hash(bytes),
  };
};
const evidence = gzipSync(JSON.stringify({ files }), { level: 9 });
writeFileSync(root + '/docs/benchmark/bulk-removal-evidence.json.gz', evidence);
const result = {
  date: new Date().toISOString(),
  decision,
  restoration,
  variants: {
    'lithent-before': 'targeted row renew + published 1.25.2 core',
    lithent: 'same targeted app + local nested bulk-removal core',
    retained: 'live row VDOM cache + local nested bulk-removal core',
  },
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  build: manifest,
  main,
  repeated,
  comparisons,
  weights,
  memory: {
    status: 'not-run',
    reason:
      'Candidate rejected on selection latency before further memory measurements.',
  },
  coreSizes: Object.fromEntries(
    [
      'dist/lithent.umd.js',
      'lithentConcurrent/dist/lithentConcurrent.umd.js',
    ].map(file => [
      file,
      {
        before: size(baseline + '/' + file),
        after: size(candidate + '/' + file),
      },
    ])
  ),
  sizes: Object.fromEntries(
    names.map(name => [
      name,
      ['index.html', 'main.js'].map(file => ({
        file,
        ...size(out + '/' + name + '/' + file),
      })),
    ])
  ),
  runs: { ...runs, selectionControl },
  selectionControl: selectionControl.samples.map(summarize),
  selectionTrace: read(out + '/selection-trace-analysis.json'),
  contracts,
  traceDirectories: [
    out + '/traces',
    out + '/reverse/traces',
    out + '/selection-control/traces',
  ],
  evidence: {
    file: 'bulk-removal-evidence.json.gz',
    sha256: hash(evidence),
    bytes: evidence.length,
    files: Object.keys(files).length,
  },
};
writeFileSync(
  root + '/docs/benchmark/bulk-removal-results.json',
  JSON.stringify(result, null, 2)
);
console.log(
  JSON.stringify(
    {
      main,
      repeated,
      comparisons,
      memory: result.memory,
      coreSizes: result.coreSizes,
      evidence: result.evidence,
    },
    null,
    2
  )
);
