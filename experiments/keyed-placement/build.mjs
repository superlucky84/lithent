import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { build, loadConfigFromFile } from 'vite';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../../scripts/emit-declaration-formats.mjs';
import { root, hash, read, guard } from './init.mjs';

const out = fs.realpathSync(
  path.resolve(process.argv[2] || '/tmp/lithent-c2-20261023')
);
const variant = process.argv[3];
assert.ok(['baseline', 'candidate'].includes(variant));
guard(out);
const runtime = path.join(out, variant);
const { config } = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  path.join(root, 'vite.config.js')
);
const sources = {};
for (const name of fs.readdirSync(path.join(runtime, 'src'), {
  recursive: true,
}))
  if (name.endsWith('.ts'))
    sources['src/' + name] = hash(
      fs.readFileSync(path.join(runtime, 'src', name))
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
        assert.ok(fs.existsSync(path.join(runtime, 'dist/index.d.ts')));
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
const bundles = {};
const historical = read(
  path.join(root, 'docs/benchmark/parent-memo-isolation-results.json')
);
for (const name of ['lithent.mjs', 'lithent.umd.js', 'lithent.cjs']) {
  const bytes = fs.readFileSync(path.join(runtime, 'dist', name));
  bundles[name] = {
    sha256: hash(bytes),
    raw: bytes.length,
    gzip: zlib.gzipSync(bytes, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(bytes).length,
  };
  if (variant === 'baseline') {
    bundles[name].historicalSHA256 =
      historical.provenance.baseline['dist/' + name];
    bundles[name].matchesHistorical =
      bundles[name].sha256 === bundles[name].historicalSHA256;
  }
}
const size = {
  budget: 4800,
  actual: bundles['lithent.umd.js'].brotli,
  pass: bundles['lithent.umd.js'].brotli <= 4800,
};
guard(out);
fs.writeFileSync(
  path.join(out, variant + '-build.json'),
  JSON.stringify(
    { at: new Date().toISOString(), sources, bundles, size },
    null,
    2
  ) + '\n'
);
console.log(JSON.stringify({ variant, bundles, size }));
if (!size.pass) process.exitCode = 2;
