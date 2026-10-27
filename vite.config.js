import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from './scripts/emit-declaration-formats.mjs';
import { minify } from 'terser';
export default defineConfig({
  plugins: [
    // Builds still type-check and lint. Tests skip the checker: on Node
    // 24.19+, vitest aborts when it exits while the checker is still running.
    !process.env.VITEST &&
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
      }),
    dts({
      outputDir: ['dist'],
      afterBuild: () => emitDeclarationFormats(resolve(__dirname, 'dist')),
    }),
    {
      name: 'compact-umd-identifiers',
      renderChunk: {
        order: 'post',
        async handler(code, _chunk, outputOptions) {
          if (outputOptions.format !== 'umd') return null;
          // Rename, reprint and a few syntax-only rewrites; preserve the
          // scopes that isolate parent getters from old diff trees, so no
          // option that inlines or moves functions. The ESM output keeps its
          // normal build. See docs/benchmark/BUNDLE_SIZE_RESULTS.md.
          const result = await minify(code, {
            compress: {
              defaults: false,
              booleans: true,
              lhs_constants: true,
              if_return: true,
              join_vars: true,
            },
            mangle: true,
            sourceMap: !!outputOptions.sourcemap,
          });
          return { code: result.code, map: result.map || null };
        },
      },
    },
  ],
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      formats: ['es', 'umd', 'cjs'],
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'lithent',
      fileName: format => {
        if (format === 'cjs') return 'lithent.cjs';
        return format === 'umd' ? 'lithent.umd.js' : 'lithent.mjs';
      },
    },
    rollupOptions: {
      // No Symbol.toStringTag "Module" marker on the UMD/CJS exports object.
      output: { generatedCode: { symbols: false } },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/packages/lithentTemplateVite/**',
      // The concurrent build has its own runner (`pnpm test:concurrent`); its
      // specs only make sense under the concurrent alias table.
      '**/lithentConcurrent/**',
      // lithent/element runs in its own package (`pnpm --filter
      // lithent-element test`), where `@` points at element/src.
      '**/element/**',
      // Browser contracts use Playwright's runner, not Vitest.
      '**/e2e/**',
      // Optional prototypes have dedicated Vitest and Playwright runners.
      '**/experiments/**',
    ],
  },
  server: {
    open: '/html/insertExample.html',
  },
});
