import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { emitDeclarationFormats } from '../../scripts/emit-declaration-formats.mjs';

export default defineConfig({
  // Keep callable defaults when CJS consumers require ESM-only externals.
  legacy: { inconsistentCjsInterop: true },
  oxc: {
    jsx: {
      runtime: 'classic',
      development: false,
      pragma: 'h',
      pragmaFrag: 'Fragment',
    },
  },
  plugins: [
    !process.env.VITEST &&
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
      }),
    dts({
      outDir: ['dist'],
      entryRoot: resolve(import.meta.dirname, 'src'),
      aliasesExclude: ['@lithent/lithent-template-vite'],
      afterBuild: () =>
        emitDeclarationFormats(resolve(import.meta.dirname, 'dist'), {
          esmTypeImports: ['vite', '@lithent/lithent-template-vite'],
        }),
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      '@lithent/hmr-parser': resolve(
        import.meta.dirname,
        '../hmrParser/src/index.ts'
      ),
      '@lithent/lithent-template-vite': resolve(
        import.meta.dirname,
        '../lithentTemplateVite/src/index.ts'
      ),
    },
  },
  build: {
    // Preserve the browser target used before the Vite 8 migration.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'lithentVite',
      formats: ['es', 'umd', 'cjs'],
      fileName: format =>
        format === 'cjs'
          ? 'index.cjs'
          : format === 'umd'
            ? 'index.umd.js'
            : 'index.mjs',
    },
    rolldownOptions: {
      external: [
        'vite',
        'lithent',
        '@lithent/hmr-parser',
        '@lithent/lithent-template-vite',
      ],
      output: {
        exports: 'named',
        globals: {
          vite: 'vite',
          lithent: 'lithent',
          '@lithent/hmr-parser': 'lithentHmrParser',
          '@lithent/lithent-template-vite': 'lithentTemplateVite',
        },
      },
    },
  },
  server: {
    port: 4000,
    open: '/html/parsor.html',
  },
});
