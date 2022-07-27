import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslintPlugin from '@nabla/vite-plugin-eslint';

export default defineConfig({
  plugins: [
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
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
});
