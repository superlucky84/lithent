import { resolve } from 'path';
import { defineConfig } from 'vite';
export default defineConfig({
  logLevel: 'error',
  build: {
    outDir: resolve(import.meta.dirname, 'out'),
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'listBoundary.helper.ts'),
      name: 'probe',
      formats: ['umd', 'es'],
      fileName: f => `probe.${f}.js`,
    },
    rollupOptions: {
      external: ['lithent'],
      output: { globals: { lithent: 'lithent' } },
    },
  },
});
