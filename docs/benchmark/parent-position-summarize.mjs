// Preserve the C1 prototype and its evidence even if the runtime is restored.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out = process.env.LITHENT_C1_OUT || '/tmp/lithent-c1-parent-20261021';
const artifact = resolve(process.env.LITHENT_C1_ARTIFACT_DIR || out);
const bench = resolve(
  process.env.LITHENT_BENCHMARK_ROOT || '../js-framework-benchmark-upstream'
);
const diagnosticDir = out + '/diagnostic-v3';
const hash = b => createHash('sha256').update(b).digest('hex');
const json = f => JSON.parse(readFileSync(f));
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
const distribution = values => ({
  count: values.length,
  median: median(values),
  min: Math.min(...values),
  max: Math.max(...values),
});
const cpu = json(out + '/original/production-cpu.json');
const diagnostic = json(diagnosticDir + '/diagnostics.json');
assert(cpu.finishedAt);
assert.equal(cpu.samples.length, 18);
assert.equal(diagnostic.counts.length, 68);
assert.equal(diagnostic.latency.length, 24);
assert.equal(diagnostic.memory.length, 6);
for (const memory of diagnostic.memory) {
  assert.equal(memory.released.registered, 0);
  assert.equal(memory.retained.alive, 0);
  assert.equal(memory.retained.dom, 0);
}
assert.equal(cpu.chromeBinarySha256, diagnostic.chromeHash);
assert.equal(hash(readFileSync(cpu.chromeBinaryPath)), cpu.chromeBinarySha256);
assert.equal(
  hash(readFileSync(cpu.chromeFrameworkPath)),
  cpu.chromeFrameworkSha256
);
const manifest = cpu.build;
assert.equal(manifest.lithent.appSource, manifest['lithent-before'].appSource);
assert.equal(manifest.lithent.helper, manifest['lithent-before'].helper);
for (const [variant, name] of [
  ['baseline', 'lithent-before'],
  ['candidate', 'lithent'],
]) {
  assert.equal(manifest[name].core, diagnostic.builds[variant + '-plain'].core);
  assert.equal(
    manifest[name].bundle,
    hash(readFileSync(out + '/original/' + name + '/main.js'))
  );
  assert.equal(
    diagnostic.builds[variant + '-counts'].wDom,
    hash(readFileSync(diagnosticDir + '/' + variant + '/src/wDom.ts'))
  );
}
const weightsSource = readFileSync(
  bench + '/webdriver-ts-results/src/Common.ts',
  'utf8'
);
const weights = weightsSource
  .match(/benchmarkWeights = \[([\s\S]*?)\];/)[1]
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
const ids = [...new Set(cpu.samples.map(s => s.id))].sort();
const cpuRows = ids.map(id => {
  const row = { id };
  for (const [variant, name] of [
    ['baseline', 'lithent-before'],
    ['candidate', 'lithent'],
  ]) {
    const sample = cpu.samples.find(s => s.name === name && s.id === id);
    assert.equal(sample.result.length, id.startsWith('04') ? 25 : 15);
    assert(!sample.error);
    row[variant] = Object.fromEntries(
      ['total', 'script', 'paint'].map(k => [
        k,
        distribution(sample.result.map(s => s[k])),
      ])
    );
  }
  row.ratio = Object.fromEntries(
    ['total', 'script'].map(k => [
      k,
      row.candidate[k].median / row.baseline[k].median,
    ])
  );
  return row;
});
const weighted = Object.fromEntries(
  ['total', 'script'].map(k => [
    k,
    Math.exp(
      cpuRows.reduce(
        (sum, r, i) => sum + weights[i] * Math.log(r.ratio[k]),
        0
      ) / weights.reduce((a, b) => a + b, 0)
    ),
  ])
);
const latency = [];
for (const n of [1000, 10000])
  for (const nested of [false, true]) {
    const row = { n, nested };
    for (const variant of ['baseline', 'candidate']) {
      const samples = diagnostic.latency.filter(
        s => s.n === n && s.nested === nested && s.variant === variant
      );
      row[variant] = Object.fromEntries(
        ['create', 'cold', 'warm', 'reorder', 'afterReorder'].map(k => [
          k,
          distribution(samples.flatMap(s => s[k])),
        ])
      );
      row[variant].warmTrialMedians = samples.map(s => median(s.warm));
    }
    latency.push(row);
  }
