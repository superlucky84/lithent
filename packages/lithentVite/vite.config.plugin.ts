import { resolve } from 'path';
import { defineConfig } from 'vite';
import lithentVitePlugin from './src/plugin';

export default defineConfig({
  root: import.meta.dirname,
  publicDir: false,
  plugins: [lithentVitePlugin()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    open: '/html/parsor.html',
  },
  optimizeDeps: {
    include: ['lithent', 'lithent/devHelper'],
  },
});
