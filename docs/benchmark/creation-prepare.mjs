// Snapshot one core build, then build the SAME current app with production settings.
// Run `before` before editing/building the core, then `after` after building it.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  cpSync,
  existsSync,
  realpathSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  ''
);
const bench = resolve(root, '../js-framework-benchmark');
const app = bench + '/frameworks/keyed/lithent';
const out =
  process.env.LITHENT_PRODUCTION_OUT ||
  '/tmp/lithent-creation-official-20261008';
const stageName = process.argv[2];
if (!['before', 'after'].includes(stageName))
  throw Error('Expected before or after');
const name = stageName === 'before' ? 'lithent-before' : 'lithent';
const stage = out + '/sources/' + name;
if (existsSync(out + '/' + name + '/main.js'))
  throw Error('Snapshot already built: ' + stage);
mkdirSync(stage + '/src', { recursive: true });
const sourceRoot = realpathSync(stage);
for (const file of ['src/main.tsx', 'index.html'])
  cpSync(app + '/' + file, stage + '/' + file);
cpSync(root + '/dist/lithent.mjs', stage + '/lithent.mjs');
cpSync(root + '/helper/dist/lithentHelper.mjs', stage + '/helper.mjs');
const { build, loadConfigFromFile } = await import(
  app + '/node_modules/vite/dist/node/index.js'
);
const loaded = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  app + '/vite.config.js'
);
if (!loaded) throw Error('Cannot load production config');
await build({
  ...loaded.config,
  configFile: false,
  root: sourceRoot,
  resolve: {
    ...loaded.config.resolve,
    alias: {
      ...loaded.config.resolve.alias,
      'lithent/helper': stage + '/helper.mjs',
      lithent: stage + '/lithent.mjs',
    },
  },
  build: {
    ...loaded.config.build,
    outDir: out + '/' + name,
    rollupOptions: {
      ...loaded.config.build.rollupOptions,
      input: sourceRoot + '/index.html',
    },
  },
});
const hash = file =>
  createHash('sha256').update(readFileSync(file)).digest('hex');
const manifestFile = out + '/build-manifest.json';
const manifest = existsSync(manifestFile)
  ? JSON.parse(readFileSync(manifestFile))
  : {};
manifest[name] = {
  date: new Date().toISOString(),
  libraryHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim(),
  benchmarkHead: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: app,
    encoding: 'utf8',
  }).trim(),
  sourceFiles: Object.fromEntries(
    ['src/diff.ts', 'lithentConcurrent/src/diff.ts'].map(file => [
      file,
      hash(root + '/' + file),
    ])
  ),
  appFiles: Object.fromEntries(
    ['src/main.tsx', 'index.html'].map(file => [file, hash(stage + '/' + file)])
  ),
  core: hash(stage + '/lithent.mjs'),
  helper: hash(stage + '/helper.mjs'),
  bundle: hash(out + '/' + name + '/main.js'),
  vite: JSON.parse(readFileSync(app + '/node_modules/vite/package.json'))
    .version,
};
if (manifest.lithent && manifest['lithent-before']) {
  if (
    JSON.stringify(manifest.lithent.appFiles) !==
      JSON.stringify(manifest['lithent-before'].appFiles) ||
    manifest.lithent.helper !== manifest['lithent-before'].helper
  )
    throw Error('Core A/B comparison requires the same app and helper');
}
writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
writeFileSync(
  out + '/versions.json',
  JSON.stringify(
    {
      lithent: JSON.parse(readFileSync(root + '/package.json')).version,
      helper: JSON.parse(readFileSync(root + '/helper/package.json')).version,
      vite: manifest[name].vite,
    },
    null,
    2
  )
);
