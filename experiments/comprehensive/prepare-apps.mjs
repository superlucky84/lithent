import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { build } from 'vite';
import { root, hash, guard, read } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const initial = guard(out);
const archive = fs.readFileSync(
  path.join(root, 'docs/benchmark/peer-baseline-evidence.json.gz')
);
assert.equal(
  hash(archive),
  '5ec4db084140ac0e1379d82c2c691d7fc437c24e1e4484d8cc823a0d7071412e'
);
const evidence = JSON.parse(gunzipSync(archive)).files;
const bench = path.join(out, 'official-benchmark');
assert(!fs.existsSync(bench), 'Use fresh app staging');
const frozen = {};
function extract(key, dest) {
  const item = evidence[key];
  assert(item, key);
  const bytes = Buffer.from(item.content, item.encoding || 'utf8');
  assert.equal(hash(bytes), item.sha256, key);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, bytes);
  return hash(bytes);
}
for (const key of Object.keys(evidence).filter(key =>
  key.startsWith('benchmark/')
)) {
  const relative = key.slice('benchmark/'.length);
  assert(!relative.split('/').includes('..'));
  frozen[relative] = extract(key, path.join(bench, relative));
}
const sibling = path.resolve(root, '../js-framework-benchmark-upstream');
assert.equal(
  hash(fs.readFileSync(path.join(sibling, 'webdriver-ts/package.json'))),
  frozen['webdriver-ts/package.json']
);
const lock = fs.readFileSync(
  path.join(sibling, 'webdriver-ts/package-lock.json')
);
fs.writeFileSync(path.join(bench, 'webdriver-ts/package-lock.json'), lock);
frozen['webdriver-ts/package-lock.json'] = hash(lock);
const installed =
  '/tmp/lithent-shape-20261023/official-benchmark/webdriver-ts/node_modules';
assert(fs.existsSync(installed));
const installedPackages = {};
for (const [relative, pkg] of Object.entries(JSON.parse(lock).packages)) {
  if (!relative || !relative.startsWith('node_modules/')) continue;
  const file = path.join(path.dirname(installed), relative, 'package.json');
  if (!fs.existsSync(file)) {
    assert(pkg.optional, relative);
    continue;
  }
  const actual = read(file);
  assert.equal(actual.version, pkg.version, relative);
  installedPackages[relative] = {
    version: actual.version,
    sha256: hash(fs.readFileSync(file)),
  };
}
fs.symlinkSync(installed, path.join(bench, 'webdriver-ts/node_modules'));
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
const apps = {};
for (const variant of ['baseline', 'event', 'c2', 'combined']) {
  const core = path.join(out, variant, 'dist/lithent.mjs');
  const compiled = read(path.join(out, variant, 'build.json'));
  assert.equal(
    hash(fs.readFileSync(core)),
    compiled.bundles['lithent.mjs'].sha256
  );
  const dest = path.join(out, 'apps', variant);
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
  apps[variant] = {
    core: compiled.bundles['lithent.mjs'].sha256,
    bundle: hash(fs.readFileSync(path.join(dest, 'main.js'))),
    html,
    source: hash(fs.readFileSync(path.join(source, 'src/main.tsx'))),
    helper: hash(fs.readFileSync(path.join(source, 'cacheUpdate.ts'))),
  };
}
for (const peer of [
  'react-hooks',
  'react-classes',
  'preact-hooks',
  'preact-classes',
]) {
  const dest = path.join(out, 'apps', peer);
  for (const file of ['index.html', 'dist/main.js'])
    extract(`run/round-main/${peer}/${file}`, path.join(dest, file));
  const inputs = {};
  for (const key of Object.keys(evidence).filter(key =>
    key.startsWith(`run/sources/${peer}/`)
  )) {
    const relative = key.slice(`run/sources/${peer}/`.length);
    inputs[relative] = extract(
      key,
      path.join(out, 'peer-inputs', peer, relative)
    );
  }
  apps[peer] = {
    bundle: hash(fs.readFileSync(path.join(dest, 'dist/main.js'))),
    html: hash(fs.readFileSync(path.join(dest, 'index.html'))),
    entryJS: 'dist/main.js',
    frozenPrebuilt: true,
    inputs,
  };
}
for (const round of ['round-main', 'round-reverse']) {
  for (const name of Object.keys(apps))
    fs.cpSync(path.join(out, 'apps', name), path.join(out, round, name), {
      recursive: true,
    });
  fs.writeFileSync(
    path.join(out, round, 'build-manifest.json'),
    JSON.stringify(apps, null, 2) + '\n'
  );
  fs.writeFileSync(
    path.join(out, round, 'versions.json'),
    JSON.stringify(
      Object.fromEntries(
        Object.entries(apps).map(([name, app]) => [
          name,
          {
            source: name,
            jsSHA256: app.bundle,
            note: app.frozenPrebuilt
              ? 'Pinned archived peer production bytes; fresh execution only'
              : 'DC-22 isolated core on original cached app',
          },
        ])
      ),
      null,
      2
    ) + '\n'
  );
}
const manifest = {
  at: new Date().toISOString(),
  head: initial.head,
  bench,
  frozen,
  installed,
  installedPackages,
  apps,
  archive: hash(archive),
  wrappers: Object.fromEntries(
    ['production-run.mjs', 'official-memory.mjs', 'targeted-update.mjs'].map(
      file => [
        file,
        hash(fs.readFileSync(path.join(root, 'docs/benchmark', file))),
      ]
    )
  ),
  peerNote:
    'Exact archived pinned production bytes and source/lock metadata; not freshly rebuilt or pooled with historical measurements',
};
fs.writeFileSync(
  path.join(out, 'app-inputs.json'),
  JSON.stringify(manifest, null, 2) + '\n'
);
guard(out);
console.log(
  JSON.stringify({
    bench,
    frozenFiles: Object.keys(frozen).length,
    installedPackages: Object.keys(installedPackages).length,
    apps: Object.keys(apps),
  })
);
