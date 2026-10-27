import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  path.join(root, '../js-framework-benchmark-upstream');
assert.equal(fs.existsSync(out), false, 'Choose a fresh output directory');
const git = (args, cwd = root) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' });
const source = fs.readFileSync(
  path.join(bench, 'frameworks/keyed/lithent/src/main.tsx')
);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  path.join(out, 'initial.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      head: git(['rev-parse', 'HEAD']).trim(),
      status: git(['status', '--short', '--branch']),
      diff: git(['diff']),
      benchmarkHead: git(['rev-parse', 'HEAD'], bench).trim(),
      benchmarkStatus: git(['status', '--short', '--branch'], bench),
      siblingSourceSHA256: crypto
        .createHash('sha256')
        .update(source)
        .digest('hex'),
    },
    null,
    2
  ) + '\n'
);
console.log(out);
