import { resolve } from 'path';
import { defineConfig } from 'vite';
import lithentTemplateVite from './src/plugin';

export default defineConfig({
  root: __dirname,
  publicDir: false,
  plugins: [lithentTemplateVite()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    open: '/html/index.html',
  },
  optimizeDeps: {
    include: ['lithent'],
  },
});
