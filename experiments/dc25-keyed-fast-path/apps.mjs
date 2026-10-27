import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { build } from 'vite';
import { root, hash, read, write, guard } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const variant = process.argv[3];
const initial = guard(out);
const archive = fs.readFileSync(
  path.join(root, 'docs/benchmark/peer-baseline-evidence.json.gz')
);
assert.equal(
  hash(archive),
  '5ec4db084140ac0e1379d82c2c691d7fc437c24e1e4484d8cc823a0d7071412e'
);
const evidence = JSON.parse(gunzipSync(archive)).files;
function extract(key, dest) {
  const item = evidence[key];
  assert(item, key);
  const bytes = Buffer.from(item.content, item.encoding || 'utf8');
  assert.equal(hash(bytes), item.sha256, key);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest))
    assert.equal(hash(fs.readFileSync(dest)), item.sha256, dest);
  else fs.writeFileSync(dest, bytes, { flag: 'wx' });
  return item.sha256;
}
const bench = path.join(out, 'official-benchmark');
if (!fs.existsSync(path.join(out, 'runner-inputs.json'))) {
  const frozen = {};
  for (const key of Object.keys(evidence).filter(key =>
    key.startsWith('benchmark/')
  )) {
    const relative = key.slice('benchmark/'.length);
    assert(!relative.split('/').includes('..'));
    frozen[relative] = extract(key, path.join(bench, relative));
  }
  const sibling = initial.sibling.root;
  for (const name of ['package.json', 'package-lock.json']) {
    const bytes = fs.readFileSync(path.join(sibling, 'webdriver-ts', name));
    const dest = path.join(bench, 'webdriver-ts', name);
    if (fs.existsSync(dest))
      assert.equal(hash(fs.readFileSync(dest)), hash(bytes), name);
    else fs.writeFileSync(dest, bytes, { flag: 'wx' });
    frozen['webdriver-ts/' + name] = hash(bytes);
  }
  const installed = path.join(sibling, 'webdriver-ts/node_modules');
  const packages = {};
  for (const [relative, entry] of Object.entries(
    read(path.join(bench, 'webdriver-ts/package-lock.json')).packages
  )) {
    if (!relative) continue;
    const file = path.join(sibling, 'webdriver-ts', relative, 'package.json');
    if (!fs.existsSync(file)) {
      assert(entry.optional, relative);
      continue;
    }
    assert.equal(read(file).version, entry.version, relative);
    packages[relative] = {
      version: entry.version,
      sha256: hash(fs.readFileSync(file)),
    };
  }
  fs.symlinkSync(installed, path.join(bench, 'webdriver-ts/node_modules'));
  write(path.join(out, 'runner-inputs.json'), {
    bench,
    frozen,
    installed,
    packages,
    archive: hash(archive),
  });
}
const source = path.join(out, 'app-source');
extract('run/sources/lithent/src/main.tsx', path.join(source, 'src/main.tsx'));
extract(
  'run/sources/lithent/cacheUpdate.ts',
  path.join(source, 'cacheUpdate.ts')
);
assert.equal(
  hash(fs.readFileSync(path.join(source, 'src/main.tsx'))),
  '4fcb17e3dcd841f628d4130a7d47ca3011550972675ba2da18e324a5f541d632'
);
const compiled = read(path.join(out, variant, 'build.json'));
const core = path.join(out, variant, 'dist/lithent.mjs');
assert.equal(
  hash(fs.readFileSync(core)),
  compiled.bundles['lithent.mjs'].sha256
);
const dest = path.join(out, 'apps', variant);
assert(!fs.existsSync(dest), 'Use a fresh app variant');
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
      { find: /^lithent$/, replacement: core },
    ],
  },
  esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
  build: {
    outDir: dest,
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: path.join(source, 'src/main.tsx'),
      output: { entryFileNames: 'main.js' },
    },
  },
});
const html = extract(
  'run/round-main/lithent/index.html',
  path.join(dest, 'index.html')
);
write(path.join(out, variant, 'app.json'), {
  core: compiled.bundles['lithent.mjs'].sha256,
  bundle: hash(fs.readFileSync(path.join(dest, 'main.js'))),
  html,
  source: hash(fs.readFileSync(path.join(source, 'src/main.tsx'))),
  helper: hash(fs.readFileSync(path.join(source, 'cacheUpdate.ts'))),
});
for (const round of ['round-main', 'round-reverse']) {
  fs.cpSync(dest, path.join(out, round, variant), { recursive: true });
  const manifestPath = path.join(out, round, 'build-manifest.json');
  const manifest = fs.existsSync(manifestPath) ? read(manifestPath) : {};
  assert(!manifest[variant]);
  manifest[variant] = read(path.join(out, variant, 'app.json'));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(
    path.join(out, round, 'versions.json'),
    JSON.stringify(
      Object.fromEntries(
        Object.entries(manifest).map(([name, item]) => [
          name,
          { source: name, jsSHA256: item.bundle, node: process.version },
        ])
      ),
      null,
      2
    ) + '\n'
  );
}
guard(out);
console.log(
  JSON.stringify({
    variant,
    app: read(path.join(out, variant, 'app.json')),
    bench,
  })
);
