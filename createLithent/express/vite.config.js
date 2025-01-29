import { resolve } from 'path';
import { defineConfig, build } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import fs from 'fs';
import mdx from '@mdx-js/rollup';

const cachedEntries = getEntries();

function fixMdxExports() {
  return {
    name: 'fix-mdx-exports',
    transform(code, id) {
      if (id.endsWith('.mdx')) {
        const fixedCode = code
          .replace(
            /^(?!export )function\s+_createMdxContent/gm,
            'export function _createMdxContent'
          )
          .replace(
            /^(?!export )function\s+MDXContent/gm,
            'export default function MDXContent'
          );

        return {
          code: fixedCode,
          map: null,
        };
      }
      return null;
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    dts({
      outputDir: ['dist'],
    }),
    mdx({
      jsxImportSource: 'lithent', // Preact의 JSX pragma 사용
      outputFormat: 'esm',
    }),
    fixMdxExports(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: cachedEntries,
      formats: ['es'],
      fileName: format => `[name]-[hash].${format}.js`, // 파일 이름 패턴 지정
    },
    rollupOptions: {
      output: {
        // 파일 구조를 유지하는 설정
        entryFileNames: assetInfo => {
          const relativePath = assetInfo.facadeModuleId.replace(
            `${resolve(__dirname, 'src')}/`,
            ''
          );
          const dir = relativePath.substring(0, relativePath.lastIndexOf('/'));
          return dir ? `${dir}/[name]-[hash].js` : `[name]-[hash].js`;
        },
        assetFileNames: assetInfo => {
          const relativePath = assetInfo.name.replace(
            `${resolve(__dirname, 'src')}/`,
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
  const entriesDir = resolve(__dirname, 'src/pages');
  const utilDir = resolve(__dirname, 'src');
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
