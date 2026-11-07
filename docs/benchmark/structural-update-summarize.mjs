// Preserve the full-list comparison separately from earlier targeted experiments.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out =
  process.env.LITHENT_PRODUCTION_OUT || '/tmp/lithent-retained-final-20261019';
const screen =
  process.env.LITHENT_SCREEN_OUT || '/tmp/lithent-retained-final-20261019';
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  resolve(root, '../js-framework-benchmark-upstream');
const names = ['lithent-before', 'targeted', 'lithent'];
const flatOut =
  process.env.LITHENT_FLAT_OUT || '/tmp/lithent-structural-final-20261019';
const flatScreen =
  process.env.LITHENT_FLAT_SCREEN || '/tmp/lithent-structural-screen-20261019';
const read = file => JSON.parse(readFileSync(file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
const manifest = read(out + '/build-manifest.json');
const runs = Object.fromEntries(
  ['cpu', 'mem', 'retention', 'verify'].map(mode => [
    mode,
    read(out + '/production-' + mode + '.json'),
  ])
);
for (const run of Object.values(runs)) {
  assert.equal(run.complete, true);
  assert.deepEqual(run.build, manifest);
  assert.deepEqual(run.versions, runs.cpu.versions);
  assert.equal(
    run.chrome.replace(/^Chrome\//, ''),
    runs.cpu.chrome.replace(/^Chrome\//, '')
  );
}
assert.equal(runs.cpu.samples.length, 27);
assert.equal(runs.mem.samples.length, 6);
assert.equal(runs.retention.samples.length, 9);
assert.equal(runs.verify.samples.length, 3);
for (const mode of ['cpu', 'mem']) {
  const groups = new Set();
  for (const sample of runs[mode].samples) {
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
for (const name of names) {
  assert.equal(manifest[name].core, manifest.lithent.core);
  assert.equal(manifest[name].helper, manifest.lithent.helper);
  assert.equal(
    hash(readFileSync(out + '/sources/' + name + '/src/main.tsx')),
    manifest[name].appSource
  );
  assert.equal(
    hash(readFileSync(out + '/' + name + '/main.js')),
    manifest[name].bundle
  );
  assert.equal(
    hash(readFileSync(out + '/sources/' + name + '/lithent.mjs')),
    manifest[name].core
  );
  assert.equal(
    hash(readFileSync(out + '/sources/' + name + '/helper.mjs')),
    manifest[name].helper
  );
  assert.equal(runs.cpu.samples.filter(s => s.name === name).length, 9);
}
assert.equal(
  hash(readFileSync(root + '/docs/benchmark/retained-row-main.tsx')),
  manifest.lithent.appSource
);
assert.equal(
  hash(readFileSync(root + '/docs/benchmark/targeted-main.tsx')),
  manifest.targeted.appSource
);
const main = runs.cpu.samples.map(({ name, id, result }) => ({
  name,
  id,
  count: result.length,
  ...Object.fromEntries(
    ['total', 'script', 'paint'].map(k => [k, median(result.map(v => v[k]))])
  ),
}));
const common = readFileSync(
  bench + '/webdriver-ts-results/src/Common.ts',
  'utf8'
);
const weights = common
  .match(/benchmarkWeights = \[([\s\S]*?)\];/)[1]
  .split(',')
  .map(v => v.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
const comparisons = [];
for (const before of ['lithent-before', 'targeted']) {
  const ratios = main
    .filter(s => s.name === 'lithent')
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(s => {
      const b = main.find(x => x.name === before && x.id === s.id);
      return {
        id: s.id,
        total: s.total / b.total,
        script: s.script / b.script,
      };
    });
  comparisons.push({
    before,
    after: 'lithent',
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
  });
}
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
for (const file of [
  'build-manifest.json',
  'versions.json',
  'production-keyed.log',
])
  add(file, out + '/' + file);
for (const file of ['diagnostic.json', 'contracts.json'])
  add('screen/' + file, screen + '/' + file);
for (const file of [
  'production-run.mjs',
  'targeted-update.mjs',
  'retained-row-main.tsx',
  'structural-main.tsx',
  'structural-update-summarize.mjs',
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
const extra = {
  flatComparison: read(flatOut + '/production-cpu.json'),
};
assert.equal(extra.flatComparison.complete, true);
assert.equal(extra.flatComparison.samples.length, 27);
const flatManifest = read(flatOut + '/build-manifest.json');
assert.deepEqual(extra.flatComparison.build, flatManifest);
for (const name of names) {
  assert.equal(
    hash(readFileSync(flatOut + '/sources/' + name + '/src/main.tsx')),
    flatManifest[name].appSource
  );
  assert.equal(
    hash(readFileSync(flatOut + '/' + name + '/main.js')),
    flatManifest[name].bundle
  );
}
assert.equal(
  hash(readFileSync(root + '/docs/benchmark/structural-main.tsx')),
  flatManifest.lithent.appSource
);
for (const sample of extra.flatComparison.samples) {
  assert.equal(sample.error, undefined);
  assert.equal(sample.result.length, sample.id.startsWith('04_') ? 25 : 15);
}
tree('flat/sources', flatOut + '/sources');
for (const name of names) tree('flat/bundles/' + name, flatOut + '/' + name);
for (const file of [
  'build-manifest.json',
  'versions.json',
  'production-verify.json',
])
  add('flat/' + file, flatOut + '/' + file);
for (const file of ['diagnostic.json', 'contracts.json'])
  add('flat/screen/' + file, flatScreen + '/' + file);
if (existsSync(out + '/reverse/production-cpu.json')) {
  const run = read(out + '/reverse/production-cpu.json');
  assert.equal(run.complete, true);
  assert.deepEqual(run.build, manifest);
  assert.deepEqual(run.versions, runs.cpu.versions);
  assert.equal(
    run.chrome.replace(/^Chrome\//, ''),
    runs.cpu.chrome.replace(/^Chrome\//, '')
  );
  assert.equal(run.samples.length, 4);
  for (const sample of run.samples) {
    assert.equal(sample.error, undefined);
    assert.equal(sample.result.length, 15);
  }
  extra.reverse = run;
}
const repeated = ['09_clear1k_x8', '02_replace1k'].flatMap(id =>
  ['targeted', 'lithent'].map(name => {
    const values = [runs.cpu, extra.reverse]
      .filter(Boolean)
      .flatMap(run =>
        run.samples
          .filter(s => s.name === name && s.id === id)
          .flatMap(s => s.result)
      );
    return {
      name,
      id,
      count: values.length,
      ...Object.fromEntries(
        ['total', 'script', 'paint'].map(k => [
          k,
          median(values.map(v => v[k])),
        ])
      ),
    };
  })
);
const evidence = gzipSync(JSON.stringify({ files }), { level: 9 });
writeFileSync(
  root + '/docs/benchmark/structural-update-evidence.json.gz',
  evidence
);
const result = {
  date: new Date().toISOString(),
  decision: 'not-adopted-clear-regression',
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
  memory: runs.mem.samples.map(s => ({
    name: s.name,
    id: s.id,
    count: s.result.length,
    medianMB: median(s.result),
  })),
  sizes: Object.fromEntries(
    names.map(name => [
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
  ),
  runs: { ...runs, ...extra },
  screen: {
    diagnostic: read(screen + '/diagnostic.json'),
    contracts: read(screen + '/contracts.json'),
  },
  traceDirectories: [
    out + '/traces',
    flatOut + '/traces',
    ...(extra.reverse ? [out + '/reverse/traces'] : []),
  ],
  evidence: {
    file: 'structural-update-evidence.json.gz',
    sha256: hash(evidence),
    bytes: evidence.length,
    files: Object.keys(files).length,
  },
};
writeFileSync(
  root + '/docs/benchmark/structural-update-results.json',
  JSON.stringify(result, null, 2)
);
console.log(
  JSON.stringify(
    { main, comparisons, memory: result.memory, evidence: result.evidence },
    null,
    2
  )
);
