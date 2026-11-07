import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build, loadConfigFromFile } from 'vite';
import dts from 'vite-plugin-dts';
import ts from 'typescript';
import { emitDeclarationFormats } from '../../scripts/emit-declaration-formats.mjs';
import { root, hash, guard } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
const variant = process.argv[3];
assert(
  ['baseline', 'slot', 'flat-original', 'event', 'c2', 'combined'].includes(
    variant
  )
);
guard(out);
const runtime = path.join(out, variant);
assert(
  !fs.existsSync(path.join(runtime, 'build.json')),
  'Freeze each build once; use a fresh candidate output for changes'
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
const sources = Object.fromEntries(
  fs
    .readdirSync(path.join(runtime, 'src'), { recursive: true })
    .filter(name => name.endsWith('.ts'))
    .sort()
    .map(name => [name, hash(fs.readFileSync(path.join(runtime, 'src', name)))])
);
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
const renderer = fs.readFileSync(path.join(runtime, 'src/render.ts'), 'utf8');
const helper = fs.existsSync(path.join(runtime, 'src/utils/event.ts'))
  ? fs.readFileSync(path.join(runtime, 'src/utils/event.ts'), 'utf8')
  : 'export ' +
    renderer.slice(
      renderer.indexOf('const updateEvent ='),
      renderer.indexOf('const updateStyle =')
    );
fs.writeFileSync(
  path.join(runtime, 'dist/event-helper.mjs'),
  ts.transpileModule(helper, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText
);
guard(out);
fs.writeFileSync(
  path.join(runtime, 'build.json'),
  JSON.stringify(
    { at: new Date().toISOString(), node: process.version, sources, bundles },
    null,
    2
  ) + '\n'
);
console.log(JSON.stringify({ variant, bundles }));
