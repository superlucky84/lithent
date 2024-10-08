import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import dts from 'vite-plugin-dts';
export default defineConfig({
  plugins: [
    checker({ typescript: true }),
    eslint(),
    dts({
      outputDir: ['dist'],
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
      entry: resolve(__dirname, 'src'),
      name: 'lithent',
      fileName: format => {
        return format === 'umd' ? 'lithent.umd.js' : 'lithent.mjs';
      },
    },
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
  },
  server: {
    open: '/html/portal.html',
  },
});
