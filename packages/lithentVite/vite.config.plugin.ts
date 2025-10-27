import { resolve } from 'path';
import { defineConfig } from 'vite';
import mdx from '@mdx-js/rollup';
import lithentVitePlugin from './src/plugin';

export default defineConfig({
  root: __dirname,
  publicDir: false,
  plugins: [
    mdx({
      jsxImportSource: 'lithent',
      outputFormat: 'esm',
    }),
    lithentVitePlugin({
      wrapMdx: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@lithent/hmr-parser': resolve(
        __dirname,
        '../hmrParser/src/index.ts'
      ),
    },
  },
  server: {
    open: '/html/parsor.html?target=mdx',
  },
  optimizeDeps: {
    include: ['lithent', 'lithent/devHelper'],
  },
});
