import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { root, bench, hash, guard, read } from './config.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-cache-20261022');
guard(out);
const analysis = read(path.join(out, 'analysis.json'));
assert.equal(read(path.join(out, 'audit.json')).complete, true);
const files = {},
  inventory = [];
const walk = dir =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : entry.isFile()
          ? [path.join(dir, entry.name)]
          : []
    );
const include = (name, file) => {
  const bytes = fs.readFileSync(file),
    utf8 = bytes.toString('utf8'),
    encoding = Buffer.from(utf8).equals(bytes) ? 'utf8' : 'base64';
  files[name] = {
    sha256: hash(bytes),
    encoding,
    content: encoding === 'utf8' ? utf8 : bytes.toString('base64'),
  };
};
for (const file of walk(out)) {
  const name = path.relative(out, file);
  if (['trace-inventory.json', 'preserve.log'].includes(name)) continue;
  if (/^(round-main|round-reverse)\/traces\//.test(name)) {
    const bytes = fs.readFileSync(file),
      preserved = /_04_select1k_0\.json$/.test(name);
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
assert.equal(inventory.filter(item => /_0[1-9]_/.test(item.file)).length, 1450);
assert.equal(inventory.filter(item => item.preserved).length, 10);
fs.writeFileSync(
  path.join(out, 'trace-inventory.json'),
  JSON.stringify(inventory, null, 2) + '\n'
);
include('run/trace-inventory.json', path.join(out, 'trace-inventory.json'));
for (const file of walk(path.join(root, 'experiments/parent-memo-cache')))
  include('repository/' + path.relative(root, file), file);
for (const name of [
  'docs/benchmark/production-run.mjs',
  'docs/benchmark/targeted-update.mjs',
  'docs/benchmark/official-memory.mjs',
  'docs/benchmark/PARENT_MEMO_CACHE_PLAN.md',
  'tsconfig.json',
  'package.json',
  'pnpm-lock.yaml',
])
  include('repository/' + name, path.join(root, name));
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
for (const [name, file] of Object.entries(
  JSON.parse(zlib.gunzipSync(archive)).files
))
  assert.equal(
    hash(
      Buffer.from(file.content, file.encoding === 'base64' ? 'base64' : 'utf8')
    ),
    file.sha256,
    name
  );
const destination = path.join(
  root,
  'docs/benchmark/parent-memo-cache-evidence.json.gz'
);
fs.writeFileSync(destination, archive);
const result = {
  ...analysis,
  audit: read(path.join(out, 'audit.json')),
  evidence: {
    file: path.relative(root, destination),
    sha256: hash(archive),
    bytes: archive.length,
    files: Object.keys(files).length,
  },
  tracePolicy: {
    normal: inventory.length,
    preserved: 10,
    note: 'All normal trace hash/size; selection index0 per condition/round content; all failed attempts retained in full. Other normal trace content remains temporary.',
  },
};
fs.writeFileSync(
  path.join(root, 'docs/benchmark/parent-memo-cache-results.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify({ evidence: result.evidence, tracePolicy: result.tracePolicy })
);
