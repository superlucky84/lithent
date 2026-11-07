import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build } from 'vite';

const root = process.cwd();
const out = path.resolve(process.argv[2]);
const prior = '/private/tmp/lithent-dc25-20261027';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
};
assert(!fs.existsSync(out), 'Use a fresh output directory');
fs.mkdirSync(out);
const source = path.join(out, 'source');
fs.mkdirSync(source);
const files = {};
for (const name of fs
  .readdirSync('src', { recursive: true })
  .filter(name => name.endsWith('.ts') && !name.startsWith('tests/'))) {
  const file = 'src/' + name;
  const target = path.join(source, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
  files[file] = hash(fs.readFileSync(file));
}
for (const file of ['boundary.ts', 'check.mjs', 'prepare.mjs', 'fixture.ts']) {
  const sourceFile = 'experiments/c4-owner/' + file;
  fs.copyFileSync(sourceFile, path.join(source, file));
  files[sourceFile] = hash(fs.readFileSync(sourceFile));
}
fs.copyFileSync('pnpm-lock.yaml', path.join(source, 'pnpm-lock.yaml'));
fs.copyFileSync('package.json', path.join(source, 'package.json'));
const original = fs.readFileSync(prior + '/app-source/src/main.tsx', 'utf8');
const cache = fs.readFileSync(prior + '/app-source/cacheUpdate.ts', 'utf8');
fs.writeFileSync(path.join(source, 'original.tsx'), original);
fs.writeFileSync(path.join(source, 'cacheUpdate.ts'), cache);
let candidate = original;
function replace(needle, value) {
  assert.equal(candidate.split(needle).length, 2, needle);
  candidate = candidate.replace(needle, value);
}
replace(
  'import { Fragment, render, mount, h } from "lithent";',
  'import { render, mount, h } from "lithent";\nimport { createListBoundary } from "@c4";\ndeclare const __C4_DIAGNOSTIC__: boolean;\nlet changedKeys: number[] | null = null;'
);
replace(
  '    const { rows } = this.state;\n    for (let i = 0; i < rows.length; i += 10) {\n      rows[i].label += " !!!";\n    }',
  '    const { rows } = this.state;\n    changedKeys = [];\n    for (let i = 0; i < rows.length; i += 10) {\n      rows[i].label += " !!!";\n      changedKeys.push(rows[i].id);\n    }'
);
replace(
  '    this.state.selected = id;',
  '    changedKeys = [this.state.selected, id].filter((key): key is number => key !== null && boundary.has(key));\n    this.state.selected = id;'
);
replace(
  'const Table = mount((renew) => {\n  renewTable = renew;\n  return () => (\n    <Fragment>{store.state.rows.map((row) => row.view(row))}</Fragment>\n  );\n});',
  `const boundary = createListBoundary<Row>(row => row.id, row => row.view(row));
renewTable = () => {
  const keys = changedKeys;
  changedKeys = null;
  if (keys) boundary.invalidate(keys);
  else boundary.set(store.state.rows);
};
const Table = boundary.View;
if (__C4_DIAGNOSTIC__) (window as any).__c4 = { boundary, store, renewTable };`
);
fs.writeFileSync(path.join(source, 'candidate.tsx'), candidate);

candidate +=
  '\nimport { runOwnerContracts } from "@fixture";\nif (__C4_DIAGNOSTIC__) (window as any).__ownerContracts = runOwnerContracts;\n';
fs.writeFileSync(path.join(source, 'candidate.tsx'), candidate);
const previousRunner = read(prior + '/runner-inputs.json');
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
const browser = read(prior + '/active-browser.json');
// Pin the actually installed browser, even if it has updated since DC-25.
const browserFiles = Object.fromEntries(
  Object.keys(browser.files).map(file => [file, hash(fs.readFileSync(file))])
);
const versions = {
  sourceCore:
    '1.25.3 / ' +
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  vite: '5.4.8',
  node: process.version,
  comparison:
    'same source core; same original A row cache/view; C4 explicit notification',
};
const manifests = {};
for (const [name, entry, diagnostic] of [
  ['baseline', 'original.tsx', false],
  ['candidate', 'candidate.tsx', false],
  ['diagnostic', 'candidate.tsx', true],
]) {
  const dest = path.join(out, 'apps', name);
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
        { find: /^lithent$/, replacement: path.join(source, 'src/index.ts') },
        { find: '@c4', replacement: path.join(source, 'boundary.ts') },
        { find: '@fixture', replacement: path.join(source, 'fixture.ts') },
        { find: '@', replacement: path.join(source, 'src') },
      ],
    },
    define: { __C4_DIAGNOSTIC__: String(diagnostic) },
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
  fs.copyFileSync(
    prior + '/apps/baseline/index.html',
    path.join(dest, 'index.html')
  );
  const bytes = fs.readFileSync(path.join(dest, 'main.js'));
  manifests[name] = {
    bundle: hash(bytes),
    html: hash(fs.readFileSync(path.join(dest, 'index.html'))),
    entryJS: 'main.js',
    raw: bytes.length,
    gzip: gzipSync(bytes, { level: 9 }).length,
    brotli: brotliCompressSync(bytes).length,
  };
}
const peerOriginal = path.join(prior, 'peer-source-v2/preact-classes');
const peer = path.join(out, 'apps/preact-classes');
fs.mkdirSync(peer, { recursive: true });
for (const name of [
  'src',
  '.babelrc',
  'package.json',
  'package-lock.json',
  'webpack.config.js',
  'index.html',
]) {
  fs.cpSync(path.join(peerOriginal, name), path.join(peer, name), {
    recursive: true,
  });
}
const peerModules = fs.realpathSync(path.join(peerOriginal, 'node_modules'));
const peerPackages = {};
for (const [relative, expected] of Object.entries(
  read(path.join(peer, 'package-lock.json')).packages
)) {
  if (!relative) continue;
  const file = path.join(path.dirname(peerModules), relative, 'package.json');
  if (!fs.existsSync(file)) {
    assert(expected.optional, relative);
    continue;
  }
  assert.equal(read(file).version, expected.version, relative);
  peerPackages[relative] = {
    version: expected.version,
    sha256: hash(fs.readFileSync(file)),
  };
}
assert.equal(
  read(path.join(peerModules, 'preact/package.json')).version,
  '11.0.0'
);
fs.symlinkSync(peerModules, path.join(peer, 'node_modules'));
fs.writeFileSync(
  path.join(out, 'peer-build.log'),
  execFileSync(
    process.execPath,
    [path.join(peerModules, 'webpack/bin/webpack.js')],
    { cwd: peer, encoding: 'utf8', maxBuffer: 16 * 1024 ** 2 }
  )
);
const peerBytes = fs.readFileSync(path.join(peer, 'dist/main.js'));
manifests['preact-classes'] = {
  bundle: hash(peerBytes),
  html: hash(fs.readFileSync(path.join(peer, 'index.html'))),
  entryJS: 'dist/main.js',
  raw: peerBytes.length,
  gzip: gzipSync(peerBytes, { level: 9 }).length,
  brotli: brotliCompressSync(peerBytes).length,
  rebuilt: true,
  version: '11.0.0',
};
write(path.join(out, 'peer-inputs.json'), {
  source: peerOriginal,
  modules: peerModules,
  packages: peerPackages,
});
for (const order of ['main', 'reverse']) {
  const stage = path.join(out, 'official-' + order);
  write(path.join(stage, 'build-manifest.json'), manifests);
  write(path.join(stage, 'versions.json'), versions);
}
write(path.join(out, 'build-manifest.json'), manifests);
write(path.join(out, 'versions.json'), versions);
write(path.join(out, 'initial.json'), {
  at: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  status: execFileSync('git', ['status', '--short'], {
    encoding: 'utf8',
  }).trim(),
  node: process.version,
  machine: { cpus: os.cpus(), memory: os.totalmem(), os: os.release() },
  files,
  browser: { binary: browser.binary, files: browserFiles },
  sourceOriginal: hash(original),
  sourceCandidate: hash(candidate),
  cache: hash(cache),
  plan: {
    cpu: '3 apps x 2 orders x (8x15 + 25) = 870 samples',
    memory: '3 apps x 2 orders x 5x3 = 90 samples',
    peers: 'Preact class11 rebuilt; other peers and Vue not collected',
    scope: 'base owner/nested component support; no product adoption',
  },
});
console.log(JSON.stringify({ out, manifests }, null, 2));
