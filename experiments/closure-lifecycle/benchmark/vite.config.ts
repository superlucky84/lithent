import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { concurrentAlias } from '../../../lithentConcurrent/alias.js';

const repo = resolve(__dirname, '../../..');
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^lithent$/,
        replacement: resolve(repo, 'lithentConcurrent/src/index.ts'),
      },
      ...concurrentAlias(resolve(repo, 'lithentConcurrent')),
    ],
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'probe.ts'),
      formats: ['es'],
      fileName: () => 'probe.mjs',
    },
  },
});
