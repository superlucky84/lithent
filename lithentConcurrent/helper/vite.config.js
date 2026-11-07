import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../../scripts/emit-declaration-formats.mjs';

/**
 * `lithent-concurrent` stays external, exactly as `helper/` keeps `lithent`
 * external: the scheduler holds module-level state (the lanes, the ambient lane
 * ref), so a second bundled copy would give the app two schedulers that never
 * see each other's queues.
 *
 * It is a workspace dependency, so tests resolve it the ordinary way — no alias
 * that would only work inside this repo.
 */
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
      outDir: ['dist/types'],
      afterBuild: () =>
        emitDeclarationFormats(resolve(import.meta.dirname, 'dist/types')),
    }),
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
      name: 'lithentConcurrentHelper',
      fileName: format => {
        if (format === 'cjs') return 'lithentConcurrentHelper.cjs';
        return format === 'umd'
          ? 'lithentConcurrentHelper.umd.js'
          : 'lithentConcurrentHelper.mjs';
      },
    },
    rolldownOptions: {
      external: ['lithent-concurrent'],
      output: {
        globals: {
          'lithent-concurrent': 'lithentConcurrent',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
  },
});
