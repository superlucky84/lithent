import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { concurrentAlias } from './alias.js';

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
  ],
  resolve: {
    alias: concurrentAlias(import.meta.dirname),
  },
  build: {
    // Preserve the browser target used before the Vite 8 migration.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      formats: ['es', 'umd', 'cjs'],
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'lithentConcurrent',
      fileName: format => {
        if (format === 'cjs') return 'lithentConcurrent.cjs';
        return format === 'umd'
          ? 'lithentConcurrent.umd.js'
          : 'lithentConcurrent.mjs';
      },
    },
    rolldownOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
  },
});
