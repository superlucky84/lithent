import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import wwxVitePlugin from '@wwact/vite-plugin-wwx';

export default defineConfig({
  plugins: [
    wwxVitePlugin(),
    checker({ typescript: true }),
    eslintPlugin({ eslintOptions: { cache: false } }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'wwact',
      fileName: 'wwact',
    },
  },
  server: {
    open: '/html/wwxExample.html',
  },
});
