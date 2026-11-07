import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const source =
  process.env.LITHENT_C3_SOURCE ||
  '/tmp/lithent-c3-isolated-20261022/runtime/src';
if (!existsSync(resolve(source, 'hook/useParentMemo.ts')))
  throw Error('Build the isolated candidate first');

export default defineConfig({
  root: resolve(__dirname, '../..'),
  resolve: { alias: { '@': source } },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
    include: [
      'src/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'experiments/parent-memo/tests/**/*.test.tsx',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
