import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';

export default defineConfig({
  plugins: [eslintPlugin({ eslintOptions: { cache: false } })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/Wwveal.jsx'),
      name: 'Wwveal',
      fileName: 'Wwveal',
    },
    rollupOptions: {
      external: ['wwact'],
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
});
