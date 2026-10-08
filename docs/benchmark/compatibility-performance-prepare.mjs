// Compare the final measured core with the compatibility fixes in the worktree.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../', import.meta.url));
const app = resolve(root, '../js-framework-benchmark/frameworks/keyed/lithent');
const out = process.env.LITHENT_PRODUCTION_OUT;
assert(out, 'Set a new LITHENT_PRODUCTION_OUT directory');
assert(!existsSync(`${out}/build-manifest.json`), 'Preserve existing results');
const hash = value => createHash('sha256').update(value).digest('hex');
const result = JSON.parse(
  readFileSync(`${root}/docs/benchmark/identity-results.json`)
);
const evidence = readFileSync(
  `${root}/docs/benchmark/identity-evidence.json.gz`
);
assert.equal(hash(evidence), result.evidenceSHA256);
const baseline = JSON.parse(gunzipSync(evidence)).productionInputs[
  'lithent-before'
];
const baselineBuild = result.official.build['lithent-before'];
assert.equal(hash(baseline['lithent.mjs']), baselineBuild.core);
assert.equal(hash(baseline['helper.mjs']), baselineBuild.helper);
assert.equal(
  hash(readFileSync(`${root}/helper/dist/lithentHelper.mjs`)),
  baselineBuild.helper
);
for (const file of ['src/main.tsx', 'index.html']) {
  assert.equal(
    hash(readFileSync(`${app}/${file}`)),
    baselineBuild.appFiles[file]
  );
}
assert.equal(
  hash(execFileSync('git', ['show', 'HEAD:src/diff.ts'], { cwd: root })),
  result.finalSourceSHA256
);

const sourceFiles = [
  'src/diff.ts',
  'src/render.ts',
  'src/wDom.ts',
  'src/utils/index.ts',
  'src/utils/redraw.ts',
  'src/hook/internal/unmount.ts',
];
const { build, loadConfigFromFile } = await import(
  `${app}/node_modules/vite/dist/node/index.js`
);
const loaded = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  `${app}/vite.config.js`
);
assert(loaded);
const manifest = {};
for (const name of ['lithent-before', 'lithent']) {
  const stage = `${out}/sources/${name}`;
  mkdirSync(`${stage}/src`, { recursive: true });
  const sourceRoot = realpathSync(stage);
  for (const [file, content] of Object.entries(baseline))
    writeFileSync(`${stage}/${file}`, content);
  if (name === 'lithent')
    cpSync(`${root}/dist/lithent.mjs`, `${stage}/lithent.mjs`);
  await build({
    ...loaded.config,
    configFile: false,
    root: sourceRoot,
    resolve: {
      ...loaded.config.resolve,
      alias: {
        'lithent/helper': `${stage}/helper.mjs`,
        lithent: `${stage}/lithent.mjs`,
      },
    },
    build: {
      ...loaded.config.build,
      outDir: `${out}/${name}`,
      rollupOptions: {
        ...loaded.config.build.rollupOptions,
        input: `${sourceRoot}/index.html`,
      },
    },
  });
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
    sourceState:
      name === 'lithent'
        ? 'working-tree'
        : 'HEAD (matches archived final measured core)',
    baselineEvidenceSHA256: result.evidenceSHA256,
    sourceFiles: Object.fromEntries(
      sourceFiles.map(file => [
        file,
        hash(
          name === 'lithent'
            ? readFileSync(`${root}/${file}`)
            : execFileSync('git', ['show', `HEAD:${file}`], { cwd: root })
        ),
      ])
    ),
    appFiles: Object.fromEntries(
      ['src/main.tsx', 'index.html'].map(file => [
        file,
        hash(readFileSync(`${stage}/${file}`)),
      ])
    ),
    core: hash(readFileSync(`${stage}/lithent.mjs`)),
    helper: hash(readFileSync(`${stage}/helper.mjs`)),
    bundle: hash(readFileSync(`${out}/${name}/main.js`)),
    vite: JSON.parse(readFileSync(`${app}/node_modules/vite/package.json`))
      .version,
  };
}
assert.deepEqual(
  manifest.lithent.appFiles,
  manifest['lithent-before'].appFiles
);
assert.equal(manifest.lithent.helper, manifest['lithent-before'].helper);
assert.equal(manifest['lithent-before'].bundle, baselineBuild.bundle);
writeFileSync(`${out}/build-manifest.json`, JSON.stringify(manifest, null, 2));
writeFileSync(
  `${out}/versions.json`,
  JSON.stringify(
    {
      lithent: JSON.parse(readFileSync(`${root}/package.json`)).version,
      helper: JSON.parse(readFileSync(`${root}/helper/package.json`)).version,
      vite: manifest.lithent.vite,
    },
    null,
    2
  )
);
console.log(
  'Baseline production bundle matches the preserved final measurement; same app and helper verified.'
);
