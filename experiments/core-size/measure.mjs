// Builds a copy of the base core like vite.config.js does (no type check, no
// declarations) and prints raw / gzip level 9 / default Brotli of each format.
//
//   node experiments/core-size/measure.mjs <outDir> [srcDir] [options]
//
// Options (each changes one thing against the repository's build):
//   --no-terser        skip the UMD Terser step
//   --wrap-func-args   Terser's default: parentheses around function arguments
//   --hidden-map       sourcemap: 'hidden' (no sourceMappingURL comment)
//
// <srcDir> defaults to ./src; point it at a copy to measure a candidate
// without touching the working tree. The repository's dist is never written.
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { brotliCompressSync, gzipSync } from 'zlib';
import { build } from 'vite';
import { minify } from 'terser';

const args = process.argv.slice(2);
const flags = new Set(args.filter(arg => arg.startsWith('--')));
const [outDir, srcDir = 'src'] = args.filter(arg => !arg.startsWith('--'));

if (!outDir) {
  console.error('usage: measure.mjs <outDir> [srcDir] [options]');
  process.exit(1);
}

const src = resolve(srcDir);
const out = resolve(outDir);
const fileNames = {
  es: 'lithent.mjs',
  umd: 'lithent.umd.js',
  cjs: 'lithent.cjs',
};

await build({
  root: process.cwd(),
  configFile: false,
  logLevel: 'silent',
  oxc: {
    jsx: {
      runtime: 'classic',
      development: false,
      pragma: 'h',
      pragmaFrag: 'Fragment',
    },
  },
  plugins: [
    {
      name: 'compact-umd-identifiers',
      renderChunk: {
        order: 'post',
        async handler(code, _chunk, outputOptions) {
          if (outputOptions.format !== 'umd' || flags.has('--no-terser')) {
            return null;
          }
          const result = await minify(code, {
            compress: {
              defaults: false,
              booleans: true,
              lhs_constants: true,
              if_return: true,
              join_vars: true,
            },
            mangle: true,
            format: { wrap_func_args: flags.has('--wrap-func-args') },
            sourceMap: !!outputOptions.sourcemap,
          });
          return { code: result.code, map: result.map || null };
        },
      },
    },
  ],
  resolve: { alias: [{ find: '@', replacement: src }] },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    emptyOutDir: true,
    outDir: out,
    sourcemap: flags.has('--hidden-map') ? 'hidden' : true,
    lib: {
      formats: ['es', 'umd', 'cjs'],
      entry: resolve(src, 'index.ts'),
      name: 'lithent',
      fileName: format => fileNames[format],
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

for (const file of Object.values(fileNames)) {
  const bytes = readFileSync(resolve(out, file));
  console.log(
    `${file.padEnd(15)} raw ${bytes.length}  gzip ${gzipSync(bytes, { level: 9 }).length}  br ${brotliCompressSync(bytes).length}`
  );
}
