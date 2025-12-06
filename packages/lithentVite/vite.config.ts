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
      '@lithent/hmr-parser': resolve(__dirname, '../hmrParser/src/index.ts'),
      '@lithent/lithent-template-vite': resolve(
        __dirname,
        '../lithentTemplateVite/src/index.ts'
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
      external: [
        'vite',
        'lithent',
        '@lithent/hmr-parser',
        '@lithent/lithent-template-vite',
      ],
      output: {
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
