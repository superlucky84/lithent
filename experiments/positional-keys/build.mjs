// node build.mjs <name> <coreRoot> [debug]
// Bundles the js-framework-benchmark app (docs/benchmark/edge-fix/app.tsx)
// against <coreRoot>/src into <out>/<name>/app.mjs, minified unless `debug`.
// A core root of another revision: git archive <rev> src helper/src | tar -x -C <dir>
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { repo, out, require } from './paths.mjs';

const { build } = await import(
  pathToFileURL(
    require.resolve('vite').replace('index.cjs', 'dist/node/index.js')
  )
);
const [name, coreRoot, debug] = process.argv.slice(2);
const root = resolve(coreRoot);
const helper = existsSync(`${root}/helper/src/hook/cacheUpdate.ts`)
  ? root
  : repo;
await build({
  configFile: false,
  root: `${repo}/docs/benchmark/edge-fix`,
  logLevel: 'error',
  resolve: {
    alias: [
      {
        find: /^lithent\/helper$/,
        replacement: `${helper}/helper/src/hook/cacheUpdate.ts`,
      },
      { find: /^lithent$/, replacement: `${root}/src/index.ts` },
      { find: /^@\//, replacement: `${root}/src/` },
    ],
  },
  esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
  build: {
    outDir: `${out}/${name}`,
    emptyOutDir: true,
    minify: debug !== 'debug',
    target: 'esnext',
    lib: {
      entry: `${repo}/docs/benchmark/edge-fix/app.tsx`,
      formats: ['es'],
      fileName: () => 'app.mjs',
    },
  },
});
console.log('built', `${out}/${name}/app.mjs`);
