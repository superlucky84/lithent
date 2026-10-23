import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { root, hash, read, guard } from './init.mjs';

const out = fs.realpathSync(
  path.resolve(process.argv[2] || '/tmp/lithent-c2-20261023-run2')
);
const initial = guard(out);
const baseline = read(path.join(out, 'baseline-build.json'));
const candidate = read(path.join(out, 'candidate-build.json'));
assert.equal(baseline.size.actual, 4798);
assert.equal(baseline.size.pass, true);
assert.equal(candidate.size.actual, 4952);
assert.equal(candidate.size.pass, false);
for (const [name, info] of Object.entries(baseline.bundles)) {
  assert.equal(info.matchesHistorical, true, name);
  assert.equal(
    hash(fs.readFileSync(path.join(out, 'baseline/dist', name))),
    info.sha256
  );
}
for (const [name, info] of Object.entries(candidate.bundles))
  assert.equal(
    hash(fs.readFileSync(path.join(out, 'candidate/dist', name))),
    info.sha256
  );
for (const variant of ['baseline', 'candidate']) {
  const build = variant === 'baseline' ? baseline : candidate;
  for (const [name, sha] of Object.entries(build.sources))
    assert.equal(
      hash(fs.readFileSync(path.join(out, variant, name))),
      sha,
      name
    );
}
const checks = {
  baselineBase: ['baseline-base-order-final.log', /Tests\s+11 passed/],
  baselineConcurrent: [
    'baseline-concurrent-order-final.log',
    /Tests\s+11 passed/,
  ],
  candidateSharedFinal: [
    'candidate-contracts-order-final.log',
    /Tests\s+11 passed/,
  ],
  candidateAll: ['candidate-all-order-final.log', /Tests\s+233 passed/],
  candidateLifetime: ['lifetime-final.log', /Tests\s+4 passed/],
};
for (const [name, [file, pattern]] of Object.entries(checks))
  assert.match(fs.readFileSync(path.join(out, file), 'utf8'), pattern, name);
for (const file of [
  'source-types-final2.log',
  'candidate-test-types-final.log',
  'eslint.log',
])
  assert.equal(fs.readFileSync(path.join(out, file), 'utf8'), '', file);
const dualLog = fs.readFileSync(
  path.join(out, 'default-dual-after-build.log'),
  'utf8'
);
const dualPassed = [...dualLog.matchAll(/Tests\s+(\d+) passed/g)].reduce(
  (n, match) => n + Number(match[1]),
  0
);
const dualSkipped = [
  ...dualLog.matchAll(/Tests[^\n]*?\|\s*(\d+) skipped/g),
].reduce((n, match) => n + Number(match[1]), 0);
assert.equal(dualPassed, 1090);
assert.equal(dualSkipped, 3);

// Replay the permanent patch on the frozen source and compare every file.
const replay = path.join(
  out,
  'patch-replay-' + hash(JSON.stringify(candidate.sources)).slice(0, 12)
);
assert.equal(
  fs.existsSync(replay),
  false,
  'Remove no evidence; use a new run for a fresh preserve'
);
fs.cpSync(path.join(out, 'baseline/src'), path.join(replay, 'src'), {
  recursive: true,
});
execFileSync(
  'git',
  ['apply', path.join(root, 'docs/benchmark/keyed-placement-candidate.patch')],
  { cwd: replay }
);
for (const [name, sha] of Object.entries(candidate.sources))
  assert.equal(hash(fs.readFileSync(path.join(replay, name))), sha, name);