const files = {};
const add = (name, file) => {
  const bytes = readFileSync(file);
  files[name] = { sha256: hash(bytes), content: bytes.toString('utf8') };
};
const tree = (name, dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) tree(name + '/' + e.name, dir + '/' + e.name);
    else if (e.isFile()) add(name + '/' + e.name, dir + '/' + e.name);
  }
};
tree('diagnostic-v3', diagnosticDir);
tree('candidate-dist', out + '/candidate-dist');
for (const name of ['sources', 'lithent-before', 'lithent'])
  tree('production/' + name, out + '/original/' + name);
for (const e of readdirSync(out + '/original', { withFileTypes: true }))
  if (e.isFile()) add('production/' + e.name, out + '/original/' + e.name);
for (const e of readdirSync(out, { withFileTypes: true }))
  if (e.isFile() && /\.(log|patch|json)$/.test(e.name))
    add('execution/' + e.name, out + '/' + e.name);
for (const rel of [
  'docs/benchmark/parent-position.mjs',
  'docs/benchmark/parent-position-summarize.mjs',
  'docs/benchmark/parent-position-candidate.patch',
  'docs/benchmark/production-run.mjs',
  'docs/benchmark/targeted-update.mjs',
  'src/tests/core-parentPosition.test.tsx',
  'package.json',
  'pnpm-lock.yaml',
])
  add('repository/' + rel, root + '/' + rel);
for (const rel of [
  'webdriver-ts-results/src/Common.ts',
  'webdriver-ts/src/benchmarksPuppeteer.ts',
  'webdriver-ts/src/forkedBenchmarkRunnerPuppeteer.ts',
  'webdriver-ts/src/benchmarksCommon.ts',
  'webdriver-ts/src/puppeteerAccess.ts',
  'webdriver-ts/src/parseTrace.ts',
  'webdriver-ts/src/common.ts',
  'webdriver-ts/dist/benchmarksPuppeteer.js',
  'webdriver-ts/dist/forkedBenchmarkRunnerPuppeteer.js',
  'webdriver-ts/dist/benchmarksCommon.js',
  'webdriver-ts/dist/puppeteerAccess.js',
  'webdriver-ts/dist/parseTrace.js',
  'webdriver-ts/dist/common.js',
])
  add('upstream/' + rel, bench + '/' + rel);
if (existsSync(out + '/original/failed-attempts'))
  tree('failed-attempts', out + '/original/failed-attempts');
const packed = gzipSync(JSON.stringify({ files }), { level: 9 });
const result = {
  status: 'C1 prototype, not adopted; Phase 2 prescreen only',
  output: out,
  cpuRows,
  weighted,
  weights,
  weightSourceSHA256: hash(weightsSource),
  latency,
  diagnostics: diagnostic,
  cpu,
  limits: [
    'One official CPU phase; no reverse-order confirmation, peer comparison or official memory five-scenario result.',
    'Generic latency is unthrottled JS + nextTick, not click-to-paint.',
    'Successful official traces stay in the temporary output directory; archive contains raw samples, runner, builds and logs.',
    'Earlier fixture failures are preserved in logs and excluded from final measurements.',
  ],
  evidence: {
    file: 'parent-position-evidence.json.gz',
    sha256: hash(packed),
    files: Object.keys(files).length,
  },
};
for (const name of [
  'parent-position-results.json',
  'parent-position-evidence.json.gz',
])
  assert(!existsSync(artifact + '/' + name), 'Refuse to overwrite evidence');
writeFileSync(artifact + '/parent-position-evidence.json.gz', packed);
writeFileSync(
  artifact + '/parent-position-results.json',
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify(
    {
      weighted,
      cpuRows: cpuRows.map(r => ({
        id: r.id,
        before: r.baseline.total.median,
        after: r.candidate.total.median,
        ratio: r.ratio,
      })),
      latency,
      evidence: result.evidence,
    },
    null,
    2
  )
);
