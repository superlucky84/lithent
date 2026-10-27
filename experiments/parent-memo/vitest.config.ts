import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: resolve(__dirname, '../..'),
  resolve: { alias: { '@': resolve(__dirname, '../../src') } },
  test: {
    environment: 'jsdom',
    include: ['experiments/parent-memo/tests/**/*.test.tsx'],
  },
});
