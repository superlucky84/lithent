import { resolve } from 'path';
import { defineConfig } from 'vite';

/**
 * Dev server for the T2 entry gate measurement (IMPLEMENT Phase 7, RC-7).
 *
 * Separate from `vitedev.config.js` on purpose: that one runs the SOURCE
 * through the fork's alias table, which is right for a behaviour demo and wrong
 * for a timing one. Comparing unbundled source against a minified bundle would
 * measure the build, not the core. Both cores here are the BUILT artifacts, so
 * the numbers describe what actually ships.
 *
 * Requires `pnpm build` (or at least `build:core` + `build:concurrent`).
 */
export default defineConfig({
  root: __dirname,
  resolve: {
    alias: [
      {
        find: /^bench-core-base$/,
        replacement: resolve(__dirname, '..', 'dist/lithent.mjs'),
      },
      {
        find: /^bench-core-concurrent$/,
        replacement: resolve(__dirname, 'dist/lithentConcurrent.mjs'),
      },
    ],
  },
  // Only this page. Without it vite's dep scanner also crawls the section B
  // demo, which imports the concurrent helper this config deliberately does not
  // alias — a resolve error for a page that is not even being served here.
  optimizeDeps: {
    entries: ['html/units.html'],
  },
  server: {
    open: process.env.LITHENT_NO_OPEN ? false : '/html/units.html',
    fs: { allow: [resolve(__dirname, '..')] },
  },
});
