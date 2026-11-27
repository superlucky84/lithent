import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../scripts/emit-declaration-formats.mjs';

/**
 * Host controller build: `lithent/live` (docs/agent-ui DESIGN §3, DC-9 ≤ 3,000 B).
 * The sandbox runtime is a separate build: vite.runtime.config.js.
 *
 * RQ-11 — `LITHENT_CORE=concurrent` points the bare `lithent` specifier at
 * the built concurrent bundle for the tests (subpaths keep resolving to the
 * real package). Requires `pnpm build:concurrent` first.
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
      exclude: ['src/tests/**', 'src/runtime/**'],
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
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      formats: ['es', 'umd', 'cjs'],
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'lithentLive',
      fileName: format => {
        if (format === 'cjs') return 'lithentLive.cjs';
        return format === 'umd' ? 'lithentLive.umd.js' : 'lithentLive.mjs';
      },
    },
    rolldownOptions: {
      // The page's lithent: direct mode runs on it (DESIGN §3.2).
      external: id => /^lithent(\/|$)/.test(id),
      output: {
        globals: {
          lithent: 'lithent',
          'lithent/helper': 'lithentHelper',
          'lithent/ftags': 'lithentFTags',
          'lithent/tag': 'lithentTag',
          'lithent/agent': 'lithentAgent',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/tests/*.test.{ts,tsx}'],
  },
});
