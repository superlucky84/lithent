import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const core = process.env.LITHENT_CORE === 'concurrent' ? 'concurrent' : 'base';
export default defineConfig({
  root: __dirname,
  resolve: {
    alias: [
      {
        find: /^lithent$/,
        replacement: resolve(
          __dirname,
          core === 'base'
            ? '../../../dist/lithent.mjs'
            : '../../../lithentConcurrent/dist/lithentConcurrent.mjs'
        ),
      },
    ],
  },
  define: { __LITHENT_CORE__: JSON.stringify(core) },
  cacheDir: resolve(
    __dirname,
    '../../../node_modules/.vite-closure-demo',
    core
  ),
  server: { open: false },
  build: { outDir: `dist/${core}` },
});
