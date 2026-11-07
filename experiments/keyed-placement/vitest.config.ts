import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const source = process.env.LITHENT_C2_SOURCE;
if (!source) throw Error('Set LITHENT_C2_SOURCE to the isolated runtime src');
export default defineConfig({
  root: resolve(__dirname, '../..'),
  resolve: { alias: { '@': source } },
  test: {
    environment: 'jsdom',
    includeSource: ['src/tests/*.{js,ts,jsx,tsx}'],
    include: [
      'src/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'experiments/keyed-placement/lifetime.test.tsx',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
