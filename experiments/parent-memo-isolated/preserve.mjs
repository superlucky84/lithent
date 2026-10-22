import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = path.resolve(
  process.argv[2] || '/tmp/lithent-c3-isolated-20261022'
);
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  path.resolve(root, '../js-framework-benchmark-upstream');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
// Refresh all audits before turning a temporary run into durable evidence.
execFileSync(
  process.execPath,
  [path.join(root, 'experiments/parent-memo-isolated/analyze.mjs'), out],
  { cwd: root, stdio: 'inherit' }
);
const analysis = read(path.join(out, 'analysis.json'));
const main = read(path.join(out, 'original/production-cpu.json'));
const siblingSource = path.join(bench, 'frameworks/keyed/lithent/src/main.tsx');
assert.equal(
  hash(fs.readFileSync(siblingSource)),
  '314efbb41cf0669c13449c4b4800c4ed5e2b193167f20ccebf7d3f7303e5d76b'
);
const walk = dir =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name))
        .flatMap(entry => {
          const file = path.join(dir, entry.name);
          return entry.isDirectory()
            ? walk(file)
            : entry.isFile()
              ? [file]
              : [];
        })
    : [];
const files = {};
const include = (name, file) => {
  const content = fs.readFileSync(file);
  const utf8 = content.toString('utf8');
  const encoding = Buffer.from(utf8).equals(content) ? 'utf8' : 'base64';
  files[name] = {
    sha256: hash(content),
    encoding,
    content: encoding === 'utf8' ? utf8 : content.toString('base64'),
  };
};
const traces = [];
for (const file of walk(out)) {
  const name = path.relative(out, file);
  if (name === 'trace-inventory.json' || name === 'preserve.log') continue;
  if (
    name.startsWith('failed-declaration-build/') &&
    !name.endsWith('build.log')
  )
    continue;
  const match = name.match(/^(original|original-reverse)\/traces\/(.+)$/);
  if (match) {
    // Preserve deterministic selection trace 0 from each variant and round.
    const preserved =
      /^(lithent|lithent-before)-production-keyed_04_select1k_0\.json$/.test(
        match[2]
      );
    const content = fs.readFileSync(file);
    traces.push({
      file: name,
      bytes: content.length,
      sha256: hash(content),
      preserved,
    });
    if (!preserved) continue;
  }
  // Failed browser attempts, if present, are retained without filtering.
  include('run/' + name, file);
}
assert.equal(traces.length, 580);
assert.equal(traces.filter(trace => trace.preserved).length, 4);
fs.writeFileSync(
  path.join(out, 'trace-inventory.json'),
  JSON.stringify(traces, null, 2) + '\n'
);
include('run/trace-inventory.json', path.join(out, 'trace-inventory.json'));
for (const dir of [
  'experiments/parent-memo-isolated',
  'experiments/parent-memo',
])
  for (const file of walk(path.join(root, dir)))
    include('repository/' + path.relative(root, file), file);
for (const name of [
  'docs/benchmark/targeted-update.mjs',
  'docs/benchmark/production-run.mjs',
  'package.json',
  'pnpm-lock.yaml',
  'vite.config.js',
  'tsconfig.json',
  'scripts/emit-declaration-formats.mjs',
  'scripts/size-report.js',
])
  include('repository/' + name, path.join(root, name));
for (const dir of ['webdriver-ts/src', 'webdriver-ts/dist', 'css'])
  for (const file of walk(path.join(bench, dir))) {
    if (file.endsWith('.map')) continue;
    include('benchmark/' + path.relative(bench, file), file);
  }
for (const name of [
  'package.json',
  'package-lock.json',
  'webdriver-ts/package.json',
  'frameworks/keyed/lithent/vite.config.js',
  'frameworks/keyed/lithent/package.json',
  'frameworks/keyed/lithent/package-lock.json',
])
  include('benchmark/' + name, path.join(bench, name));
