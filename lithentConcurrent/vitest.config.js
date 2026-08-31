import { resolve } from 'path';
import { defineConfig } from 'vite';
import { concurrentAlias } from './alias.js';

const repoRoot = resolve(__dirname, '..');

/**
 * Runs the SHARED core suite (`src/tests/*`) against the concurrent core.
 * The test files import `@/index`, which the alias table points at
 * `lithentConcurrent/src/index.ts` — so the very same specs prove that the
 * fork behaves identically to the frozen base core (IMPLEMENT 0-9).
 *
 * `root` is the repo root so the base suite is reachable by a plain glob.
 */
export default defineConfig({
  root: repoRoot,
  resolve: {
    alias: concurrentAlias(__dirname),
  },
  test: {
    environment: 'jsdom',
    includeSource: [
      'src/tests/*.{js,ts,jsx,tsx}',
      'lithentConcurrent/src/tests/*.{js,ts,jsx,tsx}',
    ],
    include: [
      'src/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'lithentConcurrent/src/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
