// Build both adapters with the existing app's production Vite settings.
// Requires core/helper dist and installed, built comparison implementations.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  realpathSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  ''
);
const bench = resolve(root, '../js-framework-benchmark');
const app = bench + '/frameworks/keyed/lithent';
const out =
  process.env.LITHENT_PRODUCTION_OUT || '/tmp/lithent-production-review';
const baseline = root + '/docs/benchmark/adapter-baseline';
const hash = file =>
  createHash('sha256').update(readFileSync(file)).digest('hex');
const json = file => JSON.parse(readFileSync(file));
const files = ['src/main.tsx', 'index.html'];
const versions = {};
for (const [name, pkg] of Object.entries({
  'preact-hooks': 'preact',
  'react-hooks': 'react',
  solid: 'solid-js',
  svelte: 'svelte',
  vue: 'vue',
})) {
  const dir = bench + '/frameworks/keyed/' + name;
  const installed = json(
    dir + '/node_modules/' + pkg + '/package.json'
  ).version;
  const locked = json(dir + '/package-lock.json').packages[
    'node_modules/' + pkg
  ].version;
  if (installed !== locked)
    throw Error(
      name + ': installed ' + installed + ' differs from lock ' + locked
    );
  versions[name] = { package: pkg, installed, locked };
}
const { build, loadConfigFromFile } = await import(
  app + '/node_modules/vite/dist/node/index.js'
);
const loaded = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  app + '/vite.config.js'
);
if (!loaded) throw Error('Cannot load production Vite config');
mkdirSync(out, { recursive: true });
for (const name of ['lithent-before', 'lithent']) {
  const stage = out + '/sources/' + name;
  mkdirSync(stage + '/src', { recursive: true });
  const sourceRoot = realpathSync(stage);
  cpSync(
    name === 'lithent-before' ? baseline + '/main.tsx' : app + '/src/main.tsx',
    stage + '/src/main.tsx'
  );
  cpSync(
    name === 'lithent-before' ? baseline + '/index.html' : app + '/index.html',
    stage + '/index.html'
  );
  await build({
    ...loaded.config,
    configFile: false,
    root: sourceRoot,
    build: {
      ...loaded.config.build,
      outDir: out + '/' + name,
      rollupOptions: {
        ...loaded.config.build.rollupOptions,
        input: sourceRoot + '/index.html',
      },
    },
  });
}
writeFileSync(out + '/versions.json', JSON.stringify(versions, null, 2));
writeFileSync(
  out + '/build-manifest.json',
  JSON.stringify(
    {
      date: new Date().toISOString(),
      appFiles: Object.fromEntries(
        files.map(file => [file, hash(app + '/' + file)])
      ),
      beforeFiles: {
        'src/main.tsx': hash(baseline + '/main.tsx'),
        'index.html': hash(baseline + '/index.html'),
      },
      core: hash(root + '/dist/lithent.mjs'),
      helper: hash(root + '/helper/dist/lithentHelper.mjs'),
      vite: json(app + '/node_modules/vite/package.json').version,
    },
    null,
    2
  )
);
