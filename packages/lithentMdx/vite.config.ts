import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      outputDir: ['dist'],
    }),
  ],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'lithentMdx',
      formats: ['es', 'umd'],
      fileName: format => {
        return format === 'umd' ? 'index.umd.js' : 'index.mjs';
      },
    },
    rollupOptions: {
      external: ['vite', 'lithent', '@mdx-js/rollup', '@lithent/hmr-parser'],
      output: {
        globals: {
          vite: 'vite',
          lithent: 'lithent',
          '@mdx-js/rollup': 'mdxRollup',
          '@lithent/hmr-parser': 'lithentHmrParser',
        },
      },
    },
  },
  test: {
    environment: 'node',
    includeSource: ['src/**/*.test.ts'],
  },
});
