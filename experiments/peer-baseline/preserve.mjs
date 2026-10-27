import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { root, bench, hash, read, fileHash } from './config.mjs';
import { verify } from './guard.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-peers-20261023');
verify(out);
const analysis = read(path.join(out, 'analysis.json')),
  audit = read(path.join(out, 'audit.json')),
  profile = read(path.join(out, 'profile-analysis.json')),
  decision = read(path.join(out, 'decision.json'));
assert.equal(audit.complete, true);
assert.equal(profile.complete, true);
assert.equal(decision.complete, true);
const profileAudit = read(path.join(out, 'profile-audit.json'));
assert.equal(profileAudit.complete, true);
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
  assert.equal(
    Object.hasOwn(files, name),
    false,
    'Duplicate archive entry ' + name
  );
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
assert.equal(inventory.length, 1450);
assert.equal(inventory.filter(item => item.preserved).length, 10);
fs.writeFileSync(
  path.join(out, 'trace-inventory.json'),
  JSON.stringify(inventory, null, 2) + '\n'
);
include('run/trace-inventory.json', path.join(out, 'trace-inventory.json'));
for (const file of walk(path.join(root, 'experiments/peer-baseline')))
  include('repository/' + path.relative(root, file), file);
for (const name of [
  'experiments/parent-memo-cache/config.mjs',
  'docs/benchmark/production-run.mjs',
  'docs/benchmark/official-memory.mjs',
  'tsconfig.json',
  'package.json',
  'pnpm-lock.yaml',
])
  include('repository/' + name, path.join(root, name));
const reused = 'docs/benchmark/parent-memo-cache-evidence.json.gz';
assert.equal(
  fileHash(path.join(root, reused)),
  '2c463ccaf74cda255f5acad7309fd83e1517df333bd765ec4a4290d580a42699'
);
include(
  'prior-validation/parent-memo-cache-evidence.json.gz',
  path.join(root, reused)
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
for (const [name, peer] of Object.entries(analysis.provenance.peers)) {
  for (const [runtime, entries] of Object.entries(peer.runtime))
    for (const [relative, expected] of Object.entries(entries)) {
      const file = path.join(peer.installedNodeModules, runtime, relative);
      assert.equal(fileHash(file), expected);
      include('dependencies/' + name + '/' + runtime + '/' + relative, file);
    }
}
if (profile.sourceMap.usable) {
  const require = createRequire(
    path.join(out, 'sources/react-hooks/package.json')
  );
  const entry = require.resolve('@jridgewell/trace-mapping');
  let dir = path.dirname(entry);
  while (!fs.existsSync(path.join(dir, 'package.json')))
    dir = path.dirname(dir);
  const pkg = read(path.join(dir, 'package.json'));
  assert.equal(pkg.name, '@jridgewell/trace-mapping');
  for (const file of walk(dir))
    include(
      'diagnostic-dependency/' + pkg.name + '/' + path.relative(dir, file),
      file
    );
}
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
  'docs/benchmark/peer-baseline-evidence.json.gz'
);
fs.writeFileSync(destination, archive);
const result = {
  ...analysis,
  audit,
  profile,
  decision,
  profileAudit,
  evidence: {
    file: path.relative(root, destination),
    sha256: hash(archive),
    bytes: archive.length,
    files: Object.keys(files).length,
  },
  reusedValidation: {
    file: reused,
    sha256: fileHash(path.join(root, reused)),
    scope:
      'Same-hash original Lithent type/B3, existing core/dual regressions; nested isolation evidence. No new core candidate.',
  },
  tracePolicy: {
    normal: inventory.length,
    preserved: 10,
    note: 'Hash/size for all normal CPU traces; selection index0 content per app/order; failed-attempt content and all separate diagnostic profiles/traces retained in full. Other normal trace content remains temporary.',
  },
};
fs.writeFileSync(
  path.join(root, 'docs/benchmark/peer-baseline-results.json'),
  JSON.stringify(result, null, 2) + '\n'
);
verify(out);
console.log(
  JSON.stringify({ evidence: result.evidence, tracePolicy: result.tracePolicy })
);
