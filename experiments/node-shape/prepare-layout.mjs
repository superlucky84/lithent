import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { hash, guard, read } from '../keyed-placement/init.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const result = {
  at: new Date().toISOString(),
  note: 'Fresh same-config layout A/B; do not pool with archived production JS',
  variants: {},
};
for (const variant of ['baseline', 'candidate']) {
  const dest = path.join(out, 'layout-' + variant);
  assert.equal(fs.existsSync(dest), false, dest);
  const core = path.join(out, variant, 'dist/lithent.mjs');
  await build({
    configFile: false,
    root: path.join(out, 'source'),
    logLevel: 'warn',
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: path.join(out, 'source/cacheUpdate.ts'),
        },
        { find: /^lithent$/, replacement: core },
      ],
    },
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    build: {
      outDir: dest,
      emptyOutDir: false,
      sourcemap: true,
      rollupOptions: {
        input: path.join(out, 'source/src/main.tsx'),
        output: { entryFileNames: 'main.js' },
      },
    },
  });
  fs.writeFileSync(
    path.join(dest, 'index.html'),
    '<!doctype html><meta charset="utf-8"><div id="main"></div><script type="module" src="./main.js"></script>\n'
  );
  result.variants[variant] = {
    core: hash(fs.readFileSync(core)),
    js: hash(fs.readFileSync(path.join(dest, 'main.js'))),
    map: hash(fs.readFileSync(path.join(dest, 'main.js.map'))),
    build: read(path.join(out, variant + '-build.json')),
  };
}
guard(out);
fs.writeFileSync(
  path.join(out, 'layout-builds.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(JSON.stringify(result.variants));
