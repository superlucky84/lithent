import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const repository = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const args = process.argv.slice(2);
const arg = name => args[args.indexOf(name) + 1];
const production = [
  'dist/lithent',
  'lithentConcurrent/dist/lithentConcurrent',
  'helper/dist/lithentHelper',
].flatMap(prefix => ['.mjs', '.cjs', '.umd.js'].map(suffix => prefix + suffix));
const measure = path => {
  const bytes = readFileSync(resolve(repository, path));
  return {
    path,
    raw: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
    brotli: brotliCompressSync(bytes).length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
};
const execute = promisify(execFile);
const git = async (...args) =>
  (
    await execute('git', args, { cwd: repository, encoding: 'utf8' })
  ).stdout.trim();
const result = {
  baselineCommit: await git('rev-parse', 'HEAD'),
  node: process.version,
  production: production.map(measure),
};

if (args.includes('--compare')) {
  const baseline = JSON.parse(readFileSync(arg('--compare'), 'utf8'));
  result.baselineCommit = baseline.baselineCommit;
  result.productionUnchanged = result.production.every(
    (file, index) => file.sha256 === baseline.production[index].sha256
  );
  result.productionSourceDiff = await git(
    'diff',
    baseline.baselineCommit,
    '--',
    'src',
    'lithentConcurrent/src',
    'helper/src',
    'element/src',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml'
  );
  result.experiment = ['.mjs', '.cjs', '.umd.js'].map(suffix =>
    measure('experiments/closure-lifecycle/dist/lifecycle' + suffix)
  );
  if (!result.productionUnchanged || result.productionSourceDiff) {
    throw new Error('The experiment changed a production source or artifact');
  }
}
if (args.includes('--output')) {
  writeFileSync(arg('--output'), JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify(result, null, 2));
