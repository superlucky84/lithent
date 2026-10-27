import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = process.argv[2] || '/tmp/lithent-c3-isolated-20261022';
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  path.resolve(root, '../js-framework-benchmark-upstream');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const json = name => JSON.parse(fs.readFileSync(path.join(out, name), 'utf8'));
const build = json('build-manifest.json');
const editor = json('contracts/editor-results.json');
const main = json('original/production-cpu.json');
const reverse = json('original-reverse/production-cpu.json');
const verify = json('original/production-verify.json');
const appContracts = json('original/contracts.json');
const packageCheck = json('package-check.json');
assert.equal(packageCheck.defaultHasMemo, false);
for (const check of [
  'isolatedOwnsItsRegistry',
  'mixedSetupRejected',
  'esmAndCommonJS',
  'packageSelfReference',
  'nodeNextESMAndCommonJSTypes',
])
  assert.equal(packageCheck[check], true, check);
const defaultPackage = fs.readFileSync(path.join(root, 'package.json'));
assert.deepEqual(
  defaultPackage,
  execFileSync('git', ['show', build.head + ':package.json'], { cwd: root })
);
for (const [name, sha] of Object.entries(build.baseline))
  assert.equal(hash(fs.readFileSync(path.join(root, name))), sha, name);
for (const [name, sha] of Object.entries(build.source))
  assert.equal(
    hash(fs.readFileSync(path.join(out, 'runtime', name))),
    sha,
    name
  );
for (const [name, value] of Object.entries(build.bundles))
  assert.equal(
    hash(fs.readFileSync(path.join(out, 'runtime/dist', name))),
    value.sha256,
    name
  );
assert.equal(editor.runs.length, 9);
for (const run of editor.runs) {
  assert.deepEqual(run.errors, []);
  assert.equal(run.retention.registered, 0);
  assert.equal(run.retention.retainedOutputsAndHost, 0);
}
assert.equal(
  editor.manifest.builds.candidate.core,
  build.bundles['lithent.mjs'].sha256
);
assert.equal(verify.complete, true);
assert.equal(verify.samples.length, 2);
for (const sample of verify.samples) {
  assert.equal(sample.scenarios, 9);
  assert.equal(sample.fontLoaded, true);
}
assert.equal(appContracts.samples.length, 2);
assert.equal(main.build.lithent.core, build.bundles['lithent.mjs'].sha256);
assert.equal(
  main.build.lithent.appSource,
  main.build['lithent-before'].appSource
);
assert.equal(main.build.lithent.helper, main.build['lithent-before'].helper);
assert.deepEqual(main.build, reverse.build);
assert.deepEqual(main.build, verify.build);
assert.deepEqual(main.build, appContracts.build);
for (const round of ['original', 'original-reverse'])
  for (const [name, expected] of Object.entries(main.build)) {
    for (const [file, key] of [
      ['src/main.tsx', 'appSource'],
      ['lithent.mjs', 'core'],
      ['helper.mjs', 'helper'],
    ])
      assert.equal(
        hash(fs.readFileSync(path.join(out, round, 'sources', name, file))),
        expected[key]
      );
    assert.equal(
      hash(fs.readFileSync(path.join(out, round, name, 'main.js'))),
      expected.bundle
    );
  }
assert.equal(main.chromeBinarySha256, reverse.chromeBinarySha256);
assert.equal(main.chromeFrameworkSha256, reverse.chromeFrameworkSha256);
assert.equal(main.chrome, reverse.chrome);
assert.equal(
  hash(fs.readFileSync(main.chromeBinaryPath)),
  main.chromeBinarySha256
);
assert.equal(
  hash(fs.readFileSync(main.chromeFrameworkPath)),
  main.chromeFrameworkSha256
);
for (const run of [main, reverse]) {
  assert.equal(run.complete, true);
  assert.equal(run.alternatingOrder, true);
  assert.equal(run.samples.length, 18);
  for (const sample of run.samples) {
    assert.equal(sample.result.length, sample.id.startsWith('04') ? 25 : 15);
    assert.equal(!!sample.error, false);
  }
}
for (let i = 0; i < main.samples.length; i += 2) {
  assert.equal(main.samples[i].id, reverse.samples[i].id);
  assert.notEqual(main.samples[i].name, reverse.samples[i].name);
}

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
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};
const distribution = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return {
    count: sorted.length,
    median: median(sorted),
    p25: median(sorted.slice(0, middle)),
    p75: median(sorted.slice(Math.ceil(sorted.length / 2))),
    min: sorted[0],
    max: sorted.at(-1),
  };
};
const ids = [...new Set(main.samples.map(sample => sample.id))].sort();
assert.equal(ids.length, 9);
const summarize = runs =>
  ids.map(id => {
    const row = { id, variants: {}, ratio: {} };
    for (const name of ['lithent-before', 'lithent']) {
      const samples = runs.flatMap(run =>
        run.samples
          .filter(sample => sample.id === id && sample.name === name)
          .flatMap(sample => sample.result)
      );
      row.variants[name] = Object.fromEntries(
        ['total', 'script', 'paint'].map(metric => [
          metric,
          distribution(samples.map(sample => sample[metric])),
        ])
      );
    }
    for (const metric of ['total', 'script'])
      row.ratio[metric] =
        row.variants.lithent[metric].median /
        row.variants['lithent-before'][metric].median;
    return row;
  });
