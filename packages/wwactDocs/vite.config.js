import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    checker({ typescript: true }),
    eslintPlugin({ eslintOptions: { cache: false } }),
    dts({
      outputDir: ['dist', 'types'],
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
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'wwactDocs',
      fileName: 'wwactDocs',
    },
    rollupOptions: {
      external: ['wwact'],
      output: {
        globals: {
          wwact: 'wwact',
        },
      },
    },
  },
  server: {
    open: '/html/index.html',
  },
});