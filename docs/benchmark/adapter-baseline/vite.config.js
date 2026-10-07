import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      'lithent/helper': path.resolve(
        __dirname,
        '../../../../lithent/helper/dist/lithentHelper.mjs'
      ),
      lithent: path.resolve(__dirname, '../../../../lithent/dist/lithent.mjs'),
      '@': path.resolve(__dirname, '../../../../lithent/src'),
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
});
