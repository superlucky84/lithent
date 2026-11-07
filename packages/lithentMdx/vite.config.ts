import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../../scripts/emit-declaration-formats.mjs';

export default defineConfig({
  plugins: [
    dts({
      outputDir: ['dist'],
      afterBuild: () =>
        emitDeclarationFormats(resolve(__dirname, 'dist'), {
          esmTypeImports: ['vite'],
        }),
    }),
  ],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'lithentMdx',
      formats: ['es', 'umd', 'cjs'],
      fileName: format => {
        if (format === 'cjs') return 'index.cjs';
        return format === 'umd' ? 'index.umd.js' : 'index.mjs';
      },
    },
    rollupOptions: {
      external: ['vite', 'lithent', '@mdx-js/rollup', '@lithent/hmr-parser'],
      output: {
        interop: 'auto',
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