const rows = {
  main: summarize([main]),
  reverse: summarize([reverse]),
  pooled: summarize([main, reverse]),
};
const weighted = Object.fromEntries(
  Object.entries(rows).map(([round, rows]) => [
    round,
    Object.fromEntries(
      ['total', 'script'].map(metric => [
        metric,
        Math.exp(
          rows.reduce(
            (sum, row, index) =>
              sum + weights[index] * Math.log(row.ratio[metric]),
            0
          ) / weights.reduce((a, b) => a + b, 0)
        ),
      ])
    ),
  ])
);
const appSizes = Object.fromEntries(
  ['lithent-before', 'lithent'].map(name => {
    const data = fs.readFileSync(path.join(out, 'original', name, 'main.js'));
    return [
      name,
      {
        raw: data.length,
        gzip: zlib.gzipSync(data, { level: 9 }).length,
        brotli: zlib.brotliCompressSync(data).length,
      },
    ];
  })
);
const totals = [main, reverse].map(run =>
  run.samples.reduce((sum, sample) => sum + sample.result.length, 0)
);
assert.deepEqual(totals, [290, 290]);
const testLog = fs.readFileSync(path.join(out, 'tests.log'), 'utf8');
assert.match(testLog, /Tests\s+251 passed/);
assert.equal(
  [
    ...testLog.matchAll(
      /✓ experiments\/parent-memo\/tests\/parentMemo.test.tsx/g
    ),
  ].length,
  33
);
const dualLog = fs.readFileSync(path.join(out, 'dual.log'), 'utf8');
const suites = [
  ...dualLog.matchAll(/^\s*Tests\s+(\d+) passed(?:\s*\|\s*(\d+) skipped)?/gm),
].map(match => ({ passed: Number(match[1]), skipped: Number(match[2] || 0) }));
assert.equal(suites.length, 13);
assert.equal(
  suites.reduce((sum, suite) => sum + suite.passed, 0),
  1070
);
assert.equal(
  suites.reduce((sum, suite) => sum + suite.skipped, 0),
  3
);
const result = {
  status:
    'Experimental isolated renderer; default runtime preserved; no adoption or public export change',
  checkpoint: build.head,
  provenance: build,
  defaultPackageSHA256: hash(defaultPackage),
  weights,
  weightSourceSHA256: hash(weightsSource),
  samples: totals,
  rows,
  weighted,
  tests: { isolated: 251, includesMemo: 33, dualPassed: 1070, dualSkipped: 3 },
  runs: [main, reverse].map(run => ({
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    loadStart: run.loadStart,
    loadEnd: run.loadEnd,
    failedBatches: run.failedBatches || [],
    chrome: run.chrome,
    chromeBinarySha256: run.chromeBinarySha256,
    chromeFrameworkSha256: run.chromeFrameworkSha256,
  })),
  contracts: {
    package: json('package-check.json'),
    editor,
    original: appContracts,
    verify,
  },
  unmeasured: [
    'memo-enabled benchmark row CPU',
    'official memory 5 scenarios',
    'full React/Preact peers',
    '100-cycle churn',
    'full B4/hardening/integration',
  ],
  limits: [
    'CPU comparison uses unchanged original app with no useParentMemo calls.',
    'Pooled medians keep equal numbers of samples from each round; batch/load/temporal confounding remains.',
    'Private standalone package and all-API bundler alias are experimental; no new subpath or optional budget has been approved.',
  ],
};
result.appSizes = appSizes;
result.analysisCompression = {
  node: process.version,
  zlib: process.versions.zlib,
  gzipLevel: 9,
};
result.declarations = {
  esm: fs
    .readdirSync(path.join(out, 'runtime/dist'), { recursive: true })
    .filter(name => name.endsWith('.d.ts')).length,
  commonJS: fs
    .readdirSync(path.join(out, 'runtime/dist'), { recursive: true })
    .filter(name => name.endsWith('.d.cts')).length,
};
assert.deepEqual(result.declarations, { esm: 17, commonJS: 17 });
fs.writeFileSync(
  path.join(out, 'analysis.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify(
    {
      samples: totals,
      weighted,
      rows: rows.pooled.map(row => ({
        id: row.id,
        baseline: row.variants['lithent-before'].total.median,
        isolated: row.variants.lithent.total.median,
        totalPercent: (row.ratio.total - 1) * 100,
        scriptPercent: (row.ratio.script - 1) * 100,
      })),
    },
    null,
    2
  )
);
