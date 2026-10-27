// Builds the base core from a copied source tree with the same Vite/Rollup
// settings as vite.config.js, minus the checker/declaration plugins, and
// prints raw/gzip/Brotli for the three JS outputs. The workspace dist is not
// touched.
//
//   node experiments/bundle-size-recheck/build-variant.mjs <variantRoot> <outDir> [terserJSON]
//
// <variantRoot> contains a src/ copy. terserJSON replaces the UMD
// post-minify options (default: rename/reprint only, as in vite.config.js).
// Env: ROLLUP_OUT=<JSON rollup output options>, SOURCEMAP=hidden.
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { brotliCompressSync, gzipSync } from 'zlib';
import { createHash } from 'crypto';
import { build } from 'vite';
import { minify } from 'terser';

const [variant, outDir, terserJSON] = process.argv.slice(2);
if (!variant || !outDir) {
  console.error('usage: build-variant.mjs <variantRoot> <outDir> [terserJSON]');
  process.exit(2);
}
const terserOptions = terserJSON
  ? JSON.parse(terserJSON)
  : { compress: false, mangle: true };
const src = resolve(variant, 'src');

await build({
  configFile: false,
  root: process.cwd(),
  logLevel: 'silent',
  plugins: [
    {
      name: 'compact-umd-identifiers',
      renderChunk: {
        order: 'post',
        async handler(code, _chunk, outputOptions) {
          if (outputOptions.format !== 'umd') return null;
          const result = await minify(code, {
            ...terserOptions,
            sourceMap: !!outputOptions.sourcemap,
          });
          return { code: result.code, map: result.map || null };
        },
      },
    },
  ],
  resolve: { alias: [{ find: '@', replacement: src }] },
  build: {
    emptyOutDir: true,
    outDir: resolve(outDir),
    sourcemap: process.env.SOURCEMAP === 'hidden' ? 'hidden' : true,
    lib: {
      formats: ['es', 'umd', 'cjs'],
      entry: resolve(src, 'index.ts'),
      name: 'lithent',
      fileName: format =>
        format === 'cjs'
          ? 'lithent.cjs'
          : format === 'umd'
            ? 'lithent.umd.js'
            : 'lithent.mjs',
    },
    rollupOptions: {
      ...(process.env.ROLLUP_OUT
        ? { output: JSON.parse(process.env.ROLLUP_OUT) }
        : {}),
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
});

for (const file of ['lithent.umd.js', 'lithent.mjs', 'lithent.cjs']) {
  const bytes = readFileSync(resolve(outDir, file));
  console.log(
    `${file.padEnd(15)} raw ${bytes.length} gzip ${gzipSync(bytes, { level: 9 }).length} ` +
      `br ${brotliCompressSync(bytes).length} sha256 ${createHash('sha256').update(bytes).digest('hex')}`
  );
}
