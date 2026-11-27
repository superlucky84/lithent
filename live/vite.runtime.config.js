import { resolve } from 'path';
import { defineConfig } from 'vite';

/**
 * Sandbox runtime build (docs/agent-ui DESIGN §3.2, DC-6, DC-9 ≤ 11,000 B):
 * one self-contained script for the sandbox iframe with lithent, the helper
 * states, ftags, tag and lithent/agent bundled in, exposing
 * `lithentLiveRuntime.start(config)`. Nothing is external: the iframe loads
 * this file alone. scripts/build-runtime-module.mjs then wraps it as the
 * `sandboxRuntimeCode` string of `lithent/live/runtime`.
 */
export default defineConfig({
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    emptyOutDir: false,
    sourcemap: false,
    lib: {
      formats: ['umd'],
      entry: resolve(import.meta.dirname, 'src/runtime/entry.ts'),
      name: 'lithentLiveRuntime',
      fileName: () => 'sandboxRuntime.umd.js',
    },
  },
});
