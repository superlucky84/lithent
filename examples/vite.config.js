import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import mdx from '@mdx-js/rollup';

export default defineConfig({
  oxc: { jsx: { runtime: 'automatic', importSource: 'lithent' } },
  plugins: [
    !process.env.VITEST &&
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{ts,tsx,mdx}"',
        },
      }),
    dts({
      outDir: ['dist'],
    }),
    mdx({
      jsxImportSource: 'lithent',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Preserve the browser target used before the Vite 8 migration.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    emptyOutDir: false,
    sourcemap: true,
  },
  server: {
    open: '/html/mdx.html',
  },
});
