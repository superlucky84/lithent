/**
 * Builds the four versions of the widget with the same settings
 * (docs/widget-compare/DESIGN.md §3), gives each one the template's host
 * page, records the bundle sizes in dist/sizes.json and writes the
 * comparison page, dist/index.html.
 *
 *   pnpm --filter lithent-widget-compare build
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build } from 'vite';
import lithentVitePlugin from '@lithent/lithent-vite';
import { dist, frameworks, root, template } from './frameworks.mjs';
import { writePage } from './page.mjs';

// The template's settings: customer pages run on browsers you do not choose.
const target = ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'];
// How the template's index.html loads the widget during development.
const DEV_SCRIPT = '<script type="module" src="/src/main.ts"></script>';

const hostPage = readFileSync(resolve(template, 'index.html'), 'utf8');
if (!hostPage.includes(DEV_SCRIPT))
  throw new Error(`createLithent/widget/index.html must contain ${DEV_SCRIPT}`);

for (const framework of frameworks) {
  const outDir = resolve(dist, framework.id);
  await build({
    configFile: false,
    root,
    mode: 'production',
    logLevel: 'warn',
    // lithent: the template's plugin, which sets the JSX import source
    // and, in a build, nothing else.
    plugins: framework.id === 'lithent' ? [lithentVitePlugin()] : [],
    ...(framework.jsx && {
      oxc: { jsx: { runtime: 'automatic', importSource: framework.jsx } },
    }),
    // Library mode leaves process.env alone; without this React would ship
    // its development build.
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    build: {
      outDir,
      emptyOutDir: true,
      copyPublicDir: false,
      target,
      sourcemap: false,
      lib: {
        entry: framework.entry,
        formats: ['iife'],
        name: 'feedbackWidget',
        fileName: () => 'widget.js',
      },
    },
  });
  // The same customer page for every version, loading the bundle with a
  // plain <script> tag.
  writeFileSync(
    resolve(outDir, 'index.html'),
    hostPage.replace(DEV_SCRIPT, '<script src="./widget.js"></script>')
  );
}

// Sized the way the template's scripts/size.mjs sizes its bundle.
const sizes = {};
for (const framework of frameworks) {
  const code = readFileSync(resolve(dist, framework.id, 'widget.js'));
  sizes[framework.id] = {
    raw: code.length,
    gzip: gzipSync(code).length,
    brotli: brotliCompressSync(code).length,
    sha256: createHash('sha256').update(code).digest('hex'),
    packages: framework.packages,
  };
}
writeFileSync(
  resolve(dist, 'sizes.json'),
  `${JSON.stringify(sizes, null, 2)}\n`
);

const kb = bytes => `${(bytes / 1024).toFixed(2)} KB`.padStart(10);
console.log(`\n${'bundle'.padEnd(20)}       raw      gzip    brotli`);
for (const framework of frameworks) {
  const { raw, gzip, brotli } = sizes[framework.id];
  console.log(
    `${`${framework.id}/widget.js`.padEnd(20)}${kb(raw)}${kb(gzip)}${kb(brotli)}`
  );
}

writePage(sizes);
