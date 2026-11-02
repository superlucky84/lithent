// Freeze two revisions, the sibling production adapter, and its official runner.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { brotliCompressSync } from 'node:zlib';
import { build as buildCore } from 'vite';

const root = fileURLToPath(new URL('../../', import.meta.url));
const [requested, sibling, baseline = 'main', candidate = 'HEAD'] =
  process.argv.slice(2);
assert(requested && sibling, 'Expected OUT BENCHMARK [BASELINE] [CANDIDATE]');
const out = path.resolve(requested);
const bench = fs.realpathSync(sibling);
assert(!fs.existsSync(out), 'Use a fresh output directory');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (args, cwd = root) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const write = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
};
const inventory = dir =>
  Object.fromEntries(
    fs.readdirSync(dir, { recursive: true }).flatMap(name => {
      const file = path.join(dir, name);
      return fs.statSync(file).isFile()
        ? [[name, hash(fs.readFileSync(file))]]
        : [];
    })
  );
fs.mkdirSync(out, { recursive: true });
const adapter = path.join(bench, 'frameworks/keyed/lithent');
const app = path.join(out, 'source/app');
fs.mkdirSync(app, { recursive: true });
for (const name of [
  'src',
  'index.html',
  'vite.config.js',
  'package.json',
  'package-lock.json',
])
  fs.cpSync(path.join(adapter, name), path.join(app, name), {
    recursive: true,
  });
const { build, loadConfigFromFile } = await import(
  pathToFileURL(path.join(adapter, 'node_modules/vite/dist/node/index.js'))
);
const loaded = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  path.join(adapter, 'vite.config.js')
);
assert(loaded, 'Missing production Vite config');
const manifests = {};
for (const [name, revision] of [
  ['baseline', baseline],
  ['candidate', candidate],
]) {
  const source = path.join(out, 'source', name);
  fs.mkdirSync(source, { recursive: true });
  const sha = git(['rev-parse', revision]);
  execFileSync('tar', ['-xf', '-', '-C', source], {
    input: execFileSync('git', ['archive', sha, 'src', 'helper/src'], {
      cwd: root,
    }),
  });
  // Same ESM library settings and tree-shaking as the package build.
  await buildCore({
    configFile: false,
    root: source,
    logLevel: 'warn',
    resolve: { alias: { '@': path.join(source, 'src') } },
    build: {
      sourcemap: true,
      lib: {
        entry: path.join(source, 'src/index.ts'),
        formats: ['es'],
        fileName: () => 'lithent.mjs',
      },
      rollupOptions: {
        output: { generatedCode: { symbols: false } },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
    },
  });
  if (name === 'baseline') {
    await buildCore({
      configFile: false,
      root: source,
      logLevel: 'warn',
      resolve: { alias: { '@': path.join(source, 'helper/src') } },
      build: {
        outDir: path.join(out, 'helper'),
        lib: {
          entry: path.join(source, 'helper/src/index.ts'),
          formats: ['es'],
          fileName: () => 'helper.mjs',
        },
        rollupOptions: { external: ['lithent'] },
      },
    });
  } else {
    assert.deepEqual(
      inventory(path.join(source, 'helper/src')),
      inventory(path.join(out, 'source/baseline/helper/src')),
      'Use the same helper for both cores'
    );
  }
  const dest = path.join(out, 'apps', name);
  await build({
    ...loaded.config,
    configFile: false,
    root: app,
    logLevel: 'warn',
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: path.join(out, 'helper/helper.mjs'),
        },
        {
          find: /^lithent$/,
          replacement: path.join(source, 'dist/lithent.mjs'),
        },
      ],
    },
    build: {
      ...loaded.config.build,
      outDir: dest,
      sourcemap: true,
    },
  });
  const bundle = fs.readFileSync(path.join(dest, 'main.js'));
  manifests[name] = {
    revision: sha,
    source: inventory(path.join(source, 'src')),
    core: hash(fs.readFileSync(path.join(source, 'dist/lithent.mjs'))),
    bundle: hash(bundle),
    raw: bundle.length,
    brotli: brotliCompressSync(bundle).length,
    files: inventory(dest),
  };
}
const frozen = path.join(out, 'official-benchmark');
for (const name of [
  'webdriver-ts/src',
  'webdriver-ts/dist',
  'webdriver-ts/package.json',
  'webdriver-ts/package-lock.json',
  'css',
]) {
  const dest = path.join(frozen, name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(path.join(bench, name), dest, { recursive: true });
}
fs.symlinkSync(
  path.join(bench, 'webdriver-ts/node_modules'),
  path.join(frozen, 'webdriver-ts/node_modules')
);
const binary = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const engine = fs.realpathSync(
  path.join(
    path.dirname(binary),
    '../Frameworks/Google Chrome Framework.framework/Versions/Current/Google Chrome Framework'
  )
);
const tools = [
  'docs/benchmark/production-run.mjs',
  'experiments/positional-keys/official-prepare.mjs',
  'experiments/positional-keys/official-run.mjs',
];
const versions = {
  node: process.version,
  coreVite: JSON.parse(
    fs.readFileSync(path.join(root, 'node_modules/vite/package.json'))
  ).version,
  appVite: JSON.parse(
    fs.readFileSync(path.join(adapter, 'node_modules/vite/package.json'))
  ).version,
  benchmark: git(['rev-parse', 'HEAD'], bench),
};
write(path.join(out, 'build-manifest.json'), manifests);
write(path.join(out, 'versions.json'), versions);
for (const stage of ['gate', 'official-main', 'official-reverse']) {
  write(path.join(out, stage, 'build-manifest.json'), manifests);
  write(path.join(out, stage, 'versions.json'), versions);
}
write(path.join(out, 'initial.json'), {
  at: new Date().toISOString(),
  out,
  bench,
  frozen,
  binary,
  browser: Object.fromEntries(
    [binary, engine].map(file => [file, hash(fs.readFileSync(file))])
  ),
  app: inventory(app),
  runner: Object.fromEntries(
    ['webdriver-ts/src', 'webdriver-ts/dist', 'css'].map(dir => [
      dir,
      inventory(path.join(frozen, dir)),
    ])
  ),
  tools: Object.fromEntries(
    tools.map(file => [file, hash(fs.readFileSync(path.join(root, file)))])
  ),
  plan: 'Official keyed/DOM/font verification, then 2 apps x 2 orders x (8 x 15 + 25) = 580 CPU samples; unchanged default throttling and warmups; no dropped samples.',
});
console.log(
  JSON.stringify(
    {
      out,
      versions,
      bundles: Object.fromEntries(
        Object.entries(manifests).map(([name, m]) => [
          name,
          { revision: m.revision, raw: m.raw, brotli: m.brotli },
        ])
      ),
    },
    null,
    2
  )
);
