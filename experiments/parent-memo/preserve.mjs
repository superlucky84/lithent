import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out =
  process.env.LITHENT_C3_OUT || '/tmp/lithent-c3-parent-memo-20261022/final';
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const walk = dir =>
  fs.readdirSync(dir).flatMap(name => {
    const full = path.join(dir, name);
    return fs.statSync(full).isDirectory() ? walk(full) : [full];
  });
const runtimeFiles = () =>
  walk(path.join(root, 'src')).filter(
    file => /\.ts$/.test(file) && !file.includes('/src/tests/')
  );
const modified = [
  'src/diff.ts',
  'src/index.ts',
  'src/render.ts',
  'src/wDom.ts',
  'lithentConcurrent/src/tests/concurrent-exportSurface.test.ts',
];
const added = 'src/hook/useParentMemo.ts';
const destination = path.join(root, 'docs/benchmark');
const patchFile = path.join(destination, 'parent-memo-candidate.patch');

if (process.argv[2] === 'capture') {
  const snapshot = path.join(out, 'candidate');
  assert.equal(
    fs.existsSync(snapshot),
    false,
    'Candidate capture already exists'
  );
  const files = [...runtimeFiles(), path.join(root, modified.at(-1))];
  const manifest = { at: new Date().toISOString(), files: {} };
  for (const file of files) {
    const name = path.relative(root, file);
    const target = path.join(snapshot, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(file, target);
    manifest.files[name] = hash(fs.readFileSync(file));
  }
  fs.cpSync(path.join(root, 'dist'), path.join(snapshot, 'dist'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(out, 'candidate-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );
  const changed = spawnSync('git', ['diff', '--binary', '--', ...modified], {
    cwd: root,
    encoding: 'utf8',
  });
  const newFile = spawnSync(
    'git',
    ['diff', '--no-index', '--', '/dev/null', added],
    { cwd: root, encoding: 'utf8' }
  );
  assert.equal(changed.status, 0);
  assert.equal(newFile.status, 1);
  fs.writeFileSync(patchFile, changed.stdout + newFile.stdout);
  console.log(
    JSON.stringify({
      candidateFiles: files.length,
      patch: path.relative(root, patchFile),
      patchSHA256: hash(fs.readFileSync(patchFile)),
    })
  );
  process.exit(0);
}

const editor = readJSON(path.join(out, 'editor-results.json'));
const original = readJSON(path.join(out, 'original/build-manifest.json'));
const contracts = readJSON(path.join(out, 'original/contracts.json'));
const verify = readJSON(path.join(out, 'original/production-verify.json'));
const restoration = readJSON(path.join(out, 'restoration.json'));
const manifest = readJSON(path.join(out, 'candidate-manifest.json'));
assert.equal(editor.runs.length, 9);
assert.equal(
  editor.manifest.builds.candidate.core,
  hash(fs.readFileSync(path.join(out, 'candidate/dist/lithent.mjs')))
);
assert.equal(original.lithent.core, editor.manifest.builds.candidate.core);
assert.equal(
  original['lithent-before'].core,
  editor.manifest.builds.baseline.core
);
assert.equal(original.lithent.appSource, original['lithent-before'].appSource);
assert.equal(original.lithent.helper, original['lithent-before'].helper);
assert.equal(contracts.samples.length, 2);
assert.equal(verify.complete, true);
assert.equal(verify.samples.length, 2);
for (const sample of verify.samples) {
  assert.equal(sample.scenarios, 9);
  assert.equal(sample.fontLoaded, true);
}
assert.equal(editor.manifest.browser, verify.chromeBinarySha256);
assert.equal(Object.keys(restoration.files).length, 28);
assert.equal(
  Object.values(restoration.files).every(file => file.equal),
  true
);
assert.equal(restoration.upstreamAppPreserved, true);
for (const row of editor.runs) {
  assert.equal(row.retention.registered, 0);
  assert.equal(row.retention.retainedOutputsAndHost, 0);
  assert.deepEqual(row.errors, []);
}
for (const [name, sha] of Object.entries(manifest.files))
  assert.equal(hash(fs.readFileSync(path.join(out, 'candidate', name))), sha);

const dual = fs.readFileSync(path.join(out, 'dual.log'), 'utf8');
const suites = [
  ...dual.matchAll(/^\s*Tests\s+(\d+) passed(?:\s*\|\s*(\d+) skipped)?/gm),
].map(match => ({ passed: Number(match[1]), skipped: Number(match[2] || 0) }));
assert.equal(suites.length, 13);
assert.equal(
  suites.reduce((sum, suite) => sum + suite.passed, 0),
  1070
);
const candidateLog = fs.readFileSync(
  path.join(out, 'candidate-contract.log'),
  'utf8'
);
assert.match(candidateLog, /Tests\s+33 passed/);
const sizes = {};
for (const [name, file] of Object.entries({
  baseline: 'baseline/dist/lithent.umd.js',
  candidate: 'candidate/dist/lithent.umd.js',
})) {
  const data = fs.readFileSync(path.join(out, file));
  sizes[name] = {
    raw: data.length,
    gzip: zlib.gzipSync(data, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(data).length,
  };
}

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
for (const file of walk(out)) include(path.relative(out, file), file);
for (const file of walk(path.join(root, 'experiments/parent-memo')))
  include('tools/' + path.relative(root, file), file);
for (const name of [
  'docs/benchmark/targeted-update.mjs',
  'docs/benchmark/production-run.mjs',
  'package.json',
  'pnpm-lock.yaml',
  'scripts/size-report.js',
])
  include('tools/' + name, path.join(root, name));
for (const file of runtimeFiles())
  include('restored-runtime/' + path.relative(root, file), file);
include('candidate.patch', patchFile);
const evidence = zlib.gzipSync(Buffer.from(JSON.stringify({ files })), {
  level: 9,
});
const evidenceFile = path.join(destination, 'parent-memo-evidence.json.gz');
fs.writeFileSync(evidenceFile, evidence);
const result = {
  status:
    'C3 base prototype validated; default adoption deferred; baseline restored',
  checkpoint: 'ddd545e5b8c3878cfd5a6340464106e4c417da4f',
  tests: { candidate: 33, dualPassed: 1070, dualSkipped: 3, suites },
  sizes,
  compression: {
    node: process.version,
    zlib: process.versions.zlib,
    gzipLevel: 9,
    recordedGate: readJSON(path.join(out, 'compression-environment.json'))
      .sizeGate,
    note: 'The recorded size gate and current aggregator can use different Node/zlib versions; compare gzip values only with their recorded compressor.',
  },
  budget: 4800,
  overBudget: sizes.candidate.brotli - 4800,
  editor,
  original: { build: original, contracts, verify },
  restoration,
  evidence: {
    file: path.relative(root, evidenceFile),
    sha256: hash(evidence),
    bytes: evidence.length,
    files: Object.keys(files).length,
  },
  patch: {
    file: path.relative(root, patchFile),
    sha256: hash(fs.readFileSync(patchFile)),
  },
  unmeasured: [
    'official CPU times and reverse order',
    'official five memory scenarios',
    'full peers',
    '100-cycle churn',
    'final B4/e2e',
    'concurrent parent memo support',
  ],
  limits: [
    'Parent diff failure does not transactionally restore the base live tree or hook cursor. Memo snapshots invalidate; explicit retry may need the previous tree.',
    'First diagnostic test assumptions were corrected; they are not performance samples. Screen-v1 has a different candidate hash and is not combined here.',
  ],
};
fs.writeFileSync(
  path.join(destination, 'parent-memo-results.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    evidence: result.evidence,
    sizes,
    tests: result.tests.candidate,
  })
);
