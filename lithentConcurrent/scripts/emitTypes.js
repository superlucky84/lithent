/**
 * Declaration emission for the concurrent build.
 *
 * `vite-plugin-dts` assumes a single source root; this package deliberately has
 * two (`lithentConcurrent/src` for the branched modules, `../src` for the 709
 * shared lines), so declarations are emitted by plain `tsc` instead and the
 * `@/…` specifiers are rewritten to relative paths here.
 *
 * The rewrite uses `forkModules` from `alias.js` — the SAME table the bundler
 * and the test runner use — so the type surface can never disagree with the
 * runtime graph about which module is the branched one.
 *
 * Emitted layout (rootDir is the repo root):
 *   dist/types/lithentConcurrent/src/*.d.ts   branched
 *   dist/types/src/**\/*.d.ts                  shared
 */
import { execFileSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { forkModules } from '../alias.js';

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const typesDir = resolve(pkgDir, 'dist/types');
const forkDir = resolve(typesDir, 'lithentConcurrent/src');
const sharedDir = resolve(typesDir, 'src');

execFileSync('tsc', ['-p', resolve(pkgDir, 'tsconfig.build.json')], {
  cwd: pkgDir,
  stdio: 'inherit',
});

const walk = dir =>
  readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory()
      ? walk(full)
      : full.endsWith('.d.ts')
        ? [full]
        : [];
  });

/** `@/wDom` -> absolute path of the emitted declaration it refers to. */
const targetOf = specifier =>
  forkModules[specifier]
    ? join(forkDir, forkModules[specifier])
    : join(sharedDir, specifier.slice('@/'.length));

const toRelative = (fromFile, specifier) => {
  const rel = relative(dirname(fromFile), targetOf(specifier));
  return rel.startsWith('.') ? rel : `./${rel}`;
};

let rewritten = 0;
for (const file of walk(typesDir)) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(
    /(from\s+|import\s*\()(['"])(@\/[^'"]+)\2/g,
    (_all, head, quote, specifier) =>
      `${head}${quote}${toRelative(file, specifier)}${quote}`
  );
  if (after !== before) {
    writeFileSync(file, after);
    rewritten += 1;
  }
}

const leftovers = walk(typesDir).filter(f =>
  /from\s+['"]@\//.test(readFileSync(f, 'utf8'))
);
if (leftovers.length) {
  console.error('[emitTypes] unresolved "@/" specifiers in:', leftovers);
  process.exit(1);
}

console.log(`[emitTypes] declarations emitted, ${rewritten} file(s) rewritten`);
