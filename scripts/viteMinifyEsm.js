import { basename, join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { transformWithEsbuild } from 'vite';
import remapping from '@jridgewell/remapping';

/**
 * Vite skips whitespace minification for ES library builds on purpose:
 * `isEsLibBuild` hardcodes `minifyWhitespace: false` so that `@__PURE__`
 * annotations survive for downstream bundlers. Our published ESM artifacts are
 * also consumed directly (CDN, script type="module"), where the retained
 * whitespace is pure overhead — the core alone ships ~5.5KB of it.
 *
 * Earlier hook points do not work:
 * - `renderChunk` (plugin or rollupOptions.plugins) runs BEFORE vite's minifier,
 *   so the result gets reformatted away. `enforce: 'post'` does not help.
 * - `generateBundle` applies code edits but silently drops `chunk.map` edits,
 *   which desyncs the sourcemap.
 *
 * So we rewrite both files after they land on disk and compose the sourcemaps:
 * esbuild's map (minified -> vite output) chained onto vite's map
 * (vite output -> original TypeScript).
 */
export const minifyEsm = () => ({
  name: 'lithent:minify-esm',
  apply: 'build',

  async writeBundle(options, bundle) {
    if (options.format !== 'es') {
      return;
    }

    const outDir = options.dir;

    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (chunk.type !== 'chunk') {
        continue;
      }

      const codePath = join(outDir, fileName);
      const mapPath = `${codePath}.map`;

      let code = await readFile(codePath, 'utf8');
      // Rollup already appended this; esbuild would drop it and we re-add it below.
      code = code.replace(/\n?\/\/# sourceMappingURL=.*$/, '');

      let prevMap = null;
      try {
        prevMap = JSON.parse(await readFile(mapPath, 'utf8'));
      } catch {
        prevMap = null;
      }

      const result = await transformWithEsbuild(code, fileName, {
        minifyWhitespace: true,
        minifyIdentifiers: false,
        minifySyntax: false,
        legalComments: 'none',
        format: 'esm',
        sourcemap: Boolean(prevMap),
        sourcefile: fileName,
      });

      let output = result.code;

      if (prevMap && result.map) {
        const composed = remapping(result.map, source =>
          source === fileName ? prevMap : null
        );
        await writeFile(mapPath, JSON.stringify(composed));
        output += `\n//# sourceMappingURL=${basename(mapPath)}`;
      }

      await writeFile(codePath, output);
    }
  },
});
