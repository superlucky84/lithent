// Stage baseline (HEAD) and candidate (working tree) cores with the official
// A app and the ordinary row-component app C, plus the frozen runner/browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build } from 'vite';

const out = path.resolve(process.argv[2]);
const runnerPrior = '/private/tmp/lithent-dc25-20261027';
const appPrior = '/private/tmp/lithent-c4-owner-20261029-v2';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
};
assert(!fs.existsSync(out), 'Use a fresh output directory');
fs.mkdirSync(out);
const source = path.join(out, 'source');

// Cores: baseline from HEAD, candidate from the working tree. Only render.ts
// may differ; the guard pins every candidate source file during collection.
const files = {};
const coreFiles = fs
  .readdirSync('src', { recursive: true })
  .filter(name => name.endsWith('.ts') && !name.startsWith('tests/'))
  .map(name => 'src/' + name);
const differing = [];
for (const file of coreFiles) {
  const head = execFileSync('git', ['show', 'HEAD:' + file]);
  const work = fs.readFileSync(file);
  for (const [core, bytes] of [
    ['baseline', head],
    ['candidate', work],
  ]) {
    const target = path.join(source, core, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  }
  files[file] = hash(work);
  if (hash(head) !== hash(work)) differing.push(file);
}
assert.deepEqual(differing, ['src/render.ts']);
for (const file of [
  'lithentConcurrent/src/render.ts',
  'src/tests/core-bulkRemoval.test.tsx',
  'docs/benchmark/production-run.mjs',
  'experiments/bulk-removal-v2/prepare.mjs',
  'experiments/bulk-removal-v2/measure.mjs',
  'experiments/bulk-removal-v2/browser-check.mjs',
])
  files[file] = hash(fs.readFileSync(file));

// Apps: the official A app (cached plain rows) and app C (one mount
// component per row with cacheUpdate) from the component-cost evidence.
const ownerInputs = read(path.join(appPrior, 'initial.json'));
const original = fs.readFileSync(path.join(appPrior, 'source/original.tsx'));
assert.equal(hash(original), ownerInputs.sourceOriginal);
const cache = fs.readFileSync(path.join(appPrior, 'source/cacheUpdate.ts'));
assert.equal(hash(cache), ownerInputs.cache);
const rows = execFileSync('tar', [
  'xzf',
  'docs/benchmark/component-cost-evidence.tar.gz',
  '-O',
  'component-cost/apps/row-memo-main.tsx',
]);
fs.writeFileSync(path.join(source, 'original.tsx'), original);
fs.writeFileSync(path.join(source, 'rows.tsx'), rows);
fs.writeFileSync(path.join(source, 'cacheUpdate.ts'), cache);
const html = path.join(appPrior, 'apps/baseline/index.html');

// Frozen official runner from DC-25 and the installed browser, pinned.
const previousRunner = read(runnerPrior + '/runner-inputs.json');
const bench = path.join(out, 'official-benchmark');
const runnerFiles = {};
for (const [file, digest] of Object.entries(previousRunner.frozen)) {
  const bytes = fs.readFileSync(path.join(previousRunner.bench, file));
  assert.equal(hash(bytes), digest, file);
  const target = path.join(bench, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  runnerFiles[file] = digest;
}
fs.symlinkSync(
  previousRunner.installed,
  path.join(bench, 'webdriver-ts/node_modules')
);
write(path.join(out, 'runner-inputs.json'), {
  bench,
  frozen: runnerFiles,
  installed: previousRunner.installed,
  packages: previousRunner.packages,
});
const binary = read(runnerPrior + '/active-browser.json').binary;
const framework = fs.realpathSync(
  path.join(
    path.dirname(binary),
    '../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
  )
);
const browserFiles = Object.fromEntries(
  [binary, framework].map(file => [file, hash(fs.readFileSync(file))])
);

const apps = [
  ['baseline', 'original.tsx', 'baseline'],
  ['candidate', 'original.tsx', 'candidate'],
  ['rows-baseline', 'rows.tsx', 'baseline'],
  ['rows-candidate', 'rows.tsx', 'candidate'],
];
const manifests = {};
for (const [name, entry, core] of apps) {
  const dest = path.join(out, 'apps', name);
  const coreRoot = path.join(source, core, 'src');
  await build({
    configFile: false,
    root: source,
    logLevel: 'warn',
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: path.join(source, 'cacheUpdate.ts'),
        },
        { find: /^lithent$/, replacement: path.join(coreRoot, 'index.ts') },
        { find: '@', replacement: coreRoot },
      ],
    },
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    build: {
      outDir: dest,
      emptyOutDir: false,
      sourcemap: true,
      rollupOptions: {
        input: path.join(source, entry),
        output: { entryFileNames: 'main.js' },
      },
    },
  });
  fs.copyFileSync(html, path.join(dest, 'index.html'));
  const bytes = fs.readFileSync(path.join(dest, 'main.js'));
  manifests[name] = {
    app: entry,
    core,
    bundle: hash(bytes),
    html: hash(fs.readFileSync(path.join(dest, 'index.html'))),
    entryJS: 'main.js',
    raw: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
    brotli: brotliCompressSync(bytes).length,
  };
}
const versions = {
  sourceCore: '1.25.3 / ' + git(['rev-parse', 'HEAD']) + ' (+ render.ts)',
  vite: '5.4.8',
  node: process.version,
  comparison:
    'A app and row-component app C, each with HEAD core vs bulk-removal render.ts',
};
for (const order of ['main', 'reverse']) {
  const stage = path.join(out, 'official-' + order);
  write(path.join(stage, 'build-manifest.json'), manifests);
  write(path.join(stage, 'versions.json'), versions);
}
write(path.join(out, 'build-manifest.json'), manifests);
write(path.join(out, 'versions.json'), versions);
write(path.join(out, 'initial.json'), {
  at: new Date().toISOString(),
  head: git(['rev-parse', 'HEAD']),
  status: git(['status', '--short']),
  node: process.version,
  machine: { cpus: os.cpus().length, memory: os.totalmem(), os: os.release() },
  files,
  names: apps.map(([name]) => name),
  browser: { binary, files: browserFiles },
  sourceOriginal: hash(original),
  sourceRows: hash(rows),
  cache: hash(cache),
  plan: {
    cpu: '4 apps x 2 orders x (8x15 + 25) = 1,160 samples',
    memory: '4 apps x 2 orders x 5x3 = 120 samples',
    peers: 'none; this is a baseline/candidate core comparison',
    scope:
      'bulk removal of component/Fragment roots; select/vsync wait reported separately',
  },
});
console.log(JSON.stringify({ out, manifests }, null, 2));
