import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../scripts/emit-declaration-formats.mjs';

/**
 * RQ-11 — run this suite against either core.
 * `LITHENT_CORE=concurrent` points the bare `lithent` specifier at the built
 * concurrent bundle, exactly as a consumer would alias it in their bundler.
 * Requires `pnpm build:concurrent` first. Subpaths keep resolving to the real
 * package — only the core is swapped.
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
      exclude: ['src/tests/**'],
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
      name: 'lithentAgent',
      fileName: format => {
        if (format === 'cjs') return 'lithentAgent.cjs';
        return format === 'umd' ? 'lithentAgent.umd.js' : 'lithentAgent.mjs';
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
    include: ['src/tests/*.test.{ts,tsx}'],
  },
});
