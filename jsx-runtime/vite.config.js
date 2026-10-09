import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../scripts/emit-declaration-formats.mjs';

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    dts({
      outputDir: ['dist'],
      afterBuild: () => emitDeclarationFormats(resolve(__dirname, 'dist')),
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
    lib: {
      formats: ['es', 'umd', 'cjs'],
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'jsxRuntime',
      fileName: format => {
        if (format === 'cjs') return 'jsxRuntime.cjs';
        return format === 'umd' ? 'jsxRuntime.umd.js' : 'jsxRuntime.mjs';
      },
    },
    rollupOptions: {
      external: ['lithent'],
      output: {
        globals: {
          lithent: 'lithent',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
  },
  server: {
    open: '/html/jsxExample.html',
  },
});
