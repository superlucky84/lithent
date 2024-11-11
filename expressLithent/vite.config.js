import { resolve } from 'path';
import { defineConfig, build } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import chokidar from 'chokidar'; // 파일 감시 모듈 추가

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
    {
      name: 'watch-entry-folder',
      configureServer() {
        const entriesDir = resolve(__dirname, 'src/pages');
        const watcher = chokidar.watch(entriesDir);

        async function rebuildIfChanged() {
          const newEntries = getEntries();

          // 기존 캐시된 목록과 새로운 목록을 비교하여 차이가 있을 때만 빌드
          if (JSON.stringify(cachedEntries) !== JSON.stringify(newEntries)) {
            cachedEntries = newEntries; // 캐시 업데이트
            await build({
              // 새로운 빌드 호출
              rollupOptions: {
                input: cachedEntries,
                external: mode === 'production' ? [] : [],
                output: {
                  globals: {
                    lithent: 'lithent',
                  },
                },
              },
              outDir: 'dist',
              emptyOutDir: true, // 전체를 삭제하지 않고 업데이트
            });
          }
        }

        watcher.on('add', rebuildIfChanged);
        watcher.on('unlink', rebuildIfChanged);
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: cachedEntries, // 초기 엔트리 설정
      external: mode === 'production' ? [] : [],
      output: {
        globals: {
          lithent: 'lithent',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
  },
  server: {
    open: '/html/jsxExample.html',
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