const commands = {
  note: 'Structured reconstruction of executed commands; paths refer to the recorded staging tree. Run CPU commands sequentially after contracts, with no build/test/other benchmark in parallel.',
  build: {
    executable: 'pnpm',
    args: ['exec', 'node', 'experiments/parent-memo-isolated/build.mjs', out],
  },
  isolatedTests: {
    executable: 'pnpm',
    args: [
      'exec',
      'vitest',
      'run',
      '--config',
      'experiments/parent-memo-isolated/vitest.config.ts',
      '--reporter',
      'verbose',
    ],
    env: { LITHENT_C3_SOURCE: out + '/runtime/src' },
  },
  types: {
    executable: 'pnpm',
    args: ['exec', 'tsc', '--noEmit', '-p', out + '/typecheck.json'],
  },
  dual: { executable: 'pnpm', args: ['test:dual'] },
  package: {
    executable: 'pnpm',
    args: [
      'exec',
      'node',
      'experiments/parent-memo-isolated/check-package.mjs',
      out,
    ],
  },
  editor: {
    executable: 'pnpm',
    args: [
      'exec',
      'node',
      'experiments/parent-memo/verify.mjs',
      out + '/contracts',
      out + '/runtime',
    ],
    env: { LITHENT_CHROME_BINARY: main.chromeBinaryPath },
  },
  prepare: {
    executable: 'node',
    args: ['docs/benchmark/targeted-update.mjs', 'prepare'],
    env: {
      LITHENT_PRODUCTION_OUT: out + '/original',
      LITHENT_BASELINE_SOURCE: out + '/official-main.tsx',
      LITHENT_CANDIDATE_SOURCE: out + '/official-main.tsx',
      LITHENT_CANDIDATE_CORE: out + '/runtime/dist/lithent.mjs',
    },
  },
  contractsAndVerify: ['contracts', 'verify'].map(mode => ({
    executable: 'node',
    args: [
      'docs/benchmark/targeted-update.mjs',
      mode,
      'lithent-before,lithent',
    ],
    env: {
      LITHENT_PRODUCTION_OUT: out + '/original',
      LITHENT_CHROME_BINARY: main.chromeBinaryPath,
    },
  })),
  reverseBuilds:
    'Copy lithent, lithent-before, sources, build-manifest.json and versions.json from original to original-reverse; no recompilation.',
  cpu: [
    ['original', 'lithent-before,lithent'],
    ['original-reverse', 'lithent,lithent-before'],
  ].map(([round, names]) => ({
    executable: 'node',
    args: ['docs/benchmark/targeted-update.mjs', 'cpu', names],
    env: {
      LITHENT_PRODUCTION_OUT: out + '/' + round,
      LITHENT_PRODUCTION_ALTERNATE_ORDER: '1',
      LITHENT_CHROME_BINARY: main.chromeBinaryPath,
    },
  })),
};
const content = Buffer.from(JSON.stringify(commands, null, 2) + '\n');
files['commands.json'] = {
  sha256: hash(content),
  encoding: 'utf8',
  content: content.toString(),
};
const environment = {
  at: new Date().toISOString(),
  node: process.version,
  zlib: process.versions.zlib,
  platform: process.platform,
  arch: process.arch,
  os: os.release(),
  cpu: os.cpus()[0].model,
  benchmarkHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: bench,
    encoding: 'utf8',
  }).trim(),
  siblingSourceSHA256: hash(fs.readFileSync(siblingSource)),
};
const archive = zlib.gzipSync(
  Buffer.from(JSON.stringify({ environment, files })),
  { level: 9 }
);
const destination = path.join(
  root,
  'docs/benchmark/parent-memo-isolation-evidence.json.gz'
);
fs.writeFileSync(destination, archive);
const result = {
  ...analysis,
  environment,
  traces: {
    count: traces.length,
    preserved: 4,
    policy:
      'All normal trace hashes/sizes; selection trace index 0 per variant per round. Other normal trace contents remain temporary. Failed attempts, if any, retained in full.',
  },
  evidence: {
    file: path.relative(root, destination),
    sha256: hash(archive),
    bytes: archive.length,
    files: Object.keys(files).length,
  },
};
fs.writeFileSync(
  path.join(root, 'docs/benchmark/parent-memo-isolation-results.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    evidence: result.evidence,
    traces: result.traces,
    environment,
  })
);
