import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { build } from 'vite';
import { minify } from 'terser';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const candidateRoot = path.resolve(
  process.env.LITHENT_EVENT_CANDIDATE_SOURCE || root
);
assert(
  fs.existsSync(path.join(candidateRoot, 'src/utils/event.ts')),
  'Select the preserved event candidate source'
);
const out = path.resolve(process.argv[2]);
const base = '8056e0243c49a29ec9f4efcf5b00f90f6c1bbca7';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert(
  !fs.existsSync(path.join(out, 'build.json')),
  'Use a fresh output directory'
);
fs.mkdirSync(out, { recursive: true });
const execute = promisify(execFile);
const git = async args =>
  (await execute('git', args, { cwd: root, encoding: 'buffer' })).stdout;
const originals = (
  await git(['ls-tree', '-r', '--name-only', base, '--', 'src'])
)
  .toString()
  .trim()
  .split('\n')
  .filter(file => !file.startsWith('src/tests/'));
const changed = [
  'src/render.ts',
  'src/hook/internal/unmount.ts',
  'src/utils/event.ts',
];
const manifest = {
  base,
  candidateKind: 'native-slot-proxy',
  at: new Date().toISOString(),
  node: process.version,
  files: {},
  bundles: {},
};
for (const variant of ['baseline', 'candidate']) {
  const source = path.join(out, variant, 'source');
  const files = {};
  const sources =
    variant === 'baseline' ? originals : [...originals, 'src/utils/event.ts'];
  for (const file of sources) {
    const bytes =
      variant === 'baseline'
        ? await git(['show', `${base}:${file}`])
        : fs.readFileSync(path.join(candidateRoot, file));
    const dest = path.join(source, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, bytes);
    files[file] = hash(bytes);
    if (variant === 'candidate' && !changed.includes(file))
      assert.equal(files[file], manifest.files.baseline[file], file);
  }
  manifest.files[variant] = files;
  const dest = path.join(out, variant, 'production');
  await build({
    configFile: false,
    root,
    logLevel: 'warn',
    resolve: { alias: [{ find: '@', replacement: path.join(source, 'src') }] },
    plugins: [
      {
        name: 'compact-umd-identifiers',
        renderChunk: {
          order: 'post',
          async handler(code, _chunk, options) {
            if (options.format !== 'umd') return null;
            const result = await minify(code, {
              compress: false,
              mangle: true,
              sourceMap: !!options.sourcemap,
            });
            return { code: result.code, map: result.map || null };
          },
        },
      },
    ],
    build: {
      outDir: dest,
      emptyOutDir: true,
      sourcemap: true,
      lib: {
        formats: ['es', 'umd', 'cjs'],
        entry: path.join(source, 'src/index.ts'),
        name: 'lithent',
        fileName: format =>
          format === 'cjs'
            ? 'lithent.cjs'
            : format === 'umd'
              ? 'lithent.umd.js'
              : 'lithent.mjs',
      },
      rollupOptions: {
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
    },
  });
  manifest.bundles[`${variant}/production`] = {};
  for (const name of ['lithent.mjs', 'lithent.umd.js', 'lithent.cjs']) {
    const bytes = fs.readFileSync(path.join(dest, name));
    assert(!bytes.includes(Buffer.from('__eventMetrics')));
    manifest.bundles[`${variant}/production`][name] = {
      sha256: hash(bytes),
      raw: bytes.length,
      gzip: gzipSync(bytes, { level: 9 }).length,
      br: brotliCompressSync(bytes).length,
    };
  }
  // Standalone helper is ONLY for native dispatch/identity observations, never timing.
  const renderer = fs.readFileSync(path.join(source, 'src/render.ts'), 'utf8');
  const helper =
    variant === 'candidate'
      ? fs.readFileSync(path.join(source, 'src/utils/event.ts'), 'utf8')
      : 'export ' +
        renderer.slice(
          renderer.indexOf('const updateEvent ='),
          renderer.indexOf('const updateStyle =')
        );
  fs.writeFileSync(
    path.join(dest, 'event-helper.mjs'),
    ts.transpileModule(helper, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ES2022,
      },
    }).outputText
  );
}
fs.writeFileSync(
  path.join(out, 'build.json'),
  JSON.stringify(manifest, null, 2)
);
// Use frozen inputs to produce a patch including the new module without relying on index state.
let patch = '';
for (const file of changed) {
  const before = path.join(out, 'baseline/source', file);
  const after = path.join(out, 'candidate/source', file);
  try {
    await execute('diff', [
      '-u',
      '--label',
      fs.existsSync(before) ? `a/${file}` : '/dev/null',
      '--label',
      `b/${file}`,
      fs.existsSync(before) ? before : '/dev/null',
      after,
    ]);
  } catch (error) {
    assert.equal(error.code, 1);
    patch += error.stdout;
  }
}
fs.writeFileSync(path.join(out, 'candidate.patch'), patch.replace(/^ $/gm, ''));
console.log(
  JSON.stringify(
    {
      out,
      sizes: Object.fromEntries(
        ['baseline', 'candidate'].map(v => [
          v,
          manifest.bundles[`${v}/production`]['lithent.umd.js'],
        ])
      ),
    },
    null,
    2
  )
);
