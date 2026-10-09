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
      name: 'lithentTag',
      fileName: format => {
        if (format === 'cjs') return 'lithentTag.cjs';
        return format === 'umd' ? 'lithentTag.umd.js' : 'lithentTag.mjs';
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
  server: {
    open: '/html/jsxExample.html',
  },
});
