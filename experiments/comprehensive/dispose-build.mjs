// Diagnostic only: observe disposal before and after releasing app-owned globals.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { root, hash, read, guard } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
const source = path.join(out, 'dispose-source');
assert(!fs.existsSync(source));
fs.mkdirSync(path.join(source, 'src'), { recursive: true });
const app = fs.readFileSync(path.join(out, 'app-source/src/main.tsx'), 'utf8');
const anchor = 'render(<App />, document.getElementById("main"));';
assert.equal(app.split(anchor).length, 2);
fs.writeFileSync(
  path.join(source, 'src/main.tsx'),
  app.replace(
    anchor,
    'let destroy: (() => void) | undefined = render(<App />, document.getElementById("main"));\nexport const disposeRoot = () => { destroy?.(); destroy = undefined; };\nexport const releaseAppState = () => { store.clear(); renewTable = () => {}; };\n'
  )
);
fs.copyFileSync(
  path.join(out, 'app-source/cacheUpdate.ts'),
  path.join(source, 'cacheUpdate.ts')
);
const manifest = {};
for (const name of ['baseline', 'event', 'c2', 'combined']) {
  const core = path.join(out, name, 'dist/lithent.mjs');
  assert.equal(
    hash(fs.readFileSync(core)),
    read(path.join(out, name, 'build.json')).bundles['lithent.mjs'].sha256
  );
  const dest = path.join(out, 'dispose', name);
  await build({
    configFile: false,
    root: source,
    logLevel: 'warn',
    resolve: {
      alias: [
        {
          find: /^lithent\/helper$/,
          replacement: path.join(source, 'cacheUpdate.ts'),
        },
        { find: /^lithent$/, replacement: core },
      ],
    },
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    build: {
      outDir: dest,
      emptyOutDir: false,
      sourcemap: true,
      lib: {
        entry: path.join(source, 'src/main.tsx'),
        formats: ['es'],
        fileName: () => 'main.mjs',
      },
    },
  });
  manifest[name] = {
    core: hash(fs.readFileSync(core)),
    bundle: hash(fs.readFileSync(path.join(dest, 'main.mjs'))),
  };
}
fs.writeFileSync(
  path.join(out, 'dispose-inputs.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      source: hash(fs.readFileSync(path.join(source, 'src/main.tsx'))),
      note: 'Original app with diagnostic disposer and app-global release exports; observe populated disposal before clearing store rows/caches and renewTable. Not an official score bundle.',
      variants: manifest,
    },
    null,
    2
  ) + '\n'
);
guard(out);
console.log(JSON.stringify(manifest));
