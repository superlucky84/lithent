import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const experiment = resolve(__dirname);
const core =
  process.env.LITHENT_CORE === 'concurrent'
    ? '../../lithentConcurrent/dist/lithentConcurrent.mjs'
    : '../../dist/lithent.mjs';

export default defineConfig({
  root: experiment,
  resolve: {
    alias: [
      { find: /^lithent$/, replacement: resolve(experiment, core) },
      {
        find: /^lithent\/helper$/,
        replacement: resolve(experiment, '../../helper/dist/lithentHelper.mjs'),
      },
    ],
  },
  build: {
    outDir: 'dist',
    lib: {
      // Historical standalone measurements use the canonical implementation.
      entry: resolve(experiment, '../../helper/src/lifecycle/index.ts'),
      name: 'lithentLifecycleExperiment',
      formats: ['es', 'cjs', 'umd'],
      fileName: format =>
        format === 'es'
          ? 'lifecycle.mjs'
          : `lifecycle.${format === 'cjs' ? 'cjs' : 'umd.js'}`,
    },
    rollupOptions: {
      external: ['lithent'],
      output: { globals: { lithent: 'lithent' } },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    exclude:
      process.env.LITHENT_CORE === 'concurrent'
        ? []
        : ['tests/**/*.concurrent.test.ts'],
  },
});
