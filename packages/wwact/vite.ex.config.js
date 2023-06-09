import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import wwxVitePlugin from '@wwact/vite-plugin-wwx';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    wwxVitePlugin(),
    checker({ typescript: true }),
    eslintPlugin({ eslintOptions: { cache: false } }),
    dts({
      outputDir: ['dist', 'types'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      wwact: resolve(__dirname, './src/index.ts'),
      wwactStore: resolve(__dirname, './src/wwactStore.ts'),
    },
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/wwactStore.ts'),
      name: 'wwactStore',
      fileName: 'wwactStore',
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
    open: '/html/jsxExample.html',
  },
});
