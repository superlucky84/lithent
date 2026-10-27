// DC-24 actual Vite builds, isolated from the workspace dist directories.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build, loadConfigFromFile } from 'vite';
import { minify } from 'terser';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = path.resolve(process.argv[2]);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sizes = bytes => ({
  raw: bytes.length,
  gzip: gzipSync(bytes, { level: 9 }).length,
  br: brotliCompressSync(bytes).length,
  sha256: hash(bytes),
});
const result = {
  node: process.version,
  zlib: process.versions.zlib,
  builds: [],
  complete: false,
};
const syntax = {
  defaults: false,
  booleans: true,
  comparisons: true,
  conditionals: true,
  evaluate: true,
  properties: true,
  typeofs: true,
};
for (const [core, folder, stem] of [
  ['base', '', 'lithent'],
  ['concurrent', 'lithentConcurrent', 'lithentConcurrent'],
]) {
  const loaded = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    path.join(root, folder, 'vite.config.js')
  );
  assert(loaded);
  const variants = [
    ['control', true, null, false],
    ['hidden', 'hidden', null, false],
    ['generated-es2015', true, { preset: 'es2015' }, false],
    ['generated-es2015-hidden', 'hidden', { preset: 'es2015' }, false],
    ...(core === 'base'
      ? [
          ['syntax', true, null, syntax],
          ['syntax-return', true, null, { ...syntax, if_return: true }],
          ['syntax-hidden', 'hidden', null, syntax],
          [
            'syntax-return-hidden',
            'hidden',
            null,
            { ...syntax, if_return: true },
          ],
        ]
      : []),
  ];
  for (const [name, sourcemap, generatedCode, compress] of variants) {
    const dir = path.join(out, 'builds', core, name);
    const plugins = loaded.config.plugins.filter(
      plugin =>
        plugin?.name !== 'vite-plugin-checker' && plugin?.name !== 'vite:dts'
    );
    if (compress) {
      const index = plugins.findIndex(
        plugin => plugin?.name === 'compact-umd-identifiers'
      );
      assert(index >= 0);
      plugins[index] = {
        name: 'dc24-syntax-candidate',
        renderChunk: {
          order: 'post',
          async handler(code, _chunk, outputOptions) {
            if (outputOptions.format !== 'umd') return null;
            const value = await minify(code, {
              compress,
              mangle: true,
              sourceMap: !!outputOptions.sourcemap,
            });
            return { code: value.code, map: value.map || null };
          },
        },
      };
    }
    await build({
      ...loaded.config,
      configFile: false,
      root: path.join(root, folder),
      plugins,
      logLevel: 'error',
      build: {
        ...loaded.config.build,
        outDir: dir,
        emptyOutDir: true,
        sourcemap,
        rollupOptions: {
          ...loaded.config.build.rollupOptions,
          output: generatedCode ? { generatedCode } : {},
        },
      },
    });
    const files = {};
    for (const suffix of ['mjs', 'umd.js', 'cjs']) {
      const file = `${stem}.${suffix}`;
      const bytes = fs.readFileSync(path.join(dir, file));
      const normal = fs.readFileSync(path.join(root, folder, 'dist', file));
      if (name === 'control')
        assert.deepEqual(bytes, normal, `${core}/${file}`);
      if (name === 'hidden')
        assert.equal(
          bytes.toString(),
          normal
            .toString()
            .replace(/\n\/\/# sourceMappingURL=[^\n]*\n?$/, '\n'),
          file
        );
      const mapBytes = fs.readFileSync(path.join(dir, file + '.map'));
      const map = JSON.parse(mapBytes);
      assert.equal(map.version, 3);
      assert(map.sources.length > 0 && map.mappings.length > 0);
      files[file] = {
        ...sizes(bytes),
        mapSHA256: hash(mapBytes),
        mapSources: map.sources.length,
      };
    }
    const entry = { core, name, sourcemap, generatedCode, compress, files };
    result.builds.push(entry);
    console.log(`${core}/${name}: ${JSON.stringify(files[`${stem}.umd.js`])}`);
  }
}
result.complete = true;
fs.writeFileSync(
  path.join(out, 'builds.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  'Control builds match current artifacts; hidden-map JS differs only by its final comment.'
);
