import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { concurrentAlias } from './alias.js';

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
  ],
  resolve: {
    alias: concurrentAlias(__dirname),
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      formats: ['es', 'umd', 'cjs'],
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'lithentConcurrent',
      fileName: format => {
        if (format === 'cjs') return 'lithentConcurrent.cjs';
        return format === 'umd'
          ? 'lithentConcurrent.umd.js'
          : 'lithentConcurrent.mjs';
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
});
