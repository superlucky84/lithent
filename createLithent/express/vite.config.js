import { resolve } from 'path';
import { defineConfig, build } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import tailwindcss from 'tailwindcss';

const cachedEntries = getEntries();

export default defineConfig(({ mode }) => ({
  plugins: [
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    dts({
      outputDir: ['dist'],
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: cachedEntries,
      formats: ['es'], // 원하는 포맷으로 설정 (ESM, UMD 등)
    },
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
  },
}));

function getEntries() {
  const entriesDir = resolve(__dirname, 'src/pages');
  const utilDir = resolve(__dirname, 'src');
  const files = fs.readdirSync(entriesDir);
  const entries = files.reduce((entries, file) => {
    const name = file; // 확장자 제거
    entries[name] = resolve(entriesDir, file);
    return entries;
  }, {});

  entries['utils.ts'] = `${utilDir}/utils.ts`;
  entries['route.ts'] = `${utilDir}/route.ts`;

  return entries;
}
