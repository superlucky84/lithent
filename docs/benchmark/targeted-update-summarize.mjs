// Validate complete runs and preserve inputs/results without copying trace GBs.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out =
  process.env.LITHENT_PRODUCTION_OUT || '/tmp/lithent-targeted-final-20261019';
const screen =
  process.env.LITHENT_SCREEN_OUT || '/tmp/lithent-targeted-update-20261019';
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  resolve(root, '../js-framework-benchmark-upstream');
const peerOut = process.env.LITHENT_PEERS_OUT || screen;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(readFileSync(file));
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const runs = Object.fromEntries(
  ['cpu-main', 'cpu-targets', 'mem', 'retention', 'verify'].map(mode => [
    mode,
    read(out + '/production-' + mode + '.json'),
  ])
);
const manifest = read(out + '/build-manifest.json');
const typedOut = out + '/typechecked';
const typedManifest = read(typedOut + '/build-manifest.json');
for (const run of Object.values(runs)) {
  assert.equal(run.complete, true);
  assert.deepEqual(run.build, manifest);
  assert.deepEqual(run.versions, runs['cpu-main'].versions);
  assert.equal(
    run.chrome.replace(/^Chrome\//, ''),
    runs['cpu-main'].chrome.replace(/^Chrome\//, '')
  );
}
assert.equal(runs['cpu-main'].samples.length, 18);
assert.equal(runs['cpu-targets'].samples.length, 12);
assert.equal(runs.mem.samples.length, 4);
assert.equal(runs.retention.samples.length, 6);
assert.equal(runs.verify.samples.length, 6);
for (const [name, run] of Object.entries(runs)) {
  if (!name.startsWith('cpu') && name !== 'mem') continue;
  for (const sample of run.samples) {
    assert.equal(sample.error, undefined);
    assert.equal(
      sample.result.length,
      name === 'mem' ? 3 : sample.id.startsWith('04_') ? 25 : 15
    );
    assert(
      sample.result.every(v =>
        name === 'mem'
          ? Number.isFinite(v)
          : ['total', 'script', 'paint'].every(k => Number.isFinite(v[k]))
      )
    );
  }
}
assert.equal(manifest.lithent.core, manifest['lithent-before'].core);
assert.equal(manifest.lithent.helper, manifest['lithent-before'].helper);
assert.equal(
  hash(readFileSync(root + '/docs/benchmark/targeted-main.tsx')),
  typedManifest.lithent.appSource
);
for (const name of ['lithent-before', 'lithent']) {
  for (const key of ['core', 'helper', 'bundle'])
    assert.equal(typedManifest[name][key], manifest[name][key]);
}
const installed = read(typedOut + '/installed.json');
assert.equal(installed.bundle, manifest.lithent.bundle);
assert.equal(installed.measured, installed.bundle);
const installedVerify = read(
  typedOut + '/installed-check/production-verify.json'
);
assert.equal(installedVerify.complete, true);
assert.equal(installedVerify.samples.length, 1);
assert.equal(installedVerify.samples[0].scenarios, 9);
assert.equal(
  hash(readFileSync(installed.app + '/dist/main.js')),
  installed.bundle
);

const summarize = samples => {
  const groups = new Map();
  for (const sample of samples) {
    const key = sample.name + '/' + sample.id;
    if (!groups.has(key))
      groups.set(key, { name: sample.name, id: sample.id, values: [] });
    groups.get(key).values.push(...sample.result);
  }
  return [...groups.values()].map(({ values, ...rest }) => ({
    ...rest,
    count: values.length,
    ...Object.fromEntries(
      ['total', 'script', 'paint'].map(k => [k, median(values.map(v => v[k]))])
    ),
  }));
};
const sizes = Object.fromEntries(
  ['lithent-before', 'lithent'].map(name => [
    name,
    ['index.html', 'main.js'].map(file => {
      const bytes = readFileSync(out + '/' + name + '/' + file);
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
const main = summarize(runs['cpu-main'].samples);
const commonSource = readFileSync(
  bench + '/webdriver-ts-results/src/Common.ts',
  'utf8'
);
const weightMatch = commonSource.match(/benchmarkWeights = \[([\s\S]*?)\];/);
assert(weightMatch);
const weights = weightMatch[1]
  .split(',')
  .map(x => x.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
const ratios = main
  .filter(x => x.name === 'lithent')
  .sort((a, b) => a.id.localeCompare(b.id))
  .map(candidate => {
    const baseline = main.find(
      x => x.name === 'lithent-before' && x.id === candidate.id
    );
    return {
      id: candidate.id,
      total: candidate.total / baseline.total,
      script: candidate.script / baseline.script,
    };
  });
const weightedRatio = Object.fromEntries(
  ['total', 'script'].map(key => [
    key,
    Math.exp(
      ratios.reduce((sum, r, i) => sum + weights[i] * Math.log(r[key]), 0) /
        weights.reduce((a, b) => a + b, 0)
    ),
  ])
);

const files = {};
const add = (key, file) => {
  const bytes = readFileSync(file);
  files[key] = { sha256: hash(bytes), content: bytes.toString('utf8') };
};
const tree = (key, dir) => {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const child = dir + '/' + ent.name;
    if (ent.isDirectory()) tree(key + '/' + ent.name, child);
    else if (ent.isFile()) add(key + '/' + ent.name, child);
  }
};
tree('final/sources', out + '/sources');
tree('final/typechecked/sources', typedOut + '/sources');
for (const name of ['lithent-before', 'lithent'])
  tree('final/typechecked/bundles/' + name, typedOut + '/' + name);
add('final/typechecked/build-manifest.json', typedOut + '/build-manifest.json');
for (const name of ['lithent-before', 'lithent'])
  tree('final/bundles/' + name, out + '/' + name);
for (const name of [
  'react-hooks',
  'preact-hooks',
  'react-classes',
  'preact-classes',
]) {
  const stage = peerOut + '/peers/' + name;
  tree('peers/' + name + '/src', stage + '/src');
  tree('peers/' + name + '/dist', stage + '/dist');
  for (const file of readdirSync(stage).filter(x =>
    /\.(json|js|html)$/.test(x)
  ))
    add('peers/' + name + '/' + file, stage + '/' + file);
}
for (const file of [
  'production-run.mjs',
  'targeted-update.mjs',
  'targeted-update-summarize.mjs',
  'targeted-main.tsx',
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
for (const file of [
  'css/currentStyle.css',
  'css/main.css',
  'css/bootstrap/dist/css/bootstrap.min.css',
])
  add('upstream/' + file, bench + '/' + file);
add('upstream/README.md', bench + '/README.md');
add('upstream/Common.ts', bench + '/webdriver-ts-results/src/Common.ts');
tree('screen/sources', screen + '/sources');
for (const name of ['lithent-before', 'lithent'])
  tree('screen/bundles/' + name, screen + '/' + name);
for (const file of [
  'build-manifest.json',
  'versions.json',
  'diagnostic.json',
  'contracts.json',
  'production-cpu.json',
  'production-verify.json',
])
  add('screen/' + file, screen + '/' + file);
const evidence = gzipSync(JSON.stringify({ files }), { level: 9 });
writeFileSync(
  root + '/docs/benchmark/targeted-update-evidence.json.gz',
  evidence
);
const results = {
  date: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  decision: 'targeted-priority-candidate-with-aggregate-regression',
  installed,
  installedVerify,
  typeOnlyRevision: {
    build: typedManifest,
    reason:
      'Erase-only component type assertion for strict h() call; both production bundles are byte-identical to measured bundles.',
  },
  versions: read(out + '/versions.json'),
  runs,
  contracts: read(out + '/contracts.json'),
  diagnostic: read(out + '/diagnostic.json'),
  initialScreen: read(screen + '/production-cpu.json'),
  summary: {
    main,
    weights,
    ratios,
    weightedRatio,
    targets: summarize([
      ...runs['cpu-main'].samples.filter(
        x => x.id.startsWith('03_') || x.id.startsWith('04_')
      ),
      ...runs['cpu-targets'].samples,
    ]),
    memory: runs.mem.samples.map(x => ({
      name: x.name,
      id: x.id,
      medianMB: median(x.result),
    })),
    sizes,
  },
  evidenceSHA256: hash(evidence),
  evidenceFiles: Object.fromEntries(
    Object.entries(files).map(([name, entry]) => [name, entry.sha256])
  ),
  traceDirectory: out + '/traces',
  traceNote:
    '03/04 trace filenames were reused by the second pass; first-pass numeric samples are preserved in runs.cpu-main, but their traces were overwritten.',
};
writeFileSync(
  root + '/docs/benchmark/targeted-update-results.json',
  JSON.stringify(results, null, 2) + '\n'
);
console.log(JSON.stringify(results.summary, null, 2));
