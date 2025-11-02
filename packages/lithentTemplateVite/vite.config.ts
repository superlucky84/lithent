import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';

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
      skipDiagnostics: true,
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
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'lithentTemplateVite',
      fileName: format => (format === 'umd' ? 'index.umd.js' : 'index.mjs'),
    },
    rollupOptions: {
      external: [
        'vite',
        '@lithent/lithent-template-parser',
        'node:fs',
        'node:fs/promises',
        'node:path',
      ],
      output: {
        globals: {
          vite: 'vite',
          '@lithent/lithent-template-parser': 'lithentTemplateParser',
        },
      },
    },
  },
});
