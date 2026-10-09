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
  plugins: [
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    dts({
      outputDir: ['dist/types'],
      afterBuild: () =>
        emitDeclarationFormats(resolve(__dirname, 'dist/types')),
    }),
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
      name: 'lithentConcurrentHelper',
      fileName: format => {
        if (format === 'cjs') return 'lithentConcurrentHelper.cjs';
        return format === 'umd'
          ? 'lithentConcurrentHelper.umd.js'
          : 'lithentConcurrentHelper.mjs';
      },
    },
    rollupOptions: {
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
