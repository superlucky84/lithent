import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { build } from 'vite';
import { minify } from 'terser';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = path.resolve(process.argv[2]);
const base = '8056e0243c49a29ec9f4efcf5b00f90f6c1bbca7';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert(
  !fs.existsSync(path.join(out, 'build.json')),
  'Use a fresh output directory'
);
fs.mkdirSync(out, { recursive: true });
const execute = promisify(execFile);
const git = async args =>
  (await execute('git', args, { cwd: root, encoding: 'buffer' })).stdout;
const sources = (await git(['ls-tree', '-r', '--name-only', base, '--', 'src']))
  .toString()
  .trim()
  .split('\n')
  .filter(file => !file.startsWith('src/tests/'));
const manifest = {
  base,
  at: new Date().toISOString(),
  node: process.version,
  files: {},
  bundles: {},
};
for (const variant of ['baseline', 'candidate']) {
  const stage = path.join(out, variant, 'source');
  const files = {};
  for (const file of sources) {
    const bytes =
      variant === 'baseline'
        ? await git(['show', `${base}:${file}`])
        : fs.readFileSync(path.join(root, file));
    const dest = path.join(stage, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, bytes);
    files[file] = hash(bytes);
    if (variant === 'candidate' && file !== 'src/render.ts')
      assert.equal(files[file], manifest.files.baseline[file], file);
  }
  manifest.files[variant] = files;
  for (const lane of ['production', 'diagnostic']) {
    const source = path.join(
      out,
      variant,
      lane === 'production' ? 'source' : 'diagnostic-source'
    );
    if (lane === 'diagnostic') {
      fs.cpSync(stage, source, { recursive: true });
      const renderer = path.join(source, 'src/render.ts');
      let code = fs.readFileSync(renderer, 'utf8');
      const one = (from, to) => {
        assert.equal(code.split(from).length, 2, from);
        code = code.replace(from, to);
      };
      one(
        'const DF =',
        'const anchorMetrics = ((globalThis as any).__anchorMetrics = { slices: 0, copied: 0, singleton: 0, visits: 0, nodeReads: 0 });\nconst DF ='
      );
      if (variant === 'baseline') {
        one(
          'brothers.slice(brothers.indexOf(wDom) + 1)',
          '(anchorMetrics.slices++, anchorMetrics.copied += brothers.length - (brothers.indexOf(wDom) + 1), brothers.slice(brothers.indexOf(wDom) + 1))'
        );
        one(
          'children.slice(tail)',
          '(anchorMetrics.slices++, anchorMetrics.copied += children.length - tail, children.slice(tail))'
        );
        one(
          'findChildFragmentNextElement([item])',
          '(anchorMetrics.singleton++, findChildFragmentNextElement([item]))'
        );
        one(
          '(targetEl, bItem) => {',
          '(targetEl, bItem) => {\n      anchorMetrics.visits++;'
        );
      } else {
        one(
          'for (let index = start; index < end; index++) {',
          'for (let index = start; index < end; index++) {\n    anchorMetrics.visits++;'
        );
      }
      one(
        'const { type, el } = bItem;',
        'anchorMetrics.nodeReads++;\n    const { type, el } = bItem;'
      );
      fs.writeFileSync(renderer, code);
    }
    const dest = path.join(out, variant, lane);
    await build({
      configFile: false,
      root,
      logLevel: 'warn',
      resolve: {
        alias: [{ find: '@', replacement: path.join(source, 'src') }],
      },
      plugins: [
        {
          name: 'compact-umd-identifiers',
          renderChunk: {
            order: 'post',
            async handler(code, _chunk, options) {
              if (options.format !== 'umd') return null;
              const result = await minify(code, {
                compress: false,
                mangle: true,
                sourceMap: !!options.sourcemap,
              });
              return { code: result.code, map: result.map || null };
            },
          },
        },
      ],
      build: {
        outDir: dest,
        emptyOutDir: true,
        sourcemap: true,
        lib: {
          formats: ['es', 'umd', 'cjs'],
          entry: path.join(source, 'src/index.ts'),
          name: 'lithent',
          fileName: format =>
            format === 'cjs'
              ? 'lithent.cjs'
              : format === 'umd'
                ? 'lithent.umd.js'
                : 'lithent.mjs',
        },
        rollupOptions: {
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false,
          },
        },
      },
    });
    manifest.bundles[`${variant}/${lane}`] = {};
    for (const name of ['lithent.mjs', 'lithent.umd.js', 'lithent.cjs']) {
      const bytes = fs.readFileSync(path.join(dest, name));
      if (lane === 'production')
        assert(!bytes.includes(Buffer.from('__anchorMetrics')));
      manifest.bundles[`${variant}/${lane}`][name] = {
        sha256: hash(bytes),
        raw: bytes.length,
        gzip: gzipSync(bytes, { level: 9 }).length,
        br: brotliCompressSync(bytes).length,
      };
    }
  }
}
fs.writeFileSync(
  path.join(out, 'build.json'),
  JSON.stringify(manifest, null, 2)
);
fs.writeFileSync(
  path.join(out, 'candidate.patch'),
  (await git(['diff', base, '--', 'src/render.ts']))
    .toString()
    .replace(/^ $/gm, '')
);
console.log(
  JSON.stringify(
    {
      out,
      sources: sources.length,
      sizes: Object.fromEntries(
        ['baseline', 'candidate'].map(v => [
          v,
          manifest.bundles[`${v}/production`]['lithent.umd.js'],
        ])
      ),
    },
    null,
    2
  )
);
