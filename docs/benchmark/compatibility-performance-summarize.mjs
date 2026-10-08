// Preserve the raw official CPU samples and the exact A/B production inputs.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const [dir, reverseDir] = process.argv.slice(2);
assert(dir, 'Expected an official output directory and optional reverse run');
const root = fileURLToPath(new URL('../../', import.meta.url));
const json = file => JSON.parse(readFileSync(file));
const hash = value => createHash('sha256').update(value).digest('hex');
const official = json(`${dir}/production-cpu.json`);
const verification = json(`${dir}/production-verify.json`);
assert(official.complete && verification.complete);
assert.equal(official.samples.length, 18);
const reverse = reverseDir
  ? json(`${reverseDir}/production-cpu.json`)
  : undefined;
if (reverse) {
  assert(reverse.complete);
  assert.deepEqual(reverse.build, official.build);
}
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const summarize = (runs, ids) =>
  ids.map(id => {
    const pair = Object.fromEntries(
      ['lithent-before', 'lithent'].map(name => {
        const values = runs.flatMap(run =>
          run.samples
            .filter(sample => sample.id === id && sample.name === name)
            .flatMap(sample => sample.result)
        );
        assert(values.length);
        return [
          name,
          {
            count: values.length,
            ...Object.fromEntries(
              ['total', 'script', 'paint'].map(key => [
                key,
                median(values.map(value => value[key])),
              ])
            ),
          },
        ];
      })
    );
    return {
      id,
      before: pair['lithent-before'],
      fixed: pair.lithent,
      ratios: Object.fromEntries(
        ['total', 'script', 'paint'].map(key => [
          key,
          pair.lithent[key] / pair['lithent-before'][key],
        ])
      ),
    };
  });
const ids = [...new Set(official.samples.map(sample => sample.id))].sort();
assert.equal(ids.length, 9);
for (const sample of official.samples) {
  assert.equal(sample.result.length, sample.id.startsWith('04_') ? 25 : 15);
  assert(!sample.error);
}
const summary = summarize([official], ids);
const weightSource = readFileSync(
  resolve(root, '../js-framework-benchmark/webdriver-ts-results/src/Common.ts'),
  'utf8'
);
const weights = weightSource
  .match(/benchmarkWeights = \[([\s\S]*?)\];/)[1]
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
assert(weights.every(Number.isFinite));
const weightedFixedBefore = Object.fromEntries(
  ['total', 'script'].map(key => [
    key,
    Math.exp(
      summary.reduce(
        (sum, row, index) => sum + weights[index] * Math.log(row.ratios[key]),
        0
      ) / weights.reduce((sum, value) => sum + value, 0)
    ),
  ])
);
const productionInputs = {};
const productionBundles = {};
const sourceFiles = {};
for (const name of ['lithent-before', 'lithent']) {
  productionInputs[name] = Object.fromEntries(
    ['src/main.tsx', 'index.html', 'lithent.mjs', 'helper.mjs'].map(file => [
      file,
      readFileSync(`${dir}/sources/${name}/${file}`, 'utf8'),
    ])
  );
  productionBundles[name] = readFileSync(`${dir}/${name}/main.js`, 'utf8');
  assert.equal(
    hash(productionInputs[name]['lithent.mjs']),
    official.build[name].core
  );
  assert.equal(
    hash(productionInputs[name]['helper.mjs']),
    official.build[name].helper
  );
  assert.equal(hash(productionBundles[name]), official.build[name].bundle);
  sourceFiles[name] = Object.fromEntries(
    Object.keys(official.build[name].sourceFiles).map(file => [
      file,
      name === 'lithent'
        ? readFileSync(`${root}/${file}`, 'utf8')
        : execFileSync(
            'git',
            ['show', `${official.build[name].libraryHead}:${file}`],
            { cwd: root, encoding: 'utf8' }
          ),
    ])
  );
  for (const [file, source] of Object.entries(sourceFiles[name]))
    assert.equal(hash(source), official.build[name].sourceFiles[file]);
}
assert.deepEqual(
  official.build.lithent.appFiles,
  official.build['lithent-before'].appFiles
);
assert.equal(
  official.build.lithent.helper,
  official.build['lithent-before'].helper
);
const scripts = Object.fromEntries(
  ['production-run.mjs', 'compatibility-performance-prepare.mjs'].map(file => [
    file,
    readFileSync(`${root}/docs/benchmark/${file}`, 'utf8'),
  ])
);
const evidence = gzipSync(
  JSON.stringify({ productionInputs, productionBundles, sourceFiles, scripts })
);
const result = {
  date: new Date().toISOString(),
  evidenceSHA256: hash(evidence),
  weights,
  weightSourceSHA256: hash(weightSource),
  weightedFixedBefore,
  productionBundleSizes: Object.fromEntries(
    Object.entries(productionBundles).map(([name, content]) => [
      name,
      {
        raw: Buffer.byteLength(content),
        gzip: gzipSync(content, { level: 9 }).length,
        brotli: brotliCompressSync(content).length,
      },
    ])
  ),
  summary,
  reverseSummary: reverse
    ? summarize(
        [reverse],
        [...new Set(reverse.samples.map(sample => sample.id))].sort()
      )
    : undefined,
  pooledRechecked: reverse
    ? summarize(
        [official, reverse],
        [...new Set(reverse.samples.map(sample => sample.id))].sort()
      )
    : undefined,
  official,
  reverse,
  verification,
};
writeFileSync(
  `${root}/docs/benchmark/compatibility-performance-evidence.json.gz`,
  evidence
);
writeFileSync(
  `${root}/docs/benchmark/compatibility-performance-results.json`,
  JSON.stringify(result, null, 2)
);
console.log(
  JSON.stringify(
    {
      weightedFixedBefore,
      summary,
      reverseSummary: result.reverseSummary,
      pooledRechecked: result.pooledRechecked,
    },
    null,
    2
  )
);
