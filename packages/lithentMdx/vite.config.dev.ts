import { resolve } from 'path';
import { defineConfig } from 'vite';
import lithentMdxPlugin from './src/plugin';
import { lithentVitePlugin } from '../lithentVite/src/plugin';

export default defineConfig({
  root: __dirname,
  publicDir: false,
  plugins: [lithentMdxPlugin(), lithentVitePlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    open: '/html/index.html',
  },
  optimizeDeps: {
    include: ['lithent', 'lithent/devHelper'],
  },
});
