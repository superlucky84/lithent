import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import lithentMdx from '@lithent/lithent-mdx';
import lithentVitePlugin from '@lithent/lithent-vite';

const cachedEntries = getEntries();

export default defineConfig(({ mode }) => ({
  plugins: [
    !process.env.VITEST &&
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
      }),
    dts({
      outDir: ['dist'],
    }),
    lithentMdx(),
    lithentVitePlugin(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Preserve the browser target used before the Vite 8 migration.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    lib: {
      // The production server resolves the stylesheet by its stable prefix.
      cssFileName: 'style',
      entry: cachedEntries,
      formats: ['es'],
      fileName: format => `[name]-[hash].${format}.js`, // 파일 이름 패턴 지정
    },
    rolldownOptions: {
      output: {
        // 파일 구조를 유지하는 설정
        entryFileNames: assetInfo => {
          const relativePath = assetInfo.facadeModuleId.replace(
            `${resolve(import.meta.dirname, 'src')}/`,
            ''
          );
          const dir = relativePath.substring(0, relativePath.lastIndexOf('/'));
          return dir ? `${dir}/[name]-[hash].js` : `[name]-[hash].js`;
        },
        assetFileNames: assetInfo => {
          const relativePath = assetInfo.name.replace(
            `${resolve(import.meta.dirname, 'src')}/`,
            ''
          );
          const dir = relativePath.substring(0, relativePath.lastIndexOf('/'));
          return dir
            ? `${dir}/[name]-[hash][extname]`
            : `[name]-[hash][extname]`;
        },
        chunkFileNames: assetInfo => {
          return `[name]-[hash].js`;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
  },
}));

function getEntries() {
  const entriesDir = resolve(import.meta.dirname, 'src/pages');
  const utilDir = resolve(import.meta.dirname, 'src');
  const files = fs.readdirSync(entriesDir);
  const entries = files.reduce((entries, file) => {
    const name = file; // 확장자 제거
    entries[name] = resolve(entriesDir, file);
    return entries;
  }, {});

  entries['load.ts'] = `${utilDir}/base/load.ts`;
  entries['layout.tsx'] = `${utilDir}/layout.tsx`;
  entries['Oops.tsx'] = `${utilDir}/components/Oops.tsx`;
  entries['NotFound.tsx'] = `${utilDir}/components/NotFound.tsx`;

  return entries;
}
