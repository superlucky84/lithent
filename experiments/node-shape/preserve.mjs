import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { root, hash, read, guard } from '../keyed-placement/init.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = read(path.join(out, 'initial.json'));
const compact = path.join(out, 'compact-experiment');
const adoption = fs.existsSync(path.join(out, 'adoption.json'))
  ? read(path.join(out, 'adoption.json'))
  : null;
if (adoption) {
  assert.equal(read(path.join(out, 'before-adoption.json')).defaultFiles, 29);
  for (const [file, sha] of Object.entries(adoption.files))
    assert.equal(hash(fs.readFileSync(path.join(root, file))), sha, file);
} else guard(out);
const performance = {
  full: read(path.join(out, 'performance.json')),
  compact: read(path.join(compact, 'performance.json')),
};
for (const value of Object.values(performance)) {
  assert.equal(value.cpuSamples, 580);
  assert.equal(value.memorySamples, 60);
}
const files = {},
  traceInventory = [],
  logInventory = [];
function include(name, bytes, extra = {}) {
  const utf8 = bytes.toString('utf8');
  const encoding = Buffer.from(utf8).equals(bytes) ? 'utf8' : 'base64';
  files[name] = {
    bytes: bytes.length,
    sha256: hash(bytes),
    encoding,
    content: encoding === 'utf8' ? utf8 : bytes.toString('base64'),
    ...extra,
  };
}
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
      if (
        entry.isSymbolicLink() ||
        entry.name === 'node_modules' ||
        (entry.isDirectory() && entry.name.startsWith('patch-replay'))
      )
        return [];
      const file = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : [];
    });
}
for (const file of walk(out)) {
  const relative = path.relative(out, file);
  if (/^(preserve|audit).*\.log$/.test(path.basename(file))) continue;
  const bytes = fs.readFileSync(file);
  if (
    /^(compact-experiment\/)?measure-(main|reverse)\/traces\//.test(relative) &&
    !relative.includes('failed-attempts/')
  ) {
    const preserved = /_04_select1k_0\.json$/.test(relative);
    traceInventory.push({
      file: relative,
      bytes: bytes.length,
      sha256: hash(bytes),
      preserved,
    });
    if (!preserved) continue;
  }
  if (relative.endsWith('-v8.log')) {
    const target =
      /^script-source,\d+,http[^,]*\/(?:production|layout-(?:baseline|candidate)|probe-(?:unified-)?(?:original|components))\/main\.js,/m.test(
        bytes.toString('utf8')
      );
    const preserved = target || relative.includes('v8-smoke');
    logInventory.push({
      file: relative,
      bytes: bytes.length,
      sha256: hash(bytes),
      preserved,
    });
    if (!preserved) continue;
    const compressed = zlib.gzipSync(bytes, { level: 9 });
    include('run/' + relative + '.gz', compressed, {
      original: {
        file: 'run/' + relative,
        bytes: bytes.length,
        sha256: hash(bytes),
      },
    });
  } else include('run/' + relative, bytes);
}
assert.equal(traceInventory.length, 1160);
assert.equal(traceInventory.filter(item => item.preserved).length, 8);
include(
  'run/trace-inventory.json',
  Buffer.from(JSON.stringify(traceInventory, null, 2) + '\n')
);
include(
  'run/v8-log-inventory.json',
  Buffer.from(JSON.stringify(logInventory, null, 2) + '\n')
);
for (const dir of ['experiments/node-shape'])
  for (const file of walk(path.join(root, dir)))
    include('repository/' + path.relative(root, file), fs.readFileSync(file));
for (const name of [
  'package.json',
  'pnpm-lock.yaml',
  'vite.config.js',
  'tsconfig.json',
  '.prettierrc',
  'scripts/size-report.js',
  'scripts/emit-declaration-formats.mjs',
  'experiments/keyed-placement/init.mjs',
  'experiments/keyed-placement/build.mjs',
  'experiments/peer-baseline/statistics.mjs',
  'src/tests/core-placementProof.test.tsx',
  'docs/benchmark/production-run.mjs',
  'docs/benchmark/official-memory.mjs',
  'docs/benchmark/targeted-update.mjs',
  'docs/benchmark/node-shape-full-candidate.patch',
  'docs/benchmark/node-shape-candidate.patch',
])
  include('repository/' + name, fs.readFileSync(path.join(root, name)));
const evidence = zlib.gzipSync(Buffer.from(JSON.stringify({ files })), {
  level: 9,
});
const evidenceFile = 'docs/benchmark/node-shape-evidence.json.gz';
fs.writeFileSync(path.join(root, evidenceFile), evidence);
const result = {
  schema: 1,
  at: new Date().toISOString(),
  head: initial.head,
  decision: adoption ? adoption.decision : 'evaluated-not-yet-applied',
  variants: {
    full: {
      build: read(path.join(out, 'candidate-build.json')),
      performance: performance.full,
      retention: read(path.join(out, 'retention.json')),
    },
    compact: {
      build: read(path.join(compact, 'candidate-build.json')),
      performance: performance.compact,
      retention: read(path.join(compact, 'retention.json')),
    },
  },
  diagnostics: {
    archivedProduction: read(path.join(out, 'analysis.json')).production
      .summary,
    layoutBaseline: read(path.join(out, 'analysis-layout-baseline.json'))
      .production.summary,
    full: read(path.join(out, 'analysis-layout-candidate.json')).production
      .summary,
    compact: read(path.join(compact, 'analysis-layout-candidate.json'))
      .production.summary,
    source: read(path.join(out, 'prepared.json')),
  },
  preservation: {
    initialFiles: initial.defaultFiles,
    sourceBaselineSHA256: initial.sources,
    initialBuildDifferences: initial.historicalBuildDifferences,
    scope:
      'Default29 guarded through both isolated experiments; any later adoption is recorded separately',
  },
  adoption,
  evidence: {
    file: evidenceFile,
    sha256: hash(evidence),
    bytes: evidence.length,
    entries: Object.keys(files).length,
    rawLogs: logInventory.length,
    preservedLogs: logInventory.filter(item => item.preserved).length,
    traceInventory: traceInventory.length,
    preservedNormalTraces: 8,
    policy:
      'All target app renderer logs stored as nested gzip; non-app renderer logs inventoried only. All normal CPU traces inventoried; selection trace0 of each variant/order preserved. Failed attempts, if any, remain complete.',
  },
  limitations: [
    'Nonisolated machine, descriptive timing distributions',
    'No mixing Chrome156 with historical Chrome155 or flagged IC timings',
    'Full and compact are separate fresh baseline comparisons',
    'No fresh four-peer target proof',
    'Raw IC events are transitions, not all accesses or time shares',
  ],
};
fs.writeFileSync(
  path.join(root, 'docs/benchmark/node-shape-results.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify({ decision: result.decision, evidence: result.evidence })
);
