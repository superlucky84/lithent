// Archive the focused portal-cleanup experiment, including rejected candidates.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const [
  diagnosticDir,
  officialDir,
  reverseDir,
  confirmDir,
  singleReverseDir,
  decision,
] = process.argv.slice(2);
assert(
  ['keep', 'reject'].includes(decision),
  'Expected diagnostic, official, reverse, confirm, single reverse directories and keep/reject'
);
const root = fileURLToPath(new URL('../../', import.meta.url));
const json = file => JSON.parse(readFileSync(file));
const hash = value => createHash('sha256').update(value).digest('hex');
const diagnostic = json(
  `${diagnosticDir}/measure-base-portalCold-portalAblation.json`
);
const official = json(`${officialDir}/production-cpu.json`);
const reverse = json(`${reverseDir}/production-cpu.json`);
const confirm = json(`${confirmDir}/production-cpu.json`);
const singleReverse = json(`${singleReverseDir}/production-cpu.json`);
const verification = json(`${officialDir}/production-verify.json`);
assert(
  diagnostic.finishedAt &&
    official.complete &&
    reverse.complete &&
    confirm.complete &&
    singleReverse.complete &&
    verification.complete
);
assert.equal(official.samples.length, 6);
assert.equal(reverse.samples.length, 2);
assert.equal(confirm.samples.length, 4);
assert.equal(singleReverse.samples.length, 2);
assert.deepEqual(reverse.build, official.build);
assert.deepEqual(confirm.build, official.build);
assert.deepEqual(singleReverse.build, official.build);
for (const sample of [
  ...official.samples,
  ...reverse.samples,
  ...confirm.samples,
  ...singleReverse.samples,
]) {
  assert(!sample.error);
  assert.equal(sample.result.length, 15);
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
            .filter(sample => sample.name === name && sample.id === id)
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
      candidate: pair.lithent,
      ratios: Object.fromEntries(
        ['total', 'script', 'paint'].map(key => [
          key,
          pair.lithent[key] / pair['lithent-before'][key],
        ])
      ),
    };
  });
const productionInputs = {};
const productionBundles = {};
const runtime = {};
for (const name of ['lithent-before', 'lithent']) {
  productionInputs[name] = Object.fromEntries(
    ['src/main.tsx', 'index.html', 'lithent.mjs', 'helper.mjs'].map(file => [
      file,
      readFileSync(`${officialDir}/sources/${name}/${file}`, 'utf8'),
    ])
  );
  productionBundles[name] = readFileSync(
    `${officialDir}/${name}/main.js`,
    'utf8'
  );
  assert.equal(hash(productionBundles[name]), official.build[name].bundle);
  assert.equal(
    hash(productionInputs[name]['lithent.mjs']),
    official.build[name].core
  );
  assert.equal(
    hash(productionInputs[name]['helper.mjs']),
    official.build[name].helper
  );
  runtime[name] = Object.fromEntries(
    Object.keys(official.build[name].sourceFiles).map(file => [
      file,
      readFileSync(`${officialDir}/sources/${name}/runtime/${file}`, 'utf8'),
    ])
  );
  for (const [file, source] of Object.entries(runtime[name]))
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
const finalName = decision === 'keep' ? 'lithent' : 'lithent-before';
assert.equal(
  hash(readFileSync(`${root}/dist/lithent.mjs`)),
  official.build[finalName].core
);
for (const [file, source] of Object.entries(runtime[finalName]))
  assert.equal(readFileSync(`${root}/${file}`, 'utf8'), source);
const evidence = gzipSync(
  JSON.stringify({
    productionInputs,
    productionBundles,
    runtime,
    diagnosticBundles: Object.fromEntries(
      ['base', 'portalCold', 'portalAblation'].map(name => [
        name,
        readFileSync(`${diagnosticDir}/${name}.js`, 'utf8'),
      ])
    ),
    scripts: Object.fromEntries(
      [
        'followup-edits.mjs',
        'followup-audit.mjs',
        'creation-prepare.mjs',
        'production-run.mjs',
        'unmount-summarize.mjs',
      ].map(file => [
        file,
        readFileSync(`${root}/docs/benchmark/${file}`, 'utf8'),
      ])
    ),
  })
);
const result = {
  date: new Date().toISOString(),
  decision,
  evidenceSHA256: hash(evidence),
  diagnosticSummary: ['clear', 'replace'].map(scenario => ({
    scenario,
    ...Object.fromEntries(
      ['base', 'portalCold', 'portalAblation'].map(name => [
        name,
        median(
          diagnostic.rounds
            .filter(row => row.scenario === scenario && row.name === name)
            .flatMap(row => row.times)
        ),
      ])
    ),
  })),
  summary: summarize([official], ['01_run1k', '02_replace1k', '09_clear1k_x8']),
  reverseSummary: summarize([reverse], ['09_clear1k_x8']),
  confirmSummary: summarize([confirm], ['09_clear1k_x8', '06_remove-one-1k']),
  singleReverseSummary: summarize([singleReverse], ['06_remove-one-1k']),
  pooledClear: summarize([official, reverse, confirm], ['09_clear1k_x8'])[0],
  diagnostic,
  official,
  reverse,
  confirm,
  singleReverse,
  verification,
};
writeFileSync(
  `${root}/docs/benchmark/unmount-results.json`,
  JSON.stringify(result, null, 2)
);
writeFileSync(`${root}/docs/benchmark/unmount-evidence.json.gz`, evidence);
console.log(
  JSON.stringify(
    {
      decision,
      summary: result.summary,
      reverseSummary: result.reverseSummary,
      confirmSummary: result.confirmSummary,
      singleReverseSummary: result.singleReverseSummary,
      pooledClear: result.pooledClear,
    },
    null,
    2
  )
);
