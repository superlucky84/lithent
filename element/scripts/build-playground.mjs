#!/usr/bin/env node
/**
 * Builds the cat widget playground into one self-contained HTML file, with
 * the lithent core UMD, the lithent/element UMD and the playground script
 * inlined, so it opens from the file system in any browser (no server).
 *
 *   node scripts/build-playground.mjs        -> playground/dist/playground.html,
 *       and playground-concurrent.html when the concurrent core is built.
 *       (Not element/dist: that folder ships in the npm package.)
 *   node scripts/build-playground.mjs --core base|concurrent  -> just that one
 *   node scripts/build-playground.mjs --fragment out.html
 *       body-level markup only (title and styles first), for hosts that add
 *       their own document skeleton
 *
 * Needs `pnpm build:core` (or build:concurrent) and `pnpm build:element`.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, '..');
const repo = resolve(pkg, '..');
const args = process.argv.slice(2);
const option = name => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

const coreFile = {
  base: resolve(repo, 'dist/lithent.umd.js'),
  concurrent: resolve(repo, 'lithentConcurrent/dist/lithentConcurrent.umd.js'),
};
const requested = option('--core');
const cores = requested
  ? [requested]
  : option('--fragment')
    ? ['base']
    : ['base', ...(existsSync(coreFile.concurrent) ? ['concurrent'] : [])];

const read = path => {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    console.error(`Missing ${path}. Build it first.`);
    process.exit(1);
  }
};
// Inline scripts must not close the tag early or point at absent maps.
const inline = code =>
  code
    .replace(/\/\/# sourceMappingURL=.*$/gm, '')
    .replace(/<\/script/gi, '<\\/script');

const template = read(resolve(pkg, 'playground/index.html'));
const [head, body] = template.split('<!-- body -->');
if (body === undefined)
  throw new Error('index.html needs a <!-- body --> marker');

const build = core => {
  const concurrent = core === 'concurrent';
  const scripts = [
    `<script>${inline(read(coreFile[core]))}</script>`,
    concurrent
      ? '<script>window.lithent = window.lithentConcurrent;</script>'
      : '',
    `<script>${inline(read(resolve(pkg, 'dist/lithentElement.umd.js')))}</script>`,
  ].join('\n');
  const page = body
    .replace('<!--LITHENT_SCRIPTS-->', () => scripts)
    .replace(
      '<!--PLAYGROUND_SCRIPT-->',
      () =>
        `<script>${inline(read(resolve(pkg, 'playground/playground.js')))}</script>`
    );

  const fragment = option('--fragment');
  if (fragment) {
    writeFileSync(fragment, `${head}\n${page}`);
    console.log(`playground fragment -> ${fragment}`);
  } else {
    const out = resolve(
      pkg,
      concurrent
        ? 'playground/dist/playground-concurrent.html'
        : 'playground/dist/playground.html'
    );
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(
      out,
      `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
${head}
</head>
<body>
${page}
</body>
</html>
`
    );
    console.log(
      `playground -> ${out} (${concurrent ? 'concurrent' : 'base'} core)`
    );
  }
};

cores.forEach(build);
