// Freeze cores, row-variant apps and the official runner for a Mac comparison.
//   node official-prepare.mjs OUT BENCHMARK [name=app:revision ...]
// app `a` is the benchmark checkout's listed main.tsx, `m` is upstream/main.tsx
// here. The first variant is the baseline of the analysis. The revision
// WORKTREE is the tracked files as they are now (a `git stash create` commit:
// no branch, index or file changes); its patch against HEAD is kept in OUT.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { brotliCompressSync } from 'node:zlib';
import { build as buildCore } from 'vite';

const root = fileURLToPath(new URL('../../', import.meta.url));
const [requested, sibling, ...specs] = process.argv.slice(2);
assert(requested && sibling, 'Expected OUT BENCHMARK [name=app:revision ...]');
const variants = (
  specs.length ? specs : ['a-main=a:main', 'a-head=a:HEAD', 'm-head=m:HEAD']
).map(spec => {
  const [, name, app, revision] = /^([\w-]+)=([am]):(.+)$/.exec(spec) || [];
  assert(name, 'Bad variant: ' + spec);
  return { name, app, revision };
});
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
let worktree;
const resolve = revision => {
  if (revision !== 'WORKTREE') return git(['rev-parse', revision]);
  if (!worktree) {
    worktree = git(['stash', 'create']) || git(['rev-parse', 'HEAD']);
    fs.writeFileSync(
      path.join(out, 'worktree.patch'),
      execFileSync('git', ['diff', 'HEAD', worktree], { cwd: root })
    );
  }
  return worktree;
};
const adapter = path.join(bench, 'frameworks/keyed/lithent');
// One app source directory per row variant; only main.tsx differs.
for (const app of ['a', 'm']) {
  const dir = path.join(out, 'source/app-' + app);
  fs.mkdirSync(dir, { recursive: true });
  for (const name of [
    'src',
    'index.html',
    'vite.config.js',
    'package.json',
    'package-lock.json',
  ])
    fs.cpSync(path.join(adapter, name), path.join(dir, name), {
      recursive: true,
    });
  if (app === 'm')
    fs.copyFileSync(
      path.join(root, 'experiments/memo-free-rows/upstream/main.tsx'),
      path.join(dir, 'src/main.tsx')
    );
}
const { build, loadConfigFromFile } = await import(
  pathToFileURL(path.join(adapter, 'node_modules/vite/dist/node/index.js'))
);
const loaded = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  path.join(adapter, 'vite.config.js')
);
assert(loaded, 'Missing production Vite config');
// As in vite.config.js and helper/vite.config.js.
const target = ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'];
const oxc = {
  jsx: {
    runtime: 'classic',
    development: false,
    pragma: 'h',
    pragmaFrag: 'Fragment',
  },
};
const cores = {};
for (const { revision } of variants) {
  const sha = resolve(revision);
  if (cores[sha]) continue;
  const source = path.join(out, 'source/core-' + sha.slice(0, 7));
  fs.mkdirSync(source, { recursive: true });
  execFileSync('tar', ['-xf', '-', '-C', source], {
    input: execFileSync('git', ['archive', sha, 'src', 'helper/src'], {
      cwd: root,
    }),
  });
  // The package build's ESM settings (vite.config.js): target, tree-shaking.
  await buildCore({
    configFile: false,
    root: source,
    logLevel: 'warn',
    oxc,
    resolve: { alias: { '@': path.join(source, 'src') } },
    build: {
      target,
      sourcemap: true,
      lib: {
        entry: path.join(source, 'src/index.ts'),
        formats: ['es'],
        fileName: () => 'lithent.mjs',
      },
      rolldownOptions: {
        output: { generatedCode: { symbols: false } },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
        },
      },
    },
  });
  const first = Object.values(cores)[0];
  if (!first) {
    await buildCore({
      configFile: false,
      root: source,
      logLevel: 'warn',
      oxc,
      resolve: { alias: { '@': path.join(source, 'helper/src') } },
      build: {
        target,
        outDir: path.join(out, 'helper'),
        lib: {
          entry: path.join(source, 'helper/src/index.ts'),
          formats: ['es'],
          fileName: () => 'helper.mjs',
        },
        rolldownOptions: { external: ['lithent'] },
      },
    });
  } else {
    assert.deepEqual(
      inventory(path.join(source, 'helper/src')),
      inventory(path.join(first.source, 'helper/src')),
      'Use the same helper for every core'
    );
  }
  const core = fs.readFileSync(path.join(source, 'dist/lithent.mjs'));
  cores[sha] = {
    source,
    sha256: hash(core),
    brotli: brotliCompressSync(core).length,
  };
}
const manifests = {};
for (const { name, app, revision } of variants) {
  const sha = resolve(revision);
  const core = cores[sha];
  const dest = path.join(out, 'apps', name);
  await build({
    ...loaded.config,
    configFile: false,
    root: path.join(out, 'source/app-' + app),
    logLevel: 'warn',
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: path.join(out, 'helper/helper.mjs'),
        },
        {
          find: /^lithent$/,
          replacement: path.join(core.source, 'dist/lithent.mjs'),
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
    app,
    revision: sha,
    worktree: revision === 'WORKTREE' || undefined,
    core: core.sha256,
    coreBrotli: core.brotli,
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
  'docs/benchmark/official-memory.mjs',
  'experiments/memo-free-rows/official-prepare.mjs',
  'experiments/memo-free-rows/official-run.mjs',
];
write(path.join(out, 'build-manifest.json'), manifests);
write(path.join(out, 'versions.json'), {
  node: process.version,
  coreVite: JSON.parse(
    fs.readFileSync(path.join(root, 'node_modules/vite/package.json'))
  ).version,
  appVite: JSON.parse(
    fs.readFileSync(path.join(adapter, 'node_modules/vite/package.json'))
  ).version,
  benchmark: git(['rev-parse', 'HEAD'], bench),
});
write(path.join(out, 'initial.json'), {
  at: new Date().toISOString(),
  out,
  bench,
  frozen,
  binary,
  names: variants.map(variant => variant.name),
  browser: Object.fromEntries(
    [binary, engine].map(file => [file, hash(fs.readFileSync(file))])
  ),
  apps: Object.fromEntries(
    ['a', 'm'].map(app => [app, inventory(path.join(out, 'source/app-' + app))])
  ),
  runner: Object.fromEntries(
    ['webdriver-ts/src', 'webdriver-ts/dist', 'css'].map(dir => [
      dir,
      inventory(path.join(frozen, dir)),
    ])
  ),
  tools: Object.fromEntries(
    tools.map(file => [file, hash(fs.readFileSync(path.join(root, file)))])
  ),
  plan: 'Official keyed/DOM/font verification, then per round and variant 8 x 15 + 25 CPU samples and 5 x 3 memory samples; odd rounds in the listed order, even rounds reversed; unchanged default throttling and warmups; no dropped samples.',
});
console.log(
  JSON.stringify(
    {
      out,
      variants: Object.fromEntries(
        Object.entries(manifests).map(([name, m]) => [
          name,
          {
            app: m.app,
            revision: m.revision.slice(0, 7),
            coreBrotli: m.coreBrotli,
            bundleBrotli: m.brotli,
          },
        ])
      ),
    },
    null,
    2
  )
);
