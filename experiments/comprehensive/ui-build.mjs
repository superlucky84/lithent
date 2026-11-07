import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { root, hash, guard, read } from './init.mjs';

const out = fs.realpathSync(process.argv[2]);
guard(out);
assert(!fs.existsSync(path.join(out, 'ui-inputs.json')));
const original = read(path.join(out, 'app-inputs.json'));
const source = path.join(root, 'experiments/comprehensive/ui.tsx');
const inputs = {};
for (const name of ['baseline', 'event', 'c2', 'combined']) {
  const core = path.join(out, name, 'dist/lithent.mjs');
  assert.equal(hash(fs.readFileSync(core)), original.apps[name].core);
  const dest = path.join(out, 'ui-apps', name);
  await build({
    configFile: false,
    root: path.dirname(source),
    logLevel: 'warn',
    resolve: { alias: [{ find: /^lithent$/, replacement: core }] },
    esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
    build: {
      outDir: dest,
      emptyOutDir: false,
      sourcemap: true,
      rollupOptions: { input: source, output: { entryFileNames: 'main.js' } },
    },
  });
  const html =
    '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/css/currentStyle.css"><div id="main"></div><script type="module" src="./main.js"></script>\n';
  fs.writeFileSync(path.join(dest, 'index.html'), html);
  inputs[name] = {
    core: original.apps[name].core,
    bundle: hash(fs.readFileSync(path.join(dest, 'main.js'))),
    html: hash(html),
    source: hash(fs.readFileSync(source)),
  };
}
for (const order of ['main', 'reverse']) {
  const dest = path.join(out, `ui-round-${order}`);
  for (const name of Object.keys(inputs))
    fs.cpSync(path.join(out, 'ui-apps', name), path.join(dest, name), {
      recursive: true,
    });
  fs.writeFileSync(
    path.join(dest, 'build-manifest.json'),
    JSON.stringify(inputs, null, 2) + '\n'
  );
  fs.writeFileSync(
    path.join(dest, 'versions.json'),
    JSON.stringify(
      Object.fromEntries(
        Object.keys(inputs).map(name => [
          name,
          {
            core: name,
            fixture: 'uncached directory',
            source: hash(fs.readFileSync(source)),
          },
        ])
      ),
      null,
      2
    ) + '\n'
  );
}
fs.writeFileSync(
  path.join(out, 'ui-inputs.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      bench: original.bench,
      source: hash(fs.readFileSync(source)),
      apps: inputs,
      scope:
        'Same deterministic uncached directory UI across B/E/K/EK. Official trace calculation for 03/04 only, not official original-app/four-peer scores.',
    },
    null,
    2
  ) + '\n'
);
guard(out);
console.log(JSON.stringify(inputs));
