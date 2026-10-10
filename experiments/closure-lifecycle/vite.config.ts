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
    alias: [{ find: /^lithent$/, replacement: resolve(experiment, core) }],
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(experiment, 'src/index.ts'),
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
  },
});
