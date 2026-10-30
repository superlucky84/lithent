import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const out = fs.realpathSync(process.argv[2]);
const hash = file =>
  createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const initial = JSON.parse(fs.readFileSync(path.join(out, 'initial.json')));
for (const [file, digest] of Object.entries(initial.files))
  assert.equal(hash(file), digest, file);
const root = Object.fromEntries(
  [
    'experiments/static-dynamic/measure.mjs',
    'experiments/static-dynamic/browser.mjs',
    'experiments/static-dynamic/freeze.mjs',
    'experiments/static-dynamic/identity-check.mjs',
    'docs/benchmark/production-run.mjs',
    'docs/benchmark/official-memory.mjs',
    'docs/benchmark/dc25-keyed-fast-path-final-results.json',
    'package.json',
    'pnpm-lock.yaml',
  ].map(file => [file, hash(file)])
);
const stage = Object.fromEntries(
  [
    ...fs
      .readdirSync(path.join(out, 'source'), { recursive: true })
      .filter(file => fs.statSync(path.join(out, 'source', file)).isFile())
      .map(file => 'source/' + file),
    'tsconfig.json',
    'tsconfig-stock.json',
    'vitest.config.mjs',
    'check.json',
    'core-regressions.json',
    'identity-check.json',
    'build-manifest.json',
    'versions.json',
    'tool-inputs.json',
  ].map(file => [file, hash(path.join(out, file))])
);
const result = JSON.parse(
  fs.readFileSync(path.join(out, 'core-regressions.json'))
);
assert(result.success && result.numFailedTests === 0);
const file = path.join(out, 'collection-inputs.json');
assert(!fs.existsSync(file), 'Do not refreeze inputs');
fs.writeFileSync(
  file,
  JSON.stringify({ at: new Date().toISOString(), root, stage }, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    rootFiles: Object.keys(root).length,
    stageFiles: Object.keys(stage).length,
    coreTests: result.numPassedTests,
    coreSuites: result.numPassedTestSuites,
  })
);
