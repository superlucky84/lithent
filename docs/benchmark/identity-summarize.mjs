// Archive the final identity candidate, including rejected experiments.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const [diagnosticDir, officialDir, out, decision, reverseDir] =
  process.argv.slice(2);
if (!out || !['keep', 'reject'].includes(decision))
  throw Error(
    'Expected diagnostic, official, output directories and keep/reject'
  );
const root = fileURLToPath(new URL('../../', import.meta.url));
const json = file => JSON.parse(readFileSync(file));
const hash = value => createHash('sha256').update(value).digest('hex');
const diagnostic = json(diagnosticDir + '/measure-base-identity.json');
const official = json(officialDir + '/production-cpu.json');
const verification = json(officialDir + '/production-verify.json');
assert(official.finishedAt && diagnostic.finishedAt);
assert.equal(official.samples.length, 18);
const reverse = reverseDir
  ? json(reverseDir + '/production-cpu.json')
  : undefined;
if (reverse) {
  assert(reverse.finishedAt);
  assert.equal(reverse.samples.length, 2);
  assert.deepEqual(reverse.build, official.build);
  assert(
    reverse.samples.every(
      sample =>
        sample.id === '03_update10th1k_x16' && sample.result.length === 15
    )
  );
}
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const ids = [...new Set(official.samples.map(sample => sample.id))].sort();
assert.equal(ids.length, 9);
const summary = ids.map(id => {
  const pair = {};
  for (const name of ['lithent-before', 'lithent']) {
    const sample = official.samples.find(
      sample => sample.name === name && sample.id === id
    );
    assert(sample);
    assert.equal(sample.result.length, id.startsWith('04_') ? 25 : 15);
    pair[name] = {
      count: sample.result.length,
      ...Object.fromEntries(
        ['total', 'script', 'paint'].map(key => [
          key,
          median(sample.result.map(value => value[key])),
        ])
      ),
    };
  }
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
const pooledUpdate = reverse
  ? ['lithent-before', 'lithent'].map(name => {
      const samples = [official, reverse].flatMap(run =>
        run.samples
          .filter(
            sample =>
              sample.name === name && sample.id === '03_update10th1k_x16'
          )
          .flatMap(sample => sample.result)
      );
      return {
        name,
        count: samples.length,
        ...Object.fromEntries(
          ['total', 'script', 'paint'].map(key => [
            key,
            median(samples.map(value => value[key])),
          ])
        ),
      };
    })
  : undefined;
const weightSource = readFileSync(
  resolve(root, '../js-framework-benchmark/webdriver-ts-results/src/Common.ts'),
  'utf8'
);
const weightText = weightSource.match(/benchmarkWeights = \[([\s\S]*?)\];/);
assert(weightText);
const weights = weightText[1]
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)
  .map(Number);
assert.equal(weights.length, 9);
assert(weights.every(Number.isFinite));
const geometric = weighted =>
  Object.fromEntries(
    ['total', 'script'].map(key => [
      key,
      Math.exp(
        summary.reduce(
          (sum, row, index) =>
            sum + (weighted ? weights[index] : 1) * Math.log(row.ratios[key]),
          0
        ) / (weighted ? weights.reduce((a, b) => a + b, 0) : summary.length)
      ),
    ])
  );
const diagnosticSummary = ['select', 'update', 'swap', 'remove', 'create'].map(
  scenario => ({
    scenario,
    ...Object.fromEntries(
      ['base', 'identity'].map(name => {
        const times = diagnostic.rounds
          .filter(row => row.name === name && row.scenario === scenario)
          .flatMap(row => row.times);
        assert.equal(times.length, 24);
        return [name, { count: times.length, median: median(times) }];
      })
    ),
  })
);
const productionInputs = Object.fromEntries(
  ['lithent-before', 'lithent'].map(name => [
    name,
    Object.fromEntries(
      ['src/main.tsx', 'index.html', 'lithent.mjs', 'helper.mjs'].map(file => [
        file,
        readFileSync(officialDir + '/sources/' + name + '/' + file, 'utf8'),
      ])
    ),
  ])
);
for (const name of ['lithent-before', 'lithent']) {
  assert.equal(
    hash(productionInputs[name]['lithent.mjs']),
    official.build[name].core
  );
  assert.equal(
    hash(productionInputs[name]['helper.mjs']),
    official.build[name].helper
  );
}
assert.equal(
  productionInputs.lithent['src/main.tsx'],
  productionInputs['lithent-before']['src/main.tsx']
);
assert.equal(
  productionInputs.lithent['helper.mjs'],
  productionInputs['lithent-before']['helper.mjs']
);
const evidence = gzipSync(
  JSON.stringify({
    diagnosticBundles: Object.fromEntries(
      ['base', 'identity'].map(name => [
        name,
        readFileSync(diagnosticDir + '/' + name + '.js', 'utf8'),
      ])
    ),
    productionInputs,
  })
);
const finalSourceSHA256 = hash(readFileSync(resolve(root, 'src/diff.ts')));
assert.equal(
  finalSourceSHA256,
  official.build[decision === 'keep' ? 'lithent' : 'lithent-before']
    .sourceFiles['src/diff.ts']
);
mkdirSync(out, { recursive: true });
writeFileSync(out + '/identity-evidence.json.gz', evidence);
const result = {
  date: new Date().toISOString(),
  decision,
  finalSourceSHA256,
  evidenceSHA256: hash(evidence),
  weights,
  weightSourceSHA256: hash(weightSource),
  weightedCandidateBefore: geometric(true),
  unweightedCandidateBefore: geometric(false),
  diagnosticSummary,
  summary,
  pooledUpdate,
  diagnostic,
  official,
  reverse,
  verification,
};
writeFileSync(out + '/identity-results.json', JSON.stringify(result, null, 2));
console.log(
  JSON.stringify(
    {
      decision,
      weightedCandidateBefore: result.weightedCandidateBefore,
      diagnosticSummary,
      summary,
      pooledUpdate,
    },
    null,
    2
  )
);
