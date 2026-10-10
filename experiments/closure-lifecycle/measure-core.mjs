import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const arg = name => args[args.indexOf(name) + 1];
if (!args.includes('--baseline')) throw new Error('Pass --baseline <json>');
const baseline = JSON.parse(readFileSync(arg('--baseline'), 'utf8'));
const measure = path => {
  const bytes = readFileSync(resolve(repo, path));
  return {
    path,
    raw: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
    brotli: brotliCompressSync(bytes).length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
};
const production = baseline.production.map(before => {
  const after = measure(before.path);
  return {
    ...after,
    baseline: before,
    delta: Object.fromEntries(
      ['raw', 'gzip', 'brotli'].map(key => [key, after[key] - before[key]])
    ),
  };
});
if (
  production.some(
    file =>
      file.path.startsWith('helper/') && file.sha256 !== file.baseline.sha256
  )
)
  throw new Error('This prototype must not change the existing helper bundle');
const execute = promisify(execFile);
const untouched = await execute(
  'git',
  [
    'diff',
    '--name-only',
    baseline.baselineCommit,
    '--',
    'helper/src',
    'element/src',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
  ],
  { cwd: repo }
);
if (untouched.stdout.trim())
  throw new Error(
    'This prototype must not change helper, element or packaging'
  );
const sourceDiff = await execute(
  'git',
  [
    'diff',
    '--stat',
    baseline.baselineCommit,
    '--',
    'src',
    'lithentConcurrent/src',
    'helper/src',
    'element/src',
    ':(exclude)**/tests/**',
  ],
  { cwd: repo }
);
const result = {
  baselineCommit: baseline.baselineCommit,
  node: process.version,
  compression: 'gzip level 9; Node default Brotli; source maps excluded',
  production,
  experiment: ['.mjs', '.cjs', '.umd.js'].map(suffix =>
    measure('experiments/closure-lifecycle/dist/lifecycle' + suffix)
  ),
  productionSourceDiffStat: sourceDiff.stdout.trim(),
};
if (args.includes('--output'))
  writeFileSync(arg('--output'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
