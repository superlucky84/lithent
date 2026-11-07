// Preserve every successful sample; compare medians without discarding outliers.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  ''
);
const dirs = process.argv.slice(2);
if (!dirs.length)
  throw Error('Expected main output directory [confirmation directories...]');
const json = file => JSON.parse(readFileSync(file));
const verification = json(dirs[0] + '/production-verify.json');
const runs = dirs.map(dir => json(dir + '/production-cpu.json'));
if (
  !verification.complete ||
  verification.samples.length !== 2 ||
  verification.samples.some(
    sample => sample.scenarios !== 9 || !sample.fontLoaded
  )
)
  throw Error('Both apps must pass the keyed, behavior and font checks');
for (const run of runs) {
  if (!run.complete || run.mode !== 'cpu') throw Error('Incomplete CPU run');
  if (JSON.stringify(run.build) !== JSON.stringify(verification.build))
    throw Error('Build changed between verification and measurement');
  if (run.chrome.replace('Chrome/', '') !== verification.chrome)
    throw Error('Browser version changed during measurement');
  for (const sample of run.samples) {
    if (
      sample.error ||
      sample.result.length !== (sample.id.startsWith('04_') ? 25 : 15)
    )
      throw Error('Invalid sample count: ' + sample.name + ' ' + sample.id);
    if (
      sample.result.some(value =>
        ['total', 'script', 'paint'].some(
          key => !Number.isFinite(value[key]) || value[key] < 0
        )
      )
    )
      throw Error('Invalid measurement');
  }
}
if (runs[0].samples.length !== 18)
  throw Error('Main run must include all 9 scenarios for both cores');
const build = verification.build;
if (
  JSON.stringify(build.lithent.appFiles) !==
    JSON.stringify(build['lithent-before'].appFiles) ||
  build.lithent.helper !== build['lithent-before'].helper
)
  throw Error('App and helper must be identical');
const weightFile = resolve(
  root,
  '../js-framework-benchmark/webdriver-ts-results/src/Common.ts'
);
const weightSource = readFileSync(weightFile, 'utf8');
const weights = JSON.parse(
  '[' +
    weightSource
      .match(/benchmarkWeights\s*=\s*\[([\d\s.,]+)\]/)[1]
      .replace(/,\s*$/, '') +
    ']'
);
const ids = [...new Set(runs[0].samples.map(sample => sample.id))].sort();
if (ids.length !== 9 || weights.length !== 9)
  throw Error('Unexpected CPU scenarios or weights');
const quantile = (values, q) => {
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  return sorted[lo] + (sorted[Math.ceil(pos)] - sorted[lo]) * (pos - lo);
};
const summarize = selectedRuns =>
  ids
    .filter(id =>
      selectedRuns.some(run => run.samples.some(sample => sample.id === id))
    )
    .map(id => {
      const result = { id };
      for (const name of ['lithent-before', 'lithent']) {
        const samples = selectedRuns.flatMap(run =>
          run.samples
            .filter(sample => sample.id === id && sample.name === name)
            .flatMap(sample => sample.result)
        );
        if (!samples.length) throw Error('Missing core: ' + name + ' ' + id);
        result[name] = {
          count: samples.length,
          ...Object.fromEntries(
            ['total', 'script', 'paint'].map(key => [
              key,
              {
                median: quantile(
                  samples.map(sample => sample[key]),
                  0.5
                ),
                q25: quantile(
                  samples.map(sample => sample[key]),
                  0.25
                ),
                q75: quantile(
                  samples.map(sample => sample[key]),
                  0.75
                ),
              },
            ])
          ),
        };
      }
      result.ratio = Object.fromEntries(
        ['total', 'script', 'paint'].map(key => [
          key,
          result.lithent[key].median / result['lithent-before'][key].median,
        ])
      );
      return result;
    });
const summary = summarize(runs);
const initial = summarize([runs[0]]);
const weightedRatio = Object.fromEntries(
  ['total', 'script'].map(key => [
    key,
    Math.exp(
      initial.reduce(
        (sum, row, index) => sum + weights[index] * Math.log(row.ratio[key]),
        0
      ) / weights.reduce((a, b) => a + b)
    ),
  ])
);
const output = {
  comparison: {
    before: build['lithent-before'].libraryHead,
    after: build.lithent.libraryHead,
  },
  verification,
  runs,
  summary,
  summariesByRun: runs.map(run => ({
    startedAt: run.startedAt,
    rows: summarize([run]),
  })),
  initialWeightedRatio: weightedRatio,
  weights: {
    values: weights,
    source: 'webdriver-ts-results/src/Common.ts',
    sha256: createHash('sha256').update(weightSource).digest('hex'),
  },
  sampleCount: runs.reduce(
    (sum, run) =>
      sum +
      run.samples.reduce((count, sample) => count + sample.result.length, 0),
    0
  ),
};
const evidence = gzipSync(
  JSON.stringify({
    build,
    files: Object.fromEntries(
      ['lithent-before', 'lithent'].flatMap(name => [
        ...['lithent.mjs', 'helper.mjs', 'src/main.tsx', 'index.html'].map(
          file => [
            'sources/' + name + '/' + file,
            readFileSync(dirs[0] + '/sources/' + name + '/' + file, 'utf8'),
          ]
        ),
        ...['main.js', 'index.html'].map(file => [
          name + '/' + file,
          readFileSync(dirs[0] + '/' + name + '/' + file, 'utf8'),
        ]),
      ])
    ),
  }),
  { level: 9 }
);
writeFileSync(
  root + '/docs/benchmark/edge-official-evidence.json.gz',
  evidence
);
output.evidenceSHA256 = createHash('sha256').update(evidence).digest('hex');
const target = root + '/docs/benchmark/edge-official-results.json';
writeFileSync(target, JSON.stringify(output, null, 2) + '\n');
const table = rows => {
  console.log(
    '| 항목 | 전 전체 ms | 후 전체 ms | 변화 | 전 JS ms | 후 JS ms | 변화 | 표본/코어 |'
  );
  console.log('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const row of rows) {
    const before = row['lithent-before'],
      after = row.lithent;
    const change = key => ((row.ratio[key] - 1) * 100).toFixed(1) + '%';
    console.log(
      `| ${row.id} | ${before.total.median.toFixed(3)} | ${after.total.median.toFixed(3)} | ${change('total')} | ${before.script.median.toFixed(3)} | ${after.script.median.toFixed(3)} | ${change('script')} | ${before.count}/${after.count} |`
    );
  }
};
console.log('Initial full run:');
table(initial);
for (let index = 1; index < runs.length; index++) {
  console.log('\nConfirmation ' + index + ':');
  table(summarize([runs[index]]));
}
console.log('\nAll samples:', output.sampleCount);
console.log('Initial weighted ratios:', weightedRatio);
console.log('Saved', target);
