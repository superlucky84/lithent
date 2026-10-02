import { resolve } from 'path';
import { defineConfig } from 'vite';

/**
 * The consumer's own build config — nothing from this repo's internals.
 *
 * `LITHENT_CORE=concurrent` swaps the core exactly the way the README tells a
 * consumer to. Two things about that alias are load-bearing:
 *
 *   - it is ANCHORED (`/^lithent$/`). A prefix match would rewrite
 *     `lithent/helper` and `lithent/jsx-runtime` too, which is how the ssr suite
 *     broke in Phase 0.
 *   - it points at the BUILT bundle, i.e. what npm would install.
 */
const swapCore = process.env.LITHENT_CORE === 'concurrent';

export default defineConfig({
  root: __dirname,
  esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
  resolve: {
    alias: swapCore
      ? [
          {
            find: /^lithent$/,
            replacement: resolve(__dirname, '../dist/lithentConcurrent.mjs'),
          },
        ]
      : [],
  },
  server: {
    open: process.env.LITHENT_NO_OPEN ? false : '/index.html',
    fs: { allow: [resolve(__dirname, '..', '..')] },
  },
});
