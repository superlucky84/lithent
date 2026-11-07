import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const out = path.resolve(process.argv[2] || '/tmp/lithent-c3-optin-20261022');
const prior = path.resolve(
  process.env.LITHENT_C3_ISOLATED_OUT || '/tmp/lithent-c3-isolated-20261022'
);
const bench = path.resolve(
  process.env.LITHENT_BENCHMARK_ROOT ||
    path.join(root, '../js-framework-benchmark-upstream')
);
const app = path.join(bench, 'frameworks/keyed/lithent');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const read = name => JSON.parse(fs.readFileSync(name, 'utf8'));
const previous = read(
  path.join(root, 'docs/benchmark/parent-memo-isolation-results.json')
);
const provenance = read(path.join(prior, 'build-manifest.json'));
assert.deepEqual(provenance, previous.provenance);
assert.equal(
  hash(fs.readFileSync(path.join(root, previous.evidence.file))),
  previous.evidence.sha256
);
for (const [name, sha] of Object.entries(provenance.baseline))
  assert.equal(hash(fs.readFileSync(path.join(root, name))), sha, name);
for (const [name, sha] of Object.entries(provenance.source))
  assert.equal(
    hash(fs.readFileSync(path.join(prior, 'runtime', name))),
    sha,
    name
  );
for (const [name, value] of Object.entries(provenance.bundles))
  assert.equal(
    hash(fs.readFileSync(path.join(prior, 'runtime/dist', name))),
    value.sha256,
    name
  );
assert.equal(
  hash(fs.readFileSync(path.join(app, 'src/main.tsx'))),
  read(path.join(out, 'initial.json')).siblingSourceSHA256
);
assert.equal(
  fs.existsSync(path.join(out, 'runtime')),
  false,
  'Choose a fresh experiment output'
);
fs.cpSync(path.join(prior, 'runtime'), path.join(out, 'runtime'), {
  recursive: true,
});
fs.writeFileSync(
  path.join(out, 'runtime-provenance.json'),
  JSON.stringify(provenance, null, 2) + '\n'
);
fs.writeFileSync(
  path.join(out, 'reused-validation.json'),
  JSON.stringify(
    {
      evidence: previous.evidence,
      tests: previous.tests,
      package: previous.contracts.package,
      declarations: previous.declarations,
      source: provenance.source,
      bundles: provenance.bundles,
      defaultPackageSHA256: previous.defaultPackageSHA256,
    },
    null,
    2
  ) + '\n'
);
const source = fs.readFileSync(
  path.join(root, 'experiments/parent-memo-optin/main.tsx')
);
const { build, loadConfigFromFile } = await import(
  path.join(app, 'node_modules/vite/dist/node/index.js')
);
const { config } = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  path.join(app, 'vite.config.js')
);
for (const diagnostic of [false, true]) {
  const stage = path.join(out, diagnostic ? 'diagnostic-source' : 'source');
  fs.mkdirSync(path.join(stage, 'src'), { recursive: true });
  fs.writeFileSync(path.join(stage, 'src/main.tsx'), source);
  fs.copyFileSync(path.join(app, 'index.html'), path.join(stage, 'index.html'));
  fs.copyFileSync(
    path.join(out, 'runtime/dist/lithent.mjs'),
    path.join(stage, 'lithent.mjs')
  );
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
        { find: /^lithent$/, replacement: path.join(stage, 'lithent.mjs') },
      ],
    },
    build: {
      ...config.build,
      outDir: path.join(
        out,
        diagnostic ? 'diagnostic-build' : 'production-build'
      ),
    },
  });
}
const manifest = {};
for (const [name, enabled] of [
  ['lithent-before', false],
  ['lithent', true],
]) {
  for (const [destination, buildFolder] of [
    ['round-main', 'production-build'],
    ['round-reverse', 'production-build'],
    ['diagnostic', 'diagnostic-build'],
  ]) {
    const dir = path.join(out, destination, name);
    fs.cpSync(path.join(out, buildFolder), dir, { recursive: true });
    const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
    assert.equal(html.split('<head>').length, 2);
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      html.replace(
        '<head>',
        `<head><script>window.__PARENT_MEMO__=${enabled}</script>`
      )
    );
  }
  const dir = path.join(out, 'round-main', name);
  const bundle = fs.readFileSync(path.join(dir, 'main.js'));
  assert.equal(
    bundle.includes(Buffer.from('__memoDiagnostic')),
    false,
    'Diagnostics remain in production'
  );
  manifest[name] = {
    at: new Date().toISOString(),
    libraryHead: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).trim(),
    benchmarkHead: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: bench,
      encoding: 'utf8',
    }).trim(),
    appSource: hash(source),
    core: provenance.bundles['lithent.mjs'].sha256,
    bundle: hash(bundle),
    html: hash(fs.readFileSync(path.join(dir, 'index.html'))),
    memoEnabled: enabled,
    diagnostic: false,
  };
}
assert.equal(manifest.lithent.bundle, manifest['lithent-before'].bundle);
for (const round of ['round-main', 'round-reverse']) {
  fs.writeFileSync(
    path.join(out, round, 'build-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  fs.writeFileSync(
    path.join(out, round, 'versions.json'),
    JSON.stringify(
      {
        core: 'unreleased C3 isolated renderer, base 1.25.2',
        vite: JSON.parse(
          fs.readFileSync(path.join(app, 'node_modules/vite/package.json'))
        ).version,
        memo: 'HTML startup flag only; identical JS',
      },
      null,
      2
    )
  );
}
fs.writeFileSync(
  path.join(out, 'typecheck.json'),
  JSON.stringify(
    {
      extends: path.join(root, 'tsconfig.json'),
      compilerOptions: {
        baseUrl: path.join(out, 'runtime'),
        paths: { '@/*': ['src/*'], lithent: ['src/index.ts'] },
        types: [],
      },
      include: [
        path.join(out, 'runtime/src/**/*.ts'),
        path.join(root, 'experiments/parent-memo-optin/main.tsx'),
      ],
      exclude: [],
    },
    null,
    2
  )
);
fs.copyFileSync(
  path.join(root, 'docs/benchmark/production-run.mjs'),
  path.join(out, 'cpu-runner.mjs')
);
const configuration = path.join(out, 'typecheck.json');
const typeOutput = execFileSync(
  process.execPath,
  [
    path.join(root, 'node_modules/typescript/bin/tsc'),
    '--noEmit',
    '-p',
    configuration,
  ],
  { cwd: root, encoding: 'utf8' }
);
fs.writeFileSync(path.join(out, 'typecheck.log'), typeOutput);
fs.writeFileSync(
  path.join(out, 'preflight.json'),
  JSON.stringify(
    {
      typecheck: {
        exitCode: 0,
        command: [
          process.execPath,
          path.join(root, 'node_modules/typescript/bin/tsc'),
          '--noEmit',
          '-p',
          configuration,
        ],
        sourceSHA256: hash(source),
        configurationSHA256: hash(fs.readFileSync(configuration)),
        logSHA256: hash(Buffer.from(typeOutput)),
      },
    },
    null,
    2
  ) + '\n'
);
console.log(JSON.stringify(manifest, null, 2));
