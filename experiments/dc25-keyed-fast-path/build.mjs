import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build, loadConfigFromFile } from 'vite';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../../scripts/emit-declaration-formats.mjs';
import { root, hash, guard, inventory, write } from './common.mjs';

const out = fs.realpathSync(process.argv[2]);
const variant = process.argv[3];
assert(/^[a-z][a-z0-9-]*$/.test(variant));
guard(out);
const runtime = path.join(out, variant);
assert(
  !fs.existsSync(path.join(runtime, 'build.json')),
  'Freeze each build once'
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
      afterBuild: () => emitDeclarationFormats(path.join(runtime, 'dist')),
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
const bundles = Object.fromEntries(
  ['lithent.mjs', 'lithent.umd.js', 'lithent.cjs'].map(name => {
    const bytes = fs.readFileSync(path.join(runtime, 'dist', name));
    return [
      name,
      {
        sha256: hash(bytes),
        raw: bytes.length,
        gzip: gzipSync(bytes, { level: 9 }).length,
        br: brotliCompressSync(bytes).length,
      },
    ];
  })
);
write(path.join(runtime, 'build.json'), {
  at: new Date().toISOString(),
  node: process.version,
  zlib: process.versions.zlib,
  sources: inventory(path.join(runtime, 'src')),
  bundles,
});
guard(out);
console.log(JSON.stringify({ variant, bundles }));
