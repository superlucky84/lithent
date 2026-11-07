// node build.mjs <name> <coreRoot>
// Bundles app.tsx against the core in <coreRoot>/src (a checkout of main, or
// this repository) into <out>/<name>/app.mjs, minified like a production build.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { here, repo, out } from './paths.mjs';

const require = createRequire(`${repo}/package.json`);
const { build } = await import(
  pathToFileURL(
    require.resolve('vite').replace('index.cjs', 'dist/node/index.js')
  )
);
const [name, coreRoot] = process.argv.slice(2);
const root = resolve(coreRoot);
await build({
  configFile: false,
  root: here,
  logLevel: 'error',
  resolve: {
    alias: [
      {
        find: /^lithent\/helper$/,
        replacement: `${repo}/helper/src/hook/cacheUpdate.ts`,
      },
      { find: /^lithent$/, replacement: `${root}/src/index.ts` },
      { find: /^@\//, replacement: `${root}/src/` },
    ],
  },
  esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
  build: {
    outDir: `${out}/${name}`,
    emptyOutDir: true,
    minify: true,
    target: 'esnext',
    lib: {
      entry: `${here}app.tsx`,
      formats: ['es'],
      fileName: () => 'app.mjs',
    },
  },
});
console.log('built', `${out}/${name}/app.mjs`);
