import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from './scripts/emit-declaration-formats.mjs';
import { minify } from 'terser';
export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'classic',
      development: false,
      pragma: 'h',
      pragmaFrag: 'Fragment',
    },
  },
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
      outDir: ['dist'],
      afterBuild: () =>
        emitDeclarationFormats(resolve(import.meta.dirname, 'dist')),
    }),
    {
      name: 'compact-umd-identifiers',
      renderChunk: {
        order: 'post',
        async handler(code, _chunk, outputOptions) {
          if (outputOptions.format !== 'umd') return null;
          // A few syntax-only rewrites before the bundler's own minifier,
          // which runs after this hook and does the renaming and printing.
          // No option that inlines or moves functions: the scopes that
          // isolate parent getters from old diff trees stay as written.
          // Function arguments are not wrapped in parentheses, which the
          // minifier would keep. See docs/bundle-size/DESIGN.md.
          const result = await minify(code, {
            compress: {
              defaults: false,
              booleans: true,
              lhs_constants: true,
              if_return: true,
              join_vars: true,
            },
            mangle: true,
            format: { wrap_func_args: false },
            sourceMap: !!outputOptions.sourcemap,
          });
          return { code: result.code, map: result.map || null };
        },
      },
    },
  ],
  resolve: {
    alias: [{ find: '@', replacement: resolve(import.meta.dirname, './src') }],
  },
  build: {
    // Preserve the browser target used before the Vite 8 migration.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      formats: ['es', 'umd', 'cjs'],
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'lithent',
      fileName: format => {
        if (format === 'cjs') return 'lithent.cjs';
        return format === 'umd' ? 'lithent.umd.js' : 'lithent.mjs';
      },
    },
    rolldownOptions: {
      // No Symbol.toStringTag "Module" marker on the UMD/CJS exports object.
      output: { generatedCode: { symbols: false } },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
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
      // Node's CI/artifact failure fixtures use their own mandatory runner.
      '**/scripts/tests/**',
      // Optional prototypes have dedicated Vitest and Playwright runners.
      '**/experiments/**',
    ],
  },
  server: {
    open: '/html/insertExample.html',
  },
});