const sibling = path.resolve(root, '../js-framework-benchmark-upstream');
const siblingPresent = fs.existsSync(path.join(sibling, '.git'));
const environment = {
  at: new Date().toISOString(),
  platform: os.platform(),
  arch: os.arch(),
  release: os.release(),
  node: process.version,
  zlib: process.versions.zlib,
  initialMissingInputs: initial.missingInputs,
  initialGeneratedBuildDifferences: initial.historicalBuildDifferences,
  siblingAfter: siblingPresent
    ? {
        head: execFileSync('git', ['rev-parse', 'HEAD'], {
          cwd: sibling,
          encoding: 'utf8',
        }).trim(),
        status: execFileSync('git', ['status', '--short', '--branch'], {
          cwd: sibling,
          encoding: 'utf8',
        }),
        sourceSHA256: hash(
          fs.readFileSync(
            path.join(sibling, 'frameworks/keyed/lithent/src/main.tsx')
          )
        ),
        note: 'Absent at initialization; checkout appeared externally during this run. This experiment only read it and does not claim to have preserved the historical modified app.',
      }
    : null,
  fixedChromePresent: fs.existsSync(
    '/tmp/lithent-benchmark-chrome-155.0.8059.85.app/Contents/MacOS/Google Chrome'
  ),
};
fs.writeFileSync(
  path.join(out, 'environment-after.json'),
  JSON.stringify(environment, null, 2) + '\n'
);
const files = {};
function include(name, file) {
  const bytes = fs.readFileSync(file);
  const utf8 = bytes.toString('utf8');
  const encoding = Buffer.from(utf8).equals(bytes) ? 'utf8' : 'base64';
  files[name] = {
    bytes: bytes.length,
    sha256: hash(bytes),
    encoding,
    content: encoding === 'utf8' ? utf8 : bytes.toString('base64'),
  };
}
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
      const file = path.join(dir, entry.name);
      if (
        entry.isSymbolicLink() ||
        entry.name === 'node_modules' ||
        entry.name.startsWith('patch-replay')
      )
        return [];
      if (entry.isDirectory()) return walk(file);
      return entry.isFile() ? [file] : [];
    });
}
for (const file of walk(out)) {
  const relative = path.relative(out, file);
  if (relative.endsWith('preserve.log') || relative.endsWith('audit.log'))
    continue;
  // First counter build had unmapped instrumentation; no counter source map is evidence.
  if (/^count-(baseline|candidate)\/.*\.map$/.test(relative)) continue;
  include('run/' + relative, file);
}
for (const file of walk(path.join(root, 'experiments/keyed-placement')))
  include('repository/' + path.relative(root, file), file);
for (const file of [
  'src/tests/core-placementProof.test.tsx',
  'docs/benchmark/keyed-placement-candidate.patch',
  'package.json',
  'pnpm-lock.yaml',
  'vite.config.js',
  '.prettierrc',
  'tsconfig.json',
  'scripts/size-report.js',
  'scripts/emit-declaration-formats.mjs',
])
  include('repository/' + file, path.join(root, file));
const evidence = zlib.gzipSync(Buffer.from(JSON.stringify({ files })), {
  level: 9,
});
const evidenceFile = 'docs/benchmark/keyed-placement-evidence.json.gz';
fs.writeFileSync(path.join(root, evidenceFile), evidence);
const result = {
  schema: 1,
  at: new Date().toISOString(),
  head: initial.head,
  decision: 'defer-this-prototype-size-gate',
  scope:
    'DC-17 base-only internal current-diff proof; no default runtime adoption',
  baseline,
  candidate,
  counters: read(path.join(out, 'counts.json')),
  validations: {
    baselineNew: { base: 11, concurrent: 11 },
    candidateShared: 229,
    candidateLifetime: 4,
    candidateAll: 233,
    defaultDual: { passed: dualPassed, skipped: dualSkipped },
    strictTypes: true,
    patchReplay: true,
    eslint: true,
  },
  notRun: [
    'official B3 browser/keyed/font',
    'CPU580 opposite orders',
    'official memory60',
    'real-browser retention',
    'final candidate+peer target',
    'final Test Hardening/Integration',
  ],
  sizeGate: {
    budget: 4800,
    baseline: 4798,
    candidate: 4952,
    added: 154,
    exceeded: 152,
    pass: false,
  },
  environment,
  preservation: {
    files: initial.defaultFiles,
    verifiedUnchanged: Object.keys(initial.defaultFiles).length,
    defaultRuntimeEdited: false,
  },
  evidence: {
    file: evidenceFile,
    sha256: hash(evidence),
    bytes: evidence.length,
    entries: Object.keys(files).length,
  },
};
fs.writeFileSync(
  path.join(root, 'docs/benchmark/keyed-placement-results.json'),
  JSON.stringify(result, null, 2) + '\n'
);
guard(out);
console.log(
  JSON.stringify({
    decision: result.decision,
    size: result.sizeGate,
    evidence: result.evidence,
    unchanged: result.preservation.verifiedUnchanged,
  })
);
