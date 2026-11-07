import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-optin-20261022');
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  path.join(root, '../js-framework-benchmark-upstream');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
execFileSync(
  process.execPath,
  [path.join(root, 'experiments/parent-memo-optin/analyze.mjs'), out],
  { cwd: root, stdio: 'inherit' }
);
const analysis = JSON.parse(fs.readFileSync(path.join(out, 'analysis.json')));
const files = {},
  inventory = [];
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
const include = (name, file) => {
  const bytes = fs.readFileSync(file),
    utf8 = bytes.toString('utf8');
  const encoding = Buffer.from(utf8).equals(bytes) ? 'utf8' : 'base64';
  files[name] = {
    sha256: hash(bytes),
    encoding,
    content: encoding === 'utf8' ? utf8 : bytes.toString('base64'),
  };
};
for (const file of walk(out)) {
  const name = path.relative(out, file);
  if (['preserve.log', 'trace-inventory.json'].includes(name)) continue;
  if (name.startsWith('failed-config-load/') && !name.endsWith('prepare.log'))
    continue;
  if (/^(round-main|round-reverse)\/traces\//.test(name)) {
    const preserved =
      /\/(lithent|lithent-before)-production-keyed_04_select1k_0\.json$/.test(
        name
      );
    const bytes = fs.readFileSync(file);
    inventory.push({
      file: name,
      bytes: bytes.length,
      sha256: hash(bytes),
      preserved,
    });
    if (!preserved) continue;
  }
  include('run/' + name, file);
}
assert.equal(inventory.filter(item => /_0[1-9]_/.test(item.file)).length, 580);
assert.equal(inventory.filter(item => item.preserved).length, 4);
fs.writeFileSync(
  path.join(out, 'trace-inventory.json'),
  JSON.stringify(inventory, null, 2) + '\n'
);
include('run/trace-inventory.json', path.join(out, 'trace-inventory.json'));
for (const file of walk(path.join(root, 'experiments/parent-memo-optin')))
  include('repository/' + path.relative(root, file), file);
for (const name of [
  'docs/benchmark/targeted-update.mjs',
  'docs/benchmark/production-run.mjs',
  'docs/benchmark/official-memory.mjs',
  'tsconfig.json',
  'package.json',
  'pnpm-lock.yaml',
  'docs/benchmark/parent-memo-isolation-results.json',
])
  include('repository/' + name, path.join(root, name));
// Keep the reused test evidence self-contained instead of relying on /tmp.
include(
  'prior-validation/parent-memo-isolation-evidence.json.gz',
  path.join(root, analysis.reused.evidence.file)
);
for (const dir of ['webdriver-ts/src', 'webdriver-ts/dist', 'css'])
  for (const file of walk(path.join(bench, dir)))
    if (!file.endsWith('.map'))
      include('benchmark/' + path.relative(bench, file), file);
for (const name of [
  'package.json',
  'package-lock.json',
  'webdriver-ts/package.json',
  'webdriver-ts-results/src/Common.ts',
  'frameworks/keyed/lithent/package.json',
  'frameworks/keyed/lithent/package-lock.json',
  'frameworks/keyed/lithent/vite.config.js',
])
  include('benchmark/' + name, path.join(bench, name));
const archive = zlib.gzipSync(Buffer.from(JSON.stringify({ files })), {
  level: 9,
});
const destination = path.join(
  root,
  'docs/benchmark/parent-memo-optin-evidence.json.gz'
);
fs.writeFileSync(destination, archive);
const result = {
  ...analysis,
  tracePolicy: {
    normal: inventory.length,
    preserved: 4,
    policy:
      'All normal trace hashes/sizes and selection index 0 per variant per CPU round; other normal trace contents remain temporary. All failed-attempt content is preserved.',
  },
  evidence: {
    file: path.relative(root, destination),
    sha256: hash(archive),
    bytes: archive.length,
    files: Object.keys(files).length,
  },
};
fs.writeFileSync(
  path.join(root, 'docs/benchmark/parent-memo-optin-results.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify({ evidence: result.evidence, tracePolicy: result.tracePolicy })
);
