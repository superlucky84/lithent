import { resolve } from 'path';
import { defineConfig, build } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import fs from 'fs';

let cachedEntries = getEntries();

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
        entryFileNames: '[name].js', // 출력 파일 이름
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
  const files = fs.readdirSync(entriesDir);

  return files.reduce((entries, file) => {
    const name = file.replace(/\.js$/, ''); // 확장자 제거
    entries[name] = resolve(entriesDir, file);
    return entries;
  }, {});
}
