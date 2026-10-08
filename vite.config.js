import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { minify } from 'terser';
export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    dts({
      outputDir: ['dist'],
    }),
    {
      name: 'compact-umd-identifiers',
      renderChunk: {
        order: 'post',
        async handler(code, _chunk, outputOptions) {
          if (outputOptions.format !== 'umd') return null;
          // Rename and reprint only; preserve the scopes that isolate parent
          // getters from old diff trees. The ESM output keeps its normal build.
          const result = await minify(code, {
            compress: false,
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
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'lithent',
      fileName: format => {
        return format === 'umd' ? 'lithent.umd.js' : 'lithent.mjs';
      },
    },
    rollupOptions: {
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
    ],
  },
  server: {
    open: '/html/insertExample.html',
  },
});
