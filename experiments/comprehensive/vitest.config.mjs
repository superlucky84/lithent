import path from 'node:path';
import fs from 'node:fs';
import { defineConfig } from 'vitest/config';
import { root } from './init.mjs';
import { forkModules } from '../../lithentConcurrent/alias.js';

if (!process.env.LITHENT_FINAL_SOURCE)
  throw Error('Set LITHENT_FINAL_SOURCE to the frozen runtime directory');
const shared = path.resolve(process.env.LITHENT_FINAL_SOURCE, 'src');
const stagedConcurrent = path.resolve(
  process.env.LITHENT_FINAL_SOURCE,
  'lithentConcurrent/src'
);
const concurrentRoot = fs.existsSync(stagedConcurrent)
  ? stagedConcurrent
  : path.join(root, 'lithentConcurrent/src');
const hasProof =
  /\/(c2|combined)$/.test(process.env.LITHENT_FINAL_SOURCE) &&
  process.env.LITHENT_CORE !== 'concurrent';
const branched =
  process.env.LITHENT_CORE === 'concurrent'
    ? Object.entries(forkModules).map(([specifier, name]) => ({
        find: new RegExp(`^${specifier.replaceAll('/', '\\/')}$`),
        replacement: path.join(concurrentRoot, `${name}.ts`),
      }))
    : [];
export default defineConfig({
  root,
  plugins: [
    {
      name: 'frozen-relative-concurrent-imports',
      enforce: 'pre',
      resolveId(source, importer) {
        if (
          process.env.LITHENT_CORE !== 'concurrent' ||
          !importer ||
          !source.startsWith('.')
        )
          return null;
        const resolved = path.resolve(path.dirname(importer), source);
        const prefix = path.join(root, 'lithentConcurrent/src') + path.sep;
        if (!resolved.startsWith(prefix) || resolved.includes('/tests/'))
          return null;
        const target = path.join(concurrentRoot, resolved.slice(prefix.length));
        return fs.existsSync(target + '.ts') ? target + '.ts' : null;
      },
    },
  ],
  resolve: {
    alias: [...branched, { find: /^@\//, replacement: `${shared}/` }],
  },
  test: {
    environment: 'jsdom',
    include: [
      'src/tests/*.{ts,tsx}',
      ...(hasProof ? ['experiments/keyed-placement/lifetime.test.tsx'] : []),
      ...(process.env.LITHENT_CORE === 'concurrent'
        ? ['lithentConcurrent/src/tests/**/*.{test,spec}.{ts,tsx}']
        : []),
    ],
    includeSource: ['src/tests/*.{ts,tsx}'],
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
