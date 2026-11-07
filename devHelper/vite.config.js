import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../scripts/emit-declaration-formats.mjs';

/**
 * RC-9 — run this suite against either core.
 * `LITHENT_CORE=concurrent` points the bare `lithent` specifier at the built
 * concurrent bundle, exactly as a consumer would alias it in their bundler.
 * Requires `pnpm build:concurrent` first.
 *
 * The match is anchored: subpath entries (`lithent/jsx-dev-runtime`,
 * `lithent/helper`, …) must keep resolving to the real package — only the core
 * is swapped.
 */
const coreAlias =
  process.env.LITHENT_CORE === 'concurrent'
    ? [
        {
          find: /^lithent$/,
          replacement: resolve(
            import.meta.dirname,
            '../lithentConcurrent/dist/lithentConcurrent.mjs'
          ),
        },
      ]
    : [];

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
  ],
  resolve: {
    alias: [
      ...coreAlias,
      { find: '@', replacement: resolve(import.meta.dirname, './src') },
    ],
  },
  build: {
    // Preserve the browser target used before the Vite 8 migration.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      formats: ['es', 'umd', 'cjs'],
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'lithentDevHelper',
      fileName: format => {
        if (format === 'cjs') return 'lithentDevHelper.cjs';
        return format === 'umd'
          ? 'lithentDevHelper.umd.js'
          : 'lithentDevHelper.mjs';
      },
    },
    rolldownOptions: {
      external: ['lithent'],
      output: {
        globals: {
          lithent: 'lithent',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
  },
  server: {
    open: '/html/hmr.html',
  },
});
