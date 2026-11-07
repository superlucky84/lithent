import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, bench, names, hash, fileHash, guard, read } from './config.mjs';

const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-cache-20261022');
const prior =
  process.env.LITHENT_C3_ISOLATED_OUT || '/tmp/lithent-c3-isolated-20261022';
const previous = guard(out);
assert.equal(
  fs.existsSync(path.join(out, 'runtime')),
  false,
  'Use fresh output'
);
fs.cpSync(path.join(prior, 'runtime'), path.join(out, 'runtime'), {
  recursive: true,
});
for (const [file, sha] of Object.entries(previous.provenance.source))
  assert.equal(fileHash(path.join(out, 'runtime', file)), sha);
for (const [file, value] of Object.entries(previous.provenance.bundles))
  assert.equal(fileHash(path.join(out, 'runtime/dist', file)), value.sha256);
fs.writeFileSync(
  path.join(out, 'reused-validation.json'),
  JSON.stringify(previous, null, 2)
);
const app = path.join(bench, 'frameworks/keyed/lithent');
const original = fs.readFileSync(path.join(prior, 'official-main.tsx'), 'utf8');
assert.equal(
  hash(original),
  '4fcb17e3dcd841f628d4130a7d47ca3011550972675ba2da18e324a5f541d632'
);
const row = fs.readFileSync(
  path.join(root, 'experiments/parent-memo-cache/main.tsx'),
  'utf8'
);
const helper = fs.readFileSync(
  path.join(root, 'helper/src/hook/cacheUpdate.ts'),
  'utf8'
);
const { build, loadConfigFromFile } = await import(
  path.join(app, 'node_modules/vite/dist/node/index.js')
);
const { config } = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  path.join(app, 'vite.config.js')
);
const manifest = {};
for (const kind of ['original-default', 'original-isolated', 'row']) {
  for (const diagnostic of [false, true]) {
    const stage = path.join(
      out,
      'sources',
      kind + (diagnostic ? '-diagnostic' : '')
    );
    fs.mkdirSync(path.join(stage, 'src'), { recursive: true });
    let source = kind === 'row' ? row : original;
    if (diagnostic && kind !== 'row') {
      const end = 'render(<App />, document.getElementById("main"));';
      assert.ok(source.includes(end));
      source = source.replace(
        end,
        `let host: HTMLElement | undefined = document.getElementById('main')!;
let dispose: (() => void) | undefined = render(<App />, host);
let observed: WeakRef<object>[] = [];
window.__cacheRoot = {
  destroy: () => {
    observed = [new WeakRef<object>(host!)];
    dispose!(); dispose = undefined; host!.remove(); host = undefined;
    store.state.rows = []; store.state.selected = null; renewTable = () => {};
  },
  retention: () => observed.filter(ref => !!ref.deref()).length,
};
declare global { interface Window { __cacheRoot: { destroy: () => void; retention: () => number } } }`
      );
    }
    fs.writeFileSync(path.join(stage, 'src/main.tsx'), source);
    fs.writeFileSync(path.join(stage, 'cacheUpdate.ts'), helper);
    fs.copyFileSync(
      path.join(app, 'index.html'),
      path.join(stage, 'index.html')
    );
    const core =
      kind === 'original-default'
        ? path.join(root, 'dist/lithent.mjs')
        : path.join(out, 'runtime/dist/lithent.mjs');
    fs.copyFileSync(core, path.join(stage, 'lithent.mjs'));
    await build({
      ...config,
      configFile: false,
      root: fs.realpathSync(stage),
      define: {
        ...config.define,
        __LITHENT_DIAGNOSTIC__: JSON.stringify(diagnostic),
      },
      resolve: {
        alias: [
          {
            find: 'lithent/helper',
            replacement: path.join(stage, 'cacheUpdate.ts'),
          },
          { find: /^lithent$/, replacement: path.join(stage, 'lithent.mjs') },
        ],
      },
      build: {
        ...config.build,
        outDir: path.join(
          out,
          'builds',
          kind + (diagnostic ? '-diagnostic' : '')
        ),
      },
    });
    // Type-check exact staged source and source aliases against its own core.
    const typeConfig = path.join(stage, 'tsconfig.json');
    fs.writeFileSync(
      typeConfig,
      JSON.stringify(
        {
          extends: path.join(root, 'tsconfig.json'),
          compilerOptions: {
            baseUrl: stage,
            paths: {
              lithent: [core.replace('/lithent.mjs', '/index.d.ts')],
              'lithent/helper': ['cacheUpdate.ts'],
            },
            types: [],
          },
          include: [
            path.join(stage, 'src/main.tsx'),
            path.join(stage, 'cacheUpdate.ts'),
          ],
          exclude: [],
        },
        null,
        2
      )
    );
    try {
      const log = execFileSync(
        process.execPath,
        [
          path.join(root, 'node_modules/typescript/bin/tsc'),
          '--noEmit',
          '-p',
          typeConfig,
        ],
        { encoding: 'utf8' }
      );
      fs.writeFileSync(path.join(stage, 'typecheck.log'), log);
    } catch (error) {
      fs.writeFileSync(
        path.join(stage, 'typecheck.log'),
        String(error.stdout || '') + String(error.stderr || '')
      );
      throw error;
    }
  }
}
for (const name of names) {
  const kind = name.startsWith('original') ? name : 'row';
  const mode = name.startsWith('row-') ? name.slice(4) : null;
  for (const destination of ['round-main', 'round-reverse', 'diagnostic']) {
    const dir = path.join(out, destination, name);
    fs.cpSync(
      path.join(
        out,
        'builds',
        kind + (destination === 'diagnostic' ? '-diagnostic' : '')
      ),
      dir,
      { recursive: true }
    );
    if (mode) {
      const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
      fs.writeFileSync(
        path.join(dir, 'index.html'),
        html.replace(
          '<head>',
          `<head><script>window.__CACHE_MODE__=${JSON.stringify(mode)}</script>`
        )
      );
    }
  }
  manifest[name] = {
    condition: String.fromCharCode(65 + names.indexOf(name)),
    appSource: hash(kind === 'row' ? row : original),
    helper: hash(helper),
    core: fileHash(path.join(out, 'sources', kind, 'lithent.mjs')),
    bundle: fileHash(path.join(out, 'round-main', name, 'main.js')),
    html: fileHash(path.join(out, 'round-main', name, 'index.html')),
    mode,
  };
  const bundle = fs.readFileSync(
    path.join(out, 'round-main', name, 'main.js'),
    'utf8'
  );
  for (const marker of [
    '__memoDiagnostic',
    '__cacheRoot',
    '__LITHENT_DIAGNOSTIC__',
    'liveOutputsAndHost',
  ])
    assert.equal(bundle.includes(marker), false, marker);
}
assert.equal(
  new Set(names.slice(2).map(name => manifest[name].bundle)).size,
  1
);
assert.equal(
  manifest['original-default'].appSource,
  manifest['original-isolated'].appSource
);
for (const round of ['round-main', 'round-reverse']) {
  fs.writeFileSync(
    path.join(out, round, 'build-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  fs.writeFileSync(
    path.join(out, round, 'versions.json'),
    JSON.stringify(
      {
        base: '1.25.2',
        isolated: 'C3 unchanged 43b8039',
        vite: read(path.join(app, 'node_modules/vite/package.json')).version,
        conditions: names,
      },
      null,
      2
    )
  );
}
for (const file of [
  'production-run.mjs',
  'targeted-update.mjs',
  'official-memory.mjs',
])
  fs.copyFileSync(
    path.join(root, 'docs/benchmark', file),
    path.join(out, file)
  );
guard(out);
console.log(JSON.stringify(manifest, null, 2));
