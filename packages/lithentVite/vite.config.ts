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
      '@lithent/hmr-parser': resolve(
        __dirname,
        '../hmrParser/src/index.ts'
      ),
    },
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'lithentVite',
      fileName: format => (format === 'umd' ? 'index.umd.js' : 'index.mjs'),
    },
    rollupOptions: {
      external: ['vite', 'lithent'],
      output: {
        globals: {
          vite: 'vite',
          lithent: 'lithent',
        },
      },
    },
  },
  server: {
    port: 4000,
    open: '/html/parsor.html',
  },
});
