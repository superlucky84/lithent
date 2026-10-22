import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-heap-20261022');
const input = path.resolve(process.argv[3] || '/tmp/lithent-c3-optin-20261022');
const bench =
  process.env.LITHENT_BENCHMARK_ROOT ||
  path.join(root, '../js-framework-benchmark-upstream');
const analysis = JSON.parse(fs.readFileSync(path.join(out, 'analysis.json')));
const audit = JSON.parse(fs.readFileSync(path.join(out, 'audit.json')));
assert.equal(analysis.complete, true);
assert.equal(audit.complete, true);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
for (const [file, sha256] of Object.entries(analysis.collection.baseline))
  assert.equal(hash(fs.readFileSync(path.join(root, file))), sha256);
assert.equal(
  hash(fs.readFileSync(path.join(root, 'package.json'))),
  analysis.collection.packageSHA256
);
assert.equal(
  hash(
    fs.readFileSync(path.join(bench, 'frameworks/keyed/lithent/src/main.tsx'))
  ),
  analysis.collection.siblingSHA256
);
const files = {};
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
const walk = dir =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)]
    );
for (const file of walk(out)) include('run/' + path.relative(out, file), file);
for (const file of walk(path.join(root, 'experiments/parent-memo-heap')))
  include('repository/' + path.relative(root, file), file);
for (const name of ['lithent-before', 'lithent'])
  for (const file of ['main.js', 'index.html']) {
    const full = path.join(input, 'round-main', name, file);
    assert.equal(
      hash(fs.readFileSync(full)),
      analysis.collection.reused.build[name][
        file === 'main.js' ? 'bundle' : 'html'
      ]
    );
    include('production/' + name + '/' + file, full);
  }
const previous = path.join(root, analysis.collection.reused.evidence.file);
assert.equal(
  hash(fs.readFileSync(previous)),
  analysis.collection.reused.evidence.sha256
);
include('prior-validation/parent-memo-optin-evidence.json.gz', previous);
const original =
  process.env.LITHENT_C3_ORIGINAL_APP ||
  '/tmp/lithent-c3-isolated-20261022/official-main.tsx';
assert.equal(
  hash(fs.readFileSync(original)),
  '4fcb17e3dcd841f628d4130a7d47ca3011550972675ba2da18e324a5f541d632'
);
include('next-comparison/official-main.tsx', original);
include(
  'next-comparison/cacheUpdate.ts',
  path.join(root, 'helper/src/hook/cacheUpdate.ts')
);
include(
  'next-comparison/PARENT_MEMO_CACHE_PLAN.md',
  path.join(root, 'docs/benchmark/PARENT_MEMO_CACHE_PLAN.md')
);
// Check CSS/fonts against the exact previously archived bytes used by DC-13.
const priorFiles = JSON.parse(zlib.gunzipSync(fs.readFileSync(previous))).files;
let cssFiles = 0;
for (const [name, record] of Object.entries(priorFiles))
  if (name.startsWith('benchmark/css/')) {
    const file = path.join(bench, name.slice('benchmark/'.length));
    assert.equal(hash(fs.readFileSync(file)), record.sha256, name);
    include(name, file);
    cssFiles++;
  }
assert.ok(cssFiles > 0);
const archive = zlib.gzipSync(Buffer.from(JSON.stringify({ files })), {
  level: 9,
});
const decoded = JSON.parse(zlib.gunzipSync(archive));
for (const [name, file] of Object.entries(decoded.files))
  assert.equal(
    hash(
      Buffer.from(file.content, file.encoding === 'base64' ? 'base64' : 'utf8')
    ),
    file.sha256,
    name
  );
const destination = path.join(
  root,
  'docs/benchmark/parent-memo-heap-evidence.json.gz'
);
fs.writeFileSync(destination, archive);
const result = {
  status: 'complete-bounded-heap-attribution',
  collection: analysis.collection,
  metrics: analysis.metrics,
  snapshots: Object.fromEntries(
    Object.entries(analysis.snapshots).map(([name, points]) => [
      name,
      Object.fromEntries(
        Object.entries(points).map(([label, summary]) => [
          label,
          {
            nodeCount: summary.nodeCount,
            edgeCount: summary.edgeCount,
            selfBytes: summary.selfBytes,
            types: summary.types,
            instances: summary.instances,
            allocationTemplates: summary.allocationTemplates,
            weakMaps: summary.weakMaps.filter(map =>
              ['Oe', 'b', 'y'].includes(map.path?.at(-1)?.edge?.name)
            ),
          },
        ])
      ),
    ])
  ),
  differences: analysis.differences,
  audit,
  limits: analysis.limits,
  evidence: {
    file: path.relative(root, destination),
    sha256: hash(archive),
    bytes: archive.length,
    files: Object.keys(files).length,
    fullSnapshots: 14,
    cssFiles,
    policy:
      'All snapshots compressed losslessly; full group/shape/path analysis and independent audit; exact production builds/tools; nested previous validation. Public results omit repetitive full node-name groups.',
  },
};
fs.writeFileSync(
  path.join(root, 'docs/benchmark/parent-memo-heap-results.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(JSON.stringify(result.evidence));
