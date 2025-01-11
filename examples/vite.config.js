import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import mdx from '@mdx-js/rollup';

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{ts,tsx,mdx}"',
      },
    }),
    dts({
      outputDir: ['dist'],
    }),
    mdx({
      jsxImportSource: 'lithent',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
  },
  server: {
    open: '/html/mdx.html',
  },
});
