// Archive the balanced adapter comparison without changing older experiments.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out =
  process.env.LITHENT_PRODUCTION_OUT ||
  '/tmp/lithent-overall-20261019/screen-v2';
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  resolve(root, '../js-framework-benchmark-upstream');
const names = ['lithent-before', 'full', 'scalar', 'static'];
const read = file => JSON.parse(readFileSync(file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
const manifest = read(out + '/build-manifest.json');
const versions = read(out + '/versions.json');
const runs = Object.fromEntries(
  ['verify', 'cpu'].map(mode => [
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
  assert.deepEqual(run.versions, versions);
  assert.equal(
    run.chrome.replace(/^Chrome\//, ''),
    runs.cpu.chrome.replace(/^Chrome\//, '')
  );
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
assert.equal(runs.verify.samples.length, 4);
assert.equal(runs.cpu.samples.length, 36);
if (runs.mem) assert.equal(runs.mem.samples.length, 20);
for (const name of names) {
  assert.equal(manifest[name].core, manifest['lithent-before'].core);
  assert.equal(manifest[name].helper, manifest['lithent-before'].helper);
  for (const [file, field] of [
    ['sources/' + name + '/src/main.tsx', 'appSource'],
    ['sources/' + name + '/lithent.mjs', 'core'],
    ['sources/' + name + '/helper.mjs', 'helper'],
    [name + '/main.js', 'bundle'],
  ])
    assert.equal(hash(readFileSync(out + '/' + file)), manifest[name][field]);
  assert.equal(runs.cpu.samples.filter(s => s.name === name).length, 9);
  if (runs.mem)
    assert.equal(runs.mem.samples.filter(s => s.name === name).length, 5);
  if (name !== 'lithent-before')
    assert.equal(
      hash(
        readFileSync(root + '/docs/benchmark/overall-' + name + '-main.tsx')
      ),
      manifest[name].appSource
    );
}
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
const cpuSummary = samples =>
  samples.map(({ name, id, result }) => ({
    name,
    id,
    count: result.length,
    ...Object.fromEntries(
      ['total', 'script', 'paint'].map(k => [k, median(result.map(v => v[k]))])
    ),
  }));
const compare = rows =>
  names.slice(1).flatMap(name => {
    const ratios = rows
      .filter(s => s.name === name)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(s => {
        const base = rows.find(
          b => b.name === 'lithent-before' && b.id === s.id
        );
        assert(base);
        return {
          id: s.id,
          total: s.total / base.total,
          script: s.script / base.script,
        };
      });
    if (!ratios.length) return [];
    return [
      {
        before: 'lithent-before',
        after: name,
        ratios,
        // A full nine-scenario score is never inferred from a partial rerun.
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
      },
    ];
  });
const main = cpuSummary(runs.cpu.samples);
const reverse = runs.reverse ? cpuSummary(runs.reverse.samples) : [];
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
  'contracts.json',
  'diagnostic.json',
  'production-keyed.log',
])
  add(file, out + '/' + file);
for (const file of [
  'production-run.mjs',
  'targeted-update.mjs',
  'overall-update-summarize.mjs',
  ...names.slice(1).map(name => 'overall-' + name + '-main.tsx'),
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
const evidence = gzipSync(JSON.stringify({ files }), { level: 9 });
writeFileSync(
  root + '/docs/benchmark/overall-update-evidence.json.gz',
  evidence
);
const result = {
  date: new Date().toISOString(),
  decision: process.env.LITHENT_OVERALL_DECISION || 'review-only',
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  },
  build: manifest,
  weights,
  main,
  comparisons: compare(main),
  reverse,
  reverseComparisons: compare(reverse),
  memory:
    runs.mem?.samples.map(s => ({
      name: s.name,
      id: s.id,
      count: s.result.length,
      medianMB: median(s.result),
    })) || null,
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
  runs,
  screen: {
    diagnostic: read(out + '/diagnostic.json'),
    contracts: read(out + '/contracts.json'),
  },
  traceDirectories: [
    out + '/traces',
    ...(runs.reverse ? [out + '/reverse/traces'] : []),
  ],
  evidence: {
    file: 'overall-update-evidence.json.gz',
    sha256: hash(evidence),
    bytes: evidence.length,
    files: Object.keys(files).length,
  },
};
writeFileSync(
  root + '/docs/benchmark/overall-update-results.json',
  JSON.stringify(result, null, 2)
);
console.log(
  JSON.stringify(
    {
      comparisons: result.comparisons,
      reverseComparisons: result.reverseComparisons,
      memory: result.memory,
      sizes: result.sizes,
      evidence: result.evidence,
    },
    null,
    2
  )
);
