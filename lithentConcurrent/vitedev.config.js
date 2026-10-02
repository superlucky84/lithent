import { resolve } from 'path';
import { defineConfig } from 'vite';
import { concurrentAlias } from './alias.js';

/**
 * Dev server for the manual scheduler checks (MANUAL_TEST_CHECKLIST section B).
 *
 * Separate from `vite.config.js` because that one is a library build: it has no
 * html root, and its `build.lib` entry is irrelevant here. The alias table is
 * shared so the page runs the same module graph the bundle is built from.
 *
 * `fs.allow` reaches one level up because the shared 709 lines live in
 * `../src` — outside this package's root.
 */
export default defineConfig({
  root: __dirname,
  resolve: {
    alias: [
      ...concurrentAlias(__dirname),
      {
        find: /^lithent-concurrent$/,
        replacement: resolve(__dirname, 'src/index.ts'),
      },
      {
        // The built bundle, not the source: the helper package aliases its own
        // `@` to its own `src`, which would collide with the core's `@` here.
        // Run `pnpm build:concurrentHelper` first (`pnpm dev:concurrent` does).
        find: /^lithent-concurrent-helper$/,
        replacement: resolve(
          __dirname,
          'helper/dist/lithentConcurrentHelper.mjs'
        ),
      },
    ],
  },
  server: {
    // LITHENT_NO_OPEN lets a headless check start the server without
    // launching a browser.
    open: process.env.LITHENT_NO_OPEN ? false : '/html/transition.html',
    fs: { allow: [resolve(__dirname, '..')] },
  },
});
