import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';

/**
 * RC-9 — run this suite against either core.
 * `LITHENT_CORE=concurrent` points the bare `lithent` specifier at the built
 * concurrent bundle, exactly as a consumer would alias it in their bundler.
 * Requires `pnpm build:concurrent` first.
 *
 * The match is anchored: subpath entries (`lithent/jsx-dev-runtime`,
 * `lithent/helper`, …) must keep resolving to the real package — only the core
 * is swapped.
 */
const coreAlias =
  process.env.LITHENT_CORE === 'concurrent'
    ? [
        {
          find: /^lithent$/,
          replacement: resolve(
            __dirname,
            '../lithentConcurrent/dist/lithentConcurrent.mjs'
          ),
        },
      ]
    : [];

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
    }),
  ],
  resolve: {
    alias: [
      ...coreAlias,
      { find: '@', replacement: resolve(__dirname, './src') },
    ],
  },
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'lithentDevHelper',
      fileName: format => {
        return format === 'umd'
          ? 'lithentDevHelper.umd.js'
          : 'lithentDevHelper.mjs';
      },
    },
    rollupOptions: {
      external: ['lithent'],
      output: {
        globals: {
          lithent: 'lithent',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
  },
  server: {
    open: '/html/hmr.html',
  },
});
