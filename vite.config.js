import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslintPlugin from '@nabla/vite-plugin-eslint';

export default ({ path, name, fileName }) => {
  return defineConfig({
    plugins: [
      // checker({ typescript: true }),
      eslintPlugin({ eslintOptions: { cache: false } }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, path),
        name,
        fileName,
      },
    },
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    },
  });
};
