import { resolve } from 'path';
import { defineConfig } from 'vite';
import lithentVitePlugin from './src/plugin';

export default defineConfig({
  root: __dirname,
  publicDir: false,
  plugins: [
    lithentVitePlugin({
      include: [/\.([cm]?[tj]sx?)$/],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    open: '/html/parsor.html?target=hmr',
  },
  optimizeDeps: {
    include: ['lithent', 'lithent/devHelper'],
  },
});
