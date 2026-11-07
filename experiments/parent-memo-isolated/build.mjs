import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { build, loadConfigFromFile } from 'vite';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../../scripts/emit-declaration-formats.mjs';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const requestedOut = path.resolve(
  process.argv[2] || '/tmp/lithent-c3-isolated-20261022'
);
fs.mkdirSync(requestedOut, { recursive: true });
// macOS resolves /tmp to /private/tmp; TS/Vite must agree on source identity.
const out = fs.realpathSync(requestedOut);
const runtime = path.join(out, 'runtime');
assert.equal(fs.existsSync(runtime), false, 'Choose a fresh output directory');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const previous = JSON.parse(
  fs.readFileSync(
    path.join(root, 'docs/benchmark/parent-memo-results.json'),
    'utf8'
  )
);
const archive = fs.readFileSync(path.join(root, previous.evidence.file));
assert.equal(hash(archive), previous.evidence.sha256);
const evidence = JSON.parse(zlib.gunzipSync(archive));
const manifest = {
  at: new Date().toISOString(),
  head: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim(),
  node: process.version,
  zlib: process.versions.zlib,
  evidence: previous.evidence.sha256,
  baseline: {},
  source: {},
  bundles: {},
};

for (const [name, file] of Object.entries(previous.restoration.files)) {
  const content = fs.readFileSync(path.join(root, name));
  assert.equal(hash(content), file.expected, name);
  manifest.baseline[name] = hash(content);
  const target = path.join(out, 'baseline', name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}
for (const [name, file] of Object.entries(evidence.files)) {
  if (!name.startsWith('candidate/src/') || !name.endsWith('.ts')) continue;
  const relative = name.slice('candidate/'.length);
  assert.equal(relative.includes('..'), false);
  const content = Buffer.from(file.content, file.encoding || 'utf8');
  assert.equal(hash(content), file.sha256, name);
  const target = path.join(runtime, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  manifest.source[relative] = hash(content);
}
assert.equal(Object.keys(manifest.source).length, 17);
const tsconfig = {
  compilerOptions: {
    target: 'ESNext',
    module: 'ESNext',
    moduleResolution: 'node',
    lib: ['DOM', 'DOM.Iterable', 'ESNext'],
    strict: true,
    skipLibCheck: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    isolatedModules: true,
    esModuleInterop: true,
    declaration: true,
    types: [],
    baseUrl: runtime,
    paths: { '@/*': ['src/*'] },
  },
  include: ['src'],
  exclude: ['dist'],
};
fs.writeFileSync(
  path.join(runtime, 'tsconfig.json'),
  JSON.stringify(tsconfig, null, 2) + '\n'
);
fs.writeFileSync(
  path.join(runtime, 'package.json'),
  JSON.stringify(
    {
      name: 'lithent-parent-memo-experiment',
      private: true,
      type: 'module',
      exports: {
        '.': {
          import: { types: './dist/index.d.ts', default: './dist/lithent.mjs' },
          require: {
            types: './dist/index.d.cts',
            default: './dist/lithent.cjs',
          },
        },
      },
    },
    null,
    2
  ) + '\n'
);

const { config } = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  path.join(root, 'vite.config.js')
);
await build({
  ...config,
  configFile: false,
  root: runtime,
  plugins: [
    dts({
      root: runtime,
      entryRoot: path.join(runtime, 'src'),
      include: ['src/**/*.ts'],
      tsConfigFilePath: path.join(runtime, 'tsconfig.json'),
      outputDir: path.join(runtime, 'dist'),
      noEmitOnError: true,
      skipDiagnostics: false,
      afterBuild: () => {
        assert.equal(
          fs.existsSync(path.join(runtime, 'dist/index.d.ts')),
          true,
          'No entry declaration emitted'
        );
        emitDeclarationFormats(path.join(runtime, 'dist'));
      },
    }),
    ...config.plugins.filter(
      plugin => plugin.name === 'compact-umd-identifiers'
    ),
  ],
  resolve: { alias: [{ find: '@', replacement: path.join(runtime, 'src') }] },
  build: {
    ...config.build,
    outDir: path.join(runtime, 'dist'),
    lib: { ...config.build.lib, entry: path.join(runtime, 'src/index.ts') },
  },
});
for (const name of ['lithent.mjs', 'lithent.umd.js', 'lithent.cjs']) {
  const content = fs.readFileSync(path.join(runtime, 'dist', name));
  const original = evidence.files['candidate/dist/' + name];
  assert.equal(
    hash(content),
    original.sha256,
    name + ': rebuild changed the validated candidate'
  );
  manifest.bundles[name] = {
    sha256: hash(content),
    raw: content.length,
    gzip: zlib.gzipSync(content, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(content).length,
  };
}
for (const [name, sha] of Object.entries(manifest.baseline))
  assert.equal(hash(fs.readFileSync(path.join(root, name))), sha, name);
fs.writeFileSync(
  path.join(out, 'build-manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    sources: Object.keys(manifest.source).length,
    defaultFilesUnchanged: Object.keys(manifest.baseline).length,
    bundles: manifest.bundles,
  })
);
