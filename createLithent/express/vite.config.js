import { resolve } from 'path';
import { defineConfig, build } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import fs from 'fs';

let cachedEntries = getEntries();

console.log('CACHEDENTRIES', cachedEntries);

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
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: cachedEntries,
      name: 'MyLibrary',
      formats: ['es'], // 원하는 포맷으로 설정 (ESM, UMD 등)
      fileName: (format, entryName) => `${entryName}.${format}.js`, // 출력 파일 이름 설정
    },
    rollupOptions: {
      // 각 엔트리마다 별도의 번들 파일을 생성
      input: cachedEntries,
      output: {
        globals: {
          lithent: 'lithent', // 글로벌 변수 설정 (필요시)
        },
        entryFileNames: '[name].[hash].js', // 출력 파일 이름
      },
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
