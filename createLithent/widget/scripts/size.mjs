/**
 * Prints the size of the built bundles and fails when the <script> bundle
 * grows past the budget. Every byte here is downloaded by your customers'
 * visitors, on pages you do not own, so keep an eye on it.
 *
 *   npm run size     # after npm run build
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

// Brotli bytes allowed for dist/<name>.js. Raise it on purpose, not by accident.
const BUDGET = 10 * 1024;

const root = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const name = pkg.name.replace(/^@[^/]+\//, '');

const kb = bytes => `${(bytes / 1024).toFixed(2)} KB`.padStart(9);

const files = [`${name}.js`, `${name}.mjs`];
const width = Math.max(...files.map(file => `dist/${file}`.length)) + 2;

let scriptBrotli = 0;
console.log(`\n${'file'.padEnd(width)}      raw      gzip    brotli`);
for (const file of files) {
  let code;
  try {
    code = readFileSync(resolve(root, 'dist', file));
  } catch {
    console.error(`dist/${file} is missing. Run npm run build first.`);
    process.exit(1);
  }
  const brotli = brotliCompressSync(code).length;
  if (file.endsWith('.js')) scriptBrotli = brotli;
  console.log(
    `${`dist/${file}`.padEnd(width)}${kb(code.length)} ${kb(gzipSync(code).length)} ${kb(brotli)}`
  );
}

if (scriptBrotli > BUDGET) {
  console.error(
    `\ndist/${name}.js is ${kb(scriptBrotli).trim()} brotli, over the ${kb(BUDGET).trim()} budget in scripts/size.mjs.`
  );
  process.exit(1);
}
console.log(
  `\nWithin the ${kb(BUDGET).trim()} brotli budget (scripts/size.mjs).`
);
