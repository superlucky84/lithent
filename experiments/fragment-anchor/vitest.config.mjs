import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { concurrentAlias } from '../../lithentConcurrent/alias.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
export default defineConfig({
  root,
  resolve: {
    alias:
      process.env.LITHENT_CORE === 'concurrent'
        ? concurrentAlias(path.join(root, 'lithentConcurrent'))
        : [
            {
              find: '@',
              replacement: path.resolve(
                process.env.LITHENT_ANCHOR_SOURCE || root,
                'src'
              ),
            },
          ],
  },
  test: {
    environment: 'jsdom',
    include: ['src/tests/*.{ts,tsx}'],
    // Manual/demo fixtures contain no test declarations.
    exclude: [
      'src/tests/core-callback.tsx',
      'src/tests/core-insert.tsx',
      'src/tests/core-lmount.tsx',
      'src/tests/core-textarea.tsx',
      'src/tests/loopWithoutKey.tsx',
    ],
    maxWorkers: 1,
    minWorkers: 1,
  },
});
