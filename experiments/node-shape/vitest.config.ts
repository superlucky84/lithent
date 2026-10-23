import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const source = process.env.LITHENT_SHAPE_SOURCE;
if (!source)
  throw Error('Set LITHENT_SHAPE_SOURCE to the isolated candidate src');
export default defineConfig({
  root: resolve(__dirname, '../..'),
  resolve: { alias: { '@': source } },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
    include: ['src/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
