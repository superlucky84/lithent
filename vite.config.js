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
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'wact',
      // the proper extensions will be added
      fileName: 'wact',
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
