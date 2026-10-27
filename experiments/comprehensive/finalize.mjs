import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, read, hash, git } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const directory = path.join(out, 'integration');
const runs = fs
  .readdirSync(directory)
  .filter(file => file.endsWith('.json') && !file.endsWith('.report.json'))
  .map(file => ({ file, ...read(path.join(directory, file)) }));
const labels = [
  'full-build',
  'verify-concurrent',
  'size',
  'types-base',
  'types-concurrent',
  'types-e2e',
  'lint',
  'full-tests',
  'ssr-base',
  'satellites-concurrent',
  'packages',
  'e2e',
];
const passed = {};
for (const label of labels) {
  const latest = runs
    .filter(run => run.name === label)
    .sort((a, b) => a.at.localeCompare(b.at))
    .at(-1);
  assert(latest, label);
  assert.equal(latest.status, 0, label);
  passed[label] = latest;
}
const report = read(passed.e2e.report);
assert.equal(report.stats.unexpected, 0);
assert.equal(report.stats.flaky, 0);
assert.equal(report.stats.skipped, 0);
const eventTests = [];
const visit = suites => {
  for (const suite of suites) {
    for (const spec of suite.specs || [])
      if (spec.file.endsWith('events.spec.ts')) eventTests.push(...spec.tests);
    visit(suite.suites || []);
  }
};
visit(report.suites);
assert.equal(eventTests.length, 12);
for (const test of eventTests) assert.equal(test.status, 'expected');
const unitCounts = {};
for (const name of ['full-tests', 'ssr-base', 'satellites-concurrent']) {
  const log = fs
    .readFileSync(
      path.join(directory, passed[name].file.replace(/\.json$/, '.log')),
      'utf8'
    )
    .replace(/\x1b\[[0-9;]*m/g, '');
  const suites = [
    ...log.matchAll(/Tests\s+(\d+) passed(?:\s+\|\s+(\d+) skipped)?/g),
  ].map(match => ({
    passed: Number(match[1]),
    skipped: Number(match[2] || 0),
  }));
  assert(suites.length, name);
  unitCounts[name] = {
    suites,
    passed: suites.reduce((sum, item) => sum + item.passed, 0),
    skipped: suites.reduce((sum, item) => sum + item.skipped, 0),
    note: 'Execution counts from the repository scripts; suites may overlap, not a claim of distinct tests.',
  };
}
const adoption = read(path.join(out, 'adoption.json'));
for (const [file, digest] of Object.entries(adoption.sources))
  assert.equal(hash(fs.readFileSync(path.join(root, file))), digest, file);
const packages = read(path.join(out, 'package-dispatch.json'));
assert(packages.complete);
assert.equal(packages.samples.length, 6);
for (const sample of packages.samples)
  assert.equal(
    hash(fs.readFileSync(path.join(root, sample.file))),
    sample.sha256,
    sample.file
  );
const finalPackages = path.join(out, 'final-packages');
assert(!fs.existsSync(finalPackages));
for (const folder of ['dist', 'lithentConcurrent/dist'])
  fs.cpSync(path.join(root, folder), path.join(finalPackages, folder), {
    recursive: true,
  });
const artifacts = Object.fromEntries(
  fs
    .readdirSync(finalPackages, { recursive: true })
    .filter(file => fs.statSync(path.join(finalPackages, file)).isFile())
    .map(file => [file, hash(fs.readFileSync(path.join(finalPackages, file)))])
);
const result = {
  at: new Date().toISOString(),
  head: git(['rev-parse', 'HEAD']).toString().trim(),
  status: git(['status', '--short']).toString(),
  pass: true,
  steps: passed,
  unitCounts,
  e2e: report.stats,
  eventBrowserTests: eventTests.length,
  packageFormats: packages.samples.length,
  creationFailures: packages.samples
    .filter(sample => sample.creationFailure)
    .map(sample => ({ name: sample.name, ...sample.creationFailure })),
  interactiveTable: packages.interactiveTable,
  artifacts,
};
fs.writeFileSync(
  path.join(out, 'validation.json'),
  JSON.stringify(result, null, 2) + '\n',
  { flag: 'wx' }
);
fs.writeFileSync(
  path.join(root, 'docs/benchmark/comprehensive-validation.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    pass: true,
    unitCounts,
    e2e: result.e2e,
    packageFormats: 6,
    artifactFiles: Object.keys(artifacts).length,
  })
);
