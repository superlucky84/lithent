// Build two committed cores in isolation, using the SAME existing benchmark app.
import {
  cpSync,
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url)).replace(
  /\/$/,
  ''
);
const bench = resolve(root, '../js-framework-benchmark');
const app = bench + '/frameworks/keyed/lithent';
const out = process.env.LITHENT_PRODUCTION_OUT;
if (!out)
  throw Error('Set LITHENT_PRODUCTION_OUT to a fresh absolute directory');
if (!out.startsWith('/')) throw Error('Output directory must be absolute');
if (existsSync(out)) throw Error('Refusing to replace existing output: ' + out);
const refs = [process.argv[2] || '592d320', process.argv[3] || 'HEAD'];
const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const commits = refs.map(ref =>
  git('rev-parse', '--verify', ref + '^{commit}')
);
const hash = file =>
  createHash('sha256').update(readFileSync(file)).digest('hex');
const json = file => JSON.parse(readFileSync(file));
const manifest = {};
mkdirSync(out, { recursive: true });
const { build, loadConfigFromFile } = await import(
  app + '/node_modules/vite/dist/node/index.js'
);
const loaded = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  app + '/vite.config.js'
);
if (!loaded) throw Error('Cannot load the existing production Vite config');

for (const [index, name] of ['lithent-before', 'lithent'].entries()) {
  const commit = commits[index];
  const snapshot = out + '/checkouts/' + name;
  mkdirSync(snapshot, { recursive: true });
  execFileSync('tar', ['-xf', '-', '-C', snapshot], {
    input: execFileSync('git', ['archive', commit], {
      cwd: root,
      maxBuffer: 256 * 1024 ** 2,
    }),
  });
  symlinkSync(root + '/node_modules', snapshot + '/node_modules', 'dir');
  mkdirSync(snapshot + '/helper/node_modules', { recursive: true });
  symlinkSync(snapshot, snapshot + '/helper/node_modules/lithent', 'dir');
  const logFile = out + '/build-' + name + '.log';
  const fd = openSync(logFile, 'wx');
  try {
    for (const cwd of [snapshot, snapshot + '/helper']) {
      execFileSync(
        process.execPath,
        [root + '/node_modules/vite/bin/vite.js', 'build'],
        {
          cwd,
          stdio: ['ignore', fd, fd],
        }
      );
    }
  } catch (error) {
    console.error(readFileSync(logFile, 'utf8'));
    throw error;
  } finally {
    closeSync(fd);
  }
  const stage = out + '/sources/' + name;
  mkdirSync(stage + '/src', { recursive: true });
  for (const file of ['src/main.tsx', 'index.html'])
    cpSync(app + '/' + file, stage + '/' + file);
  cpSync(snapshot + '/dist/lithent.mjs', stage + '/lithent.mjs');
  cpSync(snapshot + '/helper/dist/lithentHelper.mjs', stage + '/helper.mjs');
  await build({
    ...loaded.config,
    configFile: false,
    root: realpathSync(stage),
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
        input: stage + '/index.html',
      },
    },
  });
  manifest[name] = {
    date: new Date().toISOString(),
    libraryHead: commit,
    benchmarkHead: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: bench,
      encoding: 'utf8',
    }).trim(),
    benchmarkStatus: execFileSync('git', ['status', '--porcelain'], {
      cwd: bench,
      encoding: 'utf8',
    }).trim(),
    appFiles: Object.fromEntries(
      ['src/main.tsx', 'index.html'].map(file => [
        file,
        hash(stage + '/' + file),
      ])
    ),
    core: hash(stage + '/lithent.mjs'),
    helper: hash(stage + '/helper.mjs'),
    bundle: hash(out + '/' + name + '/main.js'),
    libraryVite: json(root + '/node_modules/vite/package.json').version,
    vite: json(app + '/node_modules/vite/package.json').version,
    runnerFiles: Object.fromEntries(
      [
        'forkedBenchmarkRunnerPuppeteer',
        'benchmarksPuppeteer',
        'benchmarksCommon',
        'timeline',
        'puppeteerAccess',
      ].map(file => [
        file + '.js',
        hash(bench + '/webdriver-ts/dist/' + file + '.js'),
      ])
    ),
    sizes: Object.fromEntries(
      ['lithent.mjs', 'lithent.umd.js'].map(file => [
        file,
        readFileSync(snapshot + '/dist/' + file).length,
      ])
    ),
  };
  writeFileSync(
    out + '/build-manifest.json',
    JSON.stringify(manifest, null, 2)
  );
  console.log('Prepared', name, commit, manifest[name].bundle);
}
if (
  JSON.stringify(manifest.lithent.appFiles) !==
    JSON.stringify(manifest['lithent-before'].appFiles) ||
  manifest.lithent.helper !== manifest['lithent-before'].helper
)
  throw Error('Comparison requires the same app and helper');
writeFileSync(
  out + '/versions.json',
  JSON.stringify(
    {
      node: process.version,
      libraryVite: manifest.lithent.libraryVite,
      appVite: manifest.lithent.vite,
      puppeteer: json(
        bench + '/webdriver-ts/node_modules/puppeteer-core/package.json'
      ).version,
    },
    null,
    2
  )
);
console.log('Ready:', out);
