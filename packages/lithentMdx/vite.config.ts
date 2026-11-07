import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../../scripts/emit-declaration-formats.mjs';

export default defineConfig({
  // Keep callable defaults when CJS consumers require ESM-only externals.
  legacy: { inconsistentCjsInterop: true },
  oxc: { jsx: { runtime: 'automatic', importSource: 'lithent' } },
  plugins: [
    dts({
      outDir: ['dist'],
      afterBuild: () =>
        emitDeclarationFormats(resolve(import.meta.dirname, 'dist'), {
          esmTypeImports: ['vite'],
        }),
    }),
  ],
  build: {
    // Preserve the browser target used before the Vite 8 migration.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'lithentMdx',
      formats: ['es', 'umd', 'cjs'],
      fileName: format => {
        if (format === 'cjs') return 'index.cjs';
        return format === 'umd' ? 'index.umd.js' : 'index.mjs';
      },
    },
    rolldownOptions: {
      external: ['vite', 'lithent', '@mdx-js/rollup', '@lithent/hmr-parser'],
      output: {
        exports: 'named',
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
